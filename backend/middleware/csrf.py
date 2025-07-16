from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from secrets import token_urlsafe
from typing import Optional
import hashlib
import hmac


class CSRFProtection:
    """
    CSRF (Cross-Site Request Forgery) protection middleware.
    Implements double-submit cookie pattern for CSRF protection.
    """
    
    def __init__(
        self,
        secret_key: str,
        cookie_name: str = "csrf_token",
        header_name: str = "X-CSRF-Token",
        safe_methods: set = None,
        exclude_paths: set = None
    ):
        self.secret_key = secret_key.encode()
        self.cookie_name = cookie_name
        self.header_name = header_name
        self.safe_methods = safe_methods or {"GET", "HEAD", "OPTIONS"}
        self.exclude_paths = exclude_paths or {"/docs", "/redoc", "/openapi.json", "/health"}
    
    def generate_token(self) -> str:
        """Generate a new CSRF token"""
        return token_urlsafe(32)
    
    def sign_token(self, token: str) -> str:
        """Sign the token with HMAC for additional security"""
        signature = hmac.new(
            self.secret_key,
            token.encode(),
            hashlib.sha256
        ).hexdigest()
        return f"{token}.{signature}"
    
    def verify_signature(self, signed_token: str) -> bool:
        """Verify the HMAC signature of the token"""
        try:
            token, signature = signed_token.rsplit(".", 1)
            expected_signature = hmac.new(
                self.secret_key,
                token.encode(),
                hashlib.sha256
            ).hexdigest()
            return hmac.compare_digest(signature, expected_signature)
        except ValueError:
            return False
    
    async def __call__(self, request: Request, call_next):
        """CSRF protection middleware"""
        # Skip CSRF check for safe methods
        if request.method in self.safe_methods:
            response = await call_next(request)
            
            # Set CSRF cookie for GET requests if not present
            if request.method == "GET" and self.cookie_name not in request.cookies:
                token = self.generate_token()
                signed_token = self.sign_token(token)
                response.set_cookie(
                    key=self.cookie_name,
                    value=signed_token,
                    httponly=True,
                    samesite="strict",
                    secure=request.url.scheme == "https",
                    max_age=3600  # 1 hour
                )
            
            return response
        
        # Skip CSRF check for excluded paths
        if request.url.path in self.exclude_paths:
            return await call_next(request)
        
        # Skip CSRF check for demo endpoints (chat-demo pattern)
        if request.url.path.endswith("/chat-demo"):
            return await call_next(request)
        
        # Get CSRF token from cookie
        cookie_token = request.cookies.get(self.cookie_name)
        if not cookie_token:
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"detail": "CSRF cookie not found"}
            )
        
        # Verify cookie signature
        if not self.verify_signature(cookie_token):
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"detail": "Invalid CSRF cookie signature"}
            )
        
        # Get CSRF token from header
        header_token = request.headers.get(self.header_name)
        if not header_token:
            # Try to get from form data for form submissions
            if request.headers.get("content-type", "").startswith("application/x-www-form-urlencoded"):
                form = await request.form()
                header_token = form.get("csrf_token")
        
        if not header_token:
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"detail": "CSRF token not found in request"}
            )
        
        # Extract the actual token from signed token
        try:
            actual_cookie_token = cookie_token.rsplit(".", 1)[0]
        except ValueError:
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"detail": "Invalid CSRF cookie format"}
            )
        
        # Compare tokens
        if not hmac.compare_digest(actual_cookie_token, header_token):
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"detail": "CSRF token mismatch"}
            )
        
        # CSRF check passed, continue with request
        response = await call_next(request)
        
        # Rotate token on successful POST requests for additional security
        if request.method == "POST":
            new_token = self.generate_token()
            signed_token = self.sign_token(new_token)
            response.set_cookie(
                key=self.cookie_name,
                value=signed_token,
                httponly=True,
                samesite="strict",
                secure=request.url.scheme == "https",
                max_age=3600  # 1 hour
            )
            # Add new token to response headers for client to use
            response.headers[self.header_name] = new_token
        
        return response


def get_csrf_token(request: Request) -> Optional[str]:
    """Helper function to get CSRF token from request"""
    cookie_token = request.cookies.get("csrf_token")
    if cookie_token:
        try:
            return cookie_token.rsplit(".", 1)[0]
        except ValueError:
            return None
    return None