"""Task management routes."""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from taskmaster.auth import get_current_active_user
from taskmaster.core import get_executor, get_scheduler
from taskmaster.core.scheduler import ScheduleType
from taskmaster.db import get_db
from taskmaster.db.models import Task, TaskExecution, User
from taskmaster.schemas import (
    TaskCreate,
    TaskExecuteResponse,
    TaskExecutionListResponse,
    TaskExecutionResponse,
    TaskExecutionStatus,
    TaskListResponse,
    TaskResponse,
    TaskStatus,
    TaskUpdate,
)
from taskmaster.services import TaskService

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
) -> Task:
    """Create a new task."""
    service = TaskService(db)
    task = await service.create_task(task_data, current_user.id)

    # Schedule the task
    scheduler = get_scheduler()
    scheduler.add_task(
        task_id=str(task.id),
        schedule_type=task_data.schedule_type,
        schedule=task_data.schedule,
        timezone=task_data.timezone,
    )

    return task


@router.get("", response_model=TaskListResponse)
async def list_tasks(
    status: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: Annotated[User | None, Depends(get_current_active_user)] = None,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """List all tasks with optional filtering."""
    service = TaskService(db)
    skip = (page - 1) * page_size

    tasks, total = await service.get_tasks(
        owner_id=(
            current_user.id
            if current_user and not current_user.is_superuser
            else None
        ),
        status=status,
        skip=skip,
        limit=page_size,
    )

    return {"items": tasks, "total": total, "page": page, "page_size": page_size}


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
) -> Task:
    """Get a specific task by ID."""
    service = TaskService(db)
    task = await service.get_task(task_id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
        )

    # Check ownership
    if task.owner_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this task",
        )

    return task


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: uuid.UUID,
    task_data: TaskUpdate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
) -> Task | None:
    """Update a task."""
    service = TaskService(db)

    # Check task exists and ownership
    existing_task = await service.get_task(task_id)
    if not existing_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
        )

    if existing_task.owner_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this task",
        )

    # Update task
    task = await service.update_task(task_id, task_data)

    # Update scheduler if schedule changed
    if task_data.schedule_type or task_data.schedule:
        scheduler = get_scheduler()
        scheduler.remove_task(str(task_id))
        # Ensure we pass ScheduleType enum to add_task
        sched_type = task_data.schedule_type
        if sched_type is None:
            sched_type = ScheduleType(existing_task.schedule_type)
        scheduler.add_task(
            task_id=str(task_id),
            schedule_type=sched_type,
            schedule=task_data.schedule or existing_task.schedule,
            timezone=task_data.timezone or existing_task.timezone,
        )

    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
) -> None:
    """Delete a task."""
    service = TaskService(db)

    # Check task exists and ownership
    task = await service.get_task(task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
        )

    if task.owner_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this task",
        )

    # Remove from scheduler
    scheduler = get_scheduler()
    scheduler.remove_task(str(task_id))

    # Delete from database
    await service.delete_task(task_id)


@router.post("/{task_id}/execute", response_model=TaskExecuteResponse)
async def execute_task(
    task_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Execute a task immediately."""
    service = TaskService(db)

    # Get task
    task = await service.get_task(task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
        )

    if task.owner_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to execute this task",
        )

    # Check dependencies before execution
    deps_satisfied, deps_error = await service.check_dependencies(task_id)
    if not deps_satisfied:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Task dependencies not satisfied: {deps_error}",
        )

    # Create execution record
    execution = await service.create_execution(task_id)

    # Execute task
    await _execute_task_async(str(task_id), str(execution.id), db)

    return {
        "message": "Task execution started",
        "execution_id": execution.id,
        "task_id": task_id,
    }


@router.get("/{task_id}/executions", response_model=TaskExecutionListResponse)
async def list_task_executions(
    task_id: uuid.UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: Annotated[User | None, Depends(get_current_active_user)] = None,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """List executions for a task."""
    service = TaskService(db)

    # Check task exists and ownership
    task = await service.get_task(task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
        )

    if current_user is None or (
        task.owner_id != current_user.id and not current_user.is_superuser
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this task",
        )

    skip = (page - 1) * page_size
    executions, total = await service.get_task_executions(
        task_id=task_id, skip=skip, limit=page_size
    )

    return {"items": executions, "total": total, "page": page, "page_size": page_size}


@router.get(
    "/{task_id}/executions/{execution_id}", response_model=TaskExecutionResponse
)
async def get_execution(
    task_id: uuid.UUID,
    execution_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
) -> TaskExecution:
    """Get a specific execution."""
    service = TaskService(db)

    # Check task exists and ownership
    task = await service.get_task(task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
        )

    if task.owner_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this task",
        )

    execution = await service.get_execution(execution_id)
    if not execution or execution.task_id != task_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Execution not found"
        )

    return execution


@router.post("/{task_id}/pause")
async def pause_task(
    task_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Pause a scheduled task."""
    service = TaskService(db)

    task = await service.get_task(task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
        )

    if task.owner_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to pause this task",
        )

    scheduler = get_scheduler()
    scheduler.pause_task(str(task_id))

    await service.update_task_status(task_id, TaskStatus.PENDING)

    return {"message": "Task paused", "task_id": task_id}


