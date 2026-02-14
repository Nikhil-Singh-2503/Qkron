"""Tests for authentication."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_user(async_client: AsyncClient):
    """Test user registration."""
    response = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "username": "testuser",
            "password": "testpassword123",
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["username"] == "testuser"
    assert "id" in data
    assert "hashed_password" not in data


@pytest.mark.asyncio
async def test_register_duplicate_email(async_client: AsyncClient):
    """Test registration with duplicate email."""
    # First registration
    await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "duplicate@example.com",
            "username": "user1",
            "password": "testpassword123",
        },
    )

    # Second registration with same email
    response = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "duplicate@example.com",
            "username": "user2",
            "password": "testpassword123",
        },
    )

    assert response.status_code == 400
    assert "Email already registered" in response.json()["detail"]


@pytest.mark.asyncio
async def test_login_success(async_client: AsyncClient):
    """Test successful login."""
    # Register user first
    await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "login@example.com",
            "username": "loginuser",
            "password": "testpassword123",
        },
    )

    # Login
    response = await async_client.post(
        "/api/v1/auth/login",
        data={"username": "loginuser", "password": "testpassword123"},
    )

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert "expires_in" in data


@pytest.mark.asyncio
async def test_login_invalid_credentials(async_client: AsyncClient):
    """Test login with invalid credentials."""
    response = await async_client.post(
        "/api/v1/auth/login",
        data={"username": "nonexistent", "password": "wrongpassword"},
    )

    assert response.status_code == 401
    assert "Incorrect username or password" in response.json()["detail"]


@pytest.mark.asyncio
async def test_get_current_user(async_client: AsyncClient):
    """Test getting current user info."""
    # Register and login
    await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "current@example.com",
            "username": "currentuser",
            "password": "testpassword123",
        },
    )

    login_response = await async_client.post(
        "/api/v1/auth/login",
        data={"username": "currentuser", "password": "testpassword123"},
    )

    token = login_response.json()["access_token"]

    # Get current user
    response = await async_client.get(
        "/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "current@example.com"
    assert data["username"] == "currentuser"
