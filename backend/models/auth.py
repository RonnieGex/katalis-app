from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"

class AccessKeyScope(str, Enum):
    READ = "read"
    WRITE = "write"
    ADMIN = "admin"
    AI_ACCESS = "ai_access"

class AdminLogin(BaseModel):
    username: str
    password: str
    totp_code: Optional[str] = None

class UserLogin(BaseModel):
    access_code: str

class AccessKeyCreate(BaseModel):
    name: str = Field(..., description="Human-readable name for the key")
    scopes: List[AccessKeyScope] = Field(..., description="List of permissions")
    expires_at: Optional[datetime] = None
    max_uses: Optional[int] = None

class AccessKey(BaseModel):
    id: str
    name: str
    key_prefix: str  # First 8 chars of key for display
    scopes: List[AccessKeyScope]
    created_at: datetime
    expires_at: Optional[datetime]
    last_used: Optional[datetime]
    uses_count: int
    max_uses: Optional[int]
    is_active: bool

class User(BaseModel):
    id: str
    access_code: str
    role: UserRole
    created_at: datetime
    last_login: Optional[datetime]
    is_active: bool
    access_key_id: Optional[str] = None  # Links to the access key used

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user_id: str
    role: UserRole
    scopes: List[str]