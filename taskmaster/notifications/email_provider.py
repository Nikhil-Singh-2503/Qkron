"""Email notification provider using SMTP."""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Any

from taskmaster.config import get_settings
from taskmaster.notifications import NotificationProvider

settings = get_settings()


class EmailProvider(NotificationProvider):
    """Email notification provider using SMTP."""

    async def send(
        self, recipient: str, subject: str, content: str, **kwargs
    ) -> dict[str, Any]:
        """Send an email notification."""
        try:
            # Create message
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = settings.email_from or settings.smtp_username
            msg["To"] = recipient

            # Add HTML content
            html_content = kwargs.get("html_content", content)
            msg.attach(MIMEText(content, "plain"))
            msg.attach(MIMEText(html_content, "html"))

            # Connect to SMTP server
            server = smtplib.SMTP(settings.smtp_host, settings.smtp_port)

            if settings.smtp_use_tls:
                server.starttls()

            if settings.smtp_username and settings.smtp_password:
                server.login(settings.smtp_username, settings.smtp_password)

            # Send email
            server.send_message(msg)
            server.quit()

            return {"success": True}

        except Exception as e:
            return {"success": False, "error": str(e)}

    async def validate_config(self, config: dict[str, Any]) -> bool:
        """Validate email configuration."""
        required_fields = ["smtp_host", "smtp_port", "smtp_username", "smtp_password"]
        return all(
            getattr(settings, field, None) or config.get(field)
            for field in required_fields
        )
