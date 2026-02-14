"""Tests for task executor."""

import asyncio
import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from taskmaster.core.executor import TaskExecutor
from taskmaster.schemas import TaskExecutionStatus


@pytest.fixture
def executor():
    """Create a test executor."""
    return TaskExecutor(max_workers=5)


@pytest.mark.asyncio
async def test_executor_initialization(executor):
    """Test executor initialization."""
    assert executor.max_workers == 5
    assert executor.get_running_count() == 0


@pytest.mark.asyncio
async def test_execute_success(executor):
    """Test successful command execution."""
    result = await executor.execute(
        execution_id="exec-123", command="echo 'Hello World'", timeout=10
    )

    assert result["status"] == TaskExecutionStatus.COMPLETED
    assert result["return_code"] == 0
    assert "Hello World" in result["stdout"]
    assert result["stderr"] == ""
    assert result["duration"] >= 0
    assert result["error"] is None


@pytest.mark.asyncio
async def test_execute_failure(executor):
    """Test failed command execution."""
    result = await executor.execute(
        execution_id="exec-123", command="exit 1", timeout=10
    )

    assert result["status"] == TaskExecutionStatus.FAILED
    assert result["return_code"] == 1
    assert result["error"] == "Exit code: 1"


@pytest.mark.asyncio
async def test_execute_timeout(executor):
    """Test command timeout."""
    result = await executor.execute(
        execution_id="exec-123", command="sleep 10", timeout=1
    )

    assert result["status"] == TaskExecutionStatus.TIMEOUT
    assert result["error"] == "Task timed out after 1 seconds"
    assert result["duration"] >= 1


@pytest.mark.asyncio
async def test_execute_invalid_command(executor):
    """Test invalid command execution."""
    result = await executor.execute(
        execution_id="exec-123",
        command="invalid_command_that_does_not_exist",
        timeout=10,
    )

    assert result["status"] == TaskExecutionStatus.FAILED
    assert result["error"] is not None


@pytest.mark.asyncio
async def test_is_running(executor):
    """Test checking if execution is running."""
    # Not running initially
    assert executor.is_running("exec-123") is False


@pytest.mark.asyncio
async def test_get_running_count(executor):
    """Test getting running execution count."""
    count = executor.get_running_count()
    assert count == 0
    assert isinstance(count, int)
