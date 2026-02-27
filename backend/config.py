from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    groq_api_key: str = ""
    database_url: str = "sqlite+aiosqlite:///./resume2portfolio.db"
    secret_key: str = "change-me-in-production-must-be-at-least-32-chars"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    frontend_url: str = "http://localhost:5173"
    google_client_id: str = ""
    admin_email: str = ""
    # Email settings (for Phase 3)
    mail_username: str = ""
    mail_password: str = ""
    mail_from: str = ""
    # Local file storage — no cloud needed (resumes are parsed then discarded)
    upload_dir: str = "./uploads"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
