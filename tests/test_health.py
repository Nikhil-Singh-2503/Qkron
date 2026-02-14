"""Tests for health check endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(async_client: AsyncClient):
    """Test health check endpoint."""
    response = await async_client.get("/health")

    assert response.status_code == 200
    data = response.json()

    assert "status" in data
    assert "version" in data
    assert "timestamp" in data
    assert "database" in data
    assert "redis" in data
    assert "scheduler" in data


@pytest.mark.asyncio
async def test_readiness_check(async_client: AsyncClient):
    """Test readiness check endpoint."""
    response = await async_client.get("/ready")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["ready", "not ready"]


@pytest.mark.asyncio
async def test_liveness_check(async_client: AsyncClient):
    """Test liveness check endpoint."""
    response = await async_client.get("/live")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "alive"
