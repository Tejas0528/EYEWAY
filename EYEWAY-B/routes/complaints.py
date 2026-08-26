from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import datetime
from typing import Optional
import uuid
from db.database import get_db
from db.helpers import serialize_complaint
from models.schemas import ComplaintCreate, ComplaintStatusUpdate, ComplaintOut
from core.security import get_current_user

router = APIRouter()


async def _enrich(doc, db):
    """Attach citizen name and officer name to complaint doc."""
    if doc.get("created_by"):
        u = await db["users"].find_one({"_id": doc["created_by"]})
        doc["created_by_name"] = u["name"] if u else "Unknown"
    if doc.get("assigned_to"):
        o = await db["users"].find_one({"_id": doc["assigned_to"]})
        doc["assigned_to_name"] = o["name"] if o else None
    return doc


# ── POST /complaint  (Citizen) ─────────────────────────────────────────────────
@router.post("/complaint", response_model=ComplaintOut, status_code=201)
async def create_complaint(
    payload: ComplaintCreate,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    if current_user["role"] not in ("citizen", "admin"):
        raise HTTPException(status_code=403, detail="Only citizens can file complaints")

    doc = {
        "_id": str(uuid.uuid4()),
        "title": payload.title,
        "description": payload.description,
        "category": payload.category,
        "location": payload.location,
        "priority": payload.priority,
        "status": "pending",
        "resolution_note": None,
        "created_by": str(current_user["_id"]),
        "created_by_name": current_user["name"],
        "assigned_to": None,
        "assigned_to_name": None,
        "created_at": datetime.utcnow(),
        "updated_at": None,
    }
    await db["complaints"].insert_one(doc)
    return ComplaintOut(**serialize_complaint(doc))


# ── GET /my-complaints  (Citizen — own complaints only) ────────────────────────
@router.get("/my-complaints", response_model=list[ComplaintOut])
async def my_complaints(
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    if current_user["role"] not in ("citizen", "admin"):
        raise HTTPException(status_code=403, detail="Access denied")

    query = {"created_by": str(current_user["_id"])}
    if status:
        query["status"] = status
    if category:
        query["category"] = category
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"location": {"$regex": search, "$options": "i"}},
        ]

    docs = await db["complaints"].find(query).sort("created_at", -1).to_list(200)
    return [ComplaintOut(**serialize_complaint(d)) for d in docs]


# ── GET /public-complaints  (All citizens can see — no private data) ───────────
@router.get("/public-complaints", response_model=list[ComplaintOut])
async def public_complaints(
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, le=100),
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    """
    All logged-in users can see this — but personal info is stripped.
    Shows community complaints without revealing who filed them.
    """
    query = {}
    if category:
        query["category"] = category
    if status:
        query["status"] = status

    docs = await db["complaints"].find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(100)
    result = []
    for d in docs:
        s = serialize_complaint(d)
        # Strip citizen identity for privacy
        s["created_by"] = "***"
        s["created_by_name"] = "Citizen"
        result.append(ComplaintOut(**s))
    return result


# ── GET /assigned-complaints  (Officer — only their assigned cases) ────────────
@router.get("/assigned-complaints", response_model=list[ComplaintOut])
async def assigned_complaints(
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    if current_user["role"] != "officer":
        raise HTTPException(status_code=403, detail="Officers only")

    query = {"assigned_to": str(current_user["_id"])}
    if status:
        query["status"] = status
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"location": {"$regex": search, "$options": "i"}},
        ]

    docs = await db["complaints"].find(query).sort("created_at", -1).to_list(200)
    enriched = [await _enrich(d, db) for d in docs]
    return [ComplaintOut(**serialize_complaint(d)) for d in enriched]


# ── GET /all-complaints  (Admin — full visibility) ─────────────────────────────
@router.get("/all-complaints", response_model=list[ComplaintOut])
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
        raise HTTPException(status_code=403, detail="Admin only")

    query = {}
    if status:
        query["status"] = status
    if category:
        query["category"] = category
    if priority:
        query["priority"] = priority
    if assigned_to:
        query["assigned_to"] = assigned_to
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"location": {"$regex": search, "$options": "i"}},
            {"created_by_name": {"$regex": search, "$options": "i"}},
        ]

    docs = (
        await db["complaints"]
        .find(query)
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
        .to_list(500)
    )
    enriched = [await _enrich(d, db) for d in docs]
    return [ComplaintOut(**serialize_complaint(d)) for d in enriched]


# ── GET /complaint/{id}  (owner / assigned officer / admin) ───────────────────
@router.get("/complaint/{complaint_id}", response_model=ComplaintOut)
async def get_complaint(
    complaint_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    doc = await db["complaints"].find_one({"_id": complaint_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Complaint not found")

    role = current_user["role"]
    uid = str(current_user["_id"])

    if role == "citizen" and doc["created_by"] != uid:
        raise HTTPException(status_code=403, detail="Access denied")
    if role == "officer" and doc.get("assigned_to") != uid:
        raise HTTPException(status_code=403, detail="Not assigned to you")

    doc = await _enrich(doc, db)
    return ComplaintOut(**serialize_complaint(doc))


# ── PUT /update-status  (Officer/Admin) ───────────────────────────────────────
@router.put("/update-status/{complaint_id}", response_model=ComplaintOut)
async def update_status(
    complaint_id: str,
    payload: ComplaintStatusUpdate,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    role = current_user["role"]
    if role not in ("officer", "admin"):
        raise HTTPException(status_code=403, detail="Officers and admins only")

    doc = await db["complaints"].find_one({"_id": complaint_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Complaint not found")

    # Officer can only update their assigned complaints
    if role == "officer" and doc.get("assigned_to") != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Not assigned to you")

    updates = {
        "status": payload.status,
        "updated_at": datetime.utcnow(),
    }
    if payload.resolution_note:
        updates["resolution_note"] = payload.resolution_note

    # Admin can reassign
    if payload.assigned_to and role == "admin":
        officer = await db["users"].find_one({"_id": payload.assigned_to, "role": "officer"})
        if not officer:
            raise HTTPException(status_code=404, detail="Officer not found")
        updates["assigned_to"] = payload.assigned_to
        updates["assigned_to_name"] = officer["name"]

    await db["complaints"].update_one({"_id": complaint_id}, {"$set": updates})
    updated = await db["complaints"].find_one({"_id": complaint_id})
    updated = await _enrich(updated, db)
    return ComplaintOut(**serialize_complaint(updated))


# ── DELETE /complaint/{id}  (Admin only) ──────────────────────────────────────
@router.delete("/complaint/{complaint_id}", status_code=204)
async def delete_complaint(
    complaint_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    result = await db["complaints"].delete_one({"_id": complaint_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Complaint not found")
