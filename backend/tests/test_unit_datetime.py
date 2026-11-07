"""Unit tests — datetime utilities (Phase 09)."""

import datetime

from app.utils.datetime_utils import ensure_utc, utc_now


def test_utc_now_is_aware() -> None:
    now = utc_now()
    assert now.tzinfo is not None


def test_ensure_utc_naive_is_assumed_utc() -> None:
    naive = datetime.datetime(2025, 1, 1, 9, 0, 0)
    result = ensure_utc(naive)
    assert result.tzinfo is not None
    assert result.hour == 9


def test_ensure_utc_converts_aware() -> None:
    aware = datetime.datetime(2025, 1, 1, 9, 0, 0, tzinfo=datetime.timezone(datetime.timedelta(hours=5, minutes=30)))
    result = ensure_utc(aware)
    assert result.hour == 3
    assert result.minute == 30
