import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from database import get_db
from models.user import User
from models.portfolio import Portfolio
from schemas.portfolio import PortfolioUpdate, PortfolioOut
from services.portfolio_service import update_portfolio
from services.groq_service import regenerate_field_with_groq
from utils.auth import get_current_user

router = APIRouter(prefix="/portfolio", tags=["Portfolio"])


@router.get("/me", response_model=PortfolioOut)
async def get_my_portfolio(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Portfolio).where(Portfolio.user_id == current_user.id))
    portfolio = result.scalar_one_or_none()
    if not portfolio:
        raise HTTPException(status_code=404, detail="No portfolio found. Please upload a resume first.")
    return portfolio


@router.put("/me", response_model=PortfolioOut)
async def update_my_portfolio(
    updates: PortfolioUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Portfolio).where(Portfolio.user_id == current_user.id))
    portfolio = result.scalar_one_or_none()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    update_dict = updates.model_dump(exclude_none=True)
    portfolio = await update_portfolio(db, portfolio, update_dict)
    return portfolio


@router.post("/me/publish", response_model=PortfolioOut)
async def publish_portfolio(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Portfolio).where(Portfolio.user_id == current_user.id))
    portfolio = result.scalar_one_or_none()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    portfolio = await update_portfolio(db, portfolio, {"is_published": True})
    return portfolio


@router.post("/me/unpublish", response_model=PortfolioOut)
async def unpublish_portfolio(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Portfolio).where(Portfolio.user_id == current_user.id))
    portfolio = result.scalar_one_or_none()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    portfolio = await update_portfolio(db, portfolio, {"is_published": False})
    return portfolio


class RegenerateRequest(BaseModel):
    field: str          # "summary", "tagline", "project_description", etc.
    current_value: str  # Current text to improve
    context: str = ""   # Extra context (e.g. project title, skills list)


@router.post("/me/regenerate")
async def regenerate_field(
    req: RegenerateRequest,
    current_user: User = Depends(get_current_user),
):
    """Use Groq AI to rewrite/improve a specific portfolio field."""
    allowed_fields = {"summary", "tagline", "bio", "project_description", "experience_description"}
    if req.field not in allowed_fields:
        raise HTTPException(status_code=400, detail=f"Field must be one of: {allowed_fields}")
    try:
        improved = await regenerate_field_with_groq(req.field, req.current_value, req.context)
        return {"improved": improved}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI generation failed: {str(e)}")


@router.get("/public/{slug}")
async def get_public_portfolio(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Portfolio).where(Portfolio.slug == slug, Portfolio.is_published == True)
    )
    portfolio = result.scalar_one_or_none()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found or not published")

    portfolio.view_count = (portfolio.view_count or 0) + 1
    await db.commit()

    return {
        "id": portfolio.id,
        "slug": portfolio.slug,
        "parsed_data": json.loads(portfolio.parsed_data),
        "theme": portfolio.theme,
        "primary_color": portfolio.primary_color,
        "view_count": portfolio.view_count,
        "hidden_sections": portfolio.hidden_sections or "",
    }


@router.get("/preview")
async def preview_portfolio(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Portfolio).where(Portfolio.user_id == current_user.id))
    portfolio = result.scalar_one_or_none()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    return {
        "id": portfolio.id,
        "slug": portfolio.slug,
        "parsed_data": json.loads(portfolio.parsed_data),
        "theme": portfolio.theme,
        "primary_color": portfolio.primary_color,
        "is_published": portfolio.is_published,
        "view_count": portfolio.view_count or 0,
        "hidden_sections": portfolio.hidden_sections or "",
    }
