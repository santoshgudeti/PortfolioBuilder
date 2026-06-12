import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models.user import User
from models.portfolio import Portfolio
from services.content_service import generate_content, regenerate_content, CONTENT_TYPES, TONE_OPTIONS
from utils.auth import get_current_user

router = APIRouter(prefix="/content", tags=["Content Generator"])


class GenerateContentRequest(BaseModel):
    content_type: str = Field(..., description=f"One of: {', '.join(CONTENT_TYPES.keys())}")
    tone: str = Field("professional", description=f"One of: {', '.join(TONE_OPTIONS)}")
    instructions: str = ""


class RegenerateContentRequest(BaseModel):
    original_content: str
    feedback: str


@router.get("/types")
async def get_content_types():
    """Return available content types and tone options."""
    return {
        "content_types": CONTENT_TYPES,
        "tone_options": TONE_OPTIONS,
    }


@router.post("/generate")
async def create_content(
    req: GenerateContentRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate content from portfolio data."""
    result = await db.execute(select(Portfolio).where(Portfolio.user_id == current_user.id))
    portfolio = result.scalar_one_or_none()
    if not portfolio:
        raise HTTPException(status_code=404, detail="No portfolio found")

    parsed_data = json.loads(portfolio.parsed_data) if portfolio.parsed_data else {}
    career_graph = json.loads(portfolio.career_graph) if portfolio.career_graph else {}

    try:
        content = await generate_content(
            req.content_type,
            req.tone,
            req.instructions,
            parsed_data,
            career_graph,
        )
        if "error" in content and content["error"]:
            raise HTTPException(status_code=502, detail=content["error"])
        return content
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Generation failed: {str(e)}")


@router.post("/regenerate")
async def regenerate_existing_content(
    req: RegenerateContentRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Regenerate content based on feedback."""
    result = await db.execute(select(Portfolio).where(Portfolio.user_id == current_user.id))
    portfolio = result.scalar_one_or_none()
    if not portfolio:
        raise HTTPException(status_code=404, detail="No portfolio found")

    parsed_data = json.loads(portfolio.parsed_data) if portfolio.parsed_data else {}
    career_graph = json.loads(portfolio.career_graph) if portfolio.career_graph else {}

    try:
        content = await regenerate_content(req.original_content, req.feedback, parsed_data, career_graph)
        if "error" in content and content["error"]:
            raise HTTPException(status_code=502, detail=content["error"])
        return content
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Regeneration failed: {str(e)}")
