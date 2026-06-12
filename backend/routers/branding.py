import json
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from loguru import logger

from database import get_db
from models.user import User
from models.portfolio import Portfolio
from services.branding_service import generate_brand_asset, generate_all_brand_assets, BRANDING_PROMPTS
from utils.auth import get_current_user

router = APIRouter(prefix="/branding", tags=["Branding"])


class BrandAssetRequest(BaseModel):
    asset_type: str
    tone: str = "professional"


class BrandAllRequest(BaseModel):
    tone: str = "professional"


@router.get("/types")
async def list_brand_asset_types():
    """List all available brand asset types."""
    return {
        "assets": [
            {
                "id": key,
                "label": key.replace("_", " ").title(),
            }
            for key in BRANDING_PROMPTS.keys()
        ]
    }


@router.post("/generate")
async def generate_single_asset(
    req: BrandAssetRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate a single brand asset."""
    result = await db.execute(select(Portfolio).where(Portfolio.user_id == current_user.id))
    portfolio = result.scalar_one_or_none()
    if not portfolio:
        raise HTTPException(status_code=404, detail="No portfolio found. Upload a resume first.")

    career_graph = json.loads(portfolio.career_graph) if portfolio.career_graph else {}
    parsed_data = json.loads(portfolio.parsed_data) if portfolio.parsed_data else {}

    if req.asset_type not in BRANDING_PROMPTS:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown asset type: {req.asset_type}. Valid: {list(BRANDING_PROMPTS.keys())}",
        )

    try:
        content = await generate_brand_asset(career_graph, parsed_data, req.asset_type, req.tone)
        return {"asset_type": req.asset_type, "content": content}
    except Exception as e:
        logger.error(f"Brand asset generation failed: {e}")
        raise HTTPException(status_code=502, detail=f"AI generation failed: {str(e)}")


@router.post("/generate-all")
async def generate_all_assets(
    req: BrandAllRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate all brand assets in parallel."""
    result = await db.execute(select(Portfolio).where(Portfolio.user_id == current_user.id))
    portfolio = result.scalar_one_or_none()
    if not portfolio:
        raise HTTPException(status_code=404, detail="No portfolio found. Upload a resume first.")

    career_graph = json.loads(portfolio.career_graph) if portfolio.career_graph else {}
    parsed_data = json.loads(portfolio.parsed_data) if portfolio.parsed_data else {}

    try:
        assets = await generate_all_brand_assets(career_graph, parsed_data, req.tone)
        return assets
    except Exception as e:
        logger.error(f"Batch brand asset generation failed: {e}")
        raise HTTPException(status_code=502, detail=f"AI generation failed: {str(e)}")
