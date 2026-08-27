from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import text

from core.config import settings
from db.database import get_db


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def hash_password(password: str) -> str:
    return bcrypt.hashpw(
        password.encode(),
        bcrypt.gensalt()
    ).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(
        plain.encode(),
        hashed.encode()
    )


def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None
) -> str:
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + (
        expires_delta
        or timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )

    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db=Depends(get_db),
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        user_id: str = payload.get("sub")

        if not user_id:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    # PostgreSQL user lookup
    result = await db.execute(
        text(
            """
            SELECT *
            FROM users
            WHERE id = :user_id
            """
        ),
        {"user_id": user_id},
    )

    user_row = result.mappings().first()

    if not user_row:
        raise credentials_exception

    user = dict(user_row)

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=403,
            detail="Account is disabled"
        )

    return user


def require_roles(*roles: str):
    async def checker(
        current_user=Depends(get_current_user)
    ):
        if current_user["role"] not in roles:
            raise HTTPException(
                status_code=403,
                detail=(
                    f"Access denied. Required role(s): "
                    f"{', '.join(roles)}"
                )
            )

        return current_user

    return checker