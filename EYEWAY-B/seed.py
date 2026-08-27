"""
Seed demo data into PostgreSQL.
Run: python seed.py
"""

import asyncio
import uuid
from datetime import datetime

import bcrypt
from sqlalchemy import text

from db.database import engine


def hp(password: str) -> str:
    return bcrypt.hashpw(
        password.encode(),
        bcrypt.gensalt()
    ).decode()


async def create_tables(connection):
    # ─────────────────────────────────────────────────────────────
    # USERS TABLE
    # ─────────────────────────────────────────────────────────────

    await connection.execute(
        text(
            """
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(36) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                phone VARCHAR(50),
                hashed_password TEXT NOT NULL,
                role VARCHAR(20) NOT NULL DEFAULT 'citizen',
                department VARCHAR(255),
                is_active BOOLEAN NOT NULL DEFAULT TRUE,
                created_at TIMESTAMP NOT NULL
            )
            """
        )
    )

    # ─────────────────────────────────────────────────────────────
    # COMPLAINTS TABLE
    # ─────────────────────────────────────────────────────────────

    await connection.execute(
        text(
            """
            CREATE TABLE IF NOT EXISTS complaints (
                id VARCHAR(36) PRIMARY KEY,
                title VARCHAR(500) NOT NULL,
                description TEXT NOT NULL,
                category VARCHAR(255) NOT NULL,
                location VARCHAR(500) NOT NULL,
                status VARCHAR(50) NOT NULL DEFAULT 'pending',
                priority VARCHAR(50) NOT NULL DEFAULT 'medium',
                resolution_note TEXT,
                created_by VARCHAR(36) NOT NULL,
                assigned_to VARCHAR(36),
                created_at TIMESTAMP NOT NULL,
                updated_at TIMESTAMP
            )
            """
        )
    )

    # ─────────────────────────────────────────────────────────────
    # INDEXES
    # ─────────────────────────────────────────────────────────────

    await connection.execute(
        text(
            """
            CREATE INDEX IF NOT EXISTS idx_complaints_created_by
            ON complaints(created_by)
            """
        )
    )

    await connection.execute(
        text(
            """
            CREATE INDEX IF NOT EXISTS idx_complaints_assigned_to
            ON complaints(assigned_to)
            """
        )
    )

    await connection.execute(
        text(
            """
            CREATE INDEX IF NOT EXISTS idx_complaints_status
            ON complaints(status)
            """
        )
    )


