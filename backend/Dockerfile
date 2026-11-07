# backend/Dockerfile

# Build stage: install dependencies
FROM python:3.14-slim AS builder
WORKDIR /app

# System deps for PostgreSQL driver + argon2 wheel builds (only as needed).
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential \
    && rm -rf /var/lib/apt/lists/*

# Keep pip's cache layer lean.
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir --prefix=/install -r requirements.txt

# Runtime stage
FROM python:3.14-slim AS runtime
WORKDIR /app

# Bring installed packages from builder (faster starts; less attack surface).
COPY --from=builder /install /usr/local
COPY . .

# Non-root user for safety.
RUN useradd --uid 10001 --create-home appuser \
    && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# `alembic upgrade head` is run as part of a deployment script, not here.
ENV APP_ENV=production \
    DEBUG=False

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/api/v1/health')" || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
