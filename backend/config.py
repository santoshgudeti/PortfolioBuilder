from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    env: str = "development"
    groq_api_key: str = ""
    database_url: str = "sqlite+aiosqlite:///./resume2portfolio.db"
    secret_key: str  # No default — MUST be set in .env to prevent token forgery
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 7
    frontend_url: str = "http://localhost:5173"
    google_client_id: str = ""
    admin_email: str = "hamathopc@gmail.com"
    # Email settings (for Phase 3)
    mail_username: str = ""
    mail_password: str = ""
    mail_from: str = ""
    
    # RustFS Storage settings
    rustfs_endpoint_url: str = "http://localhost:9000"
    rustfs_access_key: str = ""
    rustfs_secret_key: str = ""
    rustfs_bucket_name: str = "user-resumes"



    class Config:
        env_file = ".env"
        extra = "ignore" # Allow extra env vars without failing

    @property
    def is_production(self) -> bool:
        return self.env.lower() == "production"

    @property
    def api_base_url(self) -> str:
        # Useful for generating absolute links in emails
        return f"{self.frontend_url}/api"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
