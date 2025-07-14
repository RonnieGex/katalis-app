# Security Research & Best Practices

## Admin Access Key Systems - Real-World Examples

### 1. GitHub Personal Access Tokens (PAT) Pattern
GitHub's PAT system is a gold standard for API key management:

**Key Generation:**
- 40-character hexadecimal tokens
- Scoped permissions (repo, user, admin, etc.)
- Expiration dates (30, 60, 90 days, or custom)
- Token prefixes for identification (`ghp_`, `gho_`, etc.)

**Security Features:**
- Tokens are hashed and salted in storage
- Rate limiting per token
- Audit logs for token usage
- Automatic revocation on suspicious activity

**Implementation Pattern:**
```python
import secrets
import hashlib
from datetime import datetime, timedelta
from enum import Enum

class TokenScope(Enum):
    ADMIN_READ = "admin:read"
    ADMIN_WRITE = "admin:write"
    USER_READ = "user:read"
    USER_WRITE = "user:write"

class GitHubStyleTokenManager:
    def __init__(self):
        self.prefix = "kta_"  # Katalis Token Admin
        
    def generate_token(self, user_id: str, scopes: list, expires_days: int = 30):
        # Generate 32-byte random token
        raw_token = secrets.token_hex(32)
        full_token = f"{self.prefix}{raw_token}"
        
        # Create hash for storage (never store raw token)
        token_hash = hashlib.sha256(full_token.encode()).hexdigest()
        
        return {
            'token': full_token,
            'hash': token_hash,
            'user_id': user_id,
            'scopes': scopes,
            'expires_at': datetime.utcnow() + timedelta(days=expires_days),
            'created_at': datetime.utcnow()
        }
```

### 2. AWS IAM Access Key Pattern
AWS uses a two-part system with Access Key ID and Secret Access Key:

**Key Structure:**
- Access Key ID: 20-character identifier (starts with AKIA)
- Secret Access Key: 40-character secret
- Both parts required for authentication

**Security Features:**
- Key rotation capabilities
- IAM policies for fine-grained permissions
- CloudTrail logging for all API calls
- MFA requirements for sensitive operations

**Implementation Pattern:**
```python
class AWSStyleKeyManager:
    def generate_key_pair(self, user_id: str, policy_arn: str):
        # Generate Access Key ID (20 chars, starts with AKIA)
        access_key_id = "AKIA" + secrets.token_hex(8).upper()
        
        # Generate Secret Access Key (40 chars)
        secret_key = secrets.token_urlsafe(30)[:40]
        
        # Hash secret for storage
        secret_hash = hashlib.sha256(secret_key.encode()).hexdigest()
        
        return {
            'access_key_id': access_key_id,
            'secret_access_key': secret_key,
            'secret_hash': secret_hash,
            'user_id': user_id,
            'policy_arn': policy_arn,
            'status': 'Active'
        }
```

### 3. Stripe API Key Pattern
Stripe uses prefixed keys with different access levels:

**Key Types:**
- Publishable keys: `pk_test_` / `pk_live_`
- Secret keys: `sk_test_` / `sk_live_`
- Restricted keys: `rk_test_` / `rk_live_`

**Security Features:**
- Environment-specific keys (test/live)
- Webhook signing secrets
- IP address restrictions
- Key rolling without service interruption

## Authentication Security Patterns

### 1. Multi-Factor Authentication (MFA)
```python
import pyotp
import qrcode
from io import BytesIO
import base64

class MFAManager:
    def generate_secret(self, user_email: str) -> dict:
        """Generate TOTP secret for user"""
        secret = pyotp.random_base32()
        totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
            name=user_email,
            issuer_name="Katalis App"
        )
        
        # Generate QR code
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(totp_uri)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        qr_code_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        return {
            'secret': secret,
            'qr_code': qr_code_base64,
            'backup_codes': self.generate_backup_codes()
        }
    
    def verify_totp(self, secret: str, token: str) -> bool:
        """Verify TOTP token"""
        totp = pyotp.TOTP(secret)
        return totp.verify(token, valid_window=1)
    
    def generate_backup_codes(self) -> list:
        """Generate single-use backup codes"""
        return [secrets.token_hex(4).upper() for _ in range(10)]
```

