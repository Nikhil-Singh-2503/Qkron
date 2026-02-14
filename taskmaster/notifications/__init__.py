"""Notification providers module."""

from abc import ABC, abstractmethod
from typing import Any


class NotificationProvider(ABC):
    """Abstract base class for notification providers."""

    @abstractmethod
    async def send(
        self, recipient: str, subject: str, content: str, **kwargs
    ) -> dict[str, Any]:
        """Send a notification.

        Args:
            recipient: The recipient address (email, phone, webhook URL)
            subject: The notification subject/title
            content: The notification content/message
            **kwargs: Additional provider-specific arguments

        Returns:
            Dict with 'success' (bool) and optional 'error' (str) keys
        """
        pass

    @abstractmethod
    async def validate_config(self, config: dict[str, Any]) -> bool:
        """Validate provider configuration.

        Args:
            config: Provider-specific configuration dictionary

        Returns:
            True if configuration is valid
        """
        pass
