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
    logger.info("Starting up and checking database connection...")
    try:
        await init_db()
        app.state.db_ready = True
        logger.info("Database initialized successfully")
    except Exception:
        app.state.db_ready = False
        logger.exception("Database initialization failed")
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

if "*" in allowed_origins:
    allowed_origins = ["*"]
else:
    if "http://localhost:5173" not in allowed_origins:
        allowed_origins.append("http://localhost:5173")
    if "http://localhost:3000" not in allowed_origins:
        allowed_origins.append("http://localhost:3000")

allow_credentials = "*" not in allowed_origins

app.add_middleware(GZipMiddleware, minimum_size=1000)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline' https://accounts.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://*.googleusercontent.com; connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com"
        
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


@app.get("/api/health", tags=["Health"])
async def health(db: AsyncSession = Depends(get_db)):
    if not app.state.db_ready:
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "database": "unavailable"},
        )

    try:
        await db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception:
        app.state.db_ready = False
        logger.exception("Database health check failed")
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "database": "disconnected"},
        )


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
