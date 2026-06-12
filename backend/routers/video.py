import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.user import User
from models.portfolio import Portfolio
from services.video_service import generate_video_script
from utils.auth import get_current_user

router = APIRouter(prefix="/video", tags=["Video Portfolio"])

DURATIONS = [30, 60, 90]
TONES = ["professional", "inspiring", "modern", "creative"]


class GenerateScriptRequest(BaseModel):
    duration_seconds: int = Field(60, description=f"One of: {DURATIONS}")
    tone: str = Field("professional", description=f"One of: {TONES}")


@router.get("/options")
async def get_video_options():
    """Return available durations and tones."""
    return {"durations": DURATIONS, "tones": TONES}


@router.post("/generate")
async def create_video_script(
    req: GenerateScriptRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate a video portfolio script from portfolio data."""
    if req.duration_seconds not in DURATIONS:
        raise HTTPException(status_code=400, detail=f"Duration must be one of {DURATIONS}")
    if req.tone not in TONES:
        raise HTTPException(status_code=400, detail=f"Tone must be one of {TONES}")

    result = await db.execute(select(Portfolio).where(Portfolio.user_id == current_user.id))
    portfolio = result.scalar_one_or_none()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    parsed_data = json.loads(portfolio.parsed_data) if portfolio.parsed_data else {}
    career_graph = json.loads(portfolio.career_graph) if portfolio.career_graph else {}

    script = await generate_video_script(req.duration_seconds, req.tone, parsed_data, career_graph)
    if "error" in script:
        raise HTTPException(status_code=502, detail=script["error"])

    # Save to portfolio
    scripts = json.loads(portfolio.video_scripts) if portfolio.video_scripts else []
    entry = {
        "id": str(len(scripts) + 1),
        "created_at": str(datetime.now(timezone.utc)),
        "duration": req.duration_seconds,
        "tone": req.tone,
        "script": script,
    }
    scripts.append(entry)
    portfolio.video_scripts = json.dumps(scripts)
    await db.commit()

    return entry


@router.get("/scripts")
async def get_saved_scripts(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all saved video scripts."""
    result = await db.execute(select(Portfolio).where(Portfolio.user_id == current_user.id))
    portfolio = result.scalar_one_or_none()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    scripts = json.loads(portfolio.video_scripts) if portfolio.video_scripts else []
    return {"scripts": scripts}
