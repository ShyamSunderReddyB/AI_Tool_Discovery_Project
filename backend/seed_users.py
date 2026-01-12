"""
Seed the database with sample Indian users.
Run this script to populate the users collection with sample data.
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


async def seed_users():
    """Add sample Indian users to the database."""
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[DATABASE_NAME]
    
    print(f"Connected to MongoDB: {DATABASE_NAME}")
    
    # Sample Indian users
    users = [
        {
            "name": "Rajesh Kumar",
            "email": "rajesh.kumar@example.com",
            "password": "password123",
            "role": "user",
            "createdAt": datetime.now()
        },
        {
            "name": "Priya Sharma",
            "email": "priya.sharma@example.com",
            "password": "password123",
            "role": "user",
            "createdAt": datetime.now()
        },
        {
            "name": "Amit Patel",
            "email": "amit.patel@example.com",
            "password": "password123",
            "role": "user",
            "createdAt": datetime.now()
        },
        {
            "name": "Sneha Reddy",
            "email": "sneha.reddy@example.com",
            "password": "password123",
            "role": "user",
            "createdAt": datetime.now()
        },
        {
            "name": "Vikram Singh",
            "email": "vikram.singh@example.com",
            "password": "password123",
            "role": "user",
            "createdAt": datetime.now()
        },
        {
            "name": "Ananya Iyer",
            "email": "ananya.iyer@example.com",
            "password": "password123",
            "role": "user",
            "createdAt": datetime.now()
        },
        {
            "name": "Arjun Gupta",
            "email": "arjun.gupta@example.com",
            "password": "password123",
            "role": "user",
            "createdAt": datetime.now()
        },
        {
            "name": "Kavya Nair",
            "email": "kavya.nair@example.com",
            "password": "password123",
            "role": "user",
            "createdAt": datetime.now()
        },
        {
            "name": "Rohan Mehta",
            "email": "rohan.mehta@example.com",
            "password": "password123",
            "role": "admin",  # One admin user
            "createdAt": datetime.now()
        },
        {
            "name": "Ishita Verma",
            "email": "ishita.verma@example.com",
            "password": "password123",
            "role": "user",
            "createdAt": datetime.now()
        }
    ]
    
    # Insert users
    try:
        result = await db.users.insert_many(users)
        print(f"✅ Successfully inserted {len(result.inserted_ids)} users into the database!")
        print(f"\n👤 Users created:")
        for user in users:
            role_emoji = "👑" if user["role"] == "admin" else "👤"
            print(f"  {role_emoji} {user['name']} ({user['email']}) - {user['role']}")
    except Exception as e:
        if "duplicate key error" in str(e):
            print("⚠️  Some users already exist (duplicate email). Skipping...")
        else:
            print(f"❌ Error: {e}")
    
    # Close connection
    client.close()
    print("\nDatabase connection closed")


if __name__ == "__main__":
    asyncio.run(seed_users())
