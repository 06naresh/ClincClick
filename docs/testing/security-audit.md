# Security Audit Checklist – Service Booking Application

Date reviewed: see project commit history. Environment: local dev.

## Backend
- Passwords hashed with Argon2 (`pwdlib` + Argon2): **Passed**
- No plain-text passwords in DB / logs / responses: **Passed**
- JWT signatures and expiry validated; short-lived access tokens (15 min): **Passed**
- Refresh tokens stored as hashes in `refresh_tokens` table; single-use rotation on every refresh: **Passed**
- Refresh-token delivery limited to HTTP-only, SameSite=Lax, path-scoped cookie: **Passed**
- Role checks enforced on backend (`require_admin`): **Passed**
- Cross-customer booking access prevented (ownership checks) + 403 test: **Passed**
- Registration public-created accounts always receive customer role (role absent from schema): **Passed**
- Pydantic validation on every request schema: **Passed**
- SQLAlchemy ORM (no raw SQL from user input): **Passed**
- CORS origin restricted to configured frontend URL: **Passed**
- Rate limiting on `/auth/*` (50 requests/60s/IP): **Passed**
- Centralized error responses (no stack trace to client): **Passed**
- Secrets held in `.env` (gitignored, not committed): **Passed**
- Booking overbooking prevented (`SELECT ... FOR UPDATE` capacity check inside transaction): **Passed**
- Booking history audit preserved (created, rescheduled, cancelled, status changes): **Passed**
- Booking entity retains terminal/cancelled state (no destructive delete): **Passed**

## Frontend
- Authentication token kept in memory only (not localStorage/sessionStorage): **Passed**
- Token received via response body, attached through Axios interceptor: **Passed**
- Refresh flow restores session on reload without exposing credentials: **Passed**
- Forms use React Hook Form + Zod validation: **Passed**
- No secrets embedded in bundle (env base URL only): **Passed**
- Loading/error/empty states consistent: **Passed**

## Open items / Phase 10
- HTTPS + `Secure` cookie in production (set `REFRESH_COOKIE_SECURE=True`).
- Multi-worker deployment: replace in-memory rate limiter with shared store.
- Add dependency-scanning in CI (`pip-audit`, `npm audit`).
- Password policy lock-up threshold currently second-attempt timing; tune in production per business requirements.
- Calendar/arbitrary cancellation-window policies intentionally left configurable rather than hard-coded.
