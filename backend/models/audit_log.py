import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    admin_id: Mapped[str] = mapped_column(String, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action: Mapped[str] = mapped_column(String, nullable=False) # e.g., "DELETE_USER", "TOGGLE_ACTIVE", "UNPUBLISH_PORTFOLIO"
    target_id: Mapped[str] = mapped_column(String, nullable=True) # ID of user or portfolio being modified
    target_type: Mapped[str] = mapped_column(String, nullable=True) # "user", "portfolio"
    details: Mapped[str] = mapped_column(Text, nullable=True) # JSON or descriptive string
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
