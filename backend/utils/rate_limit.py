from collections import defaultdict, deque
from threading import Lock
from time import time

from fastapi import HTTPException, status


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
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=message,
                )

            bucket.append(now)


rate_limiter = InMemoryRateLimiter()
