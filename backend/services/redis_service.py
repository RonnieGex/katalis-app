import redis
import json
import os
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta

class RedisService:
    def __init__(self):
        self.redis_url = os.getenv("REDIS_URL")
        self.redis_rest_url = os.getenv("REDIS_REST_URL") 
        self.redis_rest_token = os.getenv("REDIS_REST_TOKEN")
        
        if self.redis_url:
            # Convert redis:// to rediss:// for SSL connection to Upstash
            ssl_url = self.redis_url.replace('redis://', 'rediss://')
            self.redis_client = redis.from_url(
                ssl_url,
                decode_responses=True
            )
        else:
            self.redis_client = None
    
    def is_connected(self) -> bool:
        """Check if Redis connection is available"""
        try:
            if self.redis_client:
                self.redis_client.ping()
                return True
        except Exception:
            pass
        return False
    
    # User Learning Progress
    def save_user_progress(self, user_id: str, module_id: str, progress_data: Dict[str, Any]) -> bool:
        """Save user progress for a specific module"""
        try:
            if not self.redis_client:
                return False
                
            key = f"user:{user_id}:progress:{module_id}"
            progress_data["updated_at"] = datetime.utcnow().isoformat()
            
            self.redis_client.hset(key, mapping={
                "data": json.dumps(progress_data),
                "module_id": module_id,
                "user_id": user_id
            })
            
            # Set expiration to 30 days
            self.redis_client.expire(key, 30 * 24 * 60 * 60)
            return True
        except Exception as e:
            print(f"Error saving user progress: {e}")
            return False
    
    def get_user_progress(self, user_id: str, module_id: str) -> Optional[Dict[str, Any]]:
        """Get user progress for a specific module"""
        try:
            if not self.redis_client:
                return None
                
            key = f"user:{user_id}:progress:{module_id}"
            data = self.redis_client.hget(key, "data")
            
            if data:
                return json.loads(data)
            return None
        except Exception as e:
            print(f"Error getting user progress: {e}")
            return None
    
    def get_all_user_progress(self, user_id: str) -> Dict[str, Any]:
        """Get all progress for a user across all modules"""
        try:
            if not self.redis_client:
                return {}
                
            pattern = f"user:{user_id}:progress:*"
            keys = self.redis_client.keys(pattern)
            
            progress = {}
            for key in keys:
                module_id = key.split(":")[-1]
                data = self.redis_client.hget(key, "data")
                if data:
                    progress[module_id] = json.loads(data)
            
            return progress
        except Exception as e:
            print(f"Error getting all user progress: {e}")
            return {}
    
    # Learning Analytics
    def track_module_completion(self, user_id: str, module_id: str, completion_time: Optional[datetime] = None) -> bool:
        """Track when a user completes a module"""
        try:
            if not self.redis_client:
                return False
                
            if completion_time is None:
                completion_time = datetime.utcnow()
            
            key = f"user:{user_id}:completions"
            completion_data = {
                "module_id": module_id,
                "completed_at": completion_time.isoformat(),
                "timestamp": completion_time.timestamp()
            }
            
            # Add to sorted set for time-based queries
            self.redis_client.zadd(
                key, 
                {json.dumps(completion_data): completion_time.timestamp()}
            )
            
            # Set expiration to 90 days
            self.redis_client.expire(key, 90 * 24 * 60 * 60)
            return True
        except Exception as e:
            print(f"Error tracking module completion: {e}")
            return False
    
    def get_user_completions(self, user_id: str, days: int = 30) -> List[Dict[str, Any]]:
        """Get user module completions in the last N days"""
        try:
            if not self.redis_client:
                return []
                
            key = f"user:{user_id}:completions"
            since = (datetime.utcnow() - timedelta(days=days)).timestamp()
            
            completions = self.redis_client.zrangebyscore(key, since, "+inf")
            return [json.loads(completion) for completion in completions]
        except Exception as e:
            print(f"Error getting user completions: {e}")
            return []
    
    # Bookmarks System
    def save_bookmark(self, user_id: str, bookmark_data: Dict[str, Any]) -> bool:
        """Save a user bookmark"""
        try:
            if not self.redis_client:
                return False
                
            bookmark_id = f"{bookmark_data['module_id']}:{bookmark_data['section']}"
            key = f"user:{user_id}:bookmarks"
            
            bookmark_data["created_at"] = datetime.utcnow().isoformat()
            bookmark_data["bookmark_id"] = bookmark_id
            
            self.redis_client.hset(key, bookmark_id, json.dumps(bookmark_data))
            
            # Set expiration to 180 days
            self.redis_client.expire(key, 180 * 24 * 60 * 60)
            return True
        except Exception as e:
            print(f"Error saving bookmark: {e}")
            return False
    
    def get_user_bookmarks(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all bookmarks for a user"""
        try:
            if not self.redis_client:
                return []
                
            key = f"user:{user_id}:bookmarks"
            bookmark_data = self.redis_client.hgetall(key)
            
            bookmarks = []
            for bookmark_json in bookmark_data.values():
                bookmarks.append(json.loads(bookmark_json))
            
            # Sort by creation date
            bookmarks.sort(key=lambda x: x.get("created_at", ""), reverse=True)
            return bookmarks
        except Exception as e:
            print(f"Error getting user bookmarks: {e}")
            return []
    
    def remove_bookmark(self, user_id: str, bookmark_id: str) -> bool:
        """Remove a user bookmark"""
        try:
            if not self.redis_client:
                return False
                
            key = f"user:{user_id}:bookmarks"
            self.redis_client.hdel(key, bookmark_id)
            return True
        except Exception as e:
            print(f"Error removing bookmark: {e}")
            return False
    
    # Learning Session Tracking
    def start_learning_session(self, user_id: str, module_id: str) -> str:
        """Start a learning session and return session ID"""
        try:
            if not self.redis_client:
                return ""
                
            session_id = f"{user_id}:{module_id}:{datetime.utcnow().timestamp()}"
            key = f"session:{session_id}"
            
            session_data = {
                "user_id": user_id,
                "module_id": module_id,
                "started_at": datetime.utcnow().isoformat(),
                "status": "active"
            }
            
            self.redis_client.hset(key, mapping=session_data)
            self.redis_client.expire(key, 24 * 60 * 60)  # 24 hours
            
            return session_id
        except Exception as e:
            print(f"Error starting learning session: {e}")
            return ""
    
    def end_learning_session(self, session_id: str, completion_percentage: float = 0.0) -> bool:
        """End a learning session"""
        try:
            if not self.redis_client:
                return False
                
            key = f"session:{session_id}"
            
            self.redis_client.hset(key, mapping={
                "ended_at": datetime.utcnow().isoformat(),
                "status": "completed",
                "completion_percentage": completion_percentage
            })
            
            return True
        except Exception as e:
            print(f"Error ending learning session: {e}")
            return False
    
    # Global Learning Statistics
    def increment_global_stat(self, stat_name: str, increment: int = 1) -> bool:
        """Increment a global learning statistic"""
        try:
            if not self.redis_client:
                return False
                
            key = f"global:stats:{stat_name}"
            self.redis_client.incr(key, increment)
            return True
        except Exception as e:
            print(f"Error incrementing global stat: {e}")
            return False
    
    def get_global_stats(self) -> Dict[str, int]:
        """Get global learning statistics"""
        try:
            if not self.redis_client:
                return {}
                
            pattern = "global:stats:*"
            keys = self.redis_client.keys(pattern)
            
            stats = {}
            for key in keys:
                stat_name = key.split(":")[-1]
                value = self.redis_client.get(key)
                stats[stat_name] = int(value) if value else 0
            
            return stats
        except Exception as e:
            print(f"Error getting global stats: {e}")
            return {}
    
    def get_current_timestamp(self) -> str:
        """Get current timestamp as ISO string"""
        return datetime.utcnow().isoformat()

# Global instance
redis_service = RedisService()