### 2. Rate Limiting Implementation
```python
import redis
import time
from functools import wraps

class RateLimiter:
    def __init__(self, redis_client):
        self.redis = redis_client
    
    def limit(self, requests: int, window: int, per: str = "ip"):
        """
        Rate limiting decorator
        requests: number of requests allowed
        window: time window in seconds
        per: rate limit per 'ip', 'user', or 'key'
        """
        def decorator(func):
            @wraps(func)
            async def wrapper(*args, **kwargs):
                # Get identifier based on 'per' parameter
                if per == "ip":
                    identifier = self.get_client_ip()
                elif per == "user":
                    identifier = self.get_user_id()
                elif per == "key":
                    identifier = self.get_api_key()
                
                key = f"rate_limit:{per}:{identifier}:{func.__name__}"
                
                # Sliding window rate limiting
                now = time.time()
                pipeline = self.redis.pipeline()
                
                # Remove expired entries
                pipeline.zremrangebyscore(key, 0, now - window)
                
                # Count current requests
                pipeline.zcard(key)
                
                # Add current request
                pipeline.zadd(key, {str(now): now})
                
                # Set expiry
                pipeline.expire(key, window)
                
                results = pipeline.execute()
                current_requests = results[1]
                
                if current_requests >= requests:
                    raise HTTPException(429, "Rate limit exceeded")
                
                return await func(*args, **kwargs)
            return wrapper
        return decorator

# Usage example
@app.post("/api/admin/keys/generate")
@rate_limiter.limit(requests=5, window=60, per="user")  # 5 requests per minute per user
async def generate_admin_key():
    pass
```

### 3. Session Management
```python
import jwt
from datetime import datetime, timedelta

class SessionManager:
    def __init__(self, secret_key: str, redis_client):
        self.secret_key = secret_key
        self.redis = redis_client
        
    def create_session(self, user_id: str, role: str, expires_hours: int = 24):
        """Create secure session with Redis storage"""
        session_id = secrets.token_urlsafe(32)
        
        # JWT payload
        payload = {
            'session_id': session_id,
            'user_id': user_id,
            'role': role,
            'iat': datetime.utcnow(),
            'exp': datetime.utcnow() + timedelta(hours=expires_hours)
        }
        
        # Create JWT
        token = jwt.encode(payload, self.secret_key, algorithm='HS256')
        
        # Store session in Redis
        session_data = {
            'user_id': user_id,
            'role': role,
            'created_at': datetime.utcnow().isoformat(),
            'last_activity': datetime.utcnow().isoformat()
        }
        
        self.redis.setex(
            f"session:{session_id}",
            expires_hours * 3600,
            json.dumps(session_data)
        )
        
        return token
    
    def validate_session(self, token: str) -> dict:
        """Validate session and update activity"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=['HS256'])
            session_id = payload['session_id']
            
            # Check if session exists in Redis
            session_data = self.redis.get(f"session:{session_id}")
            if not session_data:
                raise HTTPException(401, "Session expired")
            
            # Update last activity
            session_data = json.loads(session_data)
            session_data['last_activity'] = datetime.utcnow().isoformat()
            
            self.redis.setex(
                f"session:{session_id}",
                24 * 3600,  # Reset expiry
                json.dumps(session_data)
            )
            
            return payload
            
        except jwt.ExpiredSignatureError:
            raise HTTPException(401, "Session expired")
        except jwt.InvalidTokenError:
            raise HTTPException(401, "Invalid session")
```

## Input Validation & Sanitization

