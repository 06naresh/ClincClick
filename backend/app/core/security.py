"""Security utilities: password hashing (Argon2) and JWT handling.

- Passwords: hashed with Argon2 via pwdlib. Plain-text passwords are never
  stored or logged.
- JWT: signed access tokens (15-minute default) and random opaque refresh
  tokens. Refresh tokens are only ever stored as SHA-256 hashes — a database
  leak must not expose usable refresh tokens.
"""

import hashlib
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Literal

import jwt
from pwdlib import PasswordHash

from app.core.config import settings

# pwdlib's recommended hasher is Argon2 when `pwdlib[argon2]` is installed.
_password_hasher = PasswordHash.recommended()

ACCESS_TOKEN_TYPE = "access"


def hash_password(plain_password: str) -> str:
    """Return the Argon2 hash for a plain-text password."""
    return _password_hasher.hash(plain_password)


def verify_password(plain_password: str, password_hash: str) -> bool:
    """Constant-time verification of a password against its stored hash."""
    return _password_hasher.verify(plain_password, password_hash)


def create_access_token(user_id: int, role: str) -> str:
    """Create a short-lived signed access token for an authenticated user."""
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload: dict[str, Any] = {
        "sub": str(user_id),
        "role": role,
        "type": ACCESS_TOKEN_TYPE,
        "iat": now,
        "exp": expires_at,
        "jti": uuid.uuid4().hex,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any]:
    """Validate signature/expiry/type of an access token.

    Returns the claims, or raises ValueError so the caller can translate the
    failure into a 401. `jwt.PyJWTError` occurrences are normalized here.
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
    except jwt.ExpiredSignatureError as exc:
        raise ValueError("Token has expired") from exc
    except jwt.InvalidTokenError as exc:
        raise ValueError("Token is invalid") from exc

    if payload.get("type") != ACCESS_TOKEN_TYPE:
        raise ValueError("Wrong token type")
    if payload.get("sub") is None:
        raise ValueError("Token subject missing")
    return payload


def generate_refresh_token() -> tuple[str, str]:
    """Create an opaque refresh token and its database-safe hash.

    Returns (raw_token, token_hash). Only the hash must be persisted.
    """
    raw_token = secrets.token_urlsafe(48)
    token_hash = hash_refresh_token(raw_token)
    return raw_token, token_hash


def hash_refresh_token(raw_token: str) -> str:
    """SHA-256 hex digest used as the refresh-token record key."""
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
