"""FastAPI application entry point.

Phase 02 scope:
- Versioned API mounted at /api/v1 (health endpoints implemented).
- Consistent error responses: every HTTPException is returned in the
  standardized success/message envelope defined in app/schemas/common.py.

Later phases register their routers/services here without changing the shape
of this file (md_files/architecture.md).
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.v1.router import api_v1_router
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


# --- Standardized error envelope handlers -----------------------------------


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(
    request: Request, exc: StarletteHTTPException
) -> JSONResponse:
    """Errors use the same envelope shape as successes (success=false).

    Registered for Starlette's HTTPException so it also covers FastAPI's
    subclass and router-matching 404s.
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": str(exc.detail),
            "errors": [],
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """422 responses list field-level validation errors in `errors`."""
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "message": "Request validation failed",
            "errors": jsonable_encoder(exc.errors()),
        },
    )


# --- Routes -------------------------------------------------------------------

app.include_router(api_v1_router, prefix="/api/v1")


@app.get("/", tags=["Health"])
def root():
    """Simple root endpoint confirming the API is running."""
    return {"success": True, "message": f"{settings.APP_NAME} is running"}
