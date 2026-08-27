"""Helpers to serialize PostgreSQL records."""

from datetime import datetime


def serialize_user(doc: dict) -> dict:
    if not doc:
        return None

    return {
        "id": str(doc.get("id", "")),
        "name": doc.get("name", ""),
        "email": doc.get("email", ""),
        "phone": doc.get("phone"),
        "role": doc.get("role", "citizen"),
        "department": doc.get("department"),
        "is_active": doc.get("is_active", True),
        "created_at": doc.get(
            "created_at",
            datetime.utcnow()
        ),
    }


def serialize_complaint(doc: dict) -> dict:
    if not doc:
        return None

    return {
        "id": str(doc.get("id", "")),
        "title": doc.get("title", ""),
        "description": doc.get("description", ""),
        "category": doc.get("category", ""),
        "location": doc.get("location", ""),
        "status": doc.get("status", "pending"),
        "priority": doc.get("priority", "medium"),
        "resolution_note": doc.get("resolution_note"),
        "created_by": str(doc.get("created_by", "")),
        "created_by_name": doc.get("created_by_name"),
        "assigned_to": (
            str(doc["assigned_to"])
            if doc.get("assigned_to")
            else None
        ),
        "assigned_to_name": doc.get("assigned_to_name"),
        "created_at": doc.get(
            "created_at",
            datetime.utcnow()
        ),
        "updated_at": doc.get("updated_at"),
    }