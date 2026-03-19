import os
import uuid
import time
from contextlib import asynccontextmanager

from fastapi import APIRouter, Depends, FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from loguru import logger
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from config import get_settings
from database import get_db, init_db
from routers import admin, auth, portfolio, resume

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up...")
    try:
        # We rely on Alembic migrations in start.sh for schema
        # but we still need to verify the connection is alive
        from sqlalchemy import text
        from database import AsyncSessionLocal
        
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
            
        app.state.db_ready = True
        logger.info("Database connection verified")
        
        # Ensure initial admin exists
        from create_admin import make_admin
        await make_admin()
        
    except Exception:
        app.state.db_ready = False
        logger.exception("Startup checks failed")
        # In production, we might want to continue even if DB is transiently down
        # but for initialization, it's safer to let it restart
        raise

    try:
        yield
    finally:
        app.state.db_ready = False
        logger.info("Shutting down.")


app = FastAPI(
    title="Resume2Portfolio AI",
    description="Upload your resume, get an AI-generated portfolio website.",
    version="1.0.0",
    lifespan=lifespan,
)
app.state.db_ready = False

_raw_origins = settings.frontend_url or "http://localhost:5173"
allowed_origins = [o.strip().rstrip("/") for o in _raw_origins.split(",") if o.strip()]

# In production, we MUST have specific origins for credentials (cookies) to work.
if not allowed_origins or "*" in allowed_origins:
    if settings.is_production:
        logger.warning("CORS: Specific frontend_url not set in production. Cookies will likely be blocked.")
        # Fallback to a wider but valid list if possible, or keep as is and warn
        if "*" in allowed_origins:
            # We must remove "*" because allow_credentials=True
            allowed_origins = [o for o in allowed_origins if o != "*"]
    else:
        # Development fallbacks
        if "http://localhost:5173" not in allowed_origins:
            allowed_origins.append("http://localhost:5173")
        if "http://localhost:3000" not in allowed_origins:
            allowed_origins.append("http://localhost:3000")

# Ensure we have at least one origin if allow_credentials is True
if not allowed_origins and not settings.is_production:
     allowed_origins = ["http://localhost:5173"]

app.add_middleware(GZipMiddleware, minimum_size=1000)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app" if settings.is_production else None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Set-Cookie"],
)

def _is_unsafe_method(method: str) -> bool:
    return method.upper() in {"POST", "PUT", "PATCH", "DELETE"}


def _origin_allowed(origin: str | None) -> bool:
    if not origin:
        return False
    origin = origin.rstrip("/")
    if origin in allowed_origins:
        return True
    # When allow_origin_regex is configured (prod), accept vercel preview origins too.
    if settings.is_production and origin.startswith("https://") and origin.endswith(".vercel.app"):
        return True
    return False


def _default_csp(is_production: bool) -> str:
    """
    CSP applies when backend serves the SPA from `backend/static`.
    Keep it reasonably strict, but compatible with Vite-built assets + Google Sign-In.
    """
    # Dev is more permissive to avoid blocking local tooling / HMR.
    if not is_production:
        return (
            "default-src 'self'; "
            "base-uri 'self'; "
            "frame-ancestors 'none'; "
            "object-src 'none'; "
            "img-src 'self' data: blob: https:; "
            "font-src 'self' https://fonts.gstatic.com data:; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com; "
            "connect-src 'self' http: https: ws: wss: https://accounts.google.com https://oauth2.googleapis.com; "
            "frame-src https://accounts.google.com;"
        )

    return (
        "default-src 'self'; "
        "base-uri 'self'; "
        "frame-ancestors 'none'; "
        "object-src 'none'; "
        "img-src 'self' data: blob: https://*.googleusercontent.com; "
        "font-src 'self' https://fonts.gstatic.com data:; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "script-src 'self' 'unsafe-inline' https://accounts.google.com; "
        "connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com; "
        "frame-src https://accounts.google.com;"
    )


@app.middleware("http")
async def csrf_protect_cookie_requests(request: Request, call_next):
    """
    Minimal CSRF mitigation for cookie-auth APIs:
    - Only enforced for unsafe methods to /api/*
    - Only enforced when a cookie session is present (access_token cookie)
    - Allows Authorization: Bearer flows (Swagger/curl) without Origin/Referer
    """
    path = request.url.path or ""
    method = request.method or "GET"

    if path.startswith("/api/") and _is_unsafe_method(method):
        has_cookie_session = bool(request.cookies.get("access_token"))
        has_bearer = bool((request.headers.get("authorization") or "").lower().startswith("bearer "))

        if has_cookie_session and not has_bearer:
            origin = request.headers.get("origin")

            # Some clients may omit Origin; try Referer as fallback.
            if not origin:
                referer = request.headers.get("referer")
                if referer:
                    try:
                        origin = str(request.url.replace(path="", query="").replace(fragment=""))
                        # Above is current backend origin; if referer exists we still validate it below.
                        # We'll parse origin from referer using stdlib to avoid depending on request.url.
                        from urllib.parse import urlparse
                        parsed = urlparse(referer)
                        origin = f"{parsed.scheme}://{parsed.netloc}" if parsed.scheme and parsed.netloc else None
                    except Exception:
                        origin = None

            if not _origin_allowed(origin):
                return JSONResponse(
                    status_code=403,
                    content={"detail": "CSRF protection: invalid origin"},
                )

    return await call_next(request)


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    request_id = str(uuid.uuid4())
    # Add to logger context
    with logger.contextualize(request_id=request_id):
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        response.headers["X-Request-ID"] = request_id
        
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        csp = settings.content_security_policy.strip() or _default_csp(settings.is_production)
        response.headers["Content-Security-Policy"] = csp

        # Minimal request log for production debugging (PII-safe).
        logger.info(f"{request.method} {request.url.path} -> {response.status_code} ({process_time:.3f}s)")
        return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Our team has been notified."},
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

api_router = APIRouter(prefix="/api")
api_router.include_router(auth.router)
api_router.include_router(resume.router)
api_router.include_router(portfolio.router)
api_router.include_router(admin.router)
app.include_router(api_router)


@app.get("/api/", tags=["Health"])
async def root():
    return {"status": "ok", "message": "Resume2Portfolio AI API is running"}


@app.get("/health", tags=["Health"])
@app.get("/api/health", tags=["Health"])
async def health(db: AsyncSession = Depends(get_db)):
    """Liveness probe for cloud platforms."""
    if not app.state.db_ready:
        return JSONResponse(status_code=503, content={"status": "unhealthy", "db": "not_ready"})
    
    try:
        await db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected", "port": os.environ.get("PORT", "8000")}
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(status_code=503, content={"status": "unhealthy", "detail": str(e)})


frontend_dist = os.path.join(os.path.dirname(__file__), "static")

if os.path.isdir(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        # Specific check for files (js, css, png etc)
        file_path = os.path.join(frontend_dist, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)

        # Fallback to index.html for all other paths (SPA routing)
        index_path = os.path.join(frontend_dist, "index.html")
        if os.path.isfile(index_path):
            return FileResponse(index_path)

        return JSONResponse(status_code=404, content={"detail": "Frontend distribution not found in backend/static/"})
