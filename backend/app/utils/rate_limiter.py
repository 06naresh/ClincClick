"""In-memory sliding-window rate limiter for sensitive endpoints.

Intentional simplification for the current single-process development setup:
the counters live in one Python process. When the application is later
deployed with multiple workers, replace this with a shared store (e.g. Redis)
— the interface below (`allow_or_raise`) stays the same.
"""

import threading
import time
from collections import defaultdict, deque

from app.core.exceptions import DomainError


class RateLimitExceeded(DomainError):
    status_code = 429
    message = "Too many requests. Please try again shortly."


class SlidingWindowRateLimiter:
    """Allows at most `max_attempts` actions per IP within `window_seconds`."""

    def __init__(self, max_attempts: int, window_seconds: int) -> None:
        self.max_attempts = max_attempts
        self.window_seconds = window_seconds
        self._attempts: dict[str, deque[float]] = defaultdict(deque)
        self._lock = threading.Lock()

    def allow_or_raise(self, key: str) -> None:
        """Record one attempt for `key` or raise 429 if the window is full."""
        now = time.monotonic()
        with self._lock:
            attempts = self._attempts[key]
            while attempts and attempts[0] <= now - self.window_seconds:
                attempts.popleft()
            if len(attempts) >= self.max_attempts:
                raise RateLimitExceeded()
            attempts.append(now)
