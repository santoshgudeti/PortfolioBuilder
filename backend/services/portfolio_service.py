import json
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.portfolio import Portfolio
from utils.slug import generate_slug


async def create_portfolio(
    db: AsyncSession,
    user_id: str,
    parsed_data: dict,
    theme: str = "minimal",
    template_id: str = "standard",
    mode: str = "light",
    primary_color: str = "#6366f1",
    resume_filename: str = None,
    resume_object_key: str = None,
    career_graph: dict = None,
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
        career_graph=json.dumps(career_graph) if career_graph else None,
        theme=theme,
        template_id=template_id,
        mode=mode,
        primary_color=primary_color,
        is_published=True,
        resume_filename=resume_filename,
        resume_object_key=resume_object_key,
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
        if key == "custom_domain":
            setattr(portfolio, key, value)
            continue
        if value is None:
            continue
        if isinstance(value, dict) and key in ("parsed_data", "career_graph"):
            setattr(portfolio, key, json.dumps(value))
        else:
            setattr(portfolio, key, value)
    await db.commit()
    await db.refresh(portfolio)
    return portfolio
