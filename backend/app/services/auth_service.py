"""Authentication service — all auth business rules live here (Task 3.x).

- register_user: unique-email enforcement, Argon2 hashing, forced customer
  role (public registration can never create admins).
- authenticate: login credential verification.
- refresh_access_token: rotation — the presented refresh token is revoked and
  replaced in the same operation.
- logout: revokes the presented token (and only that token).

The service returns plain data; HTTP concerns (cookies, status codes) stay in
the endpoint layer.
"""

import hashlib
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import ConflictError, InvalidCredentialsError, UnauthorizedError
from app.core.security import (
    create_access_token,
    generate_refresh_token,
    hash_password,
    hash_refresh_token,
    verify_password,
)
from app.models.user import User, UserRole
from app.repositories.refresh_token_repository import RefreshTokenRepository
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest


class AuthService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.user_repository = UserRepository(db)
        self.token_repository = RefreshTokenRepository(db)

    # --- Registration (Task 3.1) -------------------------------------------

    def register_user(self, data: RegisterRequest) -> User:
        """Create a customer account. Always assigns the customer role."""
        if self.user_repository.email_exists(data.email):
            raise ConflictError("An account with this email already exists")

        user = self.user_repository.create_user(
            full_name=data.full_name,
            email=data.email,
            phone=data.phone,
            password_hash=hash_password(data.password),
            role=UserRole.CUSTOMER,  # forced; no client input can change this
        )
        return user

    # --- Login (Task 3.2) ----------------------------------------------------

    def authenticate(self, data: LoginRequest) -> User:
        """Verify credentials; generic error message prevents user enumeration."""
        user = self.user_repository.get_by_email(data.email)
        password_ok = False
        if user is not None:
            # Verify first, so timing stays consistent for missing users.
            password_ok = verify_password(data.password, user.password_hash)
        if user is None or not password_ok or not user.is_active:
            raise InvalidCredentialsError()
        return user

    def issue_login(self, user: User) -> dict:
        """Create access token + store a hashed refresh-token row.

        Returns the data needed by the endpoint (body values only; cookie
        insertion happens in the endpoint layer).
        """
        access_token = create_access_token(user.id, user.role.value)

        raw_token, token_hash = generate_refresh_token()
        expires_at = datetime.now(timezone.utc) + timedelta(
            days=settings.REFRESH_TOKEN_EXPIRE_DAYS
        )
        self.token_repository.store(
            user_id=user.id, token_hash=token_hash, expires_at=expires_at
        )
        return {"access_token": access_token, "refresh_token": raw_token, "user": user}

    # --- Refresh (rotation) ---------------------------------------------------

    def refresh_access_token(self, raw_refresh_token: str) -> dict:
        """Validate, revoke and rotate a refresh token.

        The presented token must exist unrevoked and unexpired by hash. The
        old row is revoked and a fresh row is issued (single-use tokens, so a
        replayed token fails).
        """
        now = datetime.now(timezone.utc)
        token_hash = hash_refresh_token(raw_refresh_token)

        record = self.token_repository.find_valid_by_hash(
            token_hash, now=now
        )
        if record is None:
            raise UnauthorizedError("Invalid or expired session")

        user = self.user_repository.get_by_id(record.user_id)
        if user is None or not user.is_active:
            raise UnauthorizedError("Account not found or inactive")

        # Rotation: revoke old record, then issue the new one.
        self.token_repository.revoke(record, now=now)

        access_token = create_access_token(user.id, user.role.value)
        raw_token, new_hash = generate_refresh_token()
        expires_at = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        self.token_repository.store(
            user_id=user.id, token_hash=new_hash, expires_at=expires_at
        )
        return {"access_token": access_token, "refresh_token": raw_token, "user": user}

    # --- Logout ---------------------------------------------------------------

    def logout(self, raw_refresh_token: str | None) -> None:
        """Revoke the presented refresh token, if any. Never an error if absent."""
        if not raw_refresh_token:
            return
        token_hash = hashlib.sha256(raw_refresh_token.encode("utf-8")).hexdigest()
        now = datetime.now(timezone.utc)
        record = self.token_repository.find_valid_by_hash(token_hash, now=now)
        if record is not None:
            self.token_repository.revoke(record, now=now)
