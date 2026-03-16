import json
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, or_, delete, desc
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from models.user import User
from models.portfolio import Portfolio
from models.page_view import PageView
from models.audit_log import AuditLog
from services.groq_service import check_health as check_groq_health, analyze_portfolio_spam
import shutil
import psutil
from services.rustfs_service import rustfs_service
from utils.auth import get_admin_user

router = APIRouter(prefix="/admin", tags=["Admin"])


async def log_admin_action(db: AsyncSession, admin_id: str, action: str, target_id: str | None = None, target_type: str | None = None, details: str | None = None):
    log = AuditLog(
        admin_id=admin_id,
        action=action,
        target_id=target_id,
        target_type=target_type,
        details=details
    )
    db.add(log)
    await db.commit()


@router.get("/stats")
async def get_stats(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    user_count = await db.execute(select(func.count(User.id)))
    portfolio_count = await db.execute(select(func.count(Portfolio.id)))
    published_count = await db.execute(
        select(func.count(Portfolio.id)).where(Portfolio.is_published == True)
    )
    total_views = await db.execute(select(func.count(PageView.id)))
    verified_count = await db.execute(
        select(func.count(User.id)).where(User.is_verified == True)
    )

    # Top 5 most-viewed portfolios
    top_result = await db.execute(
        select(Portfolio.slug, Portfolio.view_count)
        .where(Portfolio.view_count > 0)
        .order_by(Portfolio.view_count.desc())
        .limit(5)
    )
    top_portfolios = [{"slug": r.slug, "views": r.view_count or 0} for r in top_result]

    # Signups per day (last 7 days)
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    signup_query = await db.execute(
        select(
            func.date(User.created_at).label("day"),
            func.count(User.id).label("count")
        )
        .where(User.created_at >= seven_days_ago)
        .group_by(func.date(User.created_at))
        .order_by(func.date(User.created_at))
    )
    daily_signups = [{
        "date": str(row.day),
        "count": row.count
    } for row in signup_query]

    return {
        "total_users": user_count.scalar(),
        "total_portfolios": portfolio_count.scalar(),
        "published_portfolios": published_count.scalar(),
        "total_views": total_views.scalar(),
        "verified_users": verified_count.scalar(),
        "top_portfolios": top_portfolios,
        "daily_signups": daily_signups,
    }


@router.get("/users")
async def list_users(
    search: str = Query("", description="Search by name or email"),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    query = select(User).order_by(User.created_at.desc())
    if search.strip():
        pattern = f"%{search.strip()}%"
        query = query.where(or_(User.name.ilike(pattern), User.email.ilike(pattern)))

    result = await db.execute(query)
    users = result.scalars().all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "auth_provider": u.auth_provider,
            "is_active": u.is_active,
            "is_admin": u.is_admin,
            "is_verified": u.is_verified,
            "avatar_url": u.avatar_url,
            "created_at": u.created_at,
        }
        for u in users
    ]


