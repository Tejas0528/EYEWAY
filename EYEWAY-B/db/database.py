from sqlalchemy.ext.asyncio import (
    create_async_engine,
    AsyncSession,
    async_sessionmaker,
)
from core.config import settings


# PostgreSQL async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
)


# Async session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def connect_db():
    """
    Connect to PostgreSQL and verify the connection.
    """
    try:
        async with engine.begin() as connection:
            await connection.run_sync(lambda conn: None)

        print("✅ Connected to PostgreSQL successfully")

    except Exception as e:
        print(f"❌ PostgreSQL connection failed: {e}")
        raise


async def disconnect_db():
    """
    Close PostgreSQL connection pool.
    """
    await engine.dispose()
    print("PostgreSQL connection closed")


async def get_db():
    """
    Provide an async PostgreSQL database session.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()