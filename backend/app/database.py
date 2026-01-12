from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import settings


class Database:
    """MongoDB database connection manager."""
    
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None


db = Database()


async def connect_to_mongo():
    """Create database connection on startup."""
    db.client = AsyncIOMotorClient(settings.MONGODB_URI)
    db.db = db.client[settings.DATABASE_NAME]
    print(f"Connected to MongoDB: {settings.DATABASE_NAME}")
    
    # Create indexes
    await create_indexes()


async def close_mongo_connection():
    """Close database connection on shutdown."""
    if db.client:
        db.client.close()
        print("Closed MongoDB connection")


async def create_indexes():
    """Create database indexes for performance."""
    
    # Tools collection indexes
    await db.db.tools.create_index("name")
    await db.db.tools.create_index("category")
    await db.db.tools.create_index("pricingModel")
    await db.db.tools.create_index("avgRating")
    await db.db.tools.create_index([("name", "text"), ("shortDescription", "text")])
    
    # Reviews collection indexes
    await db.db.reviews.create_index("toolId")
    await db.db.reviews.create_index("userId")
    await db.db.reviews.create_index("status")
    await db.db.reviews.create_index([("toolId", 1), ("status", 1)])
    
    # Users collection indexes
    await db.db.users.create_index("email", unique=True)
    
    print("Database indexes created")


def get_database() -> AsyncIOMotorDatabase:
    """Dependency to get database instance."""
    return db.db
