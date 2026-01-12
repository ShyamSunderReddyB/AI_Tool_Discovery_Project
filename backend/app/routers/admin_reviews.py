from fastapi import APIRouter, HTTPException, status, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime
from typing import Optional

from app.database import get_database
from app.models.review import Review, ReviewUpdate, ReviewListResponse, ReviewWithUserName
from app.utils.dependencies import require_admin
from app.services.rating_service import recalculate_tool_rating


router = APIRouter(prefix="/admin/reviews", tags=["Admin - Reviews"])


@router.get("", response_model=ReviewListResponse)
async def get_reviews_for_moderation(
    status_filter: Optional[str] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get reviews for moderation (admin only).
    
    - **status**: Filter by status (pending, approved, rejected)
    - **page**: Page number (default: 1)
    - **pageSize**: Items per page (default: 20, max: 100)
    """
    # Build filter query
    filter_query = {}
    if status_filter:
        filter_query["status"] = status_filter
    
    total = await db.reviews.count_documents(filter_query)
    skip = (page - 1) * pageSize
    
    # Aggregate to join with users and tools
    pipeline = [
        {"$match": filter_query},
        {"$skip": skip},
        {"$limit": pageSize},
        {
            "$lookup": {
                "from": "users",
                "let": {"userId": {"$toObjectId": "$userId"}},
                "pipeline": [
                    {"$match": {"$expr": {"$eq": ["$_id", "$$userId"]}}}
                ],
                "as": "user"
            }
        },
        {"$unwind": "$user"},
        {
            "$lookup": {
                "from": "tools",
                "let": {"toolId": {"$toObjectId": "$toolId"}},
                "pipeline": [
                    {"$match": {"$expr": {"$eq": ["$_id", "$$toolId"]}}}
                ],
                "as": "tool"
            }
        },
        {"$unwind": "$tool"},
        {
            "$addFields": {
                "userName": "$user.name",
                "toolName": "$tool.name"
            }
        },
        {
            "$project": {
                "user": 0,
                "tool": 0
            }
        }
    ]
    
    reviews = await db.reviews.aggregate(pipeline).to_list(length=pageSize)
    
    # Convert to models
    items = []
    for review in reviews:
        review["id"] = str(review.pop("_id"))
        items.append(ReviewWithUserName(**review))
    
    return ReviewListResponse(
        items=items,
        total=total,
        page=page,
        pageSize=pageSize
    )


@router.patch("/{id}", response_model=Review)
async def moderate_review(
    id: str,
    review_update: ReviewUpdate,
    current_user: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Approve or reject a review (admin only).
    
    Automatically recalculates tool rating when review is approved.
    
    - **status**: New status (approved or rejected)
    - **moderationNote**: Optional note about the moderation decision
    """
    # Verify review exists
    try:
        review = await db.reviews.find_one({"_id": ObjectId(id)})
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid review ID"
        )
    
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    # Update review
    update_data = {
        "status": review_update.status,
        "moderatedBy": current_user["sub"],
        "updatedAt": datetime.utcnow()
    }
    
    if review_update.moderationNote:
        update_data["moderationNote"] = review_update.moderationNote
    
    await db.reviews.update_one(
        {"_id": ObjectId(id)},
        {"$set": update_data}
    )
    
    # If approved, recalculate tool rating
    if review_update.status == "approved":
        await recalculate_tool_rating(db, review["toolId"])
    
    # Return updated review
    updated_review = await db.reviews.find_one({"_id": ObjectId(id)})
    updated_review["id"] = str(updated_review.pop("_id"))
    
    return Review(**updated_review)
