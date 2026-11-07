"""FastAPI application entry point.

Phase 01 scope:
- Boot the API server so the environment can be verified.
- Provide a temporary root and health endpoint used for setup verification.

Phase 02 will introduce the layered structure (api/v1 routers, services,
repositories, models, schemas) and a richer health check. Keep this file thin.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG,
    version="0.1.0",
)


# CORS: restrict to the configured frontend origin.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Health"])
def root():
    """Simple root endpoint confirming the API is running."""
    return {"success": True, "message": f"{settings.APP_NAME} is running"}


@app.get("/health", tags=["Health"])
def health():
    """Temporary health endpoint for Phase 01 environment verification.

    Moved under /api/v1 with a database check in Phase 02 (Task 2.8).
    """
    return {"success": True, "message": "API is healthy"}
