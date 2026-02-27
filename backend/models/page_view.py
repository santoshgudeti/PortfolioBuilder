import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column
from database import Base


class PageView(Base):
    __tablename__ = "page_views"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    portfolio_id: Mapped[str] = mapped_column(String, ForeignKey("portfolios.id"), nullable=False, index=True)
    viewed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    referrer: Mapped[str] = mapped_column(String, nullable=True)   # e.g. linkedin.com, twitter.com, direct
    user_agent: Mapped[str] = mapped_column(Text, nullable=True)
