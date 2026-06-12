from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.user import User
from models.portfolio import Portfolio
from services.analytics_service import get_enhanced_analytics
from utils.auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics 2.0"])


@router.get("/overview")
async def get_analytics_overview(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get enhanced analytics with visitor segments, intent scoring, and trends."""
    result = await db.execute(select(Portfolio).where(Portfolio.user_id == current_user.id))
    portfolio = result.scalar_one_or_none()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    try:
        analytics = await get_enhanced_analytics(portfolio.id, db)
        return {
            **analytics,
            "slug": portfolio.slug,
            "is_published": portfolio.is_published,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics fetch failed: {str(e)}")
