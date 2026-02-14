# taskmaster/db/connection.py
"""Database connection and session management for Supabase PostgreSQL."""
import ssl
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool
from taskmaster.config import get_settings

settings = get_settings()

# Make sure DATABASE_URL comes from settings
database_url = settings.database_url

ssl_context = ssl.create_default_context()
# Create async engine with SSL required for Supabase
engine = create_async_engine(
    database_url,
    echo=settings.debug,
    pool_pre_ping=True,
    connect_args={"ssl": ssl_context},  # Ensure channel binding is required
    poolclass=NullPool,  # optional, Supabase prefers short-lived connections
)

# Async session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    expire_on_commit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Provide a transactional scope around a series of operations."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
