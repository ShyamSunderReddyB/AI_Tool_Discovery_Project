from fastapi import Depends, HTTPException, status
from app.utils.auth import get_current_user
from app.models.user import UserRole


async def require_user(current_user: dict = Depends(get_current_user)) -> dict:
    """
    Dependency to require authenticated user.
    
    Args:
        current_user: Current user from JWT token
        
    Returns:
        Current user data
    """
    return current_user


async def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    """
    Dependency to require admin role.
    
    Args:
        current_user: Current user from JWT token
        
    Returns:
        Current user data
        
    Raises:
        HTTPException: If user is not an admin
    """
    if current_user.get("role") != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    return current_user
