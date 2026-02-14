"""Notification service module."""

import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from taskmaster.db.models import NotificationConfig, NotificationLog
from taskmaster.notifications.email_provider import EmailProvider
from taskmaster.notifications.sms_provider import SMSProvider
from taskmaster.notifications.webhook_provider import WebhookProvider


class NotificationService:
    """Service for managing and sending notifications."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.providers = {
            "email": EmailProvider(),
            "webhook": WebhookProvider(),
            "sms": SMSProvider(),
        }

    async def get_user_notification_configs(
        self, user_id: uuid.UUID, task_id: uuid.UUID | None = None
    ) -> list[NotificationConfig]:
        """Get notification configurations for a user."""
        query = select(NotificationConfig).where(
            NotificationConfig.user_id == user_id, NotificationConfig.enabled == True
        )

        if task_id:
            # Get configs for specific task OR global configs (task_id is None)
            query = query.where(
                (NotificationConfig.task_id == task_id)
                | (NotificationConfig.task_id == None)
            )
        else:
            # Get only global configs
            query = query.where(NotificationConfig.task_id == None)

        result = await self.db.execute(query)
        return result.scalars().all()

    async def create_notification_config(
        self,
        user_id: uuid.UUID,
        channel: str,
        config: dict[str, Any],
        task_id: uuid.UUID | None = None,
        on_success: bool = False,
        on_failure: bool = True,
        on_start: bool = False,
    ) -> NotificationConfig:
        """Create a new notification configuration."""
        notification_config = NotificationConfig(
            user_id=user_id,
            task_id=task_id,
            channel=channel,
            config=config,
            on_success=on_success,
            on_failure=on_failure,
            on_start=on_start,
        )

        self.db.add(notification_config)
        await self.db.commit()
        await self.db.refresh(notification_config)

        return notification_config

    async def send_notification(
        self,
        user_id: uuid.UUID,
        channel: str,
        recipient: str,
        subject: str,
        content: str,
        event_type: str,
        task_id: uuid.UUID | None = None,
        execution_id: uuid.UUID | None = None,
        **kwargs,
    ) -> NotificationLog:
        """Send a notification and log it."""
        # Create log entry
        log_entry = NotificationLog(
            user_id=user_id,
            task_id=task_id,
            execution_id=execution_id,
            channel=channel,
            event_type=event_type,
            recipient=recipient,
            subject=subject,
            content=content,
        )

        self.db.add(log_entry)
        await self.db.commit()
        await self.db.refresh(log_entry)

        # Get provider
        provider = self.providers.get(channel)
        if not provider:
            log_entry.status = "failed"
            log_entry.error_message = f"Unknown channel: {channel}"
            await self.db.commit()
            return log_entry

        # Send notification
        result = await provider.send(
            recipient=recipient,
            subject=subject,
            content=content,
            event_type=event_type,
            task_id=task_id,
            execution_id=execution_id,
            user_id=user_id,
            **kwargs,
        )

        # Update log
        if result.get("success"):
            log_entry.status = "sent"
            log_entry.sent_at = datetime.utcnow()
        else:
            log_entry.status = "failed"
            log_entry.error_message = result.get("error", "Unknown error")
            log_entry.retry_count += 1

        await self.db.commit()
        await self.db.refresh(log_entry)

        return log_entry

    async def notify_task_event(
        self,
        user_id: uuid.UUID,
        task_name: str,
        event_type: str,  # 'success', 'failure', 'start'
        task_id: uuid.UUID | None = None,
        execution_id: uuid.UUID | None = None,
        execution_result: dict | None = None,
    ) -> list[NotificationLog]:
        """Send notifications for a task event."""
        # Get notification configs for this user and task
        configs = await self.get_user_notification_configs(user_id, task_id)

        # Filter configs based on event type
        event_trigger_map = {
            "success": "on_success",
            "failure": "on_failure",
            "start": "on_start",
        }
        trigger_field = event_trigger_map.get(event_type)

        if not trigger_field:
            return []

        configs = [c for c in configs if getattr(c, trigger_field, False)]

        if not configs:
            return []

        # Build notification content
        subject = f"Task '{task_name}' {event_type}"
        content = self._build_notification_content(
            task_name, event_type, execution_result
        )

        # Send notifications
        logs = []
        for config in configs:
            recipient = config.config.get("recipient")
            if not recipient:
                continue

            log = await self.send_notification(
                user_id=user_id,
                channel=config.channel,
                recipient=recipient,
                subject=subject,
                content=content,
                event_type=event_type,
                task_id=task_id,
                execution_id=execution_id,
                status=event_type,
                metadata=config.config.get("metadata", {}),
            )
            logs.append(log)

        return logs

    def _build_notification_content(
        self, task_name: str, event_type: str, execution_result: dict | None = None
    ) -> str:
        """Build notification content."""
        content = f"Task '{task_name}' has {event_type}."

        if execution_result:
            if "duration" in execution_result:
                content += f"\nDuration: {execution_result['duration']}s"
            if "return_code" in execution_result:
                content += f"\nExit code: {execution_result['return_code']}"
            if "error" in execution_result and execution_result["error"]:
                content += f"\nError: {execution_result['error']}"
            if "stdout" in execution_result and execution_result["stdout"]:
                stdout_preview = execution_result["stdout"][:500]
                content += f"\nOutput:\n{stdout_preview}"
                if len(execution_result["stdout"]) > 500:
                    content += "\n... (truncated)"

        return content
