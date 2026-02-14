"""Notification routes."""

import uuid
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from taskmaster.auth import get_current_active_user
from taskmaster.db import get_db
from taskmaster.db.models import NotificationConfig, NotificationLog, User
from taskmaster.schemas import (
    NotificationConfigCreate,
    NotificationConfigResponse,
    NotificationLogResponse,
)
from taskmaster.services import NotificationService

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.post(
    "/configs",
    response_model=NotificationConfigResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_notification_config(
    config_data: NotificationConfigCreate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
) -> NotificationConfig:
    """Create a new notification configuration."""
    service = NotificationService(db)

    # Validate channel-specific config
    config = config_data.config or {}

    config = await service.create_notification_config(
        user_id=current_user.id,
        channel=config_data.channel,
        config=config,
        task_id=config_data.task_id,
        on_success=config_data.on_success,
        on_failure=config_data.on_failure,
        on_start=config_data.on_start,
    )

    return config


@router.get("/configs", response_model=list[NotificationConfigResponse])
async def list_notification_configs(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
    task_id: uuid.UUID | None = None,
) -> list[NotificationConfig]:
    """List notification configurations for the current user."""
    service = NotificationService(db)
    configs = await service.get_user_notification_configs(
        user_id=current_user.id, task_id=task_id
    )
    return configs


@router.get("/configs/{config_id}", response_model=NotificationConfigResponse)
async def get_notification_config(
    config_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
) -> NotificationConfig:
    """Get a specific notification configuration."""
    result = await db.execute(
        select(NotificationConfig).where(
            NotificationConfig.id == config_id,
            NotificationConfig.user_id == current_user.id,
        )
    )
    config = result.scalar_one_or_none()

    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification configuration not found",
        )

    return config


@router.delete("/configs/{config_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification_config(
    config_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
) -> None:
    """Delete a notification configuration."""
    result = await db.execute(
        select(NotificationConfig).where(
            NotificationConfig.id == config_id,
            NotificationConfig.user_id == current_user.id,
        )
    )
    config = result.scalar_one_or_none()

    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification configuration not found",
        )

    await db.delete(config)
    await db.commit()


@router.get("/logs", response_model=list[NotificationLogResponse])
async def list_notification_logs(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
    task_id: uuid.UUID | None = None,
    limit: int = 50,
    offset: int = 0,
) -> list[NotificationLog]:
    """List notification logs for the current user."""
    query = (
        select(NotificationLog)
        .where(NotificationLog.user_id == current_user.id)
        .order_by(desc(NotificationLog.created_at))
        .limit(limit)
        .offset(offset)
    )

    if task_id:
        query = query.where(NotificationLog.task_id == task_id)

    result = await db.execute(query)
    return list(result.scalars().all())


@router.post("/test/{channel}")
async def test_notification(
    channel: str,
    recipient: str,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Send a test notification."""
    service = NotificationService(db)

    log = await service.send_notification(
        user_id=current_user.id,
        channel=channel,
        recipient=recipient,
        subject="QKron Test Notification",
        content="This is a test notification from QKron.",
        event_type="test",
    )

    return {
        "success": log.status == "sent",
        "status": log.status,
        "error": log.error_message,
        "log_id": str(log.id),
    }
