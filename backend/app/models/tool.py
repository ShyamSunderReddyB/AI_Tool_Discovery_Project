from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class PricingModel(str, Enum):
    """Pricing model options for tools."""
    FREE = "free"
    PAID = "paid"
    SUBSCRIPTION = "subscription"
    FREE_PLUS_PAID = "free_plus_paid"
    NO_PRICING = "no_pricing"


class ToolBase(BaseModel):
    """Base tool model with common fields."""
    name: str
    shortDescription: str
    category: str
    pricingDisplay: str
    pricingModel: PricingModel
    officialUrl: Optional[str] = None
    sourceUrl: str
    releasedAgo: str
    votes: Optional[int] = None
    ratingSeed: Optional[float] = None
    logoUrl: Optional[str] = None


class ToolCreate(ToolBase):
    """Model for creating a new tool."""
    pass


class ToolUpdate(BaseModel):
    """Model for updating a tool (all fields optional)."""
    name: Optional[str] = None
    shortDescription: Optional[str] = None
    category: Optional[str] = None
    pricingDisplay: Optional[str] = None
    pricingModel: Optional[PricingModel] = None
    officialUrl: Optional[str] = None
    sourceUrl: Optional[str] = None
    releasedAgo: Optional[str] = None
    votes: Optional[int] = None
    ratingSeed: Optional[float] = None
    logoUrl: Optional[str] = None


class ToolInDB(ToolBase):
    """Tool model as stored in database."""
    id: str = Field(alias="_id")
    avgRating: float = 0.0
    reviewCount: int = 0
    createdAt: datetime
    updatedAt: datetime
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "_id": "507f1f77bcf86cd799439011",
                "name": "AI Image Generator",
                "shortDescription": "Generate images from text",
                "category": "Images",
                "pricingDisplay": "Free + Paid",
                "pricingModel": "free_plus_paid",
                "officialUrl": "https://example.com",
                "sourceUrl": "https://source.com",
                "releasedAgo": "2 months ago",
                "votes": 150,
                "ratingSeed": 4.5,
                "avgRating": 4.7,
                "reviewCount": 23,
                "logoUrl": "https://example.com/logo.png",
                "createdAt": "2025-11-09T08:15:30Z",
                "updatedAt": "2026-01-09T08:15:30Z"
            }
        }


class Tool(ToolInDB):
    """Tool model for API responses."""
    pass


class ToolListResponse(BaseModel):
    """Paginated list of tools."""
    items: list[Tool]
    total: int
    page: int
    pageSize: int
    totalPages: int