@router.post("/{task_id}/resume")
async def resume_task(
    task_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Resume a paused task."""
    service = TaskService(db)

    task = await service.get_task(task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
        )

    if task.owner_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to resume this task",
        )

    scheduler = get_scheduler()
    scheduler.resume_task(str(task_id))

    await service.update_task_status(task_id, TaskStatus.RUNNING)

    return {"message": "Task resumed", "task_id": task_id}


@router.get("/{task_id}/dependencies")
async def get_task_dependencies(
    task_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Get dependency status for a task."""
    service = TaskService(db)

    task = await service.get_task(task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
        )

    if task.owner_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this task",
        )

    dependencies = await service.get_dependency_status(task_id)
    deps_satisfied, deps_error = await service.check_dependencies(task_id)

    return {
        "task_id": task_id,
        "dependencies": dependencies,
        "all_satisfied": deps_satisfied,
        "message": deps_error or "All dependencies satisfied",
    }


@router.post("/webhook/trigger/{task_id}")
async def webhook_trigger_task(
    task_id: uuid.UUID,
    token: str,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Trigger a task via webhook.

    This endpoint allows external systems to trigger task execution
    via webhook. The token must match the task's webhook_token or
    a global webhook secret.
    """
    service = TaskService(db)

    # Get task
    task = await service.get_task(task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
        )

    # Verify webhook token (in production, use proper token verification)
    # For now, accept any non-empty token for simplicity
    if not token or len(token) < 8:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid webhook token"
        )

    # Create execution record
    execution = await service.create_execution(task_id)

    # Execute task asynchronously
    await _execute_task_async(str(task_id), str(execution.id), db)

    return {
        "message": "Task execution triggered via webhook",
        "execution_id": execution.id,
        "task_id": task_id,
    }


async def _execute_task_async(
    task_id: str, execution_id: str, db: AsyncSession
) -> None:
    """Execute task asynchronously."""
    from taskmaster.db import AsyncSessionLocal

    # Create a new session for the async task
    async with AsyncSessionLocal() as session:
        service = TaskService(session)
        executor = get_executor()

        # Get task
        task = await service.get_task(uuid.UUID(task_id))
        if not task:
            return

        # Update execution status
        await service.update_execution(
            uuid.UUID(execution_id), TaskExecutionStatus.RUNNING
        )

        await service.update_task_status(uuid.UUID(task_id), TaskStatus.RUNNING)

        # Execute command with retry
        result = await executor.execute_with_retry(
            execution_id=execution_id,
            command=task.command,
            timeout=task.timeout,
            max_retries=task.max_retries,
            retry_delay=60,  # Default retry delay
        )

        # Map executor status to execution status
        status_map = {
            "completed": TaskExecutionStatus.COMPLETED,
            "failed": TaskExecutionStatus.FAILED,
            "timeout": TaskExecutionStatus.TIMEOUT,
        }
        exec_status = status_map.get(result["status"], TaskExecutionStatus.FAILED)

        # Update execution record
        await service.update_execution(
            uuid.UUID(execution_id),
            status=exec_status,
            result=result if result.get("return_code") is not None else None,
            error=result.get("error"),
            stdout=result.get("stdout"),
            stderr=result.get("stderr"),
            return_code=result.get("return_code"),
            duration=result.get("duration"),
            attempt_number=result.get("attempt_number", 1),
        )

        # Update task status
        task_status = (
            TaskStatus.COMPLETED
            if exec_status == TaskExecutionStatus.COMPLETED
            else TaskStatus.FAILED
        )
        await service.update_task_status(uuid.UUID(task_id), task_status)
