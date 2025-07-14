from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
from collections import defaultdict
from typing import Dict, Tuple
import asyncio
import time


class RateLimiter:
    """
    Token bucket rate limiter implementation for API protection.
    Prevents abuse and DDoS attacks.
    """
    
    def __init__(
        self,
        requests_per_minute: int = 60,
        requests_per_hour: int = 1000,
        burst_size: int = 10
    ):
        self.requests_per_minute = requests_per_minute
        self.requests_per_hour = requests_per_hour
        self.burst_size = burst_size
        
        # Storage for rate limit data
        self.minute_buckets: Dict[str, list] = defaultdict(list)
        self.hour_buckets: Dict[str, list] = defaultdict(list)
        self.burst_tokens: Dict[str, int] = defaultdict(lambda: burst_size)
        self.last_refill: Dict[str, float] = defaultdict(time.time)
        
        # Lock for thread safety
        self.lock = asyncio.Lock()
        
        # Cleanup task will be started when event loop is available
        self._cleanup_task = None
    
    async def start_cleanup(self):
        """Start the cleanup task when event loop is available"""
        if self._cleanup_task is None:
            self._cleanup_task = asyncio.create_task(self._cleanup_old_entries())
    
    async def _cleanup_old_entries(self):
        """Remove old entries from buckets periodically"""
        while True:
            await asyncio.sleep(300)  # Clean every 5 minutes
            async with self.lock:
                current_time = datetime.now()
                
                # Clean minute buckets
                for key in list(self.minute_buckets.keys()):
                    self.minute_buckets[key] = [
                        ts for ts in self.minute_buckets[key]
                        if current_time - ts < timedelta(minutes=1)
                    ]
                    if not self.minute_buckets[key]:
                        del self.minute_buckets[key]
                
                # Clean hour buckets
                for key in list(self.hour_buckets.keys()):
                    self.hour_buckets[key] = [
                        ts for ts in self.hour_buckets[key]
                        if current_time - ts < timedelta(hours=1)
                    ]
                    if not self.hour_buckets[key]:
                        del self.hour_buckets[key]
    
    def _get_identifier(self, request: Request) -> str:
        """Get unique identifier for the request (IP + User ID if authenticated)"""
        client_ip = request.client.host
        user_id = getattr(request.state, "user_id", None)
        
        if user_id:
            return f"{client_ip}:{user_id}"
        return client_ip
    
    async def _refill_burst_tokens(self, identifier: str):
        """Refill burst tokens based on time elapsed"""
        current_time = time.time()
        time_elapsed = current_time - self.last_refill[identifier]
        
        # Refill 1 token per second
        tokens_to_add = int(time_elapsed)
        if tokens_to_add > 0:
            self.burst_tokens[identifier] = min(
                self.burst_size,
                self.burst_tokens[identifier] + tokens_to_add
            )
            self.last_refill[identifier] = current_time
    
    async def check_rate_limit(self, request: Request) -> Tuple[bool, Dict]:
        """
        Check if request should be rate limited.
        Returns (is_allowed, limit_info)
        """
        identifier = self._get_identifier(request)
        current_time = datetime.now()
        
        async with self.lock:
            # Refill burst tokens
            await self._refill_burst_tokens(identifier)
            
            # Clean old entries
            self.minute_buckets[identifier] = [
                ts for ts in self.minute_buckets[identifier]
                if current_time - ts < timedelta(minutes=1)
            ]
            self.hour_buckets[identifier] = [
                ts for ts in self.hour_buckets[identifier]
                if current_time - ts < timedelta(hours=1)
            ]
            
            # Check minute limit
            minute_count = len(self.minute_buckets[identifier])
            if minute_count >= self.requests_per_minute:
                return False, {
                    "limit": self.requests_per_minute,
                    "window": "minute",
                    "retry_after": 60
                }
            
            # Check hour limit
            hour_count = len(self.hour_buckets[identifier])
            if hour_count >= self.requests_per_hour:
                return False, {
                    "limit": self.requests_per_hour,
                    "window": "hour",
                    "retry_after": 3600
                }
            
            # Check burst limit
            if self.burst_tokens[identifier] <= 0:
                return False, {
                    "limit": self.burst_size,
                    "window": "burst",
                    "retry_after": 1
                }
            
            # Request allowed - update buckets
            self.minute_buckets[identifier].append(current_time)
            self.hour_buckets[identifier].append(current_time)
            self.burst_tokens[identifier] -= 1
            
            return True, {
                "minute_remaining": self.requests_per_minute - minute_count - 1,
                "hour_remaining": self.requests_per_hour - hour_count - 1,
                "burst_remaining": self.burst_tokens[identifier]
            }


# Global rate limiter instances for different endpoints
default_limiter = RateLimiter(
    requests_per_minute=60,
    requests_per_hour=1000,
    burst_size=10
)

strict_limiter = RateLimiter(
    requests_per_minute=20,
    requests_per_hour=200,
    burst_size=5
)

ai_limiter = RateLimiter(
    requests_per_minute=10,
    requests_per_hour=100,
    burst_size=3
)


async def rate_limit_middleware(
    request: Request,
    call_next,
    limiter: RateLimiter = None
):
    """
    Rate limiting middleware for FastAPI.
    Can be used as a dependency or middleware.
    """
    if limiter is None:
        limiter = default_limiter
    
    # Skip rate limiting for health checks and static files
    if request.url.path in ["/health", "/docs", "/redoc", "/openapi.json"]:
        return await call_next(request)
    
    # Check rate limit
    is_allowed, limit_info = await limiter.check_rate_limit(request)
    
    if not is_allowed:
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={
                "detail": f"Rate limit exceeded: {limit_info['limit']} requests per {limit_info['window']}",
                "retry_after": limit_info["retry_after"]
            },
            headers={
                "Retry-After": str(limit_info["retry_after"]),
                "X-RateLimit-Limit": str(limit_info["limit"]),
                "X-RateLimit-Window": limit_info["window"]
            }
        )
    
    # Add rate limit headers to response
    response = await call_next(request)
    response.headers["X-RateLimit-Remaining-Minute"] = str(limit_info["minute_remaining"])
    response.headers["X-RateLimit-Remaining-Hour"] = str(limit_info["hour_remaining"])
    response.headers["X-RateLimit-Burst-Remaining"] = str(limit_info["burst_remaining"])
    
    return response


# Dependency for strict endpoints
async def strict_rate_limit(request: Request):
    """Dependency for endpoints that need strict rate limiting"""
    is_allowed, limit_info = await strict_limiter.check_rate_limit(request)
    if not is_allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded: {limit_info['limit']} requests per {limit_info['window']}",
            headers={
                "Retry-After": str(limit_info["retry_after"]),
                "X-RateLimit-Limit": str(limit_info["limit"])
            }
        )


# Dependency for AI endpoints
async def ai_rate_limit(request: Request):
    """Dependency for AI endpoints that need stricter rate limiting"""
    is_allowed, limit_info = await ai_limiter.check_rate_limit(request)
    if not is_allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"AI rate limit exceeded: {limit_info['limit']} requests per {limit_info['window']}",
            headers={
                "Retry-After": str(limit_info["retry_after"]),
                "X-RateLimit-Limit": str(limit_info["limit"])
            }
        )