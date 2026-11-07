"""Standardized API response envelope schemas.

All successful endpoints wrap their payload in `data`; failures set
`success=False` with a message and optional error list. HTTP status codes
still convey the real outcome (never HTTP 200 for failures).
"""

from typing import Any, Literal

from pydantic import BaseModel


class SuccessResponse(BaseModel):
    success: Literal[True] = True
    message: str
    data: Any | None = None


class ErrorResponse(BaseModel):
    success: Literal[False] = False
    message: str
    errors: list[Any] = []
