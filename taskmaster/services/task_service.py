"""Task management service."""

import uuid
from typing import Any

from sqlalchemy import desc, delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from taskmaster.db.models import NotificationConfig, NotificationLog, Task, TaskExecution, User
from taskmaster.schemas import TaskCreate, TaskExecutionStatus, TaskStatus, TaskUpdate


class TaskService:
    """Service for task management operations."""

    def __init__(self, db: AsyncSession):
        """Initialize task service.

        Args:
            db: Database session
        """
        self.db = db

    async def create_task(self, task_data: TaskCreate, owner_id: uuid.UUID) -> Task:
        """Create a new task."""
        task = Task(
            name=task_data.name,
            description=task_data.description,
            command=task_data.command,
            schedule_type=task_data.schedule_type.value,
            schedule=task_data.schedule,
            timezone=task_data.timezone,
            timeout=task_data.timeout,
            max_retries=task_data.max_retries,
            priority=task_data.priority,
            metadata_info=task_data.metadata_info,
            dependencies=task_data.dependencies,
            owner_id=owner_id,
        )

        self.db.add(task)
        await self.db.commit()
        await self.db.refresh(task)

        return task

    async def get_task(self, task_id: uuid.UUID) -> Task | None:
        """Get task by ID."""
        result = await self.db.execute(select(Task).where(Task.id == task_id))
        return result.scalar_one_or_none()

    async def check_dependencies(self, task_id: uuid.UUID) -> tuple[bool, str | None]:
        """Check if task dependencies are satisfied.

        Args:
            task_id: The task ID to check dependencies for

        Returns:
            Tuple of (is_satisfied, error_message)
        """
        task = await self.get_task(task_id)
        if not task or not task.dependencies:
            return True, None

        for dep_id in task.dependencies:
            try:
                dep_uuid = uuid.UUID(dep_id)
            except ValueError:
                return False, f"Invalid dependency ID format: {dep_id}"

            dep_task = await self.get_task(dep_uuid)
            if not dep_task:
                return False, f"Dependency task not found: {dep_id}"

            # Check if dependency task is active (enabled)
            if not dep_task.is_active:
                return (
                    False,
                    f"Dependency '{dep_task.name}' is disabled (is_active=False)",
                )

            if dep_task.status != TaskStatus.COMPLETED.value:
                return (
                    False,
                    f"Dependency '{dep_task.name}' not completed (status: {dep_task.status})",
                )

        return True, None

    async def get_dependency_status(self, task_id: uuid.UUID) -> list[dict[str, Any]]:
        """Get status of all dependencies for a task.

        Args:
            task_id: The task ID to get dependency status for

        Returns:
            List of dependency status dictionaries
        """
        task = await self.get_task(task_id)
        if not task or not task.dependencies:
            return []

        dependencies = []
        for dep_id in task.dependencies:
            try:
                dep_uuid = uuid.UUID(dep_id)
                dep_task = await self.get_task(dep_uuid)
                if dep_task:
                    dependencies.append(
                        {
                            "task_id": str(dep_task.id),
                            "name": dep_task.name,
                            "status": dep_task.status,
                            "is_active": dep_task.is_active,
                            "completed": dep_task.status == TaskStatus.COMPLETED.value,
                        }
                    )
            except ValueError:
                continue

        return dependencies

    async def get_tasks(
        self,
        owner_id: uuid.UUID | None = None,
        status: str | None = None,
        skip: int = 0,
        limit: int = 100,
    ) -> tuple[list[dict], int]:
        """Get tasks with optional filtering."""
        query = select(Task).options(selectinload(Task.owner))
        count_query = select(Task)

        if owner_id:
            query = query.where(Task.owner_id == owner_id)
            count_query = count_query.where(Task.owner_id == owner_id)

        if status:
            query = query.where(Task.status == status)
            count_query = count_query.where(Task.status == status)

        # Get total count
        total_result = await self.db.execute(count_query)
        total = len(total_result.scalars().all())

        # Get paginated results
        query = query.order_by(desc(Task.created_at)).offset(skip).limit(limit)
        result = await self.db.execute(query)
        tasks = result.scalars().all()

        # Convert to dict with owner_username
        from taskmaster.schemas import TaskResponse
        task_responses = []
        for task in tasks:
            task_dict = {
                "id": task.id,
                "name": task.name,
                "description": task.description,
                "command": task.command,
                "schedule_type": task.schedule_type,
                "schedule": task.schedule,
                "timezone": task.timezone,
                "timeout": task.timeout,
                "max_retries": task.max_retries,
                "status": task.status,
                "priority": task.priority,
                "is_active": task.is_active,
                "created_at": task.created_at,
                "updated_at": task.updated_at,
                "owner_id": task.owner_id,
                "owner_username": task.owner.username if task.owner else None,
                "metadata_info": task.metadata_info,
                "dependencies": task.dependencies,
                "tags": task.tags,
            }
            task_responses.append(task_dict)

        return task_responses, total

    async def update_task(
        self, task_id: uuid.UUID, task_data: TaskUpdate
    ) -> Task | None:
        """Update task."""
        task = await self.get_task(task_id)
        if not task:
            return None

        update_data = task_data.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            if hasattr(task, field):
                if field == "schedule_type" and value:
                    value = value.value
                setattr(task, field, value)

        await self.db.commit()
        await self.db.refresh(task)

        return task

    async def delete_task(self, task_id: uuid.UUID) -> bool:
        """Delete task and all related records."""
        task = await self.get_task(task_id)
        if not task:
            return False

        # Delete notification logs that reference task executions
        await self.db.execute(
            delete(NotificationLog).where(
                NotificationLog.task_id == task_id
            )
        )

        # Delete task executions
        await self.db.execute(
            delete(TaskExecution).where(TaskExecution.task_id == task_id)
        )

        # Delete notification configs for this task
        await self.db.execute(
            delete(NotificationConfig).where(NotificationConfig.task_id == task_id)
        )

        # Delete the task
        await self.db.delete(task)
        await self.db.commit()

        return True

    async def update_task_status(
        self, task_id: uuid.UUID, status: TaskStatus
    ) -> Task | None:
        """Update task status."""
        task = await self.get_task(task_id)
        if not task:
            return None

        task.status = status.value
        await self.db.commit()
        await self.db.refresh(task)

        return task

    async def create_execution(
        self,
        task_id: uuid.UUID,
        status: TaskExecutionStatus = TaskExecutionStatus.PENDING,
    ) -> TaskExecution:
        """Create task execution record."""
        execution = TaskExecution(
            task_id=task_id,
            status=status.value,
        )

        self.db.add(execution)
        await self.db.commit()
        await self.db.refresh(execution)

        return execution

    async def get_execution(self, execution_id: uuid.UUID) -> TaskExecution | None:
        """Get execution by ID."""
        result = await self.db.execute(
            select(TaskExecution).where(TaskExecution.id == execution_id)
        )
        return result.scalar_one_or_none()

    async def get_task_executions(
        self,
        task_id: uuid.UUID,
        skip: int = 0,
        limit: int = 100,
    ) -> tuple[list[TaskExecution], int]:
        """Get executions for a task."""
        # Get total count
        count_result = await self.db.execute(
            select(TaskExecution).where(TaskExecution.task_id == task_id)
        )
        total = len(count_result.scalars().all())

        # Get paginated results
        query = (
            select(TaskExecution)
            .where(TaskExecution.task_id == task_id)
            .order_by(desc(TaskExecution.created_at))
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(query)
        executions = result.scalars().all()

        return list(executions), total

    async def update_execution(
        self,
        execution_id: uuid.UUID,
        status: TaskExecutionStatus,
        result: dict | None = None,
        error: str | None = None,
        stdout: str | None = None,
        stderr: str | None = None,
        return_code: int | None = None,
        duration: int | None = None,
        attempt_number: int = 1,
    ) -> TaskExecution | None:
        """Update execution record."""
        execution = await self.get_execution(execution_id)
        if not execution:
            return None

        from datetime import datetime

        execution.status = status.value
        execution.result = result
        execution.error = error
        execution.stdout = stdout
        execution.stderr = stderr
        execution.return_code = return_code
        execution.duration = duration
        execution.attempt_number = attempt_number

        if status in [
            TaskExecutionStatus.COMPLETED,
            TaskExecutionStatus.FAILED,
            TaskExecutionStatus.TIMEOUT,
        ]:
            execution.end_time = datetime.utcnow()

        await self.db.commit()
        await self.db.refresh(execution)

        return execution
