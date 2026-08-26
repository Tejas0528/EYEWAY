"""
Seed demo data into MongoDB.
Run: python seed.py
"""
import asyncio, uuid
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
import bcrypt

MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "eyeway_db"

def hp(pwd): return bcrypt.hashpw(pwd.encode(), bcrypt.gensalt()).decode()

async def seed():
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]

    if await db["users"].find_one({}):
        print("Already seeded. Drop the DB first to re-seed.")
        client.close()
        return

    # ── Users ──────────────────────────────────────────────────────────────
    admin_id   = str(uuid.uuid4())
    officer1_id = str(uuid.uuid4())
    officer2_id = str(uuid.uuid4())
    citizen1_id = str(uuid.uuid4())
    citizen2_id = str(uuid.uuid4())

    users = [
        {"_id": admin_id,    "name": "Admin Rajan",    "email": "admin@eyeway.gov.in",   "hashed_password": hp("admin123"),   "role": "admin",   "phone": None, "department": None,       "is_active": True, "created_at": datetime.utcnow()},
        {"_id": officer1_id, "name": "Officer Suresh", "email": "suresh@eyeway.gov.in",  "hashed_password": hp("officer123"), "role": "officer", "phone": "+91 98001 11111", "department": "Roads & Transport", "is_active": True, "created_at": datetime.utcnow()},
        {"_id": officer2_id, "name": "Officer Meena",  "email": "meena@eyeway.gov.in",   "hashed_password": hp("officer123"), "role": "officer", "phone": "+91 98001 22222", "department": "Water Supply",       "is_active": True, "created_at": datetime.utcnow()},
        {"_id": citizen1_id, "name": "Priya Sharma",   "email": "priya@email.com",       "hashed_password": hp("citizen123"), "role": "citizen", "phone": "+91 99001 11111", "department": None, "is_active": True, "created_at": datetime.utcnow()},
        {"_id": citizen2_id, "name": "Rahul Menon",    "email": "rahul@email.com",       "hashed_password": hp("citizen123"), "role": "citizen", "phone": "+91 99002 22222", "department": None, "is_active": True, "created_at": datetime.utcnow()},
    ]
    await db["users"].insert_many(users)
    await db["users"].create_index("email", unique=True)

    # ── Complaints ─────────────────────────────────────────────────────────
    complaints = [
        {"_id": str(uuid.uuid4()), "title": "Large pothole on MG Road near bus stop", "description": "Deep pothole causing accidents and vehicle damage. Needs urgent repair before monsoon.", "category": "Roads & Transport", "location": "MG Road, Near Bus Stop No. 14, Chennai", "status": "in_progress", "priority": "high", "resolution_note": None, "created_by": citizen1_id, "created_by_name": "Priya Sharma", "assigned_to": officer1_id, "assigned_to_name": "Officer Suresh", "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()},
        {"_id": str(uuid.uuid4()), "title": "Broken streetlight on 5th Avenue", "description": "Streetlight non-functional for 3 weeks, safety hazard at night especially for women.", "category": "Electricity", "location": "5th Avenue, Anna Nagar, Chennai", "status": "pending", "priority": "medium", "resolution_note": None, "created_by": citizen1_id, "created_by_name": "Priya Sharma", "assigned_to": None, "assigned_to_name": None, "created_at": datetime.utcnow(), "updated_at": None},
        {"_id": str(uuid.uuid4()), "title": "No water supply for 3 days", "description": "Entire locality without water supply. Affects 200+ households including elderly and children.", "category": "Water Supply", "location": "Anna Nagar West, Block 4, Chennai", "status": "resolved", "priority": "high", "resolution_note": "Main pipe repaired on Apr 21. Supply restored to all households.", "created_by": citizen2_id, "created_by_name": "Rahul Menon", "assigned_to": officer2_id, "assigned_to_name": "Officer Meena", "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()},
        {"_id": str(uuid.uuid4()), "title": "Garbage not collected for 2 weeks", "description": "Waste accumulating on streets. Causing foul smell and health risk.", "category": "Sanitation", "location": "T Nagar, 3rd Cross Street, Chennai", "status": "pending", "priority": "medium", "resolution_note": None, "created_by": citizen2_id, "created_by_name": "Rahul Menon", "assigned_to": None, "assigned_to_name": None, "created_at": datetime.utcnow(), "updated_at": None},
        {"_id": str(uuid.uuid4()), "title": "Sewage overflow near Government School", "description": "Open sewage overflowing near primary school entrance. Health hazard for children.", "category": "Sanitation", "location": "Govt. Primary School, Anna Nagar, Chennai", "status": "in_progress", "priority": "high", "resolution_note": None, "created_by": citizen1_id, "created_by_name": "Priya Sharma", "assigned_to": officer1_id, "assigned_to_name": "Officer Suresh", "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()},
    ]
    await db["complaints"].insert_many(complaints)
    await db["complaints"].create_index("created_by")
    await db["complaints"].create_index("assigned_to")

    client.close()
    print("✅ Database seeded!\n")
    print("Demo Credentials:")
    print("  Admin   → admin@eyeway.gov.in  / admin123")
    print("  Officer → suresh@eyeway.gov.in / officer123")
    print("  Officer → meena@eyeway.gov.in  / officer123")
    print("  Citizen → priya@email.com      / citizen123")
    print("  Citizen → rahul@email.com      / citizen123")

asyncio.run(seed())
