import secrets
import hashlib
import pyotp
import json
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any, Tuple
from passlib.context import CryptContext
from jose import JWTError, jwt
from fastapi import HTTPException, status
from models.auth import AccessKey, AccessKeyCreate, User, UserRole, AccessKeyScope
from services.redis_service import redis_service
import os

def serialize_datetime_dict(data: Dict[str, Any]) -> Dict[str, Any]:
    """Convert datetime objects to ISO format strings in a dictionary"""
    serialized = {}
    for key, value in data.items():
        if isinstance(value, datetime):
            serialized[key] = value.isoformat()
        else:
            serialized[key] = value
    return serialized

class AuthService:
    def __init__(self):
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        self.secret_key = os.getenv("SECRET_KEY", "katalis-secret-key")
        self.algorithm = os.getenv("ALGORITHM", "HS256")
        self.access_token_expire_minutes = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
        
        # Default admin credentials (change in production)
        self.admin_username = os.getenv("ADMIN_USERNAME", "admin")
        self.admin_password_hash = self.pwd_context.hash(os.getenv("ADMIN_PASSWORD", "admin123"))
        self.admin_totp_secret = os.getenv("ADMIN_TOTP_SECRET", pyotp.random_base32())
    
    def generate_access_key(self, key_data: AccessKeyCreate, admin_id: str) -> Tuple[str, AccessKey]:
        """Generate a new access key"""
        # Generate secure random key
        key = f"kat_{secrets.token_urlsafe(32)}"
        key_hash = hashlib.sha256(key.encode()).hexdigest()
        
        access_key = AccessKey(
            id=secrets.token_urlsafe(16),
            name=key_data.name,
            key_prefix=key[:12] + "...",
            scopes=key_data.scopes,
            created_at=datetime.utcnow(),
            expires_at=key_data.expires_at,
            last_used=None,
            uses_count=0,
            max_uses=key_data.max_uses,
            is_active=True
        )
        
        # Store in Redis - serialize datetime objects
        access_key_data = serialize_datetime_dict(access_key.dict())
        
        key_redis_key = f"access_key:{key_hash}"
        redis_service.redis_client.hset(key_redis_key, mapping={
            "data": json.dumps(access_key_data),
            "admin_id": admin_id
        })
        
        # Set expiration if specified
        if key_data.expires_at:
            ttl = int((key_data.expires_at - datetime.utcnow()).total_seconds())
            redis_service.redis_client.expire(key_redis_key, ttl)
        
        # Store in admin's key list
        admin_keys_key = f"admin:{admin_id}:keys"
        redis_service.redis_client.sadd(admin_keys_key, access_key.id)
        
        return key, access_key
    
    def validate_access_key(self, key: str) -> Optional[AccessKey]:
        """Validate and return access key data"""
        key_hash = hashlib.sha256(key.encode()).hexdigest()
        key_redis_key = f"access_key:{key_hash}"
        
        key_data = redis_service.redis_client.hget(key_redis_key, "data")
        if not key_data:
            return None
            
        access_key = AccessKey(**json.loads(key_data))
        
        # Check if key is active
        if not access_key.is_active:
            return None
            
        # Check expiration
        if access_key.expires_at and access_key.expires_at < datetime.utcnow():
            return None
            
        # Check max uses
        if access_key.max_uses and access_key.uses_count >= access_key.max_uses:
            return None
            
        # Update usage
        access_key.uses_count += 1
        access_key.last_used = datetime.utcnow()
        
        # Serialize datetime objects
        access_key_data = serialize_datetime_dict(access_key.dict())
        redis_service.redis_client.hset(key_redis_key, "data", json.dumps(access_key_data))
        
        return access_key
    
    def authenticate_admin(self, username: str, password: str, totp_code: Optional[str] = None) -> bool:
        """Authenticate admin user"""
        if username != self.admin_username:
            return False
            
        if not self.pwd_context.verify(password, self.admin_password_hash):
            return False
            
        # TOTP verification (if enabled)
        if totp_code:
            totp = pyotp.TOTP(self.admin_totp_secret)
            if not totp.verify(totp_code):
                return False
                
        return True
    
    def create_user_from_access_code(self, access_code: str) -> Optional[User]:
        """Create/get user from access code"""
        # Simple access code validation (can be enhanced)
        if len(access_code) < 6:
            return None
            
        user_id = hashlib.sha256(access_code.encode()).hexdigest()[:16]
        user_key = f"user:{user_id}"
        
        # Check if user exists
        user_data = redis_service.redis_client.hget(user_key, "data")
        if user_data:
            user = User(**json.loads(user_data))
            user.last_login = datetime.utcnow()
        else:
            # Create new user
            user = User(
                id=user_id,
                access_code=access_code,
                role=UserRole.USER,
                created_at=datetime.utcnow(),
                last_login=datetime.utcnow(),
                is_active=True
            )
        
        # Update user data - serialize datetime objects
        user_data = serialize_datetime_dict(user.dict())
        redis_service.redis_client.hset(user_key, "data", json.dumps(user_data))
        redis_service.redis_client.expire(user_key, 30 * 24 * 60 * 60)  # 30 days
        
        return user
    
    def create_access_token(self, user_id: str, role: UserRole, scopes: List[str]) -> str:
        """Create JWT access token"""
        expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
        to_encode = {
            "sub": user_id,
            "role": role.value,
            "scopes": scopes,
            "exp": expire,
            "iat": datetime.utcnow()
        }
        
        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
    
    def verify_token(self, token: str) -> Dict[str, Any]:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials"
            )
    
    def get_admin_keys(self, admin_id: str) -> List[AccessKey]:
        """Get all access keys for an admin"""
        admin_keys_key = f"admin:{admin_id}:keys"
        key_ids = redis_service.redis_client.smembers(admin_keys_key)
        
        keys = []
        for key_id in key_ids:
            # Find key by searching (could be optimized with separate index)
            pattern = "access_key:*"
            for key_hash_key in redis_service.redis_client.keys(pattern):
                key_data = redis_service.redis_client.hget(key_hash_key, "data")
                if key_data:
                    access_key = AccessKey(**json.loads(key_data))
                    if access_key.id == key_id:
                        keys.append(access_key)
                        break
        
        return sorted(keys, key=lambda x: x.created_at, reverse=True)
    
    def revoke_access_key(self, key_id: str, admin_id: str) -> bool:
        """Revoke an access key"""
        # Find and deactivate the key
        pattern = "access_key:*"
        for key_hash_key in redis_service.redis_client.keys(pattern):
            key_data = redis_service.redis_client.hget(key_hash_key, "data")
            if key_data:
                access_key = AccessKey(**json.loads(key_data))
                if access_key.id == key_id:
                    access_key.is_active = False
                    # Serialize datetime objects
                    access_key_data = serialize_datetime_dict(access_key.dict())
                    redis_service.redis_client.hset(key_hash_key, "data", json.dumps(access_key_data))
                    return True
        
        return False
    
    def get_totp_qr_url(self) -> str:
        """Get TOTP QR code URL for admin setup"""
        totp = pyotp.TOTP(self.admin_totp_secret)
        return totp.provisioning_uri(
            name=self.admin_username,
            issuer_name="KatalisApp"
        )

# Global instance
auth_service = AuthService()