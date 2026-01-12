"""
Seed the database with dummy tools data.
Run this script to populate the tools collection with sample data.
"""
import asyncio
import json
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "ai_tools_discovery")


async def seed_tools():
    """Import tools from dummy_tools_data.json into MongoDB."""
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[DATABASE_NAME]
    
    print(f"Connected to MongoDB: {DATABASE_NAME}")
    
    # Load JSON data
    with open("dummy_tools_data.json", "r", encoding="utf-8") as f:
        tools_data = json.load(f)
    
    print(f"Loaded {len(tools_data)} tools from JSON file")
    
    # Clear existing tools (optional - comment out if you want to keep existing data)
    # await db.tools.delete_many({})
    # print("Cleared existing tools")
    
    # Transform and insert tools
    tools_to_insert = []
    
    for tool in tools_data:
        # Map the JSON fields to our schema
        tool_doc = {
            "name": tool["name"],
            "shortDescription": tool["shortDescription"],
            "category": tool["category"],
            "pricingDisplay": tool["pricingDisplay"],
            "pricingModel": tool["pricingModel"],
            "officialUrl": tool.get("officialUrl"),
            "sourceUrl": tool["sourceUrl"],
            "releasedAgo": tool["releasedAgo"],
            "votes": tool.get("votes"),
            "ratingSeed": tool.get("rating"),  # Store original rating as ratingSeed
            "avgRating": tool.get("rating") or 0.0,  # Initialize avgRating
            "reviewCount": 0,  # No reviews yet
            "logoUrl": None,  # No logos in dummy data
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        tools_to_insert.append(tool_doc)
    
    # Insert all tools
    if tools_to_insert:
        result = await db.tools.insert_many(tools_to_insert)
        print(f"✅ Successfully inserted {len(result.inserted_ids)} tools into the database!")
    else:
        print("No tools to insert")
    
    # Close connection
    client.close()
    print("Database connection closed")


if __name__ == "__main__":
    asyncio.run(seed_tools())
