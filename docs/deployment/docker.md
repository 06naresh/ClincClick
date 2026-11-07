# Docker Deployment Guide – ClincClick

## Images

- `backend/Dockerfile` — Multi-stage (builder → runtime) Python 3.14 slim image, non-root user, pinned dependencies, built-in healthcheck.
- `frontend/Dockerfile` — Vite production build served by nginx 1.27 Alpine (SPA routing, long-term cache on hashed assets).

## Compose workflow

```bash
# Recommended: backend & frontend containers, DB stays on the local PostgreSQL.
cp .env.docker.example .env.docker
# edit .env.docker with your real DATABASE_URL, SECRET_KEY, ADMIN_*, ...
docker compose up --build

# Optional fully-containerized DB (opt-in profile):
docker compose --profile container-db up --build
```

## Environment separation

- **Local development**: `.env` (backend) + `.env` (frontend); database `service_booking_db` on localhost:5432.
- **Testing**: isolated DB configured via `TEST_DATABASE_URL` (default `service_booking_db_test`); backend pytest runs from `backend/`.
- **Production**: `.env.docker` (and CI secrets) provide `DATABASE_URL`, `SECRET_KEY`, `FRONTEND_URL`, `VITE_API_BASE_URL`. `REFRESH_COOKIE_SECURE=true` when using HTTPS.

## Migrations and production startup

Run migrations against the production database before (or during) deploy:
```bash
alembic upgrade head
```
Inside the container (`docker exec clinclick-backend alembic upgrade head`), or from a separate admin container. Never auto-run destructive migrations inside the auto-scaling/retry loop.

## Health & monitoring

- Backend `/api/v1/health` — liveness.
- Backend `/api/v1/health/db` — database connectivity check.
- Frontend `/healthz` — nginx liveness.
- Container healthchecks are defined in both Dockerfiles plus `docker-compose.yml`.

## Building Images Individually

```bash
docker build -t clinclick-backend ./backend
docker build -t clinclick-frontend --build-arg VITE_API_BASE_URL=https://api.example.com/api/v1 ./frontend
```
`VITE_API_BASE_URL` is baked in at build time (Vite). Changing it requires a rebuild.
