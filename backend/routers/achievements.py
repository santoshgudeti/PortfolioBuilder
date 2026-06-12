import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from database import get_db
from models.user import User
from models.portfolio import Portfolio
from services.achievement_service import discover_achievements
from services.portfolio_service import update_portfolio
from utils.auth import get_current_user

router = APIRouter(prefix="/achievements", tags=["Achievements"])


class ApplySuggestion(BaseModel):
    type: str  # "experience" or "project"
    index: int
    suggested: str


@router.get("/discover")
async def discover(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Analyze resume entries and suggest metric-enriched rewrites."""
    result = await db.execute(select(Portfolio).where(Portfolio.user_id == current_user.id))
    portfolio = result.scalar_one_or_none()
    if not portfolio:
        raise HTTPException(status_code=404, detail="No portfolio found")

    parsed_data = json.loads(portfolio.parsed_data) if portfolio.parsed_data else {}
    career_graph = json.loads(portfolio.career_graph) if portfolio.career_graph else {}

    suggestions = await discover_achievements(parsed_data, career_graph)
    return {"suggestions": suggestions}


@router.post("/apply")
async def apply_suggestion(
    req: ApplySuggestion,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Apply a single achievement suggestion to the portfolio."""
    result = await db.execute(select(Portfolio).where(Portfolio.user_id == current_user.id))
    portfolio = result.scalar_one_or_none()
    if not portfolio:
        raise HTTPException(status_code=404, detail="No portfolio found")

    parsed_data = json.loads(portfolio.parsed_data) if portfolio.parsed_data else {}

    if req.type == "experience":
        experiences = parsed_data.get("experience", [])
        if req.index < 0 or req.index >= len(experiences):
            raise HTTPException(status_code=400, detail="Invalid experience index")
        experiences[req.index]["description"] = req.suggested
        parsed_data["experience"] = experiences
    elif req.type == "project":
        projects = parsed_data.get("projects", [])
        if req.index < 0 or req.index >= len(projects):
            raise HTTPException(status_code=400, detail="Invalid project index")
        projects[req.index]["description"] = req.suggested
        parsed_data["projects"] = projects
    else:
        raise HTTPException(status_code=400, detail="Type must be 'experience' or 'project'")

    await update_portfolio(db, portfolio, {"parsed_data": parsed_data})
    return {"message": "Suggestion applied", "parsed_data": parsed_data}
