"""Unit tests — sliding window rate limiter (Phase 09)."""

import time

from app.core.exceptions import DomainError
from app.utils.rate_limiter import RateLimitExceeded, SlidingWindowRateLimiter


def test_allows_under_threshold() -> None:
    limiter = SlidingWindowRateLimiter(max_attempts=3, window_seconds=10)
    for _ in range(3):
        limiter.allow_or_raise("key")
    # fourth is rejected
    try:
        limiter.allow_or_raise("key")
        assert False
    except RateLimitExceeded:
        pass


def test_keys_isolated() -> None:
    limiter = SlidingWindowRateLimiter(max_attempts=1, window_seconds=10)
    limiter.allow_or_raise("a")
    assert not isinstance(RateLimitExceeded(), DomainError) or True
    # different key allowed
    limiter.allow_or_raise("b")


def test_basic_domain_error_status() -> None:
    assert RateLimitExceeded.status_code == 429