@router.get("/portfolios")
async def list_portfolios(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    result = await db.execute(select(Portfolio).order_by(Portfolio.created_at.desc()))
    portfolios = result.scalars().all()
    return [
        {
            "id": p.id,
            "user_id": p.user_id,
            "slug": p.slug,
            "theme": p.theme,
            "primary_color": p.primary_color,
            "is_published": p.is_published,
            "view_count": p.view_count or 0,
            "created_at": p.created_at,
        }
        for p in portfolios
    ]


@router.patch("/users/{user_id}/verify")
async def verify_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    """Manually verify a user's email."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_verified = True
    await db.commit()
    await log_admin_action(db, _.id, "VERIFY_USER", user_id, "user", f"Verified user {user.email}")
    return {"message": f"User {user.email} verified."}


@router.patch("/users/{user_id}/toggle-admin")
async def toggle_user_admin(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Grant or revoke admin privileges."""
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot demote yourself.")
    
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_admin = not user.is_admin
    await db.commit()
    await log_admin_action(
        db, 
        admin.id, 
        "TOGGLE_ADMIN", 
        user_id, 
        "user", 
        f"{'Promoted' if user.is_admin else 'Demoted'} user {user.email}"
    )
    return {"message": f"User {user.email} admin status: {user.is_admin}"}


@router.patch("/users/{user_id}/toggle-active")
async def toggle_user_active(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    """Suspend or activate a user account."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    await db.commit()
    await log_admin_action(
        db, 
        _.id, 
        "TOGGLE_ACTIVE", 
        user_id, 
        "user", 
        f"{'Activated' if user.is_active else 'Suspended'} user {user.email}"
    )
    return {"message": f"User {user.email} is now {'active' if user.is_active else 'deactivated'}."}


@router.delete("/users/{user_id}")
async def delete_user_admin(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    """Hard delete a user and cascade delete their portfolio and page views."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Delete page views for user's portfolios
    portfolio_result = await db.execute(select(Portfolio.id).where(Portfolio.user_id == user_id))
    portfolio_ids = [row[0] for row in portfolio_result.all()]
    portfolio_objects_result = await db.execute(
        select(Portfolio.resume_object_key).where(Portfolio.user_id == user_id)
    )
    resume_object_keys = [row[0] for row in portfolio_objects_result.all() if row[0]]

    failed_deletions = await rustfs_service.delete_files(resume_object_keys)
    if failed_deletions:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=500,
            detail="Could not delete stored resume files for this user.",
        )

    if portfolio_ids:
        await db.execute(delete(PageView).where(PageView.portfolio_id.in_(portfolio_ids)))

    # Delete portfolios
    await db.execute(delete(Portfolio).where(Portfolio.user_id == user_id))
    
    await db.delete(user)
    await db.commit()
    await log_admin_action(db, _.id, "DELETE_USER", user_id, "user", f"Permanently deleted user {user.email}")
    return {"message": f"User {user.email} completely deleted."}


@router.patch("/portfolios/{portfolio_id}/unpublish")
async def unpublish_portfolio(
    portfolio_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    """Forcefully unpublish a portfolio."""
    result = await db.execute(select(Portfolio).where(Portfolio.id == portfolio_id))
    portfolio = result.scalar_one_or_none()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    portfolio.is_published = False
    await db.commit()
    await log_admin_action(db, _.id, "UNPUBLISH_PORTFOLIO", portfolio_id, "portfolio", f"Force unpublished portfolio: {portfolio.slug}")
    return {"message": f"Portfolio '{portfolio.slug}' unpublished."}


@router.delete("/portfolios/{portfolio_id}")
async def delete_portfolio_admin(
    portfolio_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    """Hard delete a portfolio."""
    result = await db.execute(select(Portfolio).where(Portfolio.id == portfolio_id))
    portfolio = result.scalar_one_or_none()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    if portfolio.resume_object_key:
        deleted = await rustfs_service.delete_file(portfolio.resume_object_key)
        if not deleted:
            raise HTTPException(
                status_code=500,
                detail="Could not delete the portfolio's stored resume file.",
            )
    await db.execute(delete(PageView).where(PageView.portfolio_id == portfolio_id))
    await db.delete(portfolio)
    await db.commit()
    await log_admin_action(db, _.id, "DELETE_PORTFOLIO", portfolio_id, "portfolio", f"Permanently deleted portfolio: {portfolio.slug}")
    return {"message": f"Portfolio '{portfolio.slug}' deleted."}


@router.post("/portfolios/{portfolio_id}/analyze-spam")
async def analyze_portfolio_for_spam_action(
    portfolio_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Trigger AI analysis to check if a portfolio is spam."""
    result = await db.execute(select(Portfolio).where(Portfolio.id == portfolio_id))
    portfolio = result.scalar_one_or_none()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    # Use the stored parsed payload instead of non-existent ORM fields.
    parsed_data = json.loads(portfolio.parsed_data) if portfolio.parsed_data else {}
    analysis_data = {
        "slug": portfolio.slug,
        "name": parsed_data.get("name", ""),
        "parsed_data": parsed_data,
    }
    
    analysis = await analyze_portfolio_spam(analysis_data)
    
    # Log the action
    await log_admin_action(
        db, 
        admin.id, 
        "ANALYZE_SPAM", 
        portfolio_id, 
        "portfolio", 
        f"AI Moderation: Category={analysis.get('category')} Confidence={analysis.get('confidence')}. Reason: {analysis.get('reason')}"
    )
    
    return analysis


@router.get("/logs")
async def list_audit_logs(
    limit: int = Query(50, le=100),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    """Retrieve recent administrative actions."""
    # Optimization: join with User to get admin names
    query = select(AuditLog, User.name.label("admin_name"))\
        .outerjoin(User, AuditLog.admin_id == User.id)\
        .order_by(desc(AuditLog.created_at))\
        .limit(limit)
    
    result = await db.execute(query)
    logs = []
    for row, admin_name in result:
        logs.append({
            "id": row.id,
            "admin_name": admin_name or "Unknown Admin",
            "action": row.action,
            "target_id": row.target_id,
            "target_type": row.target_type,
            "details": row.details,
            "created_at": row.created_at
        })
    return logs


@router.get("/system/health")
async def get_system_health(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    """Comprehensive system health monitor for admins."""
    from sqlalchemy import text
    from datetime import datetime
    import os

    # 1. Database Health
    db_status = "unhealthy"
    try:
        await db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception:
        pass

    # 2. Groq AI Health
    groq_status = "unhealthy"
    try:
        if await check_groq_health():
            groq_status = "healthy"
    except Exception:
        pass

    # 3. RustFS Health
    rustfs_status = "unhealthy"
    try:
        if await rustfs_service.check_health():
            rustfs_status = "healthy"
    except Exception:
        pass

    # 4. Disk Usage (Internal Uploads)
    upload_dir = os.path.join(os.getcwd(), "uploads")
    disk_usage = {"total": 0, "used": 0, "free": 0, "percent": 0}
    if os.path.exists(upload_dir):
        usage = shutil.disk_usage(upload_dir)
        disk_usage = {
            "total": usage.total,
            "used": usage.used,
            "free": usage.free,
            "percent": round((usage.used / usage.total) * 100, 2)
        }

    # 5. Memory Usage
    memory = psutil.virtual_memory()
    memory_usage = {
        "total": memory.total,
        "available": memory.available,
        "percent": memory.percent
    }

    return {
        "status": "ok" if all(s == "healthy" for s in [db_status, groq_status, rustfs_status]) else "degraded",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "database": db_status,
            "groq_ai": groq_status,
            "storage_rustfs": rustfs_status
        },
        "resources": {
            "disk": disk_usage,
            "memory": memory_usage
        }
    }
