"""Task scheduler using APScheduler."""

import asyncio
from collections.abc import Callable
from typing import Any

from apscheduler.events import EVENT_JOB_ERROR, EVENT_JOB_EXECUTED
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger

from taskmaster.config import get_settings
from taskmaster.schemas import ScheduleType

settings = get_settings()


class TaskScheduler:
    """Task scheduler with APScheduler integration."""

    def __init__(self):
        """Initialize task scheduler."""
        self.scheduler = AsyncIOScheduler(
            jobstores={},
            executors={
                "default": {
                    "type": "threadpool",
                    "max_workers": settings.scheduler_max_workers,
                }
            },
            job_defaults={
                "coalesce": False,
                "max_instances": 1,
                "misfire_grace_time": 3600,
            },
            timezone=settings.scheduler_timezone,
        )
        self.jobs: dict[str, Any] = {}
        self._callback: Callable | None = None
        self._async_callback: Callable | None = None

    def set_callback(self, callback: Callable) -> None:
        """Set callback function for task execution.

        Args:
            callback: Function to call when task is triggered
        """
        self._callback = callback

        async def async_callback(task_id: str):
            await callback(task_id)

        self._async_callback = async_callback

    def start(self) -> None:
        """Start the scheduler."""
        self.scheduler.start()
        self.scheduler.add_listener(
            self._on_job_executed, EVENT_JOB_EXECUTED | EVENT_JOB_ERROR
        )

    def shutdown(self, wait: bool = True) -> None:
        """Shutdown the scheduler.

        Args:
            wait: Whether to wait for jobs to complete
        """
        self.scheduler.shutdown(wait=wait)

    def add_task(
        self,
        task_id: str,
        schedule_type: ScheduleType,
        schedule: str,
        timezone: str = "UTC",
    ) -> None:
        """Add a task to the scheduler.

        Args:
            task_id: Task ID
            schedule_type: Type of schedule (cron, interval)
            schedule: Schedule expression
            timezone: Timezone for scheduling
        """
        if task_id in self.jobs:
            self.remove_task(task_id)

        trigger = self._create_trigger(schedule_type, schedule, timezone)

        # Store reference to scheduler instance for use in wrapper
        scheduler = self

        def sync_wrapper():
            """Wrapper to run async callback from sync threadpool."""
            try:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                try:
                    if scheduler._async_callback:
                        loop.run_until_complete(scheduler._async_callback(task_id))
                finally:
                    loop.close()
            except Exception as e:
                import logging
                logging.error(f"Error running scheduled task {task_id}: {e}")

        job = self.scheduler.add_job(
            func=sync_wrapper,
            trigger=trigger,
            id=task_id,
            replace_existing=True,
        )

        self.jobs[task_id] = job

    def remove_task(self, task_id: str) -> None:
        """Remove a task from the scheduler.

        Args:
            task_id: Task ID
        """
        if task_id in self.jobs:
            try:
                self.scheduler.remove_job(task_id)
            except Exception:
                pass
            del self.jobs[task_id]

    def pause_task(self, task_id: str) -> None:
        """Pause a scheduled task.

        Args:
            task_id: Task ID
        """
        if task_id in self.jobs:
            self.scheduler.pause_job(task_id)

    def resume_task(self, task_id: str) -> None:
        """Resume a paused task.

        Args:
            task_id: Task ID
        """
        if task_id in self.jobs:
            self.scheduler.resume_job(task_id)

    def get_task(self, task_id: str) -> dict | None:
        """Get task schedule info.

        Args:
            task_id: Task ID

        Returns:
            Task info dict if found
        """
        if task_id not in self.jobs:
            return None

        job = self.jobs[task_id]
        return {
            "id": job.id,
            "next_run_time": job.next_run_time,
            "trigger": str(job.trigger),
        }

    def list_tasks(self) -> list:
        """List all scheduled tasks.

        Returns:
            List of task info dicts
        """
        return [
            {
                "id": job.id,
                "next_run_time": job.next_run_time,
                "trigger": str(job.trigger),
            }
            for job in self.jobs.values()
        ]

    def _create_trigger(
        self, schedule_type: ScheduleType, schedule: str, timezone: str
    ):
        """Create trigger based on schedule type.

        Args:
            schedule_type: Type of schedule
            schedule: Schedule expression
            timezone: Timezone

        Returns:
            APScheduler trigger
        """
        if schedule_type == ScheduleType.CRON:
            return CronTrigger.from_crontab(schedule, timezone=timezone)
        elif schedule_type == ScheduleType.INTERVAL:
            # Parse interval string (e.g., "5m", "1h", "30s")
            return self._parse_interval_trigger(schedule, timezone)
        else:
            raise ValueError(f"Unsupported schedule type: {schedule_type}")

    def _parse_interval_trigger(self, schedule: str, timezone: str):
        """Parse interval schedule string.

        Args:
            schedule: Interval string (e.g., "5m", "1h")
            timezone: Timezone

        Returns:
            IntervalTrigger
        """
        unit = schedule[-1].lower()
        value = int(schedule[:-1])

        kwargs = {}
        if unit == "s":
            kwargs["seconds"] = value
        elif unit == "m":
            kwargs["minutes"] = value
        elif unit == "h":
            kwargs["hours"] = value
        elif unit == "d":
            kwargs["days"] = value
        else:
            raise ValueError(f"Invalid interval unit: {unit}")

        return IntervalTrigger(**kwargs, timezone=timezone)

    async def _execute_task(self, task_id: str) -> None:
        """Execute task callback.

        Args:
            task_id: Task ID
        """
        if self._callback:
            await self._callback(task_id)

    def _on_job_executed(self, event) -> None:
        """Handle job execution event.

        Args:
            event: APScheduler event
        """
        # Events are handled in the callback
        pass


# Global scheduler instance
_scheduler: TaskScheduler | None = None


def get_scheduler() -> TaskScheduler:
    """Get or create scheduler instance.

    Returns:
        TaskScheduler instance
    """
    global _scheduler
    if _scheduler is None:
        _scheduler = TaskScheduler()
    return _scheduler
