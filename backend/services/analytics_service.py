from urllib.parse import urlparse
from datetime import datetime, timezone, timedelta

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from models.page_view import PageView


RECRUITER_REFERRERS = [
    "linkedin.com/recruiter",
    "linkedin.com/talent",
    "indeed.com",
    "glassdoor.com",
    "monster.com",
    "ziprecruiter.com",
    "careerbuilder.com",
    "wellfound.com",
    "angellist.com",
    "hackerrank.com",
    "leetcode.com",
    "greenhouse.io",
    "lever.co",
    "workable.com",
    "bamboohr.com",
]

RECRUITER_UA_KEYWORDS = [
    "greenhouse",
    "lever",
    "workable",
    "bamboohr",
    "icims",
    "smartrecruiters",
]

BOT_UA_KEYWORDS = [
    "bot",
    "crawler",
    "spider",
    "scraper",
    "headless",
    "python-requests",
    "curl",
    "wget",
    "ahrefs",
    "semrush",
    "majestic",
    "proximic",
]


def classify_visitor(user_agent: str | None, referrer: str | None) -> tuple[str, int]:
    """Classify a visitor into a segment and return intent score (0-100)."""
    ua = (user_agent or "").lower()
    ref = (referrer or "").lower()

    # Bot detection
    if any(kw in ua for kw in BOT_UA_KEYWORDS):
        return ("bot", 0)

    # Recruiter detection
    if any(r in ref for r in RECRUITER_REFERRERS):
        return ("recruiter", 95)
    if any(kw in ua for kw in RECRUITER_UA_KEYWORDS):
        return ("recruiter", 90)

    # Recruiter-like: LinkedIn (non-recruiter specific path), wellfound
    if "linkedin" in ref:
        return ("professional", 70)
    if "wellfound" in ref or "angellist" in ref:
        return ("recruiter", 85)

    # Peer/developer
    if "github" in ref:
        return ("peer", 50)
    if "stackoverflow" in ref or "stackexchange" in ref:
        return ("peer", 55)

    # Academic/ researcher
    if "scholar.google" in ref or "academia" in ref or "researchgate" in ref:
        return ("researcher", 60)
    if any(domain in ref for domain in [".edu", "ac.uk", ".edu.au"]):
        return ("researcher", 65)

    # Direct visit (typed URL or bookmark) - high intent
    if ref == "direct" or not ref:
        return ("direct", 75)

    # Social media
    if "twitter" in ref or "x.com" in ref:
        return ("social", 40)
    if "facebook" in ref or "fb.com" in ref:
        return ("social", 30)
    if "reddit" in ref:
        return ("social", 35)

    # Search engine
    if "google" in ref or "bing" in ref or "duckduckgo" in ref or "yahoo" in ref:
        return ("search", 45)

    # General referral
    return ("referral", 50)


def is_mobile(user_agent: str | None) -> bool:
    ua = (user_agent or "").lower()
    return any(kw in ua for kw in ["mobile", "android", "iphone", "ipad", "ipod"])


def clean_referrer(referrer: str | None) -> str:
    ref = (referrer or "").lower()
    if not ref or ref == "direct":
        return "Direct"
    if "linkedin" in ref:
        return "LinkedIn"
    if "twitter" in ref or "x.com" in ref:
        return "Twitter/X"
    if "github" in ref:
        return "GitHub"
    if "google" in ref:
        return "Google"
    if "bing" in ref:
        return "Bing"
    if "facebook" in ref or "fb.com" in ref:
        return "Facebook"
    if "reddit" in ref:
        return "Reddit"
    if "wellfound" in ref or "angellist" in ref:
        return "Wellfound"
    if "indeed" in ref:
        return "Indeed"
    if "glassdoor" in ref:
        return "Glassdoor"
    try:
        domain = urlparse(ref).netloc
        return domain.replace("www.", "") if domain else "Other"
    except Exception:
        return "Other"


