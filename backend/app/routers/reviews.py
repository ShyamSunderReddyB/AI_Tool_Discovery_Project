from fastapi import APIRouter, HTTPException, status, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime

from app.database import get_database
from app.models.review import ReviewCreate, Review, ReviewWithToolName, ReviewListResponse, ReviewStatus
from app.utils.dependencies import require_user


router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.post("", response_model=Review, status_code=status.HTTP_201_CREATED)
async def create_review(
    review_data: ReviewCreate,
    current_user: dict = Depends(require_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Submit a new review for a tool (requires authentication).
    
    - **toolId**: ID of the tool being reviewed
    - **rating**: Rating from 1 to 5
    - **comment**: Review comment
    """
    # Verify tool exists
    try:
        tool = await db.tools.find_one({"_id": ObjectId(review_data.toolId)})
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid tool ID"
        )
    
    if not tool:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tool not found"
        )
    
    # Check if user already reviewed this tool
    existing_review = await db.reviews.find_one({
        "toolId": review_data.toolId,
        "userId": current_user["sub"]
    })
    
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reviewed this tool"
        )
    
    # Create review document
    review_doc = {
        "toolId": review_data.toolId,
        "userId": current_user["sub"],
        "rating": review_data.rating,
        "comment": review_data.comment,
        "status": ReviewStatus.PENDING,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
        "moderatedBy": None,
        "moderationNote": None
    }
    
    result = await db.reviews.insert_one(review_doc)
    
    # Return created review
    review_doc["id"] = str(result.inserted_id)
    review_doc.pop("_id")
    
    return Review(**review_doc)


@router.get("/me", response_model=ReviewListResponse)
async def get_my_reviews(
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(require_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get current user's own reviews.
    
    - **page**: Page number (default: 1)
    - **pageSize**: Items per page (default: 20, max: 100)
    """
    filter_query = {"userId": current_user["sub"]}
    
    total = await db.reviews.count_documents(filter_query)
    skip = (page - 1) * pageSize
    
    # Aggregate to join with tools
    pipeline = [
        {"$match": filter_query},
        {"$skip": skip},
        {"$limit": pageSize},
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
                "toolName": "$tool.name"
            }
        },
        {
            "$project": {
                "tool": 0
            }
        }
    ]
    
    reviews = await db.reviews.aggregate(pipeline).to_list(length=pageSize)
    
    # Convert to models
    items = []
    for review in reviews:
        review["id"] = str(review.pop("_id"))
        items.append(ReviewWithToolName(**review))
    
    return ReviewListResponse(
        items=items,
        total=total,
        page=page,
        pageSize=pageSize
    )
