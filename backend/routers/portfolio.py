import json
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from database import get_db
from models.user import User
from models.portfolio import Portfolio
from models.page_view import PageView
from schemas.portfolio import PortfolioUpdate, PortfolioOut
from services.portfolio_service import update_portfolio
from services.groq_service import regenerate_field_with_groq
from utils.auth import get_current_user
from datetime import datetime, timedelta

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
async def get_public_portfolio(slug: str, request: Request, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Portfolio).where(Portfolio.slug == slug, Portfolio.is_published == True)
    )
    portfolio = result.scalar_one_or_none()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found or not published")

    portfolio.view_count = (portfolio.view_count or 0) + 1

    # Track individual page view for analytics
    referrer = request.headers.get("referer", "direct")
    user_agent = request.headers.get("user-agent", "")
    page_view = PageView(
        portfolio_id=portfolio.id,
        referrer=referrer,
        user_agent=user_agent,
    )
    db.add(page_view)
    await db.commit()

    return {
        "id": portfolio.id,
        "slug": portfolio.slug,
        "parsed_data": json.loads(portfolio.parsed_data),
        "theme": portfolio.theme,
        "template_id": portfolio.template_id,
        "mode": portfolio.mode,
        "primary_color": portfolio.primary_color,
        "view_count": portfolio.view_count,
        "hidden_sections": portfolio.hidden_sections or "",
    }


@router.get("/domain/{domain}")
async def get_portfolio_by_domain(domain: str, request: Request, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Portfolio).where(Portfolio.custom_domain == domain, Portfolio.is_published == True)
    )
    portfolio = result.scalar_one_or_none()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found or not published on this domain")

    portfolio.view_count = (portfolio.view_count or 0) + 1

    # Track individual page view for analytics
    referrer = request.headers.get("referer", "direct")
    user_agent = request.headers.get("user-agent", "")
    page_view = PageView(
        portfolio_id=portfolio.id,
        referrer=referrer,
        user_agent=user_agent,
    )
    db.add(page_view)
    await db.commit()

    return {
        "id": portfolio.id,
        "slug": portfolio.slug,
        "custom_domain": portfolio.custom_domain,
        "parsed_data": json.loads(portfolio.parsed_data),
        "theme": portfolio.theme,
        "template_id": portfolio.template_id,
        "mode": portfolio.mode,
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


import re

@router.get("/check-slug")
async def check_slug_availability(
    slug: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Check if a portfolio slug is available."""
    # Validate format
    if not re.match(r'^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$', slug):
        return {"available": False, "reason": "Use only lowercase letters, numbers, and hyphens (3-40 chars)"}
    
    # Check if taken by someone else
    result = await db.execute(select(Portfolio).where(Portfolio.slug == slug))
    existing = result.scalar_one_or_none()
    if existing and existing.user_id != current_user.id:
        return {"available": False, "reason": "This URL is already taken"}
    return {"available": True}


class SlugUpdate(BaseModel):
    slug: str

@router.patch("/me/slug")
async def update_portfolio_slug(
    data: SlugUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update the portfolio URL slug."""
    import re
    slug = data.slug.strip().lower().replace(' ', '-')
    
    if not re.match(r'^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$', slug):
        raise HTTPException(status_code=400, detail="Slug must be 3-40 chars: lowercase letters, numbers, hyphens only")
    
    # Check uniqueness
    result = await db.execute(select(Portfolio).where(Portfolio.slug == slug))
    existing = result.scalar_one_or_none()
    if existing and existing.user_id != current_user.id:
        raise HTTPException(status_code=409, detail="This URL is already taken. Please choose another.")
    
    # Update user's portfolio
    result2 = await db.execute(select(Portfolio).where(Portfolio.user_id == current_user.id))
    portfolio = result2.scalar_one_or_none()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    portfolio.slug = slug
    await db.commit()
    await db.refresh(portfolio)
    return {"slug": portfolio.slug, "message": "Portfolio URL updated successfully!"}


@router.get("/me/analytics")
async def get_portfolio_analytics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get analytics data for the current user's portfolio."""
    result = await db.execute(select(Portfolio).where(Portfolio.user_id == current_user.id))
    portfolio = result.scalar_one_or_none()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    # --- 7-day view counts ---
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    views_query = await db.execute(
        select(
            func.date(PageView.viewed_at).label("day"),
            func.count(PageView.id).label("count")
        )
        .where(PageView.portfolio_id == portfolio.id, PageView.viewed_at >= seven_days_ago)
        .group_by(func.date(PageView.viewed_at))
        .order_by(func.date(PageView.viewed_at))
    )
    daily_views = [{"date": str(row.day), "views": row.count} for row in views_query]

    # Fill missing days with 0
    all_days = []
    for i in range(7):
        day = (datetime.utcnow() - timedelta(days=6-i)).strftime("%Y-%m-%d")
        found = next((d for d in daily_views if d["date"] == day), None)
        all_days.append({"date": day, "views": found["views"] if found else 0})

    # --- Total views ---
    total_views = await db.execute(
        select(func.count(PageView.id)).where(PageView.portfolio_id == portfolio.id)
    )
    total = total_views.scalar() or 0

    # --- Referrer breakdown ---
    ref_query = await db.execute(
        select(PageView.referrer, func.count(PageView.id).label("count"))
        .where(PageView.portfolio_id == portfolio.id, PageView.viewed_at >= seven_days_ago)
        .group_by(PageView.referrer)
        .order_by(func.count(PageView.id).desc())
        .limit(10)
    )
    referrers = []
    for row in ref_query:
        ref = row.referrer or "direct"
        # Clean up referrer to domain
        if "linkedin" in ref.lower():
            ref = "LinkedIn"
        elif "twitter" in ref.lower() or "x.com" in ref.lower():
            ref = "Twitter/X"
        elif "github" in ref.lower():
            ref = "GitHub"
        elif "google" in ref.lower():
            ref = "Google"
        elif ref == "direct" or not ref:
            ref = "Direct"
        else:
            try:
                from urllib.parse import urlparse
                ref = urlparse(ref).netloc or "Other"
            except Exception:
                ref = "Other"
        referrers.append({"source": ref, "count": row.count})

    # --- Device breakdown (basic mobile vs desktop from user-agent) ---
    ua_query = await db.execute(
        select(PageView.user_agent)
        .where(PageView.portfolio_id == portfolio.id, PageView.viewed_at >= seven_days_ago)
    )
    mobile = 0
    desktop = 0
    for row in ua_query:
        ua = (row.user_agent or "").lower()
        if any(kw in ua for kw in ["mobile", "android", "iphone", "ipad"]):
            mobile += 1
        else:
            desktop += 1

    return {
        "total_views": total,
        "view_count": portfolio.view_count or 0,
        "daily_views": all_days,
        "referrers": referrers,
        "devices": {"mobile": mobile, "desktop": desktop},
        "slug": portfolio.slug,
        "is_published": portfolio.is_published,
    }
