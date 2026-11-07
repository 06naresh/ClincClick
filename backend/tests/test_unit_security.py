"""Unit tests — security utilities (Phase 09)."""

import datetime
import jwt

from app.core.config import settings
from app.core.security import (
    decode_access_token,
    generate_refresh_token,
    hash_password,
    hash_refresh_token,
    verify_password,
)


def test_password_hash_roundtrip() -> None:
    hashed = hash_password("SuperSecret1")
    assert hashed != "SuperSecret1"
    assert verify_password("SuperSecret1", hashed) is True
    assert verify_password("WrongPass1", hashed) is False


def test_access_token_validates() -> None:
    raw = hash_password("whatever")  # not relevant
    del raw
    from app.core.security import create_access_token

    token = create_access_token(user_id=42, role="customer")
    payload = decode_access_token(token)
    assert payload["sub"] == "42"
    assert payload["role"] == "customer"
    assert payload["type"] == "access"


def test_expired_token_raises() -> None:
    import jwt as pyjwt

    now = datetime.datetime.now(datetime.timezone.utc)
    expired = pyjwt.encode(
        {
            "sub": "1",
            "role": "customer",
            "type": "access",
            "iat": now - datetime.timedelta(hours=1),
            "exp": now - datetime.timedelta(minutes=5),
        },
        settings.SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )
    from app.core.security import decode_access_token

    try:
        decode_access_token(expired)
        assert False, "Expected ValueError"
    except ValueError as exc:
        assert "expired" in str(exc).lower()


def test_wrong_token_type_rejected() -> None:
    import jwt as pyjwt

    wrong = pyjwt.encode(
        {
            "sub": "1",
            "role": "customer",
            "type": "refresh",
            "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=5),
        },
        settings.SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )
    from app.core.security import decode_access_token

    try:
        decode_access_token(wrong)
        assert False, "Expected ValueError"
    except ValueError as exc:
        assert "type" in str(exc).lower() or "invalid" in str(exc).lower()


def test_garbage_token_raises() -> None:
    from app.core.security import decode_access_token

    try:
        decode_access_token("not.a.jwt")
        assert False, "Expected ValueError"
    except ValueError:
        pass


def test_refresh_token_hash_only() -> None:
    raw, hashed = generate_refresh_token()
    assert raw and hashed
    assert raw != hashed
    assert hash_refresh_token(raw) == hashed
    assert len(hashed) == 64
