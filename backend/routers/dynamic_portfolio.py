import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.user import User
from models.portfolio import Portfolio
from services.dynamic_portfolio_service import generate_role_version
from utils.auth import get_current_user

router = APIRouter(prefix="/portfolio/dynamic", tags=["Dynamic Portfolios"])

SUGGESTED_ROLES = [
    "Software Engineer",
    "Product Manager",
    "Founder / Startup",
    "Engineering Manager",
    "Data Scientist",
    "Solutions Architect",
    "Technical Writer",
    "Freelancer / Consultant",
]


class GenerateRoleVersionRequest(BaseModel):
    target_role: str = Field(..., min_length=2, max_length=100)


class ActivateVersionRequest(BaseModel):
    role: str


@router.get("/suggested-roles")
async def get_suggested_roles():
    """Return list of suggested target roles."""
    return {"suggested_roles": SUGGESTED_ROLES}


@router.get("/versions")
async def get_role_versions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all generated role versions for the user's portfolio."""
    result = await db.execute(select(Portfolio).where(Portfolio.user_id == current_user.id))
    portfolio = result.scalar_one_or_none()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    versions = json.loads(portfolio.role_versions) if portfolio.role_versions else {}
    return {
        "versions": [
            {
                "role": role,
                "data": data,
                "is_active": portfolio.active_role == role,
            }
            for role, data in versions.items()
        ],
        "active_role": portfolio.active_role,
    }


@router.post("/generate")
async def create_role_version(
    req: GenerateRoleVersionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate a role-specific version of the portfolio data."""
    result = await db.execute(select(Portfolio).where(Portfolio.user_id == current_user.id))
    portfolio = result.scalar_one_or_none()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    parsed_data = json.loads(portfolio.parsed_data) if portfolio.parsed_data else {}
    career_graph = json.loads(portfolio.career_graph) if portfolio.career_graph else {}

    if not parsed_data or not parsed_data.get("skills"):
        raise HTTPException(status_code=400, detail="Portfolio has no data. Upload a resume first.")

    tailored = await generate_role_version(req.target_role, parsed_data, career_graph)
    if not tailored:
        raise HTTPException(status_code=502, detail="Failed to generate role version")

    versions = json.loads(portfolio.role_versions) if portfolio.role_versions else {}
    versions[req.target_role] = tailored
    portfolio.role_versions = json.dumps(versions)
    await db.commit()
    await db.refresh(portfolio)

    return {
        "role": req.target_role,
        "data": tailored,
        "message": f"Role version for '{req.target_role}' generated successfully.",
    }


@router.post("/activate")
async def activate_role_version(
    req: ActivateVersionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Set a role version as the active portfolio view."""
    result = await db.execute(select(Portfolio).where(Portfolio.user_id == current_user.id))
    portfolio = result.scalar_one_or_none()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    versions = json.loads(portfolio.role_versions) if portfolio.role_versions else {}
    if req.role not in versions:
        raise HTTPException(status_code=404, detail=f"Version for role '{req.role}' not found. Generate it first.")

    portfolio.active_role = req.role
    await db.commit()

    return {"active_role": req.role, "message": f"Active role set to '{req.role}'."}


@router.post("/reset")
async def reset_to_original(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Reset to original portfolio data (no role tailoring)."""
    result = await db.execute(select(Portfolio).where(Portfolio.user_id == current_user.id))
    portfolio = result.scalar_one_or_none()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    portfolio.active_role = None
    await db.commit()

    return {"message": "Reset to original portfolio data."}
