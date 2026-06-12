import json
from sqlalchemy import func, select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from models.portfolio import Portfolio
from models.user import User


async def search_talent(
    db: AsyncSession,
    query: str = "",
    skills: list[str] = None,
    role: str = "",
    limit: int = 20,
    offset: int = 0,
) -> tuple[list[dict], int]:
    """Search published portfolios visible to recruiters."""
    skills = skills or []

    base = (
        select(Portfolio)
        .options(joinedload(Portfolio.user))
        .where(
            Portfolio.is_published == True,
            Portfolio.visible_to_recruiters == True,
        )
    )

    if query:
        base = base.where(
            or_(
                Portfolio.parsed_data.ilike(f"%{query}%"),
                User.name.ilike(f"%{query}%"),
            )
        )

    for skill in skills:
        base = base.where(Portfolio.parsed_data.ilike(f"%{skill}%"))

    if role:
        base = base.where(Portfolio.parsed_data.ilike(f"%{role}%"))

    count_base = base.subquery()
    total = await db.scalar(select(func.count()).select_from(count_base)) or 0

    result = await db.execute(base.order_by(Portfolio.updated_at.desc()).offset(offset).limit(limit))
    portfolios = result.unique().scalars().all()

    profiles = []
    for p in portfolios:
        parsed = json.loads(p.parsed_data) if p.parsed_data else {}
        career = json.loads(p.career_graph) if p.career_graph else {}
        profiles.append({
            "id": p.id,
            "slug": p.slug,
            "name": p.user.name if p.user else "Anonymous",
            "avatar_url": p.user.avatar_url if p.user else None,
            "title": parsed.get("title", "Professional"),
            "summary": (parsed.get("summary", "") or "")[:200],
            "skills": parsed.get("skills", [])[:15],
            "top_skills": (career.get("skills", []) or [])[:8] if career else parsed.get("skills", [])[:8],
            "industries": career.get("industries", []) if career else [],
            "experience_years": career.get("experience_years", 0) if career else None,
            "career_level": career.get("career_level", "") if career else "",
            "experience_count": len(parsed.get("experience", [])),
            "project_count": len(parsed.get("projects", [])),
            "updated_at": p.updated_at.isoformat() if p.updated_at else None,
        })

    return profiles, total
