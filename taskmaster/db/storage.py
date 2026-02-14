"""In-memory storage for QKron."""

import uuid
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from taskmaster.db.models import User, Task, TaskExecution


class InMemoryStorage:
    """Simple in-memory storage for development."""

    def __init__(self):
        """Initialize storage."""
        self.users: dict[uuid.UUID, "User"] = {}
        self.tasks: dict[uuid.UUID, "Task"] = {}
        self.executions: dict[uuid.UUID, "TaskExecution"] = {}
        self._email_index: dict[str, uuid.UUID] = {}
        self._username_index: dict[str, uuid.UUID] = {}

    def clear(self):
        """Clear all data."""
        self.users.clear()
        self.tasks.clear()
        self.executions.clear()
        self._email_index.clear()
        self._username_index.clear()


# Global storage instance
_storage = InMemoryStorage()


def get_storage() -> InMemoryStorage:
    """Get storage instance."""
    return _storage
