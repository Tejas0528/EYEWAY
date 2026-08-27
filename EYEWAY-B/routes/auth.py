from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
import uuid
from sqlalchemy import text

from db.database import get_db
from db.helpers import serialize_user
from models.schemas import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    UserOut,
    ProfileUpdate,
)
from core.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)

router = APIRouter()


# ─────────────────────────────────────────────────────────────────────────────
# REGISTER
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(
    payload: RegisterRequest,
    db=Depends(get_db),
):
    # Check duplicate email
    result = await db.execute(
        text("SELECT * FROM users WHERE email = :email"),
        {"email": payload.email},
    )

    existing_user = result.mappings().first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    user_id = str(uuid.uuid4())
    created_at = datetime.utcnow()

    user = {
        "id": user_id,
        "name": payload.name,
        "email": payload.email,
        "phone": payload.phone,
        "hashed_password": hash_password(payload.password),
        "role": payload.role.value,
        "department": payload.department,
        "is_active": True,
        "created_at": created_at,
    }

    await db.execute(
        text(
            """
            INSERT INTO users (
                id,
                name,
                email,
                phone,
                hashed_password,
                role,
                department,
                is_active,
                created_at
            )
            VALUES (
                :id,
                :name,
                :email,
                :phone,
                :hashed_password,
                :role,
                :department,
                :is_active,
                :created_at
            )
            """
        ),
        user,
    )

    await db.commit()

    token = create_access_token(
        {
            "sub": user_id,
            "role": payload.role.value,
        }
    )

    return TokenResponse(
        access_token=token,
        user=UserOut(**serialize_user(user)),
    )


# ─────────────────────────────────────────────────────────────────────────────
# LOGIN
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/login", response_model=TokenResponse)
async def login(
    payload: LoginRequest,
    db=Depends(get_db),
):
    result = await db.execute(
        text("SELECT * FROM users WHERE email = :email"),
        {"email": payload.email},
    )

    user_row = result.mappings().first()

    if not user_row:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    user = dict(user_row)

    if not verify_password(
        payload.password,
        user["hashed_password"],
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=403,
            detail="Account is disabled",
        )

    token = create_access_token(
        {
            "sub": str(user["id"]),
            "role": user["role"],
        }
    )

    return TokenResponse(
        access_token=token,
        user=UserOut(**serialize_user(user)),
    )


# ─────────────────────────────────────────────────────────────────────────────
# CURRENT USER
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/me", response_model=UserOut)
async def get_me(
    current_user=Depends(get_current_user),
):
    return UserOut(**serialize_user(current_user))


# ─────────────────────────────────────────────────────────────────────────────
# UPDATE PROFILE
# ─────────────────────────────────────────────────────────────────────────────

@router.patch("/me", response_model=UserOut)
async def update_profile(
    payload: ProfileUpdate,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    updates = {}
    params = {
        "user_id": str(current_user["id"])
    }

    if payload.name:
        updates["name"] = payload.name.strip()

    if payload.phone is not None:
        updates["phone"] = payload.phone

    if payload.department is not None:
        updates["department"] = payload.department

    # Password change
    if payload.new_password:

        if not payload.current_password:
            raise HTTPException(
                status_code=400,
                detail="Current password required",
            )

        if not verify_password(
            payload.current_password,
            current_user["hashed_password"],
        ):
            raise HTTPException(
                status_code=400,
                detail="Current password is incorrect",
            )

        if len(payload.new_password) < 6:
            raise HTTPException(
                status_code=400,
                detail="New password must be at least 6 characters",
            )

        updates["hashed_password"] = hash_password(
            payload.new_password
        )

    if updates:

        set_parts = []

        for key, value in updates.items():
            set_parts.append(f"{key} = :{key}")
            params[key] = value

        query = text(
            f"""
            UPDATE users
            SET {", ".join(set_parts)}
            WHERE id = :user_id
            """
        )

        await db.execute(query, params)
        await db.commit()

    result = await db.execute(
        text("SELECT * FROM users WHERE id = :user_id"),
        {"user_id": str(current_user["id"])},
    )

    updated = result.mappings().first()

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    return UserOut(**serialize_user(dict(updated)))


# ─────────────────────────────────────────────────────────────────────────────
# LIST USERS — ADMIN
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/users", response_model=list[UserOut])
async def list_users(
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin only",
        )

    result = await db.execute(
        text(
            """
            SELECT *
            FROM users
            ORDER BY created_at DESC
            LIMIT 500
            """
        )
    )

    users = result.mappings().all()

    return [
        UserOut(**serialize_user(dict(user)))
        for user in users
    ]


# ─────────────────────────────────────────────────────────────────────────────
# LIST OFFICERS — ADMIN
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/officers", response_model=list[UserOut])
async def list_officers(
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin only",
        )

    result = await db.execute(
        text(
            """
            SELECT *
            FROM users
            WHERE role = 'officer'
            ORDER BY created_at DESC
            LIMIT 200
            """
        )
    )

    officers = result.mappings().all()

    return [
        UserOut(**serialize_user(dict(officer)))
        for officer in officers
    ]


# ─────────────────────────────────────────────────────────────────────────────
# TOGGLE USER — ADMIN
# ─────────────────────────────────────────────────────────────────────────────

@router.patch("/users/{user_id}/toggle")
async def toggle_user(
    user_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin only",
        )

    if user_id == str(current_user["id"]):
        raise HTTPException(
            status_code=400,
            detail="Cannot disable yourself",
        )

    result = await db.execute(
        text("SELECT * FROM users WHERE id = :user_id"),
        {"user_id": user_id},
    )

    user_row = result.mappings().first()

    if not user_row:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    user = dict(user_row)

    new_status = not user.get("is_active", True)

    await db.execute(
        text(
            """
            UPDATE users
            SET is_active = :is_active
            WHERE id = :user_id
            """
        ),
        {
            "is_active": new_status,
            "user_id": user_id,
        },
    )

    await db.commit()

    return {
        "user_id": user_id,
        "is_active": new_status,
    }