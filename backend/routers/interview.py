import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models.user import User
from models.portfolio import Portfolio
from services.interview_service import generate_questions, evaluate_answer
from utils.auth import get_current_user

router = APIRouter(prefix="/interview", tags=["Interview Preparation"])


class GenerateQuestionsRequest(BaseModel):
    role_focus: str = ""


class EvaluateAnswerRequest(BaseModel):
    question: str
    answer: str
    expected_topics: list[str]


@router.get("/questions")
async def get_interview_questions(
    role_focus: str = "",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate interview questions based on portfolio data."""
    result = await db.execute(select(Portfolio).where(Portfolio.user_id == current_user.id))
    portfolio = result.scalar_one_or_none()
    if not portfolio:
        raise HTTPException(status_code=404, detail="No portfolio found")

    parsed_data = json.loads(portfolio.parsed_data) if portfolio.parsed_data else {}
    career_graph = json.loads(portfolio.career_graph) if portfolio.career_graph else {}

    try:
        questions = await generate_questions(parsed_data, career_graph, role_focus)
        return questions
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Generation failed: {str(e)}")


@router.post("/evaluate")
async def evaluate_interview_answer(
    req: EvaluateAnswerRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Evaluate an interview answer and return feedback."""
    result = await db.execute(select(Portfolio).where(Portfolio.user_id == current_user.id))
    portfolio = result.scalar_one_or_none()
    if not portfolio:
        raise HTTPException(status_code=404, detail="No portfolio found")

    parsed_data = json.loads(portfolio.parsed_data) if portfolio.parsed_data else {}
    career_graph = json.loads(portfolio.career_graph) if portfolio.career_graph else {}

    try:
        feedback = await evaluate_answer(req.question, req.answer, req.expected_topics, parsed_data, career_graph)
        return feedback
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Evaluation failed: {str(e)}")
