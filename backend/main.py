from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger
from database import init_db, get_db
from routers import auth, resume, portfolio, admin
from config import get_settings

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Modern lifecycle handler (replaces deprecated on_event)."""
    # Startup
    logger.info("Starting up — checking database connection...")
    try:
        await init_db()
        logger.info("Database initialized successfully ✅")
    except Exception as e:
        logger.error(f"Database initialization failed: {str(e)}")
    yield
    # Shutdown
    logger.info("Shutting down.")


app = FastAPI(
    title="Resume2Portfolio AI",
    description="Upload your resume, get an AI-generated portfolio website.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — supports multiple origins via comma-separated FRONTEND_URL
_raw_origins = settings.frontend_url or "http://localhost:5173"
# Strip trailing slashes and whitespace
allowed_origins = [o.strip().rstrip("/") for o in _raw_origins.split(",") if o.strip()]

# If '*' is anywhere, use only '*' for allow_origins
if "*" in allowed_origins:
    allowed_origins = ["*"]
else:
    # Always include localhost for local dev
    if "http://localhost:5173" not in allowed_origins:
        allowed_origins.append("http://localhost:5173")
    if "http://localhost:3000" not in allowed_origins:
        allowed_origins.append("http://localhost:3000")

# Browsers reject credentialed requests with wildcard origins.
allow_credentials = "*" not in allowed_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",  # Support all Vercel subdomains
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create an API Router to group all backend routes under /api
api_router = APIRouter(prefix="/api")
api_router.include_router(auth.router)
api_router.include_router(resume.router)
api_router.include_router(portfolio.router)
api_router.include_router(admin.router)

# Include the API router into the main app
app.include_router(api_router)


@app.get("/api/", tags=["Health"])
async def root():
    return {"status": "ok", "message": "Resume2Portfolio AI API is running 🚀"}


@app.get("/api/health", tags=["Health"])
async def health(db: AsyncSession = Depends(get_db)):
    """Health check that verifies database connectivity."""
    try:
        await db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception:
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "database": "disconnected"},
        )

# Serve the frontend statically over FastAPI
frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")

if os.path.isdir(frontend_dist):
    # Serve the assets natively
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    # Catch-all route to handle React Router and root files (e.g., favicon.ico)
    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        # Look for a specific file at root
        file_path = os.path.join(frontend_dist, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        # Fall back to index.html for SPA rendering
        index_path = os.path.join(frontend_dist, "index.html")
        if os.path.isfile(index_path):
            return FileResponse(index_path)
        return JSONResponse(status_code=404, content={"detail": "Frontend not found! Did you build it?"})

