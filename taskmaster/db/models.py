"""Database models using SQLAlchemy."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Optional

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    """Base model with common attributes."""

    type_annotation_map = {
        dict[str, Any]: JSON,
        list[str]: JSON,
    }


class User(Base):
    """User model."""

    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    username: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    tasks: Mapped[list["Task"]] = relationship(
        "Task", back_populates="owner", lazy="selectin"
    )
    notification_configs: Mapped[list["NotificationConfig"]] = relationship(
        "NotificationConfig",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class Task(Base):
    """Task model."""

    __tablename__ = "tasks"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    command: Mapped[str] = mapped_column(Text, nullable=False)
    schedule_type: Mapped[str] = mapped_column(
        String(50), nullable=False, default="cron"
    )
    schedule: Mapped[str] = mapped_column(String(255), nullable=False)
    timezone: Mapped[str] = mapped_column(String(50), default="UTC")
    timeout: Mapped[int] = mapped_column(Integer, default=300)
    max_retries: Mapped[int] = mapped_column(Integer, default=3)
    status: Mapped[str] = mapped_column(String(50), default="pending", index=True)
    priority: Mapped[int] = mapped_column(Integer, default=5)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
    metadata_info: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    dependencies: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    tags: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )

    # Relationships
    owner: Mapped["User"] = relationship("User", back_populates="tasks")
    executions: Mapped[list["TaskExecution"]] = relationship(
        "TaskExecution",
        back_populates="task",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    notification_configs: Mapped[list["NotificationConfig"]] = relationship(
        "NotificationConfig",
        back_populates="task",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class TaskExecution(Base):
    """Task execution history model."""

    __tablename__ = "task_executions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    task_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tasks.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    status: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    start_time: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    end_time: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    duration: Mapped[int | None] = mapped_column(Integer, nullable=True)
    result: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    error: Mapped[str | None] = mapped_column(Text, nullable=True)
    attempt_number: Mapped[int] = mapped_column(Integer, default=1)
    stdout: Mapped[str | None] = mapped_column(Text, nullable=True)
    stderr: Mapped[str | None] = mapped_column(Text, nullable=True)
    return_code: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    task: Mapped["Task"] = relationship("Task", back_populates="executions")


class NotificationConfig(Base):
    """Notification configuration for users."""

    __tablename__ = "notification_configs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    task_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tasks.id", ondelete="CASCADE"), nullable=True
    )

    # Channel configuration
    channel: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # email, webhook, sms
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)

    # Event triggers
    on_success: Mapped[bool] = mapped_column(Boolean, default=False)
    on_failure: Mapped[bool] = mapped_column(Boolean, default=True)
    on_start: Mapped[bool] = mapped_column(Boolean, default=False)

    # Channel-specific configuration (stored as JSON)
    config: Mapped[dict[str, Any]] = mapped_column(JSONB, default=dict)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="notification_configs")
    task: Mapped["Optional[Task]"] = relationship(
        "Task", back_populates="notification_configs"
    )


class NotificationLog(Base):
    """Log of sent notifications."""

    __tablename__ = "notification_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    task_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tasks.id"), nullable=True
    )
    execution_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("task_executions.id"), nullable=True
    )

    channel: Mapped[str] = mapped_column(String(50), nullable=False)
    event_type: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # success, failure, start
    status: Mapped[str] = mapped_column(
        String(50), default="pending"
    )  # pending, sent, failed

    recipient: Mapped[str] = mapped_column(String(500), nullable=False)
    subject: Mapped[str | None] = mapped_column(String(500), nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)

    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    retry_count: Mapped[int] = mapped_column(Integer, default=0)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    sent_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
