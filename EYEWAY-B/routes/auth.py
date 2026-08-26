from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime
import uuid
from db.database import get_db
from db.helpers import serialize_user
from models.schemas import RegisterRequest, LoginRequest, TokenResponse, UserOut, ProfileUpdate
from core.security import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(payload: RegisterRequest, db=Depends(get_db)):
    # Check duplicate
    if await db["users"].find_one({"email": payload.email}):
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = str(uuid.uuid4())
    doc = {
        "_id": user_id,
        "name": payload.name,
        "email": payload.email,
        "phone": payload.phone,
        "hashed_password": hash_password(payload.password),
        "role": payload.role,
        "department": payload.department,
        "is_active": True,
        "created_at": datetime.utcnow(),
    }
    await db["users"].insert_one(doc)

    token = create_access_token({"sub": user_id, "role": payload.role})
    return TokenResponse(
        access_token=token,
        user=UserOut(**serialize_user(doc))
    )


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db=Depends(get_db)):
    user = await db["users"].find_one({"email": payload.email})
    if not user or not verify_password(payload.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account is disabled")

    token = create_access_token({"sub": str(user["_id"]), "role": user["role"]})
    return TokenResponse(
        access_token=token,
        user=UserOut(**serialize_user(user))
    )


@router.get("/me", response_model=UserOut)
async def get_me(current_user=Depends(get_current_user)):
    return UserOut(**serialize_user(current_user))


@router.patch("/me", response_model=UserOut)
async def update_profile(
    payload: ProfileUpdate,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    updates = {}
    if payload.name:
        updates["name"] = payload.name.strip()
    if payload.phone is not None:
        updates["phone"] = payload.phone
    if payload.department is not None:
        updates["department"] = payload.department

    # Password change
    if payload.new_password:
        if not payload.current_password:
            raise HTTPException(status_code=400, detail="Current password required")
        if not verify_password(payload.current_password, current_user["hashed_password"]):
            raise HTTPException(status_code=400, detail="Current password is incorrect")
        if len(payload.new_password) < 6:
            raise HTTPException(status_code=400, detail="New password must be at least 6 characters")
        updates["hashed_password"] = hash_password(payload.new_password)

    if updates:
        await db["users"].update_one({"_id": current_user["_id"]}, {"$set": updates})

    updated = await db["users"].find_one({"_id": current_user["_id"]})
    return UserOut(**serialize_user(updated))


@router.get("/users", response_model=list[UserOut])
async def list_users(current_user=Depends(get_current_user), db=Depends(get_db)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    users = await db["users"].find().sort("created_at", -1).to_list(500)
    return [UserOut(**serialize_user(u)) for u in users]


@router.get("/officers", response_model=list[UserOut])
async def list_officers(current_user=Depends(get_current_user), db=Depends(get_db)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    officers = await db["users"].find({"role": "officer"}).to_list(200)
    return [UserOut(**serialize_user(o)) for o in officers]


@router.patch("/users/{user_id}/toggle")
async def toggle_user(
    user_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    if user_id == str(current_user["_id"]):
        raise HTTPException(status_code=400, detail="Cannot disable yourself")
    user = await db["users"].find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    new_status = not user.get("is_active", True)
    await db["users"].update_one({"_id": user_id}, {"$set": {"is_active": new_status}})
    return {"user_id": user_id, "is_active": new_status}
