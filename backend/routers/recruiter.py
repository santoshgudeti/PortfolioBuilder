from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.user import User
from models.portfolio import Portfolio
from services.recruiter_service import search_talent
from utils.auth import get_current_user

router = APIRouter(prefix="/recruiter", tags=["Recruiter Mode"])


@router.get("/search")
async def search_talent_endpoint(
    query: str = Query("", description="Free-text search across profiles"),
    skills: str = Query("", description="Comma-separated skills filter"),
    role: str = Query("", description="Job role filter"),
    limit: int = Query(20, ge=1, le=50),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """Search published portfolios visible to recruiters. Public endpoint."""
    skill_list = [s.strip() for s in skills.split(",") if s.strip()] if skills else []
    profiles, total = await search_talent(db, query, skill_list, role, limit, offset)
    return {
        "profiles": profiles,
        "total": total,
        "limit": limit,
        "offset": offset,
    }


@router.get("/visibility")
async def get_recruiter_visibility(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Check if current user's portfolio is visible to recruiters."""
    result = await db.execute(select(Portfolio).where(Portfolio.user_id == current_user.id))
    portfolio = result.scalar_one_or_none()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return {"visible_to_recruiters": portfolio.visible_to_recruiters}


@router.post("/visibility")
async def toggle_recruiter_visibility(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Toggle whether portfolio is visible to recruiters."""
    result = await db.execute(select(Portfolio).where(Portfolio.user_id == current_user.id))
    portfolio = result.scalar_one_or_none()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    portfolio.visible_to_recruiters = not portfolio.visible_to_recruiters
    await db.commit()
    return {
        "visible_to_recruiters": portfolio.visible_to_recruiters,
        "message": "Recruiter visibility " + ("enabled" if portfolio.visible_to_recruiters else "disabled"),
    }
