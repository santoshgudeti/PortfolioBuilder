"""Send portfolio reminder emails to owners of published portfolios.

Examples:
    python send_published_portfolio_emails.py
    python send_published_portfolio_emails.py --limit 25
    python send_published_portfolio_emails.py --slug my-portfolio --send
    python send_published_portfolio_emails.py --send --delay-seconds 0.5
"""

import argparse
import asyncio
from dataclasses import dataclass

from sqlalchemy import select

from config import get_settings
from database import AsyncSessionLocal
from models.portfolio import Portfolio
from models.user import User
from services.email_service import (
    build_public_portfolio_url,
    send_portfolio_checkout_email,
)


@dataclass(frozen=True)
class EmailTarget:
    email: str
    user_name: str
    slug: str
    custom_domain: str | None


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Send reminder emails to all published portfolio owners."
    )
    parser.add_argument(
        "--send",
        action="store_true",
        help="Actually send emails. Without this flag the script only previews recipients.",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Limit how many published portfolios to process.",
    )
    parser.add_argument(
        "--slug",
        action="append",
        default=[],
        help="Only process a specific portfolio slug. Repeat the flag to target multiple slugs.",
    )
    parser.add_argument(
        "--delay-seconds",
        type=float,
        default=0.0,
        help="Delay between sends to avoid SMTP throttling.",
    )
    return parser.parse_args()


async def fetch_targets(slugs: list[str], limit: int | None) -> list[EmailTarget]:
    async with AsyncSessionLocal() as session:
        stmt = (
            select(
                User.email,
                User.name,
                Portfolio.slug,
                Portfolio.custom_domain,
            )
            .join(User, Portfolio.user_id == User.id)
            .where(Portfolio.is_published.is_(True))
            .order_by(Portfolio.updated_at.desc())
        )

        if slugs:
            stmt = stmt.where(Portfolio.slug.in_(slugs))

        if limit is not None:
            stmt = stmt.limit(limit)

        result = await session.execute(stmt)
        return [
            EmailTarget(
                email=row.email,
                user_name=row.name or "there",
                slug=row.slug,
                custom_domain=row.custom_domain,
            )
            for row in result.all()
        ]


def preview_targets(targets: list[EmailTarget]) -> None:
    print(f"Found {len(targets)} published portfolio(s).")
    for target in targets:
        portfolio_url = build_public_portfolio_url(target.slug, target.custom_domain)
        print(f"- {target.email} -> {portfolio_url}")


async def send_targets(targets: list[EmailTarget], delay_seconds: float) -> tuple[int, int]:
    sent = 0
    failed = 0

    for index, target in enumerate(targets, start=1):
        try:
            await send_portfolio_checkout_email(
                email=target.email,
                user_name=target.user_name,
                slug=target.slug,
                custom_domain=target.custom_domain,
            )
            sent += 1
            print(f"[{index}/{len(targets)}] Sent to {target.email}")
        except Exception as exc:
            failed += 1
            print(f"[{index}/{len(targets)}] Failed for {target.email}: {type(exc).__name__}: {exc}")

        if delay_seconds > 0 and index < len(targets):
            await asyncio.sleep(delay_seconds)

    return sent, failed


async def main() -> int:
    args = parse_args()
    targets = await fetch_targets(args.slug, args.limit)

    if not targets:
        print("No published portfolios found.")
        return 0

    preview_targets(targets)

    if not args.send:
        print("Dry run only. Re-run with --send to actually email these users.")
        return 0

    settings = get_settings()
    if not settings.mail_username or not settings.mail_password:
        print("MAIL_USERNAME and MAIL_PASSWORD must be configured before sending.")
        return 1

    sent, failed = await send_targets(targets, args.delay_seconds)
    print(f"Finished sending. Sent={sent} Failed={failed}")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
