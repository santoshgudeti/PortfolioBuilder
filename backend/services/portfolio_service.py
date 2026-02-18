import re
import json
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.portfolio import Portfolio
from schemas.portfolio import ParsedResumeData


def generate_slug(name: str, user_id: str) -> str:
    """Generate a URL-friendly slug from name."""
    base = re.sub(r"[^a-zA-Z0-9\s]", "", name.lower())
    base = re.sub(r"\s+", "-", base.strip())
    # Append short user_id suffix to ensure uniqueness
    suffix = user_id[:6]
    return f"{base}-{suffix}" if base else f"user-{suffix}"


async def create_portfolio(
    db: AsyncSession,
    user_id: str,
    parsed_data: dict,
    theme: str = "minimal",
    primary_color: str = "#6366f1",
    resume_filename: str = None,
) -> Portfolio:
    """Create a new portfolio record."""
    name = parsed_data.get("name", "user")
    slug = generate_slug(name, user_id)

    # Ensure slug is unique
    existing = await db.execute(select(Portfolio).where(Portfolio.slug == slug))
    if existing.scalar_one_or_none():
        slug = f"{slug}-{user_id[:4]}"

    portfolio = Portfolio(
        user_id=user_id,
        slug=slug,
        parsed_data=json.dumps(parsed_data),
        theme=theme,
        primary_color=primary_color,
        resume_filename=resume_filename,
    )
    db.add(portfolio)
    await db.commit()
    await db.refresh(portfolio)
    return portfolio


async def update_portfolio(
    db: AsyncSession,
    portfolio: Portfolio,
    updates: dict,
) -> Portfolio:
    """Update portfolio fields."""
    for key, value in updates.items():
        if value is not None:
            if key == "parsed_data" and isinstance(value, dict):
                setattr(portfolio, key, json.dumps(value))
            else:
                setattr(portfolio, key, value)
    await db.commit()
    await db.refresh(portfolio)
    return portfolio
