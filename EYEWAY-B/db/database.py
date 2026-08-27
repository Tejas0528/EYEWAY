from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

from core.config import settings


DATABASE_URL = settings.DATABASE_URL

# Render gives postgresql://...
# SQLAlchemy async requires postgresql+asyncpg://
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace(
        "postgresql://",
        "postgresql+asyncpg://",
        1
    )

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def connect_db():
    """
    Connect to PostgreSQL and create required tables.
    """

    async with engine.begin() as conn:

        # ─────────────────────────────────────────────
        # USERS TABLE
        # ─────────────────────────────────────────────

        await conn.execute(
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
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
        )

        # ─────────────────────────────────────────────
        # COMPLAINTS TABLE
        # ─────────────────────────────────────────────

        await conn.execute(
            text(
                """
                CREATE TABLE IF NOT EXISTS complaints (
                    id VARCHAR(36) PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    description TEXT NOT NULL,
                    category VARCHAR(255) NOT NULL,
                    location VARCHAR(500) NOT NULL,
                    status VARCHAR(30) NOT NULL DEFAULT 'pending',
                    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
                    resolution_note TEXT,
                    created_by VARCHAR(36) NOT NULL,
                    assigned_to VARCHAR(36),
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP
                )
                """
            )
        )

        # ─────────────────────────────────────────────
        # INDEXES
        # ─────────────────────────────────────────────

        await conn.execute(
            text(
                """
                CREATE INDEX IF NOT EXISTS idx_users_email
                ON users(email)
                """
            )
        )

        await conn.execute(
            text(
                """
                CREATE INDEX IF NOT EXISTS idx_complaints_created_by
                ON complaints(created_by)
                """
            )
        )

        await conn.execute(
            text(
                """
                CREATE INDEX IF NOT EXISTS idx_complaints_assigned_to
                ON complaints(assigned_to)
                """
            )
        )

        await conn.execute(
            text(
                """
                CREATE INDEX IF NOT EXISTS idx_complaints_status
                ON complaints(status)
                """
            )
        )

        await conn.execute(
            text(
                """
                CREATE INDEX IF NOT EXISTS idx_complaints_category
                ON complaints(category)
                """
            )
        )

    print("✅ Connected to PostgreSQL")
    print("✅ Users table ready")
    print("✅ Complaints table ready")


async def disconnect_db():
    """
    Close PostgreSQL connection pool.
    """

    await engine.dispose()

    print("PostgreSQL connection closed")


async def get_db():
    """
    Provide an async database session to FastAPI routes.
    """

    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()