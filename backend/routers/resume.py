import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models.user import User
from models.portfolio import Portfolio
from schemas.portfolio import PortfolioOut
from services.parser import extract_text
from services.groq_service import parse_resume_with_groq
from services.portfolio_service import create_portfolio, update_portfolio
from utils.auth import get_current_user

router = APIRouter(prefix="/resume", tags=["Resume"])

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Validate file type
    if not file.filename.lower().endswith((".pdf", ".docx", ".doc")):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")

    # Read and validate size
    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds 5MB limit")

    # Extract text
    try:
        resume_text = extract_text(file_bytes, file.filename)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not extract text: {str(e)}")

    if not resume_text.strip():
        raise HTTPException(status_code=422, detail="No text found in the uploaded file")

    # Parse with Groq
    try:
        parsed_data = await parse_resume_with_groq(resume_text)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI parsing failed: {str(e)}")

    # Check if user already has a portfolio
    result = await db.execute(select(Portfolio).where(Portfolio.user_id == current_user.id))
    existing_portfolio = result.scalar_one_or_none()

    if existing_portfolio:
        # Update existing portfolio
        portfolio = await update_portfolio(
            db,
            existing_portfolio,
            {"parsed_data": parsed_data, "resume_filename": file.filename},
        )
    else:
        # Create new portfolio
        portfolio = await create_portfolio(
            db,
            user_id=current_user.id,
            parsed_data=parsed_data,
            resume_filename=file.filename,
        )

    return {
        "message": "Resume parsed successfully",
        "portfolio_id": portfolio.id,
        "slug": portfolio.slug,
        "parsed_data": parsed_data,
    }
