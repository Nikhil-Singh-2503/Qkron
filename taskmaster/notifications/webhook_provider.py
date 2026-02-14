"""Webhook notification provider."""

from typing import Any

import httpx

from taskmaster.config import get_settings
from taskmaster.notifications import NotificationProvider

settings = get_settings()


class WebhookProvider(NotificationProvider):
    """Webhook notification provider for HTTP callbacks."""

    async def send(
        self, recipient: str, subject: str, content: str, **kwargs
    ) -> dict[str, Any]:
        """Send a webhook notification.

        Args:
            recipient: The webhook URL
            subject: Event title
            content: Event message/details
            **kwargs: Additional payload data
        """
        try:
            webhook_url = recipient

            # Build payload
            payload = {
                "event": kwargs.get("event_type", "notification"),
                "subject": subject,
                "message": content,
                "timestamp": kwargs.get("timestamp"),
                "task_id": str(kwargs.get("task_id"))
                if kwargs.get("task_id")
                else None,
                "execution_id": str(kwargs.get("execution_id"))
                if kwargs.get("execution_id")
                else None,
                "user_id": str(kwargs.get("user_id"))
                if kwargs.get("user_id")
                else None,
                "status": kwargs.get("status"),
                "metadata": kwargs.get("metadata", {}),
            }

            # Remove None values
            payload = {k: v for k, v in payload.items() if v is not None}

            # Get custom headers from config
            headers = kwargs.get("headers", {})
            headers.update(
                {
                    "Content-Type": "application/json",
                    "User-Agent": "QKron-Webhook/1.0",
                }
            )

            # Add authentication if provided
            auth_token = kwargs.get("auth_token")
            if auth_token:
                headers["Authorization"] = f"Bearer {auth_token}"

            # Send webhook with retries
            async with httpx.AsyncClient() as client:
                for attempt in range(settings.webhook_max_retries):
                    try:
                        response = await client.post(
                            webhook_url,
                            json=payload,
                            headers=headers,
                            timeout=settings.webhook_timeout,
                        )
                        response.raise_for_status()
                        return {"success": True, "status_code": response.status_code}
                    except httpx.HTTPStatusError as e:
                        if attempt == settings.webhook_max_retries - 1:
                            return {
                                "success": False,
                                "error": f"HTTP {e.response.status_code}: {e.response.text}",
                            }
                    except Exception as e:
                        if attempt == settings.webhook_max_retries - 1:
                            raise

            return {"success": False, "error": "Max retries exceeded"}

        except Exception as e:
            return {"success": False, "error": str(e)}

    async def validate_config(self, config: dict[str, Any]) -> bool:
        """Validate webhook configuration."""
        webhook_url = config.get("webhook_url", "")
        return bool(webhook_url and webhook_url.startswith(("http://", "https://")))
