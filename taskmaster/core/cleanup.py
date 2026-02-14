"""Task execution history cleanup service."""

import logging
from datetime import UTC, datetime, timedelta

from sqlalchemy import delete, select

from taskmaster.db import AsyncSessionLocal
from taskmaster.db.models import TaskExecution

logger = logging.getLogger(__name__)


async def cleanup_old_executions(days: int = 90) -> int:
    """Clean up old task execution records.

    Args:
        days: Number of days to retain execution history (default: 90)

    Returns:
        Number of records deleted
    """
    cutoff_date = datetime.now(UTC) - timedelta(days=days)

    async with AsyncSessionLocal() as db:
        # Get count before deletion
        count_result = await db.execute(
            select(TaskExecution).where(TaskExecution.created_at < cutoff_date)
        )
        records_to_delete = count_result.scalars().all()
        count = len(records_to_delete)

        if count > 0:
            # Delete old executions
            await db.execute(
                delete(TaskExecution).where(TaskExecution.created_at < cutoff_date)
            )
            await db.commit()

            logger.info(
                "Cleaned up old task executions",
                deleted_count=count,
                cutoff_date=cutoff_date.isoformat(),
            )

        return count


async def cleanup_old_notification_logs(days: int = 90) -> int:
    """Clean up old notification log records.

    Args:
        days: Number of days to retain notification logs (default: 90)

    Returns:
        Number of records deleted
    """
    from taskmaster.db.models import NotificationLog

    cutoff_date = datetime.now(UTC) - timedelta(days=days)

    async with AsyncSessionLocal() as db:
        # Get count before deletion
        count_result = await db.execute(
            select(NotificationLog).where(NotificationLog.created_at < cutoff_date)
        )
        records_to_delete = count_result.scalars().all()
        count = len(records_to_delete)

        if count > 0:
            # Delete old logs
            await db.execute(
                delete(NotificationLog).where(NotificationLog.created_at < cutoff_date)
            )
            await db.commit()

            logger.info(
                "Cleaned up old notification logs",
                deleted_count=count,
                cutoff_date=cutoff_date.isoformat(),
            )

        return count


async def run_cleanup_task():
    """Run all cleanup tasks."""
    logger.info("Starting cleanup task")

    executions_deleted = await cleanup_old_executions()
    logs_deleted = await cleanup_old_notification_logs()

    logger.info(
        "Cleanup task completed",
        executions_deleted=executions_deleted,
        logs_deleted=logs_deleted,
    )

    return {"executions_deleted": executions_deleted, "logs_deleted": logs_deleted}
