"""Task execution engine."""

from __future__ import annotations

import asyncio
import logging
import re
import shlex
from datetime import datetime
from typing import Any

from taskmaster.config import get_settings
from taskmaster.schemas import TaskExecutionStatus

settings = get_settings()
logger = logging.getLogger(__name__)

# Dangerous patterns that could lead to command injection
DANGEROUS_PATTERNS = [
    r";\s*rm\s",
    r"\|\s*rm\s",
    r"&&\s*rm\s",
    r";\s*curl\s",
    r"\|\s*curl\s",
    r";\s*wget\s",
    r"\|\s*wget\s",
    r"\$\(",
    r"`",
    r">\s*/dev/",
    r">\s*\|",
]

# Allowed commands (whitelist approach - empty means all allowed)
ALLOWED_COMMANDS: list[str] = []


class CommandValidationError(Exception):
    """Raised when command validation fails."""

    pass


def validate_command(
    command: str, allowed_commands: list[str] | None = None
) -> tuple[bool, str]:
    """Validate a command for security concerns.

    Args:
        command: The command string to validate
        allowed_commands: Optional list of allowed commands (whitelist)

    Returns:
        Tuple of (is_valid, error_message)
    """
    if not command or not command.strip():
        return False, "Command cannot be empty"

    # Check command length
    if len(command) > 10000:
        return False, "Command too long (max 10000 characters)"

    # Whitelist approach: if allowed_commands is specified, check against it
    whitelist = allowed_commands if allowed_commands is not None else ALLOWED_COMMANDS
    if whitelist:
        # Extract the base command
        try:
            parts = shlex.split(command)
            if parts:
                base_cmd = parts[0]
                # Check if base command is in allowed list
                if base_cmd not in whitelist:
                    return False, f"Command '{base_cmd}' not in allowed list"
        except ValueError:
            pass

    # Blacklist approach: check for dangerous patterns
    for pattern in DANGEROUS_PATTERNS:
        if re.search(pattern, command, re.IGNORECASE):
            logger.warning(
                f"Potentially dangerous command pattern detected: pattern={pattern} command={command[:100]}..."
            )
            return False, f"Command contains disallowed pattern: {pattern}"

    # Check for null bytes
    if "\x00" in command:
        return False, "Command contains null bytes"

    # Check for excessive newlines
    if command.count("\n") > 2:
        return False, "Command contains too many newlines"

    return True, ""


def sanitize_command(command: str) -> str:
    """Sanitize a command by removing potentially dangerous elements.

    Args:
        command: The command to sanitize

    Returns:
        Sanitized command string
    """
    # Remove null bytes
    command = command.replace("\x00", "")

    # Limit consecutive newlines
    command = re.sub(r"\n{3,}", "\n\n", command)

    return command.strip()


