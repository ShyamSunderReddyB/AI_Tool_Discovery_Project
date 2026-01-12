from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    """User role options."""
    USER = "user"
    ADMIN = "admin"


class UserBase(BaseModel):
    """Base user model."""
    name: str
    email: EmailStr


class UserCreate(UserBase):
    """Model for creating a new user."""
    password: str


class UserLogin(BaseModel):
    """Model for user login."""
    email: EmailStr
    password: str


class UserInDB(UserBase):
    """User model as stored in database."""
    id: str = Field(alias="_id")
    password: str  # Plain text password (for hackathon/dev only)
    role: UserRole = UserRole.USER
    createdAt: datetime
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "_id": "507f1f77bcf86cd799439013",
                "name": "John Doe",
                "email": "john@example.com",
                "password": "password123",
                "role": "user",
                "createdAt": "2026-01-09T08:15:30Z"
            }
        }


class User(BaseModel):
    """User model for API responses (without password)."""
    id: str
    name: str
    email: EmailStr
    role: UserRole
    createdAt: Optional[datetime] = None
    
    class Config:
        populate_by_name = True


class TokenResponse(BaseModel):
    """JWT token response."""
    access_token: str
    token_type: str = "bearer"
    user: User