### 1. Pydantic Models for Validation
```python
from pydantic import BaseModel, validator, EmailStr
from typing import Optional, List
import re

class AdminKeyRequest(BaseModel):
    name: str
    scopes: List[str]
    expires_days: Optional[int] = 30
    ip_restrictions: Optional[List[str]] = None
    
    @validator('name')
    def validate_name(cls, v):
        if len(v) < 3 or len(v) > 50:
            raise ValueError('Name must be between 3 and 50 characters')
        if not re.match(r'^[a-zA-Z0-9\s\-_]+$', v):
            raise ValueError('Name contains invalid characters')
        return v
    
    @validator('scopes')
    def validate_scopes(cls, v):
        valid_scopes = ['admin:read', 'admin:write', 'user:read', 'user:write']
        for scope in v:
            if scope not in valid_scopes:
                raise ValueError(f'Invalid scope: {scope}')
        return v
    
    @validator('expires_days')
    def validate_expiry(cls, v):
        if v and (v < 1 or v > 365):
            raise ValueError('Expiry must be between 1 and 365 days')
        return v

class UserLoginRequest(BaseModel):
    access_code: str
    
    @validator('access_code')
    def validate_access_code(cls, v):
        # Remove spaces and convert to uppercase
        v = v.replace(' ', '').upper()
        
        # Check format (8 alphanumeric characters)
        if not re.match(r'^[A-Z0-9]{8}$', v):
            raise ValueError('Invalid access code format')
        
        return v
```

### 2. SQL Injection Prevention
```python
from sqlalchemy.orm import Session
from sqlalchemy import text

class SecureDatabase:
    def __init__(self, db: Session):
        self.db = db
    
    def get_user_by_id(self, user_id: str):
        """Secure parameterized query"""
        # BAD: Never do this
        # query = f"SELECT * FROM users WHERE id = '{user_id}'"
        
        # GOOD: Use parameterized queries
        query = text("SELECT * FROM users WHERE id = :user_id")
        result = self.db.execute(query, {"user_id": user_id})
        return result.fetchone()
    
    def search_users(self, search_term: str):
        """Secure search with parameterization"""
        # Sanitize search term
        search_term = search_term.replace('%', '\\%').replace('_', '\\_')
        
        query = text("""
            SELECT id, email, name 
            FROM users 
            WHERE name ILIKE :search_term 
            LIMIT 10
        """)
        
        result = self.db.execute(query, {"search_term": f"%{search_term}%"})
        return result.fetchall()
```

## Security Headers Implementation

### 1. FastAPI Security Middleware
```python
from fastapi import FastAPI, Request
from fastapi.responses import Response

class SecurityHeadersMiddleware:
    def __init__(self, app: FastAPI):
        self.app = app
    
    async def __call__(self, request: Request, call_next):
        response = await call_next(request)
        
        # Prevent clickjacking
        response.headers["X-Frame-Options"] = "DENY"
        
        # Prevent MIME type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"
        
        # XSS protection
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        # HSTS (HTTPS only)
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        # Content Security Policy
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "connect-src 'self' https:; "
            "frame-ancestors 'none'"
        )
        
        # Referrer Policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Permissions Policy
        response.headers["Permissions-Policy"] = (
            "geolocation=(), "
            "microphone=(), "
            "camera=(), "
            "payment=(), "
            "usb=(), "
            "magnetometer=(), "
            "gyroscope=(), "
            "speaker=(), "
            "vibrate=(), "
            "fullscreen=(self)"
        )
        
        return response

# Add to FastAPI app
app.add_middleware(SecurityHeadersMiddleware)
```

### 2. API Key Security Best Practices

#### Key Storage
```python
import bcrypt
from cryptography.fernet import Fernet

class SecureKeyStorage:
    def __init__(self, encryption_key: bytes):
        self.fernet = Fernet(encryption_key)
    
    def hash_key(self, api_key: str) -> str:
        """Hash API key for storage"""
        return bcrypt.hashpw(api_key.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def verify_key(self, api_key: str, hashed_key: str) -> bool:
        """Verify API key against hash"""
        return bcrypt.checkpw(api_key.encode('utf-8'), hashed_key.encode('utf-8'))
    
    def encrypt_sensitive_data(self, data: str) -> str:
        """Encrypt sensitive data"""
        return self.fernet.encrypt(data.encode()).decode()
    
    def decrypt_sensitive_data(self, encrypted_data: str) -> str:
        """Decrypt sensitive data"""
        return self.fernet.decrypt(encrypted_data.encode()).decode()
```

