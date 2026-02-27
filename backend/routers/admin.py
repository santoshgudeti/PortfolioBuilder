import json
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from database import get_db
from models.user import User
from models.portfolio import Portfolio
from models.page_view import PageView
from utils.auth import get_admin_user
from datetime import datetime, timedelta

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/stats")
async def get_stats(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    user_count = await db.execute(select(func.count(User.id)))
    portfolio_count = await db.execute(select(func.count(Portfolio.id)))
    published_count = await db.execute(
        select(func.count(Portfolio.id)).where(Portfolio.is_published == True)
    )
    total_views = await db.execute(select(func.count(PageView.id)))
    verified_count = await db.execute(
        select(func.count(User.id)).where(User.is_verified == True)
    )

    # Top 5 most-viewed portfolios
    top_result = await db.execute(
        select(Portfolio.slug, Portfolio.view_count)
        .where(Portfolio.view_count > 0)
        .order_by(Portfolio.view_count.desc())
        .limit(5)
    )
    top_portfolios = [{"slug": r.slug, "views": r.view_count or 0} for r in top_result]

    # Signups per day (last 7 days)
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    signup_query = await db.execute(
        select(
            func.date(User.created_at).label("day"),
            func.count(User.id).label("count")
        )
        .where(User.created_at >= seven_days_ago)
        .group_by(func.date(User.created_at))
        .order_by(func.date(User.created_at))
    )
    daily_signups = [{
        "date": str(row.day),
        "count": row.count
    } for row in signup_query]

    return {
        "total_users": user_count.scalar(),
        "total_portfolios": portfolio_count.scalar(),
        "published_portfolios": published_count.scalar(),
        "total_views": total_views.scalar(),
        "verified_users": verified_count.scalar(),
        "top_portfolios": top_portfolios,
        "daily_signups": daily_signups,
    }


@router.get("/users")
async def list_users(
    search: str = Query("", description="Search by name or email"),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    query = select(User).order_by(User.created_at.desc())
    if search.strip():
        pattern = f"%{search.strip()}%"
        query = query.where(or_(User.name.ilike(pattern), User.email.ilike(pattern)))

    result = await db.execute(query)
    users = result.scalars().all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "auth_provider": u.auth_provider,
            "is_active": u.is_active,
            "is_admin": u.is_admin,
            "is_verified": u.is_verified,
            "avatar_url": u.avatar_url,
            "created_at": u.created_at,
        }
        for u in users
    ]


@router.get("/portfolios")
async def list_portfolios(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    result = await db.execute(select(Portfolio).order_by(Portfolio.created_at.desc()))
    portfolios = result.scalars().all()
    return [
        {
            "id": p.id,
            "user_id": p.user_id,
            "slug": p.slug,
            "theme": p.theme,
            "primary_color": p.primary_color,
            "is_published": p.is_published,
            "view_count": p.view_count or 0,
            "created_at": p.created_at,
        }
        for p in portfolios
    ]
