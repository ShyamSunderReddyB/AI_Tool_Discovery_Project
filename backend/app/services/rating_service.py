from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId


async def recalculate_tool_rating(db: AsyncIOMotorDatabase, tool_id: str):
    """
    Recalculate and update a tool's average rating and review count.
    
    This function aggregates all approved reviews for a specific tool,
    calculates the average rating, and updates the tool document.
    
    Args:
        db: MongoDB database instance
        tool_id: ID of the tool to update
    """
    # Aggregate approved reviews for this tool
    pipeline = [
        {
            "$match": {
                "toolId": tool_id,
                "status": "approved"
            }
        },
        {
            "$group": {
                "_id": None,
                "avgRating": {"$avg": "$rating"},
                "count": {"$sum": 1}
            }
        }
    ]
    
    result = await db.reviews.aggregate(pipeline).to_list(length=1)
    
    if result:
        avg_rating = round(result[0]["avgRating"], 2)
        review_count = result[0]["count"]
    else:
        # No approved reviews
        avg_rating = 0.0
        review_count = 0
    
    # Update tool document
    await db.tools.update_one(
        {"_id": ObjectId(tool_id)},
        {
            "$set": {
                "avgRating": avg_rating,
                "reviewCount": review_count
            }
        }
    )
    
    return {"avgRating": avg_rating, "reviewCount": review_count}
