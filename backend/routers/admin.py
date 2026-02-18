import json
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from database import get_db
from models.user import User
from models.portfolio import Portfolio
from utils.auth import get_admin_user

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
    return {
        "total_users": user_count.scalar(),
        "total_portfolios": portfolio_count.scalar(),
        "published_portfolios": published_count.scalar(),
    }


@router.get("/users")
async def list_users(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "is_active": u.is_active,
            "is_admin": u.is_admin,
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
            "is_published": p.is_published,
            "created_at": p.created_at,
        }
        for p in portfolios
    ]
