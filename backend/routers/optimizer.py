import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from loguru import logger

from database import get_db
from models.user import User
from models.portfolio import Portfolio
from services.resume_optimizer import analyze_resume
from utils.auth import get_current_user

router = APIRouter(prefix="/optimizer", tags=["Resume Optimizer"])


@router.get("/analyze")
async def get_resume_analysis(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Analyze the current user's resume and return ATS scorecard with suggestions."""
    result = await db.execute(select(Portfolio).where(Portfolio.user_id == current_user.id))
    portfolio = result.scalar_one_or_none()
    if not portfolio:
        raise HTTPException(status_code=404, detail="No portfolio found. Upload a resume first.")

    parsed_data = json.loads(portfolio.parsed_data) if portfolio.parsed_data else {}
    career_graph = json.loads(portfolio.career_graph) if portfolio.career_graph else {}

    try:
        scorecard = await analyze_resume(parsed_data, career_graph)
        return scorecard
    except Exception as e:
        logger.error(f"Resume analysis failed: {e}")
        raise HTTPException(status_code=502, detail=f"AI analysis failed: {str(e)}")