async def get_enhanced_analytics(portfolio_id: str, db: AsyncSession) -> dict:
    """Get enhanced analytics with visitor segments, intent scoring, and trends."""
    now = datetime.now(timezone.utc)
    seven_days_ago = now - timedelta(days=7)
    thirty_days_ago = now - timedelta(days=30)

    # --- Total views (all time) ---
    total = await db.scalar(
        select(func.count(PageView.id)).where(PageView.portfolio_id == portfolio_id)
    )

    # --- Views trend (30 days) ---
    views_30d = await db.execute(
        select(
            func.date(PageView.viewed_at).label("day"),
            func.count(PageView.id).label("count"),
        )
        .where(PageView.portfolio_id == portfolio_id, PageView.viewed_at >= thirty_days_ago)
        .group_by(func.date(PageView.viewed_at))
        .order_by(func.date(PageView.viewed_at))
    )
    views_by_day_30d = {str(row.day): row.count for row in views_30d}

    # Fill missing days
    daily_views_30d = []
    for i in range(30):
        day = (now - timedelta(days=29 - i)).strftime("%Y-%m-%d")
        daily_views_30d.append({"date": day, "views": views_by_day_30d.get(day, 0)})

    # 7-day (for backward compat and short view)
    daily_views_7d = daily_views_30d[-7:]

    # --- Visitor segments (30 days) ---
    segments_raw = await db.execute(
        select(
            PageView.visitor_type,
            func.count(PageView.id).label("count"),
        )
        .where(PageView.portfolio_id == portfolio_id, PageView.viewed_at >= thirty_days_ago)
        .group_by(PageView.visitor_type)
        .order_by(func.count(PageView.id).desc())
    )
    segments = [{"type": row.visitor_type or "unknown", "count": row.count} for row in segments_raw]

    # --- Intent distribution ---
    intent_raw = await db.execute(
        select(
            PageView.intent_score,
            func.count(PageView.id).label("count"),
        )
        .where(PageView.portfolio_id == portfolio_id, PageView.viewed_at >= thirty_days_ago)
        .group_by(PageView.intent_score)
    )
    total_scored = 0
    weighted_sum = 0
    for row in intent_raw:
        cnt = row.count
        total_scored += cnt
        weighted_sum += (row.intent_score or 0) * cnt
    avg_intent = round(weighted_sum / total_scored, 1) if total_scored > 0 else 0

    # Intent buckets
    high_intent = await db.scalar(
        select(func.count(PageView.id))
        .where(
            PageView.portfolio_id == portfolio_id,
            PageView.viewed_at >= thirty_days_ago,
            PageView.intent_score >= 70,
        )
    )
    medium_intent = await db.scalar(
        select(func.count(PageView.id))
        .where(
            PageView.portfolio_id == portfolio_id,
            PageView.viewed_at >= thirty_days_ago,
            PageView.intent_score >= 40,
            PageView.intent_score < 70,
        )
    )
    low_intent = await db.scalar(
        select(func.count(PageView.id))
        .where(
            PageView.portfolio_id == portfolio_id,
            PageView.viewed_at >= thirty_days_ago,
            PageView.intent_score < 40,
            PageView.intent_score > 0,
        )
    )

    # --- Repeat visitors (by IP) ---
    repeat_raw = await db.execute(
        select(
            PageView.ip_address,
            func.count(PageView.id).label("count"),
        )
        .where(
            PageView.portfolio_id == portfolio_id,
            PageView.viewed_at >= thirty_days_ago,
            PageView.ip_address.isnot(None),
        )
        .group_by(PageView.ip_address)
        .having(func.count(PageView.id) > 1)
    )
    repeat_visitors = sum(1 for _ in repeat_raw)

    # --- Device breakdown (30 days) ---
    ua_rows = await db.execute(
        select(PageView.user_agent)
        .where(PageView.portfolio_id == portfolio_id, PageView.viewed_at >= thirty_days_ago)
    )
    mobile_count = 0
    desktop_count = 0
    for row in ua_rows:
        if is_mobile(row.user_agent):
            mobile_count += 1
        else:
            desktop_count += 1

    # --- Referrer breakdown (30 days) ---
    ref_query = await db.execute(
        select(PageView.referrer, func.count(PageView.id).label("count"))
        .where(PageView.portfolio_id == portfolio_id, PageView.viewed_at >= thirty_days_ago)
        .group_by(PageView.referrer)
        .order_by(func.count(PageView.id).desc())
        .limit(10)
    )
    referrers = []
    for row in ref_query:
        cleaned = clean_referrer(row.referrer)
        existing = next((r for r in referrers if r["source"] == cleaned), None)
        if existing:
            existing["count"] += row.count
        else:
            referrers.append({"source": cleaned, "count": row.count})

    return {
        "total_views": total or 0,
        "daily_views_7d": daily_views_7d,
        "daily_views_30d": daily_views_30d,
        "segments": segments,
        "segments_total": sum(s["count"] for s in segments),
        "intent": {
            "average": avg_intent,
            "high": high_intent or 0,
            "medium": medium_intent or 0,
            "low": low_intent or 0,
            "total_scored": total_scored or 0,
        },
        "repeat_visitors": repeat_visitors,
        "devices": {"mobile": mobile_count, "desktop": desktop_count},
        "referrers": referrers,
    }
