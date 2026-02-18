import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, Boolean, Text, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column
from database import Base


class Portfolio(Base):
    __tablename__ = "portfolios"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False, index=True)
    slug: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    parsed_data: Mapped[str] = mapped_column(Text, nullable=False, default="{}")  # JSON string
    theme: Mapped[str] = mapped_column(String, default="minimal")
    primary_color: Mapped[str] = mapped_column(String, default="#6366f1")
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)
    resume_filename: Mapped[str] = mapped_column(String, nullable=True)
    view_count: Mapped[int] = mapped_column(Integer, default=0)
    hidden_sections: Mapped[str] = mapped_column(String, default="")  # comma-separated section names
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