#### Key Rotation
```python
class KeyRotationManager:
    def __init__(self, db: Session, key_manager: SecureKeyStorage):
        self.db = db
        self.key_manager = key_manager
    
    def rotate_key(self, old_key_id: str, grace_period_days: int = 7):
        """Rotate API key with grace period"""
        # Generate new key
        new_key_data = self.generate_new_key()
        
        # Mark old key for deprecation
        old_key = self.db.query(APIKey).filter(APIKey.id == old_key_id).first()
        old_key.status = 'deprecated'
        old_key.expires_at = datetime.utcnow() + timedelta(days=grace_period_days)
        
        # Create new key
        new_key = APIKey(
            id=new_key_data['id'],
            hash=new_key_data['hash'],
            user_id=old_key.user_id,
            scopes=old_key.scopes,
            status='active'
        )
        
        self.db.add(new_key)
        self.db.commit()
        
        return {
            'new_key': new_key_data['key'],
            'old_key_expires': old_key.expires_at,
            'rotation_id': new_key.id
        }
```

## Monitoring & Alerting

### 1. Security Event Logging
```python
import structlog
from datetime import datetime

class SecurityLogger:
    def __init__(self):
        self.logger = structlog.get_logger()
    
    def log_failed_login(self, ip_address: str, user_id: str = None, reason: str = ""):
        """Log failed login attempt"""
        self.logger.warning(
            "failed_login_attempt",
            ip_address=ip_address,
            user_id=user_id,
            reason=reason,
            timestamp=datetime.utcnow().isoformat(),
            event_type="authentication_failure"
        )
    
    def log_key_usage(self, key_id: str, endpoint: str, ip_address: str):
        """Log API key usage"""
        self.logger.info(
            "api_key_usage",
            key_id=key_id,
            endpoint=endpoint,
            ip_address=ip_address,
            timestamp=datetime.utcnow().isoformat(),
            event_type="api_access"
        )
    
    def log_suspicious_activity(self, event: str, details: dict):
        """Log suspicious activity"""
        self.logger.error(
            "suspicious_activity",
            event=event,
            details=details,
            timestamp=datetime.utcnow().isoformat(),
            event_type="security_alert"
        )
```

### 2. Intrusion Detection
```python
class IntrusionDetection:
    def __init__(self, redis_client, security_logger):
        self.redis = redis_client
        self.logger = security_logger
    
    def check_brute_force(self, ip_address: str, threshold: int = 5, window: int = 300):
        """Check for brute force attacks"""
        key = f"failed_attempts:{ip_address}"
        
        # Get current failed attempts
        failed_attempts = self.redis.get(key)
        if failed_attempts and int(failed_attempts) >= threshold:
            self.logger.log_suspicious_activity(
                "brute_force_attack",
                {"ip_address": ip_address, "attempts": failed_attempts}
            )
            
            # Block IP for extended period
            self.redis.setex(f"blocked_ip:{ip_address}", 3600, "blocked")
            return True
        
        return False
    
    def detect_anomalous_access(self, user_id: str, ip_address: str):
        """Detect anomalous access patterns"""
        # Check if user is accessing from new location
        known_ips_key = f"user_ips:{user_id}"
        known_ips = self.redis.smembers(known_ips_key)
        
        if ip_address not in [ip.decode() for ip in known_ips]:
            # New IP detected
            self.logger.log_suspicious_activity(
                "new_ip_access",
                {"user_id": user_id, "ip_address": ip_address}
            )
            
            # Add to known IPs after verification
            self.redis.sadd(known_ips_key, ip_address)
            self.redis.expire(known_ips_key, 30 * 24 * 3600)  # 30 days
```

This comprehensive security research provides real-world patterns and implementations for building a secure authentication system with proper access key management, following industry best practices from companies like GitHub, AWS, and Stripe.