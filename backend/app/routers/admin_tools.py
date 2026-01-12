from fastapi import APIRouter, HTTPException, status, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime
from typing import Optional

from app.database import get_database
from app.models.tool import ToolCreate, ToolUpdate, Tool, ToolListResponse
from app.utils.dependencies import require_admin
import math


router = APIRouter(prefix="/admin/tools", tags=["Admin - Tools"])


def tool_doc_to_model(doc: dict) -> Tool:
    """Convert MongoDB document to Tool model."""
    doc["id"] = str(doc.pop("_id"))
    return Tool(**doc)


@router.get("", response_model=ToolListResponse)
async def get_all_tools(
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    pricingModel: Optional[str] = None,
    minRating: Optional[float] = Query(None, ge=0, le=5),
    search: Optional[str] = None,
    current_user: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get all tools (admin view with all fields).
    
    Same filters as public endpoint but requires admin authentication.
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


@router.post("", response_model=Tool, status_code=status.HTTP_201_CREATED)
async def create_tool(
    tool_data: ToolCreate,
    current_user: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Create a new tool (admin only).
    
    All fields from ToolCreate model are required.
    """
    # Create tool document
    tool_doc = tool_data.model_dump()
    tool_doc.update({
        "avgRating": 0.0,
        "reviewCount": 0,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    })
    
    result = await db.tools.insert_one(tool_doc)
    
    # Return created tool
    tool_doc["_id"] = result.inserted_id
    return tool_doc_to_model(tool_doc)


@router.put("/{id}", response_model=Tool)
async def update_tool(
    id: str,
    tool_data: ToolUpdate,
    current_user: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Update an existing tool (admin only).
    
    Only provided fields will be updated.
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
    
    # Build update document (only include provided fields)
    update_data = tool_data.model_dump(exclude_unset=True)
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    update_data["updatedAt"] = datetime.utcnow()
    
    # Update tool
    await db.tools.update_one(
        {"_id": ObjectId(id)},
        {"$set": update_data}
    )
    
    # Return updated tool
    updated_tool = await db.tools.find_one({"_id": ObjectId(id)})
    return tool_doc_to_model(updated_tool)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tool(
    id: str,
    current_user: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Delete a tool (admin only).
    
    This will permanently delete the tool and all associated reviews.
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
    
    # Delete tool
    await db.tools.delete_one({"_id": ObjectId(id)})
    
    # Delete associated reviews
    await db.reviews.delete_many({"toolId": id})
    
    return None
