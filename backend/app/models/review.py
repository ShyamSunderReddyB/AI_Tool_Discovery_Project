from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
from enum import Enum


class ReviewStatus(str, Enum):
    """Review status options."""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class ReviewBase(BaseModel):
    """Base review model."""
    toolId: str
    rating: int
    comment: str
    
    @field_validator('rating')
    @classmethod
    def validate_rating(cls, v):
        """Ensure rating is between 1 and 5."""
        if not 1 <= v <= 5:
            raise ValueError('Rating must be between 1 and 5')
        return v


class ReviewCreate(ReviewBase):
    """Model for creating a new review."""
    pass


class ReviewUpdate(BaseModel):
    """Model for updating review status (admin only)."""
    status: ReviewStatus
    moderationNote: Optional[str] = None


class ReviewInDB(ReviewBase):
    """Review model as stored in database."""
    id: str = Field(alias="_id")
    userId: str
    status: ReviewStatus = ReviewStatus.PENDING
    createdAt: datetime
    updatedAt: datetime
    moderatedBy: Optional[str] = None
    moderationNote: Optional[str] = None
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "_id": "507f1f77bcf86cd799439012",
                "toolId": "507f1f77bcf86cd799439011",
                "userId": "507f1f77bcf86cd799439013",
                "rating": 5,
                "comment": "Excellent tool, very useful!",
                "status": "approved",
                "createdAt": "2026-01-08T10:30:00Z",
                "updatedAt": "2026-01-08T10:30:00Z",
                "moderatedBy": "507f1f77bcf86cd799439014",
                "moderationNote": "Looks good"
            }
        }


class Review(ReviewInDB):
    """Review model for API responses."""
    pass


class ReviewWithUserName(Review):
    """Review with user name included."""
    userName: str


class ReviewWithToolName(Review):
    """Review with tool name included."""
    toolName: str


class ReviewListResponse(BaseModel):
    """Paginated list of reviews."""
    items: list[Review]
    total: int
    page: int
    pageSize: int
