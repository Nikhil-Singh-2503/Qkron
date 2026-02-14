"""Authentication and authorization utilities."""

from datetime import UTC, datetime, timedelta
from typing import Any
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from taskmaster.config import get_settings
from taskmaster.db import get_db
from taskmaster.db.models import User
from taskmaster.schemas import TokenData

settings = get_settings()

# Password hashing using Argon2
pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto",
)

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.api_v1_prefix}/auth/login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies password."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hashes password using Argon2."""
    return pwd_context.hash(password)


def create_access_token(
    user_id: UUID,
    expires_delta: timedelta | None = None,
) -> str:
    """Create JWT access token."""
    if expires_delta:
        expire = datetime.now(UTC) + expires_delta
    else:
        expire = datetime.now(UTC) + timedelta(
            minutes=settings.access_token_expire_minutes
        )

    to_encode: dict[str, Any] = {
        "sub": str(user_id),
        "exp": int(expire.timestamp()),
    }

    return jwt.encode(
        to_encode,
        settings.secret_key,
        algorithm=settings.algorithm,
    )


async def get_current_user(
    token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)
) -> User:
    """Get current authenticated user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm],
        )

        user_id_raw = payload.get("sub")
        if not isinstance(user_id_raw, str):
            raise credentials_exception

        token_data = TokenData(user_id=UUID(user_id_raw))

    except (JWTError, ValueError) as err:
        raise credentials_exception from err

    # Get user from database
    result = await db.execute(select(User).where(User.id == token_data.user_id))
    user = result.scalar_one_or_none()

    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user",
        )

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Get current active user."""
    return current_user
