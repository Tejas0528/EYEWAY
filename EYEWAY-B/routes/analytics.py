from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text

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
        raise HTTPException(
            status_code=403,
            detail="Admin only"
        )

    # ─────────────────────────────────────────────
    # Complaint counts
    # ─────────────────────────────────────────────

    result = await db.execute(
        text("SELECT COUNT(*) FROM complaints")
    )
    total = result.scalar() or 0

    result = await db.execute(
        text(
            "SELECT COUNT(*) FROM complaints "
            "WHERE status = 'pending'"
        )
    )
    pending = result.scalar() or 0

    result = await db.execute(
        text(
            "SELECT COUNT(*) FROM complaints "
            "WHERE status = 'in_progress'"
        )
    )
    in_progress = result.scalar() or 0

    result = await db.execute(
        text(
            "SELECT COUNT(*) FROM complaints "
            "WHERE status = 'resolved'"
        )
    )
    resolved = result.scalar() or 0

    result = await db.execute(
        text(
            "SELECT COUNT(*) FROM complaints "
            "WHERE status = 'rejected'"
        )
    )
    rejected = result.scalar() or 0

    # ─────────────────────────────────────────────
    # User counts
    # ─────────────────────────────────────────────

    result = await db.execute(
        text(
            "SELECT COUNT(*) FROM users "
            "WHERE role = 'citizen'"
        )
    )
    citizens = result.scalar() or 0

    result = await db.execute(
        text(
            "SELECT COUNT(*) FROM users "
            "WHERE role = 'officer'"
        )
    )
    officers = result.scalar() or 0

    # ─────────────────────────────────────────────
    # Complaints by category
    # ─────────────────────────────────────────────

    result = await db.execute(
        text(
            """
            SELECT category, COUNT(*) AS count
            FROM complaints
            GROUP BY category
            """
        )
    )

    by_category = {
        row["category"]: row["count"]
        for row in result.mappings().all()
    }

    # ─────────────────────────────────────────────
    # Complaints by priority
    # ─────────────────────────────────────────────

    result = await db.execute(
        text(
            """
            SELECT priority, COUNT(*) AS count
            FROM complaints
            GROUP BY priority
            """
        )
    )

    by_priority = {
        row["priority"]: row["count"]
        for row in result.mappings().all()
    }

    # ─────────────────────────────────────────────
    # Resolution rate
    # ─────────────────────────────────────────────

    resolution_rate = (
        round(resolved / total * 100, 1)
        if total
        else 0.0
    )

    return AnalyticsOut(
        total=total,
        pending=pending,
        in_progress=in_progress,
        resolved=resolved,
        rejected=rejected,
        by_category=by_category,
        by_priority=by_priority,
        total_citizens=citizens,
        total_officers=officers,
        resolution_rate=resolution_rate,
    )


@router.get("/officer-stats")
async def officer_stats(
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    """Officer's own performance stats."""

    if current_user["role"] not in ("officer", "admin"):
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    oid = str(current_user["id"])

    # Total assigned
    result = await db.execute(
        text(
            """
            SELECT COUNT(*)
            FROM complaints
            WHERE assigned_to = :oid
            """
        ),
        {"oid": oid},
    )
    total = result.scalar() or 0

    # Resolved
    result = await db.execute(
        text(
            """
            SELECT COUNT(*)
            FROM complaints
            WHERE assigned_to = :oid
            AND status = 'resolved'
            """
        ),
        {"oid": oid},
    )
    resolved = result.scalar() or 0

    # Pending
    result = await db.execute(
        text(
            """
            SELECT COUNT(*)
            FROM complaints
            WHERE assigned_to = :oid
            AND status = 'pending'
            """
        ),
        {"oid": oid},
    )
    pending = result.scalar() or 0

    # In progress
    result = await db.execute(
        text(
            """
            SELECT COUNT(*)
            FROM complaints
            WHERE assigned_to = :oid
            AND status = 'in_progress'
            """
        ),
        {"oid": oid},
    )
    in_progress = result.scalar() or 0

    return {
        "total_assigned": total,
        "resolved": resolved,
        "pending": pending,
        "in_progress": in_progress,
        "resolution_rate": (
            round(resolved / total * 100, 1)
            if total
            else 0.0
        ),
    }