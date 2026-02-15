"""Authentication routes."""

from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from taskmaster.auth import (
    create_access_token,
    get_current_active_user,
    get_password_hash,
    verify_password,
)
from taskmaster.config import get_settings
from taskmaster.db import get_db
from taskmaster.db.models import User
from taskmaster.schemas import Token, UserCreate, UserResponse

router = APIRouter(prefix="/auth", tags=["authentication"])
settings = get_settings()


# Load superuser secret from environment
SUPERUSER_SECRET = settings.secret_key


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register(
    user_data: UserCreate,
    superuser_secret: str | None = Query(
        None, description="Secret key to create the first superuser"
    ),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Register a new user. Use `superuser_secret` to create the first superuser."""
    # Check if email already exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Check if username already exists
    result = await db.execute(select(User).where(User.username == user_data.username))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken",
        )

    # Determine if user should be a superuser
    is_superuser = False
    # Only allow superuser if secret matches and no other superusers exist
    if superuser_secret == SUPERUSER_SECRET:
        # Check if any superuser exists already
        result = await db.execute(select(User).where(User.is_superuser.is_(True)))
        any_superuser_exists = result.scalar_one_or_none() is not None
        if not any_superuser_exists:
            is_superuser = True

    # Create user
    user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=get_password_hash(user_data.password),
        is_superuser=is_superuser,
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)

    return user


@router.post("/login", response_model=Token)
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Login and get access token."""
    # Find user by username
    result = await db.execute(select(User).where(User.username == form_data.username))
    user = result.scalar_one_or_none()

    if not user or not verify_password(
        form_data.password,
        user.hashed_password,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user",
        )

    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)

    access_token = create_access_token(
        user_id=user.id,
        expires_delta=access_token_expires,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": settings.access_token_expire_minutes * 60,
    }


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> User:
    """Get current user info."""
    return current_user
