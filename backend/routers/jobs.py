import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models.user import User
from models.portfolio import Portfolio
from services.job_matching_service import find_matching_roles
from utils.auth import get_current_user

router = APIRouter(prefix="/jobs", tags=["Job Matching"])


@router.get("/matches")
async def get_job_matches(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Analyze career data and return matching job roles with scores."""
    result = await db.execute(select(Portfolio).where(Portfolio.user_id == current_user.id))
    portfolio = result.scalar_one_or_none()
    if not portfolio:
        raise HTTPException(status_code=404, detail="No portfolio found")

    parsed_data = json.loads(portfolio.parsed_data) if portfolio.parsed_data else {}
    career_graph = json.loads(portfolio.career_graph) if portfolio.career_graph else {}

    try:
        matches = await find_matching_roles(parsed_data, career_graph)
        return matches
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Analysis failed: {str(e)}")
