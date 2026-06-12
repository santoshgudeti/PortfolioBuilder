import json
from datetime import datetime, timezone
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, Request
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models.user import User
from models.portfolio import Portfolio
from services.parser import extract_text
from services.groq_service import parse_resume_with_groq, extract_career_graph
from services.portfolio_service import create_portfolio, update_portfolio
from services.rustfs_service import rustfs_service
from utils.auth import get_current_user
from utils.rate_limit import rate_limiter



router = APIRouter(prefix="/resume", tags=["Resume"])

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_resume(
    request: Request,
    file: UploadFile = File(...),
    tone: str = Form("professional"),
    mode: str = Form("replace"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ip = request.client.host if request.client else 'unknown'
    rate_limit_key = f"resume_upload:{current_user.id}:{ip}"
    
    await rate_limiter.enforce(
        key=rate_limit_key,
        limit=6, 
        window_seconds=300,
        message="Too many upload attempts. Please wait a few minutes and try again.",
    )

    if current_user and current_user.auth_provider == "email" and not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Please verify your email before generating a portfolio."
        )

    # Validate file type
    if not file.filename.lower().endswith((".pdf", ".docx")):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")

    # Read and validate size
    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds 5MB limit")

    # Upload to RustFS
    resume_object_key = None
    if rustfs_service.s3_client:
        try:
            resume_object_key = await rustfs_service.upload_file(file_bytes, file.filename, current_user.id)
        except Exception as e:
            logger.warning(f"Failed to upload to RustFS: {e}")

    # Extract text
    try:
        resume_text = extract_text(file_bytes, file.filename)
    except Exception as e:
        if resume_object_key:
            await rustfs_service.delete_file(resume_object_key)
        raise HTTPException(
            status_code=422,
            detail=f"Could not extract text: {str(e)}",
        )

    if not resume_text.strip():
        if resume_object_key:
            await rustfs_service.delete_file(resume_object_key)
        raise HTTPException(
            status_code=422,
            detail="No text found in the uploaded file. Please upload a text-based PDF or DOCX.",
        )

    # Parse with Groq (with auto-retry and caching — never throws)
    parsed_data = await parse_resume_with_groq(resume_text, tone=tone)
    ai_fallback = not parsed_data.get("name") and not parsed_data.get("skills")
    if ai_fallback:
        logger.warning(f"AI parsing returned fallback (empty) data for user {current_user.id}")

    # Extract career knowledge graph (augments parsed data, doesn't replace it)
    career_graph = await extract_career_graph(resume_text)

    # Check if user already has a portfolio
    result = await db.execute(select(Portfolio).where(Portfolio.user_id == current_user.id))
    existing_portfolio = result.scalar_one_or_none()

    if existing_portfolio:
        # Snapshot current state to version_history before any mutation
        try:
            history = json.loads(existing_portfolio.version_history or "[]")
            history.append({
                "parsed_data": json.loads(existing_portfolio.parsed_data) if existing_portfolio.parsed_data else {},
                "saved_at": datetime.now(timezone.utc).isoformat(),
            })
            # Keep max 10 most recent snapshots
            existing_portfolio.version_history = json.dumps(history[-10:])
            await db.flush()
        except Exception:
            logger.warning("Failed to snapshot portfolio version history")

        previous_resume_object_key = existing_portfolio.resume_object_key
        if mode == "merge":
            # Deep merge: keep existing edited fields, only fill empty/null from new parse
            existing_data = json.loads(existing_portfolio.parsed_data) if existing_portfolio.parsed_data else {}
            new_data = json.loads(parsed_data) if isinstance(parsed_data, str) else parsed_data
            merged: dict[str, Any] = {**new_data}
            for key, val in existing_data.items():
                if val and val != "" and val != []:
                    if key == "skills" and isinstance(val, list) and isinstance(merged.get("skills", []), list):
                        # Deduplicate and append new skills
                        existing_set = set(s.lower() for s in val)
                        new_skills = [s for s in merged.get("skills", []) if s.lower() not in existing_set]
                        merged["skills"] = val + new_skills
                    else:
                        merged[key] = val
            portfolio = await update_portfolio(
                db,
                existing_portfolio,
                {
                    "parsed_data": json.dumps(merged) if isinstance(merged, dict) else merged, 
                    "career_graph": career_graph,
                    "resume_filename": file.filename,
                    "resume_object_key": resume_object_key if resume_object_key else existing_portfolio.resume_object_key,
                    # Auto-publish on successful generation/update.
                    "is_published": True,
                },
            )
            parsed_data = merged
        else:
            # Replace mode: overwrite everything
            portfolio = await update_portfolio(
                db,
                existing_portfolio,
                {
                    "parsed_data": parsed_data, 
                    "career_graph": career_graph,
                    "resume_filename": file.filename,
                    "resume_object_key": resume_object_key if resume_object_key else existing_portfolio.resume_object_key,
                    # Auto-publish on successful generation/update.
                    "is_published": True,
                },
            )

        if (
            resume_object_key
            and previous_resume_object_key
            and resume_object_key != previous_resume_object_key
        ):
            deleted = await rustfs_service.delete_file(previous_resume_object_key)
            if not deleted:
                logger.warning(
                    f"Uploaded a replacement resume for {current_user.email}, but failed to delete old object {previous_resume_object_key}"
                )
    else:
        # Create new portfolio
        portfolio = await create_portfolio(
            db,
            user_id=current_user.id,
            parsed_data=parsed_data,
            career_graph=career_graph,
            resume_filename=file.filename,
            resume_object_key=resume_object_key,
        )

    return {
        "message": "Resume parsed successfully" if not ai_fallback else "AI parsing was limited. You can edit the data manually in the editor.",
        "portfolio_id": portfolio.id,
        "slug": portfolio.slug,
        "parsed_data": parsed_data,
        "ai_fallback": ai_fallback,
    }
