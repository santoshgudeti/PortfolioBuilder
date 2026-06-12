import re


def generate_slug(name: str, user_id: str) -> str:
    """Generate a URL-friendly slug from name."""
    base = re.sub(r"[^a-zA-Z0-9\s]", "", name.lower())
    base = re.sub(r"\s+", "-", base.strip())
    suffix = user_id[:6]
    return f"{base}-{suffix}" if base else f"user-{suffix}"