async def seed():
    async with engine.begin() as connection:

        print("Creating PostgreSQL tables...")

        await create_tables(connection)

        print("✅ Tables ready")

        # ─────────────────────────────────────────────────────────
        # CHECK WHETHER DATA ALREADY EXISTS
        # ─────────────────────────────────────────────────────────

        result = await connection.execute(
            text("SELECT COUNT(*) AS count FROM users")
        )

        count = result.scalar()

        if count and count > 0:
            print("⚠️ Database already contains users.")
            print("Skipping demo seed data.")
            return

        # ─────────────────────────────────────────────────────────
        # USER IDS
        # ─────────────────────────────────────────────────────────

        admin_id = str(uuid.uuid4())
        officer1_id = str(uuid.uuid4())
        officer2_id = str(uuid.uuid4())
        citizen1_id = str(uuid.uuid4())
        citizen2_id = str(uuid.uuid4())

        now = datetime.utcnow()

        # ─────────────────────────────────────────────────────────
        # USERS
        # ─────────────────────────────────────────────────────────

        users = [
            {
                "id": admin_id,
                "name": "Admin Rajan",
                "email": "admin@eyeway.gov.in",
                "hashed_password": hp("admin123"),
                "role": "admin",
                "phone": None,
                "department": None,
                "is_active": True,
                "created_at": now,
            },
            {
                "id": officer1_id,
                "name": "Officer Suresh",
                "email": "suresh@eyeway.gov.in",
                "hashed_password": hp("officer123"),
                "role": "officer",
                "phone": "+91 98001 11111",
                "department": "Roads & Transport",
                "is_active": True,
                "created_at": now,
            },
            {
                "id": officer2_id,
                "name": "Officer Meena",
                "email": "meena@eyeway.gov.in",
                "hashed_password": hp("officer123"),
                "role": "officer",
                "phone": "+91 98001 22222",
                "department": "Water Supply",
                "is_active": True,
                "created_at": now,
            },
            {
                "id": citizen1_id,
                "name": "Priya Sharma",
                "email": "priya@email.com",
                "hashed_password": hp("citizen123"),
                "role": "citizen",
                "phone": "+91 99001 11111",
                "department": None,
                "is_active": True,
                "created_at": now,
            },
            {
                "id": citizen2_id,
                "name": "Rahul Menon",
                "email": "rahul@email.com",
                "hashed_password": hp("citizen123"),
                "role": "citizen",
                "phone": "+91 99002 22222",
                "department": None,
                "is_active": True,
                "created_at": now,
            },
        ]

        for user in users:
            await connection.execute(
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

        # ─────────────────────────────────────────────────────────
        # COMPLAINTS
        # ─────────────────────────────────────────────────────────

        complaints = [
            {
                "id": str(uuid.uuid4()),
                "title": "Large pothole on MG Road near bus stop",
                "description": (
                    "Deep pothole causing accidents and vehicle damage. "
                    "Needs urgent repair before monsoon."
                ),
                "category": "Roads & Transport",
                "location": "MG Road, Near Bus Stop No. 14, Chennai",
                "status": "in_progress",
                "priority": "high",
                "resolution_note": None,
                "created_by": citizen1_id,
                "assigned_to": officer1_id,
                "created_at": now,
                "updated_at": now,
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Broken streetlight on 5th Avenue",
                "description": (
                    "Streetlight non-functional for 3 weeks, "
                    "safety hazard at night especially for women."
                ),
                "category": "Electricity",
                "location": "5th Avenue, Anna Nagar, Chennai",
                "status": "pending",
                "priority": "medium",
                "resolution_note": None,
                "created_by": citizen1_id,
                "assigned_to": None,
                "created_at": now,
                "updated_at": None,
            },
            {
                "id": str(uuid.uuid4()),
                "title": "No water supply for 3 days",
                "description": (
                    "Entire locality without water supply. "
                    "Affects 200+ households including elderly and children."
                ),
                "category": "Water Supply",
                "location": "Anna Nagar West, Block 4, Chennai",
                "status": "resolved",
                "priority": "high",
                "resolution_note": (
                    "Main pipe repaired on Apr 21. "
                    "Supply restored to all households."
                ),
                "created_by": citizen2_id,
                "assigned_to": officer2_id,
                "created_at": now,
                "updated_at": now,
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Garbage not collected for 2 weeks",
                "description": (
                    "Waste accumulating on streets. "
                    "Causing foul smell and health risk."
                ),
                "category": "Sanitation",
                "location": "T Nagar, 3rd Cross Street, Chennai",
                "status": "pending",
                "priority": "medium",
                "resolution_note": None,
                "created_by": citizen2_id,
                "assigned_to": None,
                "created_at": now,
                "updated_at": None,
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Sewage overflow near Government School",
                "description": (
                    "Open sewage overflowing near primary school entrance. "
                    "Health hazard for children."
                ),
                "category": "Sanitation",
                "location": "Govt. Primary School, Anna Nagar, Chennai",
                "status": "in_progress",
                "priority": "high",
                "resolution_note": None,
                "created_by": citizen1_id,
                "assigned_to": officer1_id,
                "created_at": now,
                "updated_at": now,
            },
        ]

        for complaint in complaints:
            await connection.execute(
                text(
                    """
                    INSERT INTO complaints (
                        id,
                        title,
                        description,
                        category,
                        location,
                        status,
                        priority,
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
                        :status,
                        :priority,
                        :resolution_note,
                        :created_by,
                        :assigned_to,
                        :created_at,
                        :updated_at
                    )
                    """
                ),
                complaint,
            )

    print("\n✅ PostgreSQL database seeded successfully!\n")

    print("Demo Credentials:")
    print("  Admin   → admin@eyeway.gov.in  / admin123")
    print("  Officer → suresh@eyeway.gov.in / officer123")
    print("  Officer → meena@eyeway.gov.in  / officer123")
    print("  Citizen → priya@email.com      / citizen123")
    print("  Citizen → rahul@email.com      / citizen123")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())