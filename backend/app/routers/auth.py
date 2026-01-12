from fastapi import APIRouter, HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime

from app.database import get_database
from app.models.user import UserCreate, UserLogin, User, TokenResponse, UserRole
from app.utils.auth import create_access_token, verify_password


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=User, status_code=status.HTTP_201_CREATED)
async def signup(
    user_data: UserCreate,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Create a new user account.
    
    - **name**: User's full name
    - **email**: User's email (must be unique)
    - **password**: User's password (stored as plain text)
    """
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user document
    user_doc = {
        "name": user_data.name,
        "email": user_data.email,
        "password": user_data.password,  # Plain text password
        "role": UserRole.USER,
        "createdAt": datetime.utcnow()
    }
    
    result = await db.users.insert_one(user_doc)
    
    # Return user without password
    return User(
        id=str(result.inserted_id),
        name=user_data.name,
        email=user_data.email,
        role=UserRole.USER,
        createdAt=user_doc["createdAt"]
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    credentials: UserLogin,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Login and receive JWT access token.
    
    - **email**: User's email
    - **password**: User's password
    """
    # Find user by email
    user = await db.users.find_one({"email": credentials.email})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Verify password (plain text comparison)
    if not verify_password(credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create access token
    token_data = {
        "sub": str(user["_id"]),
        "email": user["email"],
        "role": user["role"]
    }
    access_token = create_access_token(token_data)
    
    # Return token and user info
    user_response = User(
        id=str(user["_id"]),
        name=user["name"],
        email=user["email"],
        role=user["role"],
        createdAt=user.get("createdAt")
    )
    
    return TokenResponse(
        access_token=access_token,
        user=user_response
    )
