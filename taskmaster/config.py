"""QKron configuration module."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    app_name: str = "QKron"
    environment: str = "development"
    debug: bool = True
    log_level: str = "INFO"

    # Security
    secret_key: str = "change-this-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # Database
    database_url: str = "postgresql+asyncpg://qkron:qkron@localhost:5432/qkron_db"
    database_pool_size: int = 20
    database_max_overflow: int = 30

    # API
    api_v1_prefix: str = "/api/v1"
    allowed_hosts: list[str] = ["localhost", "127.0.0.1"]
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://localhost:5173",
    ]

    # Scheduler
    scheduler_max_workers: int = 10
    scheduler_timezone: str = "UTC"

    # Task Execution
    task_default_timeout: int = 300
    task_max_retries: int = 3
    task_retry_delay: int = 60

    # Email Notifications (SMTP)
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_use_tls: bool = True
    email_from: str = ""

    # SMS Notifications (Twilio)
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_phone_number: str = ""

    # Webhook Notifications
    webhook_timeout: int = 30
    webhook_max_retries: int = 3

    @property
    def is_development(self) -> bool:
        """Check if running in development mode."""
        return self.environment.lower() == "development"

    @property
    def is_production(self) -> bool:
        """Check if running in production mode."""
        return self.environment.lower() == "production"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
