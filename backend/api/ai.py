from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials  
from pydantic import BaseModel
from typing import Dict, Any, Optional
from services.ai_service import ai_service
from services.auth_service import auth_service
from middleware import ai_rate_limit

router = APIRouter()
security = HTTPBearer()

class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None

class AnalysisRequest(BaseModel):
    data_type: str  # cash_flow, unit_economics, pricing, etc.
    data: Dict[str, Any]

class EducationalRequest(BaseModel):
    topic: str
    level: str = "beginner"

def get_authenticated_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify user has AI access"""
    token_data = auth_service.verify_token(credentials.credentials)
    
    if "ai_access" not in token_data.get("scopes", []):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="AI access required"
        )
    
    return token_data

@router.post("/ai/chat", dependencies=[Depends(ai_rate_limit)])
async def ai_chat(
    request: ChatRequest,
    current_user: dict = Depends(get_authenticated_user)
):
    """Chat with AI financial assistant"""
    try:
        response = await ai_service.chat_with_user(
            user_id=current_user["sub"],
            message=request.message,
            context=request.context
        )
        
        return {
            "response": response,
            "user_id": current_user["sub"],
            "timestamp": ai_service.redis_service.get_current_timestamp()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {str(e)}"
        )

@router.post("/ai/analyze")
async def analyze_data(
    request: AnalysisRequest,
    current_user: dict = Depends(get_authenticated_user)
):
    """Analyze financial data with AI"""
    try:
        analysis = await ai_service.analyze_financial_data(
            user_id=current_user["sub"],
            data_type=request.data_type,
            data=request.data
        )
        
        return analysis
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis error: {str(e)}"
        )

@router.post("/ai/education")
async def get_educational_content(
    request: EducationalRequest,
    current_user: dict = Depends(get_authenticated_user)
):
    """Get educational content on financial topics"""
    try:
        content = await ai_service.get_educational_content(
            topic=request.topic,
            user_level=request.level
        )
        
        return content
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Education service error: {str(e)}"
        )

@router.get("/ai/topics")
async def get_available_topics(current_user: dict = Depends(get_authenticated_user)):
    """Get list of available educational topics"""
    return {
        "topics": [
            "flujo-de-caja",
            "unidades-economicas", 
            "costos-y-precios",
            "rentabilidad",
            "planificacion-financiera",
            "presupuestos",
            "indicadores-financieros",
            "analisis-de-mercado",
            "estrategias-de-crecimiento",
            "gestion-de-riesgos"
        ],
        "levels": ["beginner", "intermediate", "advanced"]
    }

@router.get("/ai/conversation-history")
async def get_conversation_history(current_user: dict = Depends(get_authenticated_user)):
    """Get user's conversation history summary"""
    memory = ai_service.get_user_memory(current_user["sub"])
    
    # Get recent messages
    messages = []
    for message in memory.chat_memory.messages[-10:]:  # Last 10 messages
        if hasattr(message, 'content'):
            msg_type = "user" if "HumanMessage" in str(type(message)) else "ai"
            messages.append({
                "type": msg_type,
                "content": message.content[:200] + "..." if len(message.content) > 200 else message.content
            })
    
    return {
        "recent_messages": messages,
        "total_messages": len(memory.chat_memory.messages)
    }