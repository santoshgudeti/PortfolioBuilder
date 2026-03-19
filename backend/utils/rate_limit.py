from __future__ import annotations

from collections import defaultdict, deque
from threading import Lock
from time import time

from fastapi import HTTPException, status
from loguru import logger

from config import get_settings


class InMemoryRateLimiter:
    """Small in-memory rate limiter for single-process deployments."""

    def __init__(self) -> None:
        self._hits: dict[str, deque[float]] = defaultdict(deque)
        self._lock = Lock()

    def enforce(self, key: str, limit: int, window_seconds: int, message: str) -> None:
        now = time()
        cutoff = now - window_seconds

        with self._lock:
            bucket = self._hits[key]
            while bucket and bucket[0] < cutoff:
                bucket.popleft()

            if len(bucket) >= limit:
                raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=message)

            bucket.append(now)


class RedisRateLimiter:
    """Redis-backed sliding-window counter (best-effort) for multi-instance deployments."""

    def __init__(self, redis_url: str) -> None:
        self._redis_url = redis_url
        self._client = None

    async def _get_client(self):
        if self._client is not None:
            return self._client
        try:
            import redis.asyncio as redis  # type: ignore

            self._client = redis.from_url(self._redis_url, decode_responses=True)
            return self._client
        except Exception as e:
            logger.warning(f"Redis rate limiter disabled (init failed): {e}")
            self._client = None
            return None

    async def enforce(self, key: str, limit: int, window_seconds: int, message: str) -> None:
        client = await self._get_client()
        if client is None:
            # If Redis is unavailable, caller should fall back to in-memory limiter.
            raise RuntimeError("redis_unavailable")

        # Sliding window with ZSET of timestamps.
        now = time()
        cutoff = now - window_seconds
        zkey = f"rl:{key}"

        try:
            async with client.pipeline(transaction=True) as pipe:
                pipe.zremrangebyscore(zkey, 0, cutoff)
                pipe.zadd(zkey, {str(now): now})
                pipe.zcard(zkey)
                pipe.expire(zkey, window_seconds + 10)
                _, _, count, _ = await pipe.execute()

            if int(count) > limit:
                raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=message)
        except HTTPException:
            raise
        except Exception as e:
            logger.warning(f"Redis rate limiter error; falling back to in-memory: {e}")
            raise RuntimeError("redis_error")


class RateLimiter:
    """Unified limiter with Redis (optional) + in-memory fallback."""

    def __init__(self) -> None:
        self._settings = get_settings()
        self._mem = InMemoryRateLimiter()
        self._redis = RedisRateLimiter(self._settings.redis_url) if self._settings.redis_url else None

    async def enforce(self, key: str, limit: int, window_seconds: int, message: str) -> None:
        if self._redis is not None:
            try:
                await self._redis.enforce(key, limit, window_seconds, message)
                return
            except RuntimeError:
                # fall back
                pass

        self._mem.enforce(key, limit, window_seconds, message)


rate_limiter = RateLimiter()
