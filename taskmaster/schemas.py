"""Pydantic schemas for API validation."""

from datetime import datetime
from enum import Enum
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class TaskStatus(str, Enum):
    """Task status enumeration."""

    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ScheduleType(str, Enum):
    """Schedule type enumeration."""

    CRON = "cron"
    INTERVAL = "interval"
    ONCE = "once"


class TaskBase(BaseModel):
    """Base task schema."""

    model_config = ConfigDict(from_attributes=True)

    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = Field(None, max_length=1000)
    command: str = Field(..., min_length=1)
    schedule_type: ScheduleType = ScheduleType.CRON
    schedule: str = Field(..., min_length=1, max_length=255)
    timezone: str = Field(default="UTC", max_length=50)
    timeout: int = Field(default=300, ge=1, le=86400)
    max_retries: int = Field(default=3, ge=0, le=10)
    priority: int = Field(default=5, ge=1, le=10)
    metadata_info: dict[str, Any] | None = None
    dependencies: list[str] | None = None


class TaskCreate(TaskBase):
    """Task creation schema."""

    pass


class TaskUpdate(BaseModel):
    """Task update schema."""

    model_config = ConfigDict(from_attributes=True)

    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = Field(None, max_length=1000)
    command: str | None = Field(None, min_length=1)
    schedule_type: ScheduleType | None = None
    schedule: str | None = Field(None, min_length=1, max_length=255)
    timezone: str | None = Field(None, max_length=50)
    timeout: int | None = Field(None, ge=1, le=86400)
    max_retries: int | None = Field(None, ge=0, le=10)
    priority: int | None = Field(None, ge=1, le=10)
    is_active: bool | None = None
    metadata_info: dict[str, Any] | None = None
    dependencies: list[str] | None = None


class TaskResponse(TaskBase):
    """Task response schema."""

    id: UUID
    status: TaskStatus
    is_active: bool
    created_at: datetime
    updated_at: datetime
    owner_id: UUID
    owner_username: str | None = None


class TaskListResponse(BaseModel):
    """Task list response schema."""

    items: list[TaskResponse]
    total: int
    page: int
    page_size: int


class TaskExecutionStatus(str, Enum):
    """Task execution status enumeration."""

    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    TIMEOUT = "timeout"
    CANCELLED = "cancelled"


class TaskExecutionBase(BaseModel):
    """Base task execution schema."""

    model_config = ConfigDict(from_attributes=True)

    status: TaskExecutionStatus
    start_time: datetime
    end_time: datetime | None = None
    duration: int | None = None
    result: dict[str, Any] | None = None
    error: str | None = None
    attempt_number: int = 1
    return_code: int | None = None


class TaskExecutionResponse(TaskExecutionBase):
    """Task execution response schema."""

    id: UUID
    task_id: UUID
    stdout: str | None = None
    stderr: str | None = None
    created_at: datetime


class TaskExecutionListResponse(BaseModel):
    """Task execution list response schema."""

    items: list[TaskExecutionResponse]
    total: int
    page: int
    page_size: int


class TaskExecuteResponse(BaseModel):
    """Task execution trigger response."""

    message: str
    execution_id: UUID
    task_id: UUID


class UserBase(BaseModel):
    """Base user schema."""

    model_config = ConfigDict(from_attributes=True)

    email: str = Field(..., max_length=255)
    username: str = Field(..., min_length=3, max_length=255)


class UserCreate(UserBase):
    """User creation schema."""

    password: str = Field(..., min_length=4, max_length=72)


class UserResponse(UserBase):
    """User response schema."""

    id: UUID
    is_active: bool
    is_superuser: bool
    created_at: datetime


class Token(BaseModel):
    """Token response schema."""

    access_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenData(BaseModel):
    """Token data schema."""

    user_id: UUID


class HealthCheck(BaseModel):
    """Health check response schema."""

    status: str
    version: str
    timestamp: datetime
    database: str
    redis: str
    scheduler: str


class ErrorResponse(BaseModel):
    """Error response schema."""

    detail: str
    error_code: str | None = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class NotificationChannel(str, Enum):
    """Notification channel enumeration."""

    EMAIL = "email"
    WEBHOOK = "webhook"
    SMS = "sms"


class NotificationConfigBase(BaseModel):
    """Base notification configuration schema."""

    model_config = ConfigDict(from_attributes=True)

    channel: NotificationChannel
    enabled: bool = True
    on_success: bool = False
    on_failure: bool = True
    on_start: bool = False
    config: dict[str, Any] = {}


class NotificationConfigCreate(NotificationConfigBase):
    """Notification configuration creation schema."""

    task_id: UUID | None = None


class NotificationConfigUpdate(BaseModel):
    """Notification configuration update schema."""

    channel: NotificationChannel | None = None
    enabled: bool | None = None
    on_success: bool | None = None
    on_failure: bool | None = None
    on_start: bool | None = None
    config: dict[str, Any] | None = None
    task_id: UUID | None = None


class NotificationConfigResponse(NotificationConfigBase):
    """Notification configuration response schema."""

    id: UUID
    user_id: UUID
    task_id: UUID | None
    created_at: datetime
    updated_at: datetime


class NotificationLogResponse(BaseModel):
    """Notification log response schema."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    task_id: UUID | None
    execution_id: UUID | None
    channel: str
    event_type: str
    status: str
    recipient: str
    subject: str | None
    content: str
    error_message: str | None
    retry_count: int
    created_at: datetime
    sent_at: datetime | None
