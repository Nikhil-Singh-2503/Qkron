"""Main FastAPI application."""

from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from sqlalchemy import text

from taskmaster import __version__
from taskmaster.api.routes import auth, health, notifications, tasks, users
from taskmaster.config import get_settings
from taskmaster.core import get_scheduler
from taskmaster.db import engine, AsyncSessionLocal
from taskmaster.db.models import Base

settings = get_settings()

# Configure rate limiter
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100/hour", "20/minute"],
)

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer(),
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()


async def on_schedule_trigger(task_id: str):
    """Handle scheduled task trigger."""
    from taskmaster.services import TaskService, NotificationService
    from taskmaster.schemas import TaskExecutionStatus, TaskStatus
    from taskmaster.core import get_executor
    import uuid

    async with AsyncSessionLocal() as db:
        service = TaskService(db)
        notification_service = NotificationService(db)
        executor = get_executor()

        try:
            task_uuid = uuid.UUID(task_id)
            task = await service.get_task(task_uuid)

            if not task or not task.is_active:
                return

            # Check dependencies before execution
            deps_satisfied, deps_error = await service.check_dependencies(task_uuid)
            if not deps_satisfied:
                logger.warning(
                    "Task dependencies not satisfied", task_id=task_id, error=deps_error
                )
                await service.update_task_status(task_uuid, TaskStatus.FAILED)
                # Send failure notification
                await notification_service.notify_task_event(
                    user_id=task.owner_id,
                    task_name=task.name,
                    event_type="failure",
                    task_id=task.id,
                    execution_result={
                        "error": f"Dependency not satisfied: {deps_error}"
                    },
                )
                return

            # Send start notification
            await notification_service.notify_task_event(
                user_id=task.owner_id,
                task_name=task.name,
                event_type="start",
                task_id=task.id,
            )

            execution = await service.create_execution(task_uuid)
            await service.update_execution(execution.id, TaskExecutionStatus.RUNNING)
            await service.update_task_status(task_uuid, TaskStatus.RUNNING)

            result = await executor.execute_with_retry(
                execution_id=str(execution.id),
                command=task.command,
                timeout=task.timeout,
                max_retries=task.max_retries,
                retry_delay=settings.task_retry_delay,
            )

            status_map = {
                "completed": TaskExecutionStatus.COMPLETED,
                "failed": TaskExecutionStatus.FAILED,
                "timeout": TaskExecutionStatus.TIMEOUT,
            }
            exec_status = status_map.get(result["status"], TaskExecutionStatus.FAILED)

            await service.update_execution(
                execution.id,
                status=exec_status,
                result=result if result.get("return_code") is not None else None,
                error=result.get("error"),
                stdout=result.get("stdout"),
                stderr=result.get("stderr"),
                return_code=result.get("return_code"),
                duration=result.get("duration"),
                attempt_number=result.get("attempt_number", 1),
            )

            task_status = (
                TaskStatus.COMPLETED
                if exec_status == TaskExecutionStatus.COMPLETED
                else TaskStatus.FAILED
            )
            await service.update_task_status(task_uuid, task_status)

            # Send completion notification
            event_type = (
                "success" if exec_status == TaskExecutionStatus.COMPLETED else "failure"
            )
            await notification_service.notify_task_event(
                user_id=task.owner_id,
                task_name=task.name,
                event_type=event_type,
                task_id=task.id,
                execution_id=execution.id,
                execution_result=result,
            )

        except Exception as e:
            logger.error(
                "Scheduled task execution failed", task_id=task_id, error=str(e)
            )


async def load_scheduled_tasks(scheduler):
    """Load existing active tasks from database into scheduler."""
    from sqlalchemy import select
    from taskmaster.db.models import Task
    from taskmaster.schemas import ScheduleType
    import logging

    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Task).where(Task.is_active == True)
        )
        tasks = result.scalars().all()

        print(f"[DEBUG] Found {len(tasks)} active tasks")
        
        for task in tasks:
            try:
                print(f"[DEBUG] Loading task: {task.name}, type={task.schedule_type}, schedule={task.schedule}")
                scheduler.add_task(
                    task_id=str(task.id),
                    schedule_type=ScheduleType(task.schedule_type),
                    schedule=task.schedule,
                    timezone=task.timezone,
                )
                print(f"[DEBUG] Successfully loaded task: {task.name}")
                logger.info(f"Loaded task into scheduler task_id={str(task.id)} task_name={task.name}")
            except Exception as e:
                print(f"[ERROR] Failed to load task {task.name}: {e}")
                logger.error(f"Failed to load task into scheduler task_id={str(task.id)} error={str(e)}")

        print(f"[DEBUG] Finished loading {len(tasks)} tasks")
        logger.info(f"Loaded {len(tasks)} tasks into scheduler")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    logger.info("Starting QKron", version=__version__)

    try:
        async with engine.begin() as conn:
            # Set Supabase public schema
            await conn.execute(text("SET search_path TO public"))
            # Create all tables
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Failed to create database tables: {e}")
        raise

    # Start scheduler
    scheduler = get_scheduler()
    scheduler.set_callback(on_schedule_trigger)
    scheduler.start()

    # Load existing active tasks from database
    await load_scheduled_tasks(scheduler)

    logger.info("QKron started successfully")
    yield

    # Shutdown
    logger.info("Shutting down QKron")
    scheduler.shutdown(wait=False)
    await engine.dispose()
    logger.info("QKron shutdown complete")


# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    description="Industry-Grade Task Scheduling and Execution System",
    version=__version__,
    docs_url="/docs" if settings.is_development else None,
    redoc_url="/redoc" if settings.is_development else None,
    openapi_url=f"{settings.api_v1_prefix}/openapi.json",
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add rate limiter state
app.state.limiter = limiter

# Include routers
app.include_router(auth.router, prefix=settings.api_v1_prefix)
app.include_router(health.router)
app.include_router(tasks.router, prefix=settings.api_v1_prefix)
app.include_router(users.router, prefix=settings.api_v1_prefix)
app.include_router(notifications.router, prefix=settings.api_v1_prefix)


@app.get("/")
async def root():
    return {
        "name": settings.app_name,
        "version": __version__,
        "docs": "/docs" if settings.is_development else None,
    }
