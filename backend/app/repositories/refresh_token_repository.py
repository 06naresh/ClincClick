"""Repository for refresh-token session records.

Note: this repository file is not in the original architecture.md list; it was
added because refresh-token storage needs dedicated queries and services must
not perform database access themselves (justified structure change).
"""

from datetime import datetime

from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.models.refresh_token import RefreshToken


class RefreshTokenRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def store(
        self, *, user_id: int, token_hash: str, expires_at: datetime
    ) -> RefreshToken:
        token = RefreshToken(
            user_id=user_id, token_hash=token_hash, expires_at=expires_at
        )
        self.db.add(token)
        self.db.commit()
        self.db.refresh(token)
        return token

    def find_valid_by_hash(self, token_hash: str, *, now: datetime) -> RefreshToken | None:
        """Return the record only if it exists, is unrevoked and unexpired."""
        stmt = select(RefreshToken).where(
            RefreshToken.token_hash == token_hash,
            RefreshToken.revoked_at.is_(None),
            RefreshToken.expires_at > now,
        )
        return self.db.scalar(stmt)

    def revoke(self, token: RefreshToken, *, now: datetime) -> None:
        token.revoked_at = now
        self.db.commit()

    def revoke_all_for_user(self, user_id: int, *, now: datetime) -> int:
        """Invalidate every active refresh token for a user (e.g. on logout).

        Returns the number of revoked records.
        """
        stmt = (
            update(RefreshToken)
            .where(
                RefreshToken.user_id == user_id,
                RefreshToken.revoked_at.is_(None),
            )
            .values(revoked_at=now)
        )
        result = self.db.execute(stmt)
        self.db.commit()
        return result.rowcount or 0
