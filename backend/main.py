from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
from database import init_db
from routers import auth, resume, portfolio, admin
from config import get_settings

settings = get_settings()

app = FastAPI(
    title="Resume2Portfolio AI",
    description="Upload your resume, get an AI-generated portfolio website.",
    version="1.0.0",
)

# CORS — supports multiple origins via comma-separated FRONTEND_URL
_raw_origins = settings.frontend_url or "http://localhost:5173"
allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]
# Always include localhost for local dev
if "http://localhost:5173" not in allowed_origins:
    allowed_origins.append("http://localhost:5173")
if "http://localhost:3000" not in allowed_origins:
    allowed_origins.append("http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(resume.router)
app.include_router(portfolio.router)
app.include_router(admin.router)


@app.on_event("startup")
async def startup_event():
    logger.info("Starting up — initializing database...")
    await init_db()
    logger.info("Database initialized successfully ✅")


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down.")


@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "message": "Resume2Portfolio AI API is running 🚀"}


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy"}

