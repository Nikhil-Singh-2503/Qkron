"""SMS notification provider using Twilio."""

from typing import Any

from taskmaster.config import get_settings
from taskmaster.notifications import NotificationProvider

settings = get_settings()


class SMSProvider(NotificationProvider):
    """SMS notification provider using Twilio."""

    def __init__(self):
        self.client = None
        self._init_client()

    def _init_client(self):
        """Initialize Twilio client."""
        try:
            from twilio.rest import Client

            if settings.twilio_account_sid and settings.twilio_auth_token:
                self.client = Client(
                    settings.twilio_account_sid, settings.twilio_auth_token
                )
        except ImportError:
            # Twilio not installed
            pass

    async def send(
        self, recipient: str, subject: str, content: str, **kwargs
    ) -> dict[str, Any]:
        """Send an SMS notification.

        Args:
            recipient: Phone number in E.164 format (e.g., +1234567890)
            subject: Not used for SMS (included for interface compatibility)
            content: SMS message body
        """
        try:
            if not self.client:
                return {
                    "success": False,
                    "error": "Twilio client not initialized. Check your Twilio credentials.",
                }

            # Ensure phone number is in E.164 format
            to_number = recipient
            if not to_number.startswith("+"):
                to_number = "+" + to_number

            # Send SMS
            message = self.client.messages.create(
                body=content[:1600],  # Twilio limit is 1600 characters
                from_=settings.twilio_phone_number,
                to=to_number,
            )

            return {
                "success": True,
                "message_sid": message.sid,
                "status": message.status,
            }

        except Exception as e:
            return {"success": False, "error": str(e)}

    async def validate_config(self, config: dict[str, Any]) -> bool:
        """Validate SMS configuration."""
        # Check if Twilio is installed
        try:
            from twilio.rest import Client
        except ImportError:
            return False

        # Check settings
        required_settings = [
            "twilio_account_sid",
            "twilio_auth_token",
            "twilio_phone_number",
        ]

        return all(getattr(settings, field, None) for field in required_settings)

    async def validate_phone_number(self, phone_number: str) -> bool:
        """Validate phone number format."""
        import re

        # Basic E.164 validation
        pattern = r"^\+[1-9]\d{1,14}$"
        return bool(re.match(pattern, phone_number))
