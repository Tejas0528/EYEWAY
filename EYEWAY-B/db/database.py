from motor.motor_asyncio import AsyncIOMotorClient
from core.config import settings

client: AsyncIOMotorClient = None


async def connect_db():
    global client
    client = AsyncIOMotorClient(settings.MONGO_URI)
    # Create indexes
    db = client[settings.DB_NAME]
    await db["users"].create_index("email", unique=True)
    await db["complaints"].create_index("created_by")
    await db["complaints"].create_index("assigned_to")
    await db["complaints"].create_index("status")
    print(f"✅ Connected to MongoDB: {settings.DB_NAME}")


async def disconnect_db():
    global client
    if client:
        client.close()
        print("MongoDB connection closed")


def get_db():
    return client[settings.DB_NAME]
