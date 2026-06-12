import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Boolean, Text, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


class Portfolio(Base):
    __tablename__ = "portfolios"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False, index=True)
    slug: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    custom_domain: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=True)
    parsed_data: Mapped[str] = mapped_column(Text, nullable=False, default="{}")  # JSON string
    theme: Mapped[str] = mapped_column(String, default="minimal")
    template_id: Mapped[str] = mapped_column(String, default="standard")
    mode: Mapped[str] = mapped_column(String, default="light")
    primary_color: Mapped[str] = mapped_column(String, default="#6366f1")
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)
    moderation_status: Mapped[str] = mapped_column(String, default="pending") # pending, approved, flagged
    moderation_score: Mapped[float] = mapped_column(Integer, default=0) # AI confidence score (0-100)
    moderation_reason: Mapped[str] = mapped_column(String, nullable=True)
    resume_filename: Mapped[str] = mapped_column(String, nullable=True)
    resume_object_key: Mapped[str] = mapped_column(String, nullable=True)
    view_count: Mapped[int] = mapped_column(Integer, default=0)
    hidden_sections: Mapped[str] = mapped_column(String, default="")  # comma-separated section names
    version_history: Mapped[str] = mapped_column(Text, default="[]")  # JSON array of {"parsed_data": {...}, "saved_at": "ISO timestamp"}
    career_graph: Mapped[str] = mapped_column(Text, nullable=True)  # JSON string — AI Career Knowledge Graph
    role_versions: Mapped[str] = mapped_column(Text, nullable=True)  # JSON dict of role -> tailored data
    active_role: Mapped[str] = mapped_column(String, nullable=True)  # currently active role version
    visible_to_recruiters: Mapped[bool] = mapped_column(Boolean, default=True)
    connected_sources: Mapped[str] = mapped_column(Text, nullable=True)
    video_scripts: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    user = relationship("User", back_populates="portfolio", uselist=False)

