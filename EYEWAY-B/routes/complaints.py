from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import datetime
from typing import Optional
import uuid

from sqlalchemy import text

from db.database import get_db
from db.helpers import serialize_complaint
from models.schemas import (
    ComplaintCreate,
    ComplaintStatusUpdate,
    ComplaintOut,
)
from core.security import get_current_user


router = APIRouter()


async def _enrich(doc, db):
    """Attach citizen name and officer name to complaint."""

    doc = dict(doc)

    if doc.get("created_by"):
        result = await db.execute(
            text("SELECT name FROM users WHERE id = :user_id"),
            {"user_id": str(doc["created_by"])},
        )

        user = result.mappings().first()

        doc["created_by_name"] = (
            user["name"] if user else "Unknown"
        )

    if doc.get("assigned_to"):
        result = await db.execute(
            text("SELECT name FROM users WHERE id = :user_id"),
            {"user_id": str(doc["assigned_to"])},
        )

        officer = result.mappings().first()

        doc["assigned_to_name"] = (
            officer["name"] if officer else None
        )

    return doc


# ─────────────────────────────────────────────────────────────────────────────
# POST /complaint
# ─────────────────────────────────────────────────────────────────────────────

@router.post(
    "/complaint",
    response_model=ComplaintOut,
    status_code=201
)
async def create_complaint(
    payload: ComplaintCreate,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    if current_user["role"] not in ("citizen", "admin"):
        raise HTTPException(
            status_code=403,
            detail="Only citizens can file complaints"
        )

    complaint_id = str(uuid.uuid4())
    created_at = datetime.utcnow()

    doc = {
        "id": complaint_id,
        "title": payload.title,
        "description": payload.description,
        "category": payload.category,
        "location": payload.location,
        "priority": payload.priority,
        "status": "pending",
        "resolution_note": None,
        "created_by": str(current_user["id"]),
        "created_by_name": current_user["name"],
        "assigned_to": None,
        "assigned_to_name": None,
        "created_at": created_at,
        "updated_at": None,
    }

    await db.execute(
        text(
            """
            INSERT INTO complaints (
                id,
                title,
                description,
                category,
                location,
                priority,
                status,
                resolution_note,
                created_by,
                assigned_to,
                created_at,
                updated_at
            )
            VALUES (
                :id,
                :title,
                :description,
                :category,
                :location,
                :priority,
                :status,
                :resolution_note,
                :created_by,
                :assigned_to,
                :created_at,
                :updated_at
            )
            """
        ),
        doc,
    )

    await db.commit()

    return ComplaintOut(
        **serialize_complaint(doc)
    )


# ─────────────────────────────────────────────────────────────────────────────
# GET /my-complaints
# ─────────────────────────────────────────────────────────────────────────────

@router.get(
    "/my-complaints",
    response_model=list[ComplaintOut]
)
async def my_complaints(
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    if current_user["role"] not in ("citizen", "admin"):
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    conditions = ["created_by = :created_by"]
    params = {
        "created_by": str(current_user["id"])
    }

    if status:
        conditions.append("status = :status")
        params["status"] = status

    if category:
        conditions.append("category = :category")
        params["category"] = category

    if search:
        conditions.append(
            "(title ILIKE :search OR location ILIKE :search)"
        )
        params["search"] = f"%{search}%"

    query = f"""
        SELECT *
        FROM complaints
        WHERE {" AND ".join(conditions)}
        ORDER BY created_at DESC
        LIMIT 200
    """

    result = await db.execute(text(query), params)

    docs = [dict(row) for row in result.mappings().all()]

    return [
        ComplaintOut(**serialize_complaint(d))
        for d in docs
    ]


# ─────────────────────────────────────────────────────────────────────────────
# GET /public-complaints
# ─────────────────────────────────────────────────────────────────────────────

@router.get(
    "/public-complaints",
    response_model=list[ComplaintOut]
)
async def public_complaints(
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, le=100),
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    conditions = []
    params = {
        "skip": skip,
        "limit": limit,
    }

    if category:
        conditions.append("category = :category")
        params["category"] = category

    if status:
        conditions.append("status = :status")
        params["status"] = status

    where_clause = ""

    if conditions:
        where_clause = "WHERE " + " AND ".join(conditions)

    query = f"""
        SELECT *
        FROM complaints
        {where_clause}
        ORDER BY created_at DESC
        OFFSET :skip
        LIMIT :limit
    """

    result = await db.execute(
        text(query),
        params
    )

    docs = [dict(row) for row in result.mappings().all()]

    result_list = []

    for d in docs:
        s = serialize_complaint(d)

        # Privacy
        s["created_by"] = "***"
        s["created_by_name"] = "Citizen"

        result_list.append(
            ComplaintOut(**s)
        )

    return result_list


# ─────────────────────────────────────────────────────────────────────────────
# GET /assigned-complaints
# ─────────────────────────────────────────────────────────────────────────────

@router.get(
    "/assigned-complaints",
    response_model=list[ComplaintOut]
)
async def assigned_complaints(
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    if current_user["role"] != "officer":
        raise HTTPException(
            status_code=403,
            detail="Officers only"
        )

    conditions = ["assigned_to = :assigned_to"]

    params = {
        "assigned_to": str(current_user["id"])
    }

    if status:
        conditions.append("status = :status")
        params["status"] = status

    if search:
        conditions.append(
            "(title ILIKE :search OR location ILIKE :search)"
        )
        params["search"] = f"%{search}%"

    query = f"""
        SELECT *
        FROM complaints
        WHERE {" AND ".join(conditions)}
        ORDER BY created_at DESC
        LIMIT 200
    """

    result = await db.execute(
        text(query),
        params
    )

    docs = [dict(row) for row in result.mappings().all()]

    enriched = [
        await _enrich(d, db)
        for d in docs
    ]

    return [
        ComplaintOut(**serialize_complaint(d))
        for d in enriched
    ]


# ─────────────────────────────────────────────────────────────────────────────
# GET /all-complaints
# ─────────────────────────────────────────────────────────────────────────────

@router.get(
    "/all-complaints",
    response_model=list[ComplaintOut]
)
async def all_complaints(
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    assigned_to: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=500),
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin only"
        )

    conditions = []
    params = {
        "skip": skip,
        "limit": limit,
    }

    if status:
        conditions.append("c.status = :status")
        params["status"] = status

    if category:
        conditions.append("c.category = :category")
        params["category"] = category

    if priority:
        conditions.append("c.priority = :priority")
        params["priority"] = priority

    if assigned_to:
        conditions.append("c.assigned_to = :assigned_to")
        params["assigned_to"] = assigned_to

    if search:
        conditions.append(
            """
            (
                c.title ILIKE :search
                OR c.location ILIKE :search
                OR u.name ILIKE :search
            )
            """
        )
        params["search"] = f"%{search}%"

    where_clause = ""

    if conditions:
        where_clause = "WHERE " + " AND ".join(conditions)

    query = f"""
        SELECT c.*
        FROM complaints c
        LEFT JOIN users u
            ON u.id = c.created_by
        {where_clause}
        ORDER BY c.created_at DESC
        OFFSET :skip
        LIMIT :limit
    """

    result = await db.execute(
        text(query),
        params
    )

    docs = [dict(row) for row in result.mappings().all()]

    enriched = [
        await _enrich(d, db)
        for d in docs
    ]

    return [
        ComplaintOut(**serialize_complaint(d))
        for d in enriched
    ]


# ─────────────────────────────────────────────────────────────────────────────
# GET /complaint/{complaint_id}
# ─────────────────────────────────────────────────────────────────────────────

@router.get(
    "/complaint/{complaint_id}",
    response_model=ComplaintOut
)
async def get_complaint(
    complaint_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    result = await db.execute(
        text(
            "SELECT * FROM complaints WHERE id = :complaint_id"
        ),
        {"complaint_id": complaint_id},
    )

    row = result.mappings().first()

    if not row:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    doc = dict(row)

    role = current_user["role"]
    uid = str(current_user["id"])

    if role == "citizen" and doc["created_by"] != uid:
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    if role == "officer" and doc.get("assigned_to") != uid:
        raise HTTPException(
            status_code=403,
            detail="Not assigned to you"
        )

    doc = await _enrich(doc, db)

    return ComplaintOut(
        **serialize_complaint(doc)
    )


# ─────────────────────────────────────────────────────────────────────────────
# PUT /update-status
# ─────────────────────────────────────────────────────────────────────────────

@router.put(
    "/update-status/{complaint_id}",
    response_model=ComplaintOut
)
async def update_status(
    complaint_id: str,
    payload: ComplaintStatusUpdate,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    role = current_user["role"]

    if role not in ("officer", "admin"):
        raise HTTPException(
            status_code=403,
            detail="Officers and admins only"
        )

    result = await db.execute(
        text(
            "SELECT * FROM complaints WHERE id = :complaint_id"
        ),
        {"complaint_id": complaint_id},
    )

    row = result.mappings().first()

    if not row:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    doc = dict(row)

    # Officer can only update assigned complaints
    if (
        role == "officer"
        and doc.get("assigned_to") != str(current_user["id"])
    ):
        raise HTTPException(
            status_code=403,
            detail="Not assigned to you"
        )

    updates = {
        "status": payload.status,
        "updated_at": datetime.utcnow(),
    }

    if payload.resolution_note:
        updates["resolution_note"] = payload.resolution_note

    # Admin can reassign
    if payload.assigned_to and role == "admin":

        officer_result = await db.execute(
            text(
                """
                SELECT *
                FROM users
                WHERE id = :officer_id
                AND role = 'officer'
                """
            ),
            {
                "officer_id": payload.assigned_to
            },
        )

        officer_row = officer_result.mappings().first()

        if not officer_row:
            raise HTTPException(
                status_code=404,
                detail="Officer not found"
            )

        officer = dict(officer_row)

        updates["assigned_to"] = payload.assigned_to
        updates["assigned_to_name"] = officer["name"]

    set_parts = []
    params = {
        "complaint_id": complaint_id
    }

    for key, value in updates.items():
        set_parts.append(f"{key} = :{key}")
        params[key] = value

    await db.execute(
        text(
            f"""
            UPDATE complaints
            SET {", ".join(set_parts)}
            WHERE id = :complaint_id
            """
        ),
        params,
    )

    await db.commit()

    result = await db.execute(
        text(
            "SELECT * FROM complaints WHERE id = :complaint_id"
        ),
        {"complaint_id": complaint_id},
    )

    updated_row = result.mappings().first()

    updated = await _enrich(
        dict(updated_row),
        db
    )

    return ComplaintOut(
        **serialize_complaint(updated)
    )


# ─────────────────────────────────────────────────────────────────────────────
# DELETE /complaint/{complaint_id}
# ─────────────────────────────────────────────────────────────────────────────

@router.delete(
    "/complaint/{complaint_id}",
    status_code=204
)
async def delete_complaint(
    complaint_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin only"
        )

    result = await db.execute(
        text(
            "DELETE FROM complaints WHERE id = :complaint_id"
        ),
        {"complaint_id": complaint_id},
    )

    if result.rowcount == 0:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    await db.commit()

    return None