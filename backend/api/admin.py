from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List
from models.auth import AdminLogin, AccessKeyCreate, AccessKey, TokenResponse, UserRole
from services.auth_service import auth_service
from datetime import datetime

router = APIRouter()
security = HTTPBearer()

def get_admin_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Dependency to verify admin authentication"""
    token_data = auth_service.verify_token(credentials.credentials)
    
    if token_data.get("role") != UserRole.ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    return token_data

@router.post("/admin/login", response_model=TokenResponse)
async def admin_login(login_data: AdminLogin):
    """Admin login endpoint"""
    if not auth_service.authenticate_admin(
        login_data.username, 
        login_data.password, 
        login_data.totp_code
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Create admin token
    admin_id = "admin"
    token = auth_service.create_access_token(
        user_id=admin_id,
        role=UserRole.ADMIN,
        scopes=["admin", "read", "write", "ai_access"]
    )
    
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in=auth_service.access_token_expire_minutes * 60,
        user_id=admin_id,
        role=UserRole.ADMIN,
        scopes=["admin", "read", "write", "ai_access"]
    )

@router.post("/admin/access-keys", response_model=AccessKey)
async def create_access_key(
    key_data: AccessKeyCreate,
    admin: dict = Depends(get_admin_user)
):
    """Create a new access key"""
    key, access_key = auth_service.generate_access_key(key_data, admin["sub"])
    
    # Return the access key data with the actual key (only shown once)
    response_data = access_key.dict()
    response_data["full_key"] = key  # Only returned on creation
    
    return response_data

@router.get("/admin/access-keys", response_model=List[AccessKey])
async def list_access_keys(admin: dict = Depends(get_admin_user)):
    """List all access keys for the admin"""
    return auth_service.get_admin_keys(admin["sub"])

@router.delete("/admin/access-keys/{key_id}")
async def revoke_access_key(
    key_id: str,
    admin: dict = Depends(get_admin_user)
):
    """Revoke an access key"""
    success = auth_service.revoke_access_key(key_id, admin["sub"])
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Access key not found"
        )
    
    return {"success": True, "message": "Access key revoked"}

@router.get("/admin/totp-setup")
async def get_totp_setup(admin: dict = Depends(get_admin_user)):
    """Get TOTP setup information"""
    qr_url = auth_service.get_totp_qr_url()
    
    return {
        "qr_url": qr_url,
        "secret": auth_service.admin_totp_secret,
        "instructions": "Scan the QR code with your authenticator app"
    }

@router.get("/admin/stats")
async def get_admin_stats(admin: dict = Depends(get_admin_user)):
    """Get admin dashboard statistics"""
    keys = auth_service.get_admin_keys(admin["sub"])
    
    active_keys = len([k for k in keys if k.is_active])
    total_uses = sum(k.uses_count for k in keys)
    
    return {
        "total_keys": len(keys),
        "active_keys": active_keys,
        "total_api_calls": total_uses,
        "keys_created_today": len([k for k in keys if k.created_at.date() == datetime.utcnow().date()])
    }