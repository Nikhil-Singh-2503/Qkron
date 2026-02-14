"""Health check routes."""

from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from taskmaster import __version__
from taskmaster.db import get_db
from taskmaster.schemas import HealthCheck

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthCheck)
async def health_check(db: AsyncSession = Depends(get_db)) -> dict[str, Any]:
    """Health check endpoint."""
    # Check database
    try:
        await db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception:
        db_status = "unhealthy"

    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "version": __version__,
        "timestamp": datetime.now(UTC),
        "database": db_status,
        "redis": "not_configured",
        "scheduler": "healthy",
    }


@router.get("/ready")
async def readiness_check(db: AsyncSession = Depends(get_db)) -> dict[str, str]:
    """Readiness check for Kubernetes."""
    try:
        await db.execute(text("SELECT 1"))
        return {"status": "ready"}
    except Exception:
        return {"status": "not ready"}


@router.get("/live")
async def liveness_check() -> dict[str, str]:
    """Liveness check for Kubernetes."""
    return {"status": "alive"}
