from fastapi import APIRouter, HTTPException, status, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from typing import Optional
import math

from app.database import get_database
from app.models.tool import Tool, ToolListResponse
from app.models.review import ReviewWithUserName, ReviewListResponse


router = APIRouter(prefix="/tools", tags=["Tools"])


def tool_doc_to_model(doc: dict) -> Tool:
    """Convert MongoDB document to Tool model."""
    doc["id"] = str(doc.pop("_id"))
    return Tool(**doc)


@router.get("", response_model=ToolListResponse)
async def get_tools(
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    pricingModel: Optional[str] = None,
    minRating: Optional[float] = Query(None, ge=0, le=5),
    search: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get paginated list of tools with optional filters.
    
    - **page**: Page number (default: 1)
    - **pageSize**: Items per page (default: 20, max: 100)
    - **category**: Filter by category
    - **pricingModel**: Filter by pricing model
    - **minRating**: Minimum average rating
    - **search**: Search in name and description
    """
    # Build filter query
    filter_query = {}
    
    if category:
        filter_query["category"] = category
    
    if pricingModel:
        filter_query["pricingModel"] = pricingModel
    
    if minRating is not None:
        filter_query["avgRating"] = {"$gte": minRating}
    
    if search:
        filter_query["$text"] = {"$search": search}
    
    # Get total count
    total = await db.tools.count_documents(filter_query)
    
    # Calculate pagination
    skip = (page - 1) * pageSize
    total_pages = math.ceil(total / pageSize)
    
    # Get paginated results
    cursor = db.tools.find(filter_query).skip(skip).limit(pageSize)
    tools = await cursor.to_list(length=pageSize)
    
    # Convert to models
    items = [tool_doc_to_model(tool) for tool in tools]
    
    return ToolListResponse(
        items=items,
        total=total,
        page=page,
        pageSize=pageSize,
        totalPages=total_pages
    )


@router.get("/{id}", response_model=Tool)
async def get_tool(
    id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get detailed information about a specific tool.
    
    - **id**: Tool ID
    """
    try:
        tool = await db.tools.find_one({"_id": ObjectId(id)})
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
    
    return tool_doc_to_model(tool)


@router.get("/{id}/reviews", response_model=ReviewListResponse)
async def get_tool_reviews(
    id: str,
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get approved reviews for a specific tool.
    
    - **id**: Tool ID
    - **page**: Page number (default: 1)
    - **pageSize**: Items per page (default: 20, max: 100)
    """
    # Verify tool exists
    try:
        tool = await db.tools.find_one({"_id": ObjectId(id)})
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
    
    # Get approved reviews with user names
    filter_query = {"toolId": id, "status": "approved"}
    
    total = await db.reviews.count_documents(filter_query)
    skip = (page - 1) * pageSize
    
    # Aggregate to join with users
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
            "$addFields": {
                "userName": "$user.name"
            }
        },
        {
            "$project": {
                "user": 0
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
