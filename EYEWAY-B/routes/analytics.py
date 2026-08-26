from fastapi import APIRouter, Depends, HTTPException
from db.database import get_db
from models.schemas import AnalyticsOut
from core.security import get_current_user

router = APIRouter()


@router.get("/", response_model=AnalyticsOut)
async def get_analytics(
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")

    total = await db["complaints"].count_documents({})
    pending = await db["complaints"].count_documents({"status": "pending"})
    in_progress = await db["complaints"].count_documents({"status": "in_progress"})
    resolved = await db["complaints"].count_documents({"status": "resolved"})
    rejected = await db["complaints"].count_documents({"status": "rejected"})
    citizens = await db["users"].count_documents({"role": "citizen"})
    officers = await db["users"].count_documents({"role": "officer"})

    # By category
    cat_pipeline = [{"$group": {"_id": "$category", "count": {"$sum": 1}}}]
    cat_result = await db["complaints"].aggregate(cat_pipeline).to_list(50)
    by_category = {r["_id"]: r["count"] for r in cat_result}

    # By priority
    pri_pipeline = [{"$group": {"_id": "$priority", "count": {"$sum": 1}}}]
    pri_result = await db["complaints"].aggregate(pri_pipeline).to_list(10)
    by_priority = {r["_id"]: r["count"] for r in pri_result}

    resolution_rate = round(resolved / total * 100, 1) if total else 0.0

    return AnalyticsOut(
        total=total, pending=pending, in_progress=in_progress,
        resolved=resolved, rejected=rejected,
        by_category=by_category, by_priority=by_priority,
        total_citizens=citizens, total_officers=officers,
        resolution_rate=resolution_rate,
    )


@router.get("/officer-stats")
async def officer_stats(
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    """Officer's own performance stats."""
    if current_user["role"] not in ("officer", "admin"):
        raise HTTPException(status_code=403, detail="Access denied")

    oid = str(current_user["_id"])
    total = await db["complaints"].count_documents({"assigned_to": oid})
    resolved = await db["complaints"].count_documents({"assigned_to": oid, "status": "resolved"})
    pending = await db["complaints"].count_documents({"assigned_to": oid, "status": "pending"})
    in_progress = await db["complaints"].count_documents({"assigned_to": oid, "status": "in_progress"})

    return {
        "total_assigned": total,
        "resolved": resolved,
        "pending": pending,
        "in_progress": in_progress,
        "resolution_rate": round(resolved / total * 100, 1) if total else 0.0,
    }
