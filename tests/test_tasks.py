"""Tests for task management."""

import pytest
from httpx import AsyncClient


@pytest.fixture
async def auth_headers(async_client: AsyncClient):
    """Create a user and return auth headers."""
    # Register
    await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "taskuser@example.com",
            "username": "taskuser",
            "password": "testpassword123",
        },
    )

    # Login
    login_response = await async_client.post(
        "/api/v1/auth/login",
        data={"username": "taskuser", "password": "testpassword123"},
    )

    token = login_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_create_task(async_client: AsyncClient, auth_headers):
    """Test creating a task."""
    response = await async_client.post(
        "/api/v1/tasks",
        headers=auth_headers,
        json={
            "name": "Test Task",
            "command": "echo 'Hello World'",
            "schedule_type": "cron",
            "schedule": "0 0 * * *",
            "timeout": 300,
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Task"
    assert data["command"] == "echo 'Hello World'"
    assert data["schedule_type"] == "cron"
    assert "id" in data


@pytest.mark.asyncio
async def test_list_tasks(async_client: AsyncClient, auth_headers):
    """Test listing tasks."""
    # Create a task first
    await async_client.post(
        "/api/v1/tasks",
        headers=auth_headers,
        json={
            "name": "List Test Task",
            "command": "echo 'test'",
            "schedule_type": "interval",
            "schedule": "5m",
        },
    )

    # List tasks
    response = await async_client.get("/api/v1/tasks", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert len(data["items"]) >= 1


@pytest.mark.asyncio
async def test_get_task(async_client: AsyncClient, auth_headers):
    """Test getting a specific task."""
    # Create a task
    create_response = await async_client.post(
        "/api/v1/tasks",
        headers=auth_headers,
        json={
            "name": "Get Test Task",
            "command": "echo 'get test'",
            "schedule_type": "once",
            "schedule": "0 0 1 1 *",
        },
    )

    task_id = create_response.json()["id"]

    # Get task
    response = await async_client.get(f"/api/v1/tasks/{task_id}", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Get Test Task"
    assert data["id"] == task_id


@pytest.mark.asyncio
async def test_update_task(async_client: AsyncClient, auth_headers):
    """Test updating a task."""
    # Create a task
    create_response = await async_client.post(
        "/api/v1/tasks",
        headers=auth_headers,
        json={
            "name": "Update Test Task",
            "command": "echo 'before'",
            "schedule_type": "cron",
            "schedule": "0 0 * * *",
        },
    )

    task_id = create_response.json()["id"]

    # Update task
    response = await async_client.put(
        f"/api/v1/tasks/{task_id}",
        headers=auth_headers,
        json={"name": "Updated Task Name", "command": "echo 'after'"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Task Name"
    assert data["command"] == "echo 'after'"


@pytest.mark.asyncio
async def test_delete_task(async_client: AsyncClient, auth_headers):
    """Test deleting a task."""
    # Create a task
    create_response = await async_client.post(
        "/api/v1/tasks",
        headers=auth_headers,
        json={
            "name": "Delete Test Task",
            "command": "echo 'delete me'",
            "schedule_type": "cron",
            "schedule": "0 0 * * *",
        },
    )

    task_id = create_response.json()["id"]

    # Delete task
    response = await async_client.delete(
        f"/api/v1/tasks/{task_id}", headers=auth_headers
    )

    assert response.status_code == 204

    # Verify deletion
    get_response = await async_client.get(
        f"/api/v1/tasks/{task_id}", headers=auth_headers
    )

    assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_execute_task(async_client: AsyncClient, auth_headers):
    """Test executing a task."""
    # Create a task
    create_response = await async_client.post(
        "/api/v1/tasks",
        headers=auth_headers,
        json={
            "name": "Execute Test Task",
            "command": "echo 'execution test'",
            "schedule_type": "cron",
            "schedule": "0 0 * * *",
        },
    )

    task_id = create_response.json()["id"]

    # Execute task
    response = await async_client.post(
        f"/api/v1/tasks/{task_id}/execute", headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert "execution_id" in data
    assert "message" in data
    assert data["task_id"] == task_id


@pytest.mark.asyncio
async def test_unauthorized_access(async_client: AsyncClient):
    """Test unauthorized access to tasks."""
    response = await async_client.get("/api/v1/tasks")

    assert response.status_code == 401
