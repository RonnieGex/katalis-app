from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from datetime import datetime
from services.redis_service import redis_service

router = APIRouter()

class ProgressUpdate(BaseModel):
    module_id: str
    progress_percentage: float
    current_section: Optional[str] = None
    time_spent: Optional[int] = None  # in seconds
    completed_sections: Optional[List[str]] = []
    quiz_scores: Optional[Dict[str, float]] = {}
    bookmarks: Optional[List[str]] = []

class BookmarkCreate(BaseModel):
    module_id: str
    section: str
    title: str
    description: Optional[str] = None
    content_type: str = "concept"  # concept, example, calculation, etc.

class LearningSession(BaseModel):
    module_id: str

# Progress endpoints
@router.post("/users/{user_id}/progress")
async def update_user_progress(user_id: str, progress: ProgressUpdate):
    """Update user progress for a specific module"""
    try:
        progress_data = {
            "progress_percentage": progress.progress_percentage,
            "current_section": progress.current_section,
            "time_spent": progress.time_spent or 0,
            "completed_sections": progress.completed_sections or [],
            "quiz_scores": progress.quiz_scores or {},
            "bookmarks": progress.bookmarks or [],
            "last_activity": datetime.utcnow().isoformat()
        }
        
        success = redis_service.save_user_progress(user_id, progress.module_id, progress_data)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to save progress")
        
        # Track completion if progress is 100%
        if progress.progress_percentage >= 100:
            redis_service.track_module_completion(user_id, progress.module_id)
            redis_service.increment_global_stat("modules_completed")
        
        # Update global statistics
        redis_service.increment_global_stat("learning_sessions")
        
        return {
            "success": True,
            "message": "Progress updated successfully",
            "progress": progress_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating progress: {str(e)}")

@router.get("/users/{user_id}/progress/{module_id}")
async def get_user_progress(user_id: str, module_id: str):
    """Get user progress for a specific module"""
    try:
        progress = redis_service.get_user_progress(user_id, module_id)
        
        if progress is None:
            return {
                "progress_percentage": 0,
                "current_section": None,
                "time_spent": 0,
                "completed_sections": [],
                "quiz_scores": {},
                "bookmarks": [],
                "last_activity": None
            }
        
        return progress
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting progress: {str(e)}")

@router.get("/users/{user_id}/progress")
async def get_all_user_progress(user_id: str):
    """Get all progress for a user across all modules"""
    try:
        progress = redis_service.get_all_user_progress(user_id)
        completions = redis_service.get_user_completions(user_id, days=30)
        
        # Calculate overall statistics
        total_modules = len(progress)
        completed_modules = len([p for p in progress.values() if p.get("progress_percentage", 0) >= 100])
        total_time = sum([p.get("time_spent", 0) for p in progress.values()])
        
        return {
            "progress": progress,
            "recent_completions": completions,
            "statistics": {
                "total_modules": total_modules,
                "completed_modules": completed_modules,
                "completion_rate": (completed_modules / total_modules * 100) if total_modules > 0 else 0,
                "total_time_spent": total_time,
                "average_time_per_module": (total_time / total_modules) if total_modules > 0 else 0
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting progress: {str(e)}")

# Bookmarks endpoints
@router.post("/users/{user_id}/bookmarks")
async def create_bookmark(user_id: str, bookmark: BookmarkCreate):
    """Create a new bookmark for the user"""
    try:
        bookmark_data = {
            "module_id": bookmark.module_id,
            "section": bookmark.section,
            "title": bookmark.title,
            "description": bookmark.description,
            "content_type": bookmark.content_type
        }
        
        success = redis_service.save_bookmark(user_id, bookmark_data)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to create bookmark")
        
        return {
            "success": True,
            "message": "Bookmark created successfully",
            "bookmark": bookmark_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating bookmark: {str(e)}")

@router.get("/users/{user_id}/bookmarks")
async def get_user_bookmarks(user_id: str):
    """Get all bookmarks for a user"""
    try:
        bookmarks = redis_service.get_user_bookmarks(user_id)
        return {"bookmarks": bookmarks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting bookmarks: {str(e)}")

@router.delete("/users/{user_id}/bookmarks/{bookmark_id}")
async def delete_bookmark(user_id: str, bookmark_id: str):
    """Delete a user bookmark"""
    try:
        success = redis_service.remove_bookmark(user_id, bookmark_id)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete bookmark")
        
        return {"success": True, "message": "Bookmark deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting bookmark: {str(e)}")

# Learning sessions
@router.post("/users/{user_id}/sessions/start")
async def start_learning_session(user_id: str, session: LearningSession):
    """Start a new learning session"""
    try:
        session_id = redis_service.start_learning_session(user_id, session.module_id)
        
        if not session_id:
            raise HTTPException(status_code=500, detail="Failed to start learning session")
        
        return {
            "success": True,
            "session_id": session_id,
            "message": "Learning session started"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error starting session: {str(e)}")

@router.post("/sessions/{session_id}/end")
async def end_learning_session(session_id: str, completion_percentage: float = 0.0):
    """End a learning session"""
    try:
        success = redis_service.end_learning_session(session_id, completion_percentage)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to end learning session")
        
        return {
            "success": True,
            "message": "Learning session ended"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error ending session: {str(e)}")

# Analytics
@router.get("/analytics/global")
async def get_global_analytics():
    """Get global learning analytics"""
    try:
        stats = redis_service.get_global_stats()
        
        return {
            "global_statistics": stats,
            "redis_connected": redis_service.is_connected()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting analytics: {str(e)}")

@router.get("/health")
async def health_check():
    """Health check for the progress service"""
    try:
        redis_connected = redis_service.is_connected()
        return {
            "status": "healthy" if redis_connected else "degraded",
            "redis_connected": redis_connected,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "redis_connected": False,
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }