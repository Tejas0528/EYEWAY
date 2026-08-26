from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    citizen = "citizen"
    officer = "officer"
    admin = "admin"


class ComplaintStatus(str, Enum):
    pending = "pending"
    in_progress = "in_progress"
    resolved = "resolved"
    rejected = "rejected"


class ComplaintPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


# ── Auth ──────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    role: UserRole = UserRole.citizen
    department: Optional[str] = None  # for officers

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v

    @field_validator("name")
    @classmethod
    def name_not_blank(cls, v):
        if not v.strip():
            raise ValueError("Name is required")
        return v.strip()


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str]
    role: UserRole
    department: Optional[str]
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None


# ── Complaints ─────────────────────────────────────────────────────────────────

class ComplaintCreate(BaseModel):
    title: str
    description: str
    category: str
    location: str
    priority: ComplaintPriority = ComplaintPriority.medium

    @field_validator("title", "description", "category", "location")
    @classmethod
    def not_blank(cls, v):
        if not v.strip():
            raise ValueError("Field cannot be empty")
        return v.strip()


class ComplaintStatusUpdate(BaseModel):
    status: ComplaintStatus
    resolution_note: Optional[str] = None
    assigned_to: Optional[str] = None  # officer user id (admin only)


class ComplaintOut(BaseModel):
    id: str
    title: str
    description: str
    category: str
    location: str
    status: ComplaintStatus
    priority: ComplaintPriority
    resolution_note: Optional[str]
    created_by: str
    created_by_name: Optional[str]
    assigned_to: Optional[str]
    assigned_to_name: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = {"from_attributes": True}


# ── Analytics ──────────────────────────────────────────────────────────────────

class AnalyticsOut(BaseModel):
    total: int
    pending: int
    in_progress: int
    resolved: int
    rejected: int
    by_category: dict
    by_priority: dict
    total_citizens: int
    total_officers: int
    resolution_rate: float
