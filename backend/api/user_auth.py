from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from models.auth import UserLogin, TokenResponse, UserRole
from services.auth_service import auth_service

router = APIRouter()
security = HTTPBearer()

def get_authenticated_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Dependency to verify user authentication"""
    token_data = auth_service.verify_token(credentials.credentials)
    return token_data

@router.post("/user/login", response_model=TokenResponse)
async def user_login(login_data: UserLogin):
    """User login with access code"""
    user = auth_service.create_user_from_access_code(login_data.access_code)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access code"
        )
    
    # Create user token
    token = auth_service.create_access_token(
        user_id=user.id,
        role=user.role,
        scopes=["read", "ai_access"]
    )
    
    return TokenResponse(
        access_token=token,
        token_type="bearer", 
        expires_in=auth_service.access_token_expire_minutes * 60,
        user_id=user.id,
        role=user.role,
        scopes=["read", "ai_access"]
    )

@router.get("/user/profile")
async def get_user_profile(current_user: dict = Depends(get_authenticated_user)):
    """Get current user profile"""
    return {
        "user_id": current_user["sub"],
        "role": current_user["role"],
        "scopes": current_user["scopes"]
    }