class TaskExecutor:
    """Asynchronous task execution engine."""

    def __init__(
        self, max_workers: int = 10, allowed_commands: list[str] | None = None
    ):
        """Initialize task executor.

        Args:
            max_workers: Maximum number of concurrent tasks
            allowed_commands: Optional whitelist of allowed commands
        """
        self.max_workers = max_workers
        self.semaphore = asyncio.Semaphore(self.max_workers)
        self._running_tasks: dict[str, asyncio.subprocess.Process] = {}
        self.allowed_commands = (
            allowed_commands if allowed_commands is not None else ALLOWED_COMMANDS
        )

    async def execute_with_retry(
        self,
        execution_id: str,
        command: str,
        timeout: int = 300,
        max_retries: int = 3,
        retry_delay: int = 60,
    ) -> dict[str, Any]:
        """Execute a command with retry logic.

        Args:
            execution_id: Unique execution identifier
            command: Shell command to execute
            timeout: Timeout in seconds
            max_retries: Maximum number of retry attempts
            retry_delay: Delay between retries in seconds

        Returns:
            Dict containing execution result with status, output, etc.
        """
        # Validate command before execution
        is_valid, error_msg = validate_command(command, self.allowed_commands)
        if not is_valid:
            logger.warning(f"Command validation failed: {error_msg}")
            return {
                "status": TaskExecutionStatus.FAILED,
                "return_code": None,
                "stdout": None,
                "stderr": None,
                "duration": 0,
                "error": f"Command validation failed: {error_msg}",
            }

        # Sanitize command
        command = sanitize_command(command)

        last_result = None

        for attempt in range(max_retries):
            # Update execution_id for each attempt to make it unique
            attempt_execution_id = f"{execution_id}_attempt_{attempt + 1}"

            logger.info(
                f"Executing task attempt execution_id={attempt_execution_id} attempt={attempt + 1}/{max_retries}"
            )

            result = await self.execute(
                execution_id=attempt_execution_id,
                command=command,
                timeout=timeout,
            )

            last_result = result
            last_result["attempt_number"] = attempt + 1

            # Check if execution was successful
            if result.get("status") == TaskExecutionStatus.COMPLETED:
                logger.info(
                    f"Task execution successful execution_id={execution_id} attempt={attempt + 1}"
                )
                return result

            # Log failure and retry if attempts remain
            if attempt < max_retries - 1:
                logger.warning(
                    f"Task execution failed, retrying after delay (Attempt {attempt + 1}/{max_retries}) execution_id={execution_id} status={result.get('status')}, error={result.get('error')}"
                )
                await asyncio.sleep(retry_delay)
            else:
                logger.error(
                    f"Task execution failed after all retries execution_id={execution_id} status={result.get('status')}, error={result.get('error')}"
                )

        return last_result or {
            "status": TaskExecutionStatus.FAILED,
            "return_code": None,
            "stdout": None,
            "stderr": None,
            "duration": 0,
            "error": "No execution result available",
        }

    async def execute(
        self,
        execution_id: str,
        command: str,
        timeout: int = 300,
    ) -> dict[str, Any]:
        """Execute a command asynchronously."""
        # Validate command before execution
        is_valid, error_msg = validate_command(command, self.allowed_commands)
        if not is_valid:
            logger.warning(f"Command validation failed: {error_msg}")
            return {
                "status": TaskExecutionStatus.FAILED,
                "return_code": None,
                "stdout": None,
                "stderr": None,
                "duration": 0,
                "error": f"Command validation failed: {error_msg}",
            }

        # Sanitize command
        command = sanitize_command(command)

        async with self.semaphore:
            try:
                # Create subprocess
                process = await asyncio.create_subprocess_shell(
                    command,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE,
                    limit=1024 * 1024,  # 1MB buffer
                )

                # Store running task
                self._running_tasks[execution_id] = process

                # Wait for completion with timeout
                start_time = datetime.utcnow()

                try:
                    stdout, stderr = await asyncio.wait_for(
                        process.communicate(), timeout=timeout
                    )

                    end_time = datetime.utcnow()
                    duration = int((end_time - start_time).total_seconds())

                    # Clean up
                    if execution_id in self._running_tasks:
                        del self._running_tasks[execution_id]

                    # Decode output
                    stdout_str = (
                        stdout.decode("utf-8", errors="replace") if stdout else None
                    )
                    stderr_str = (
                        stderr.decode("utf-8", errors="replace") if stderr else None
                    )

                    # Truncate if too long (max 100KB)
                    max_length = 100 * 1024
                    if stdout_str and len(stdout_str) > max_length:
                        stdout_str = stdout_str[:max_length] + "\n... (truncated)"
                    if stderr_str and len(stderr_str) > max_length:
                        stderr_str = stderr_str[:max_length] + "\n... (truncated)"

                    return {
                        "status": TaskExecutionStatus.COMPLETED
                        if process.returncode == 0
                        else TaskExecutionStatus.FAILED,
                        "return_code": process.returncode,
                        "stdout": stdout_str,
                        "stderr": stderr_str,
                        "duration": duration,
                        "error": None
                        if process.returncode == 0
                        else f"Exit code: {process.returncode}",
                    }

                except TimeoutError:
                    # Kill process on timeout
                    try:
                        process.kill()
                        await process.wait()
                    except Exception:
                        pass

                    # Clean up
                    if execution_id in self._running_tasks:
                        del self._running_tasks[execution_id]

                    end_time = datetime.utcnow()
                    duration = int((end_time - start_time).total_seconds())

                    return {
                        "status": TaskExecutionStatus.TIMEOUT,
                        "return_code": None,
                        "stdout": None,
                        "stderr": None,
                        "duration": duration,
                        "error": f"Task timed out after {timeout} seconds",
                    }

            except Exception as e:
                # Clean up
                if execution_id in self._running_tasks:
                    del self._running_tasks[execution_id]

                return {
                    "status": TaskExecutionStatus.FAILED,
                    "return_code": None,
                    "stdout": None,
                    "stderr": None,
                    "duration": 0,
                    "error": str(e),
                }

    async def cancel(self, execution_id: str) -> bool:
        """Cancel a running task."""
        if execution_id not in self._running_tasks:
            return False

        process = self._running_tasks[execution_id]

        try:
            process.kill()
            await process.wait()
        except Exception:
            pass
        finally:
            if execution_id in self._running_tasks:
                del self._running_tasks[execution_id]

        return True

    def is_running(self, execution_id: str) -> bool:
        """Check if task is running."""
        return execution_id in self._running_tasks

    def get_running_count(self) -> int:
        """Get number of running tasks."""
        return len(self._running_tasks)


# Global executor instance
_executor: "TaskExecutor" | None = None


def get_executor() -> "TaskExecutor":
    """Get or create executor instance."""
    global _executor
    if _executor is None:
        _executor = TaskExecutor()
    return _executor
