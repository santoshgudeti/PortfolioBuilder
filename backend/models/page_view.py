import uuid
from datetime import datetime, timezone
from sqlalchemy import Float, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column
from database import Base


class PageView(Base):
    __tablename__ = "page_views"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    portfolio_id: Mapped[str] = mapped_column(String, ForeignKey("portfolios.id"), nullable=False, index=True)
    viewed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    referrer: Mapped[str] = mapped_column(String, nullable=True)
    user_agent: Mapped[str] = mapped_column(Text, nullable=True)
    ip_address: Mapped[str] = mapped_column(String, nullable=True, index=True)
    visitor_type: Mapped[str] = mapped_column(String, nullable=True, default="unknown", index=True)
    intent_score: Mapped[int] = mapped_column(Integer, nullable=True, default=0)
