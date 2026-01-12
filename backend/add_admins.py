"""
Add admin users to the database.
Run this script to add admin users for testing.
"""
import asyncio
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "ai_tools_discovery")


async def add_admins():
    """Add admin users to the database."""
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[DATABASE_NAME]
    
    print(f"Connected to MongoDB: {DATABASE_NAME}")
    
    # Admin users
    admins = [
        {
            "name": "Admin User",
            "email": "admin@example.com",
            "password": "admin123",
            "role": "admin",
            "createdAt": datetime.now()
        },
        {
            "name": "Anjan Kumar",
            "email": "anjan@example.com",
            "password": "admin123",
            "role": "admin",
            "createdAt": datetime.now()
        },
        {
            "name": "Sanjay Admin",
            "email": "sanjay.admin@example.com",
            "password": "admin123",
            "role": "admin",
            "createdAt": datetime.now()
        },
        {
            "name": "Deepa Admin",
            "email": "deepa.admin@example.com",
            "password": "admin123",
            "role": "admin",
            "createdAt": datetime.now()
        }
    ]
    
    # Insert admins
    inserted_count = 0
    for admin in admins:
        try:
            await db.users.insert_one(admin)
            print(f"  👑 {admin['name']} ({admin['email']})")
            inserted_count += 1
        except Exception as e:
            if "duplicate key error" in str(e):
                print(f"  ⚠️  {admin['email']} already exists, skipping...")
            else:
                print(f"  ❌ Error adding {admin['email']}: {e}")
    
    print(f"\n✅ Successfully added {inserted_count} admin users!")
    print(f"\n🔑 All admin passwords: admin123")
    
    # Close connection
    client.close()
    print("\nDatabase connection closed")


if __name__ == "__main__":
    asyncio.run(add_admins())
