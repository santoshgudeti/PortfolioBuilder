import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.user import User
from models.portfolio import Portfolio
from services.auto_update_service import fetch_github_repos, fetch_medium_posts, merge_into_parsed_data
from utils.auth import get_current_user

router = APIRouter(prefix="/auto-update", tags=["Auto Updates"])


class GitHubSyncRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=100)


class MediumSyncRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=100)


@router.get("/sources")
async def get_connected_sources(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get currently connected external sources."""
    result = await db.execute(select(Portfolio).where(Portfolio.user_id == current_user.id))
    portfolio = result.scalar_one_or_none()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    sources = json.loads(portfolio.connected_sources) if portfolio.connected_sources else {}
    return {"sources": sources}


@router.post("/github/preview")
async def preview_github_repos(
    req: GitHubSyncRequest,
):
    """Preview GitHub repos before importing."""
    try:
        repos = await fetch_github_repos(req.username)
        return {
            "username": req.username,
            "repos": repos,
            "count": len(repos),
        }
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"GitHub fetch failed: {str(e)}")


@router.post("/github/sync")
async def sync_github(
    req: GitHubSyncRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Fetch GitHub repos and merge into portfolio."""
    result = await db.execute(select(Portfolio).where(Portfolio.user_id == current_user.id))
    portfolio = result.scalar_one_or_none()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    parsed_data = json.loads(portfolio.parsed_data) if portfolio.parsed_data else {}

    repos = await fetch_github_repos(req.username)
    if not repos:
        raise HTTPException(status_code=404, detail=f"No public repos found for GitHub user '{req.username}'")

    merged = merge_into_parsed_data(parsed_data, repos=repos)
    portfolio.parsed_data = json.dumps(merged)

    sources = json.loads(portfolio.connected_sources) if portfolio.connected_sources else {}
    sources["github"] = {"username": req.username, "last_synced": str(datetime.now(timezone.utc)), "repo_count": len(repos)}
    portfolio.connected_sources = json.dumps(sources)

    await db.commit()

    return {
        "imported": len(repos),
        "message": f"Imported {len(repos)} repos from GitHub.",
        "repos": repos,
    }


@router.post("/medium/preview")
async def preview_medium_posts(
    req: MediumSyncRequest,
):
    """Preview Medium posts before importing."""
    try:
        posts = await fetch_medium_posts(req.username)
        return {
            "username": req.username,
            "posts": posts,
            "count": len(posts),
        }
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Medium fetch failed: {str(e)}")


@router.post("/medium/sync")
async def sync_medium(
    req: MediumSyncRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Fetch Medium posts and merge into portfolio."""
    result = await db.execute(select(Portfolio).where(Portfolio.user_id == current_user.id))
    portfolio = result.scalar_one_or_none()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    parsed_data = json.loads(portfolio.parsed_data) if portfolio.parsed_data else {}

    posts = await fetch_medium_posts(req.username)
    if not posts:
        raise HTTPException(status_code=404, detail=f"No posts found for Medium user '{req.username}'")

    merged = merge_into_parsed_data(parsed_data, posts=posts)
    portfolio.parsed_data = json.dumps(merged)

    sources = json.loads(portfolio.connected_sources) if portfolio.connected_sources else {}
    sources["medium"] = {"username": req.username, "last_synced": str(datetime.now(timezone.utc)), "post_count": len(posts)}
    portfolio.connected_sources = json.dumps(sources)

    await db.commit()

    return {
        "imported": len(posts),
        "message": f"Imported {len(posts)} posts from Medium.",
        "posts": posts,
    }
