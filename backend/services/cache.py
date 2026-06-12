import hashlib
import json
import os
import time
from pathlib import Path

CACHE_DIR = Path(os.path.dirname(__file__)) / ".." / ".cache"
CACHE_TTL_SECONDS = 86400 * 7  # 7 days

def _ensure_cache_dir():
    CACHE_DIR.mkdir(parents=True, exist_ok=True)

def _cache_key(resume_text: str, tone: str) -> str:
    raw = f"{resume_text}:::{tone}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()

def _cache_path(key: str) -> Path:
    return CACHE_DIR / f"{key}.json"

def get_cached_parse(resume_text: str, tone: str) -> dict | None:
    key = _cache_key(resume_text, tone)
    path = _cache_path(key)
    if not path.exists():
        return None
    try:
        data = json.loads(path.read_text("utf-8"))
        if time.time() - data["cached_at"] > CACHE_TTL_SECONDS:
            path.unlink(missing_ok=True)
            return None
        return data["result"]
    except Exception:
        path.unlink(missing_ok=True)
        return None

def set_cached_parse(resume_text: str, tone: str, result: dict):
    _ensure_cache_dir()
    key = _cache_key(resume_text, tone)
    path = _cache_path(key)
    try:
        path.write_text(
            json.dumps({"cached_at": time.time(), "result": result}, ensure_ascii=False),
            encoding="utf-8",
        )
    except Exception:
        pass
