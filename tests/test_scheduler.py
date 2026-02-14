"""Tests for task scheduler."""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from taskmaster.core.scheduler import TaskScheduler
from taskmaster.schemas import ScheduleType


@pytest.fixture
def scheduler():
    """Create a test scheduler."""
    return TaskScheduler()


def test_scheduler_initialization(scheduler):
    """Test scheduler initialization."""
    assert scheduler.scheduler is not None
    assert scheduler.jobs == {}
    assert scheduler._callback is None


def test_set_callback(scheduler):
    """Test setting callback function."""
    callback = AsyncMock()
    scheduler.set_callback(callback)
    assert scheduler._callback == callback


@pytest.mark.asyncio
async def test_execute_task(scheduler):
    """Test task execution callback."""
    callback = AsyncMock()
    scheduler.set_callback(callback)

    await scheduler._execute_task("task-123")

    callback.assert_called_once_with("task-123")


def test_create_cron_trigger(scheduler):
    """Test cron trigger creation."""
    from apscheduler.triggers.cron import CronTrigger

    trigger = scheduler._create_trigger(ScheduleType.CRON, "0 0 * * *", "UTC")

    assert isinstance(trigger, CronTrigger)


def test_create_interval_trigger(scheduler):
    """Test interval trigger creation."""
    from apscheduler.triggers.interval import IntervalTrigger

    trigger = scheduler._create_trigger(ScheduleType.INTERVAL, "5m", "UTC")

    assert isinstance(trigger, IntervalTrigger)
    assert trigger.interval.total_seconds() == 300


def test_parse_interval_trigger(scheduler):
    """Test interval string parsing."""
    from apscheduler.triggers.interval import IntervalTrigger

    # Test seconds
    trigger = scheduler._parse_interval_trigger("30s", "UTC")
    assert trigger.interval.total_seconds() == 30

    # Test minutes
    trigger = scheduler._parse_interval_trigger("5m", "UTC")
    assert trigger.interval.total_seconds() == 300

    # Test hours
    trigger = scheduler._parse_interval_trigger("2h", "UTC")
    assert trigger.interval.total_seconds() == 7200

    # Test days
    trigger = scheduler._parse_interval_trigger("1d", "UTC")
    assert trigger.interval.total_seconds() == 86400


def test_parse_invalid_interval(scheduler):
    """Test invalid interval string."""
    with pytest.raises(ValueError):
        scheduler._parse_interval_trigger("5x", "UTC")


def test_list_tasks_empty(scheduler):
    """Test listing tasks when empty."""
    tasks = scheduler.list_tasks()
    assert tasks == []
