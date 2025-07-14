"""
KatalisApp LangChain Agents API
Endpoints para consultar con agentes especializados usando LangChain + OpenAI + Pydantic
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from datetime import datetime
import json

from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from agents.langchain_agents import langchain_agent_manager
from services.auth_service import auth_service

security = HTTPBearer()

def get_authenticated_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify user has access"""
    token_data = auth_service.verify_token(credentials.credentials)
    return token_data

router = APIRouter()

# Request models
class AgentConsultationRequest(BaseModel):
    agent_id: str
    data: Dict[str, Any]
    context: Optional[str] = None

class MultiAgentRequest(BaseModel):
    comprehensive_data: Dict[str, Any]
    specific_agents: Optional[List[str]] = None

class CashFlowData(BaseModel):
    current_balance: float = 0
    monthly_expenses: float = 0
    cash_flow_history: List[Dict[str, Any]] = []
    accounts_receivable: float = 0
    accounts_payable: float = 0

class UnitEconomicsData(BaseModel):
    ltv: float = 0
    cac: float = 0
    churn_rate: float = 0
    arpu: float = 0
    customer_count: int = 0
    cohort_data: Dict[str, Any] = {}

class GrowthData(BaseModel):
    growth_rate: float = 0
    revenue_trend: List[Dict[str, Any]] = []
    market_size: float = 0
    current_revenue: float = 0
    acquisition_channels: Dict[str, Any] = {}

class RiskData(BaseModel):
    debt_to_equity: float = 0
    customer_concentration: float = 0
    burn_rate: float = 0
    revenue_volatility: float = 0
    cash_balance: float = 0
    risk_context: Dict[str, Any] = {}

class PerformanceData(BaseModel):
    operating_margin: float = 0
    revenue_per_employee: float = 0
    automation_percentage: float = 0
    process_efficiency_score: float = 0
    department_metrics: Dict[str, Any] = {}
    process_analysis: Dict[str, Any] = {}

@router.get("/agents/available")
async def get_available_agents(current_user: dict = Depends(get_authenticated_user)):
    """Get list of available LangChain AI agents"""
    try:
        agents = langchain_agent_manager.get_available_agents()
        return {
            "status": "success",
            "agents": agents,
            "total_agents": len(agents),
            "technology": "LangChain + OpenAI GPT-4 + Pydantic",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting agents: {str(e)}")

@router.post("/agents/consult")
async def consult_agent(
    request: AgentConsultationRequest,
    current_user: dict = Depends(get_authenticated_user)
):
    """Consult with a specific LangChain AI agent"""
    try:
        result = await langchain_agent_manager.consult_agent(
            agent_id=request.agent_id,
            user_id=current_user.get("user_id", current_user.get("sub")),
            data=request.data
        )
        
        return {
            "status": "success",
            "consultation": result,
            "agent_id": request.agent_id,
            "user_id": current_user.get("user_id", current_user.get("sub")),
            "timestamp": datetime.now().isoformat()
        }
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error consulting agent: {str(e)}")

@router.post("/agents/multi-agent-analysis")
async def multi_agent_analysis(
    request: MultiAgentRequest,
    current_user: dict = Depends(get_authenticated_user)
):
    """Get comprehensive analysis from multiple relevant LangChain agents"""
    try:
        result = await langchain_agent_manager.multi_agent_consultation(
            user_id=current_user.get("user_id", current_user.get("sub")),
            comprehensive_data=request.comprehensive_data
        )
        
        return {
            "status": "success",
            "multi_agent_analysis": result,
            "user_id": current_user.get("user_id", current_user.get("sub")),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in multi-agent analysis: {str(e)}")

# Specialized agent endpoints with structured data models

@router.post("/agents/maya/cash-flow-analysis")
async def maya_cash_flow_analysis(
    data: CashFlowData,
    current_user: dict = Depends(get_authenticated_user)
):
    """Maya - Cash Flow Optimization Analysis"""
    try:
        result = await langchain_agent_manager.consult_agent(
            agent_id="maya",
            user_id=current_user.get("user_id", current_user.get("sub")),
            data=data.dict()
        )
        
        return {
            "status": "success",
            "agent": "Maya - Cash Flow Optimizer",
            "analysis": result,
            "recommendation_summary": "Análisis completo de flujo de caja con recomendaciones específicas",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in Maya analysis: {str(e)}")

@router.post("/agents/carlos/unit-economics-analysis")
async def carlos_unit_economics_analysis(
    data: UnitEconomicsData,
    current_user: dict = Depends(get_authenticated_user)
):
    """Carlos - Unit Economics Analysis"""
    try:
        result = await langchain_agent_manager.consult_agent(
            agent_id="carlos",
            user_id=current_user.get("user_id", current_user.get("sub")),
            data=data.dict()
        )
        
        return {
            "status": "success",
            "agent": "Carlos - Unit Economics Analyst",
            "analysis": result,
            "recommendation_summary": "Análisis profundo de unit economics con optimizaciones",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in Carlos analysis: {str(e)}")

@router.post("/agents/sofia/growth-strategy")
async def sofia_growth_strategy(
    data: GrowthData,
    current_user: dict = Depends(get_authenticated_user)
):
    """Sofia - Growth Strategy Development"""
    try:
        result = await langchain_agent_manager.consult_agent(
            agent_id="sofia",
            user_id=current_user.get("user_id", current_user.get("sub")),
            data=data.dict()
        )
        
        return {
            "status": "success",
            "agent": "Sofia - Growth Strategist",
            "analysis": result,
            "recommendation_summary": "Estrategia de crecimiento con roadmap detallado",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in Sofia analysis: {str(e)}")

@router.post("/agents/alex/risk-assessment")
async def alex_risk_assessment(
    data: RiskData,
    current_user: dict = Depends(get_authenticated_user)
):
    """Alex - Risk Assessment and Mitigation"""
    try:
        result = await langchain_agent_manager.consult_agent(
            agent_id="alex",
            user_id=current_user.get("user_id", current_user.get("sub")),
            data=data.dict()
        )
        
        return {
            "status": "success",
            "agent": "Alex - Risk Assessment Specialist",
            "analysis": result,
            "recommendation_summary": "Evaluación completa de riesgos con planes de mitigación",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in Alex analysis: {str(e)}")

@router.post("/agents/diana/performance-optimization")
async def diana_performance_optimization(
    data: PerformanceData,
    current_user: dict = Depends(get_authenticated_user)
):
    """Diana - Performance Optimization"""
    try:
        result = await langchain_agent_manager.consult_agent(
            agent_id="diana",
            user_id=current_user.get("user_id", current_user.get("sub")),
            data=data.dict()
        )
        
        return {
            "status": "success",
            "agent": "Diana - Performance Optimizer",
            "analysis": result,
            "recommendation_summary": "Optimización de rendimiento con quick wins y proyectos a largo plazo",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in Diana analysis: {str(e)}")

@router.get("/agents/user-preferences/{user_id}")
async def get_user_agent_preferences(
    user_id: str,
    current_user: dict = Depends(get_authenticated_user)
):
    """Get user preferences for AI agents (learning mode vs AI-only mode)"""
    try:
        # Check if user wants learning disabled (AI-only mode)
        from services.redis_service import redis_service
        
        preferences_key = f"user_preferences:{user_id}"
        preferences = redis_service.redis_client.get(preferences_key)
        
        if preferences:
            prefs_data = json.loads(preferences)
        else:
            prefs_data = {
                "learning_mode_enabled": True,
                "preferred_agents": [],
                "ai_assistance_level": "full"
            }
        
        return {
            "status": "success",
            "user_id": user_id,
            "preferences": prefs_data,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting preferences: {str(e)}")

@router.post("/agents/user-preferences/{user_id}")
async def update_user_agent_preferences(
    user_id: str,
    preferences: Dict[str, Any],
    current_user: dict = Depends(get_authenticated_user)
):
    """Update user preferences for AI agents"""
    try:
        from services.redis_service import redis_service
        
        preferences_key = f"user_preferences:{user_id}"
        
        # Add timestamp to preferences
        preferences["updated_at"] = datetime.now().isoformat()
        
        # Store preferences in Redis
        redis_service.redis_client.setex(
            preferences_key,
            30 * 24 * 60 * 60,  # 30 days
            json.dumps(preferences)
        )
        
        return {
            "status": "success",
            "message": "Preferencias actualizadas correctamente",
            "user_id": user_id,
            "preferences": preferences,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating preferences: {str(e)}")

@router.get("/agents/agent-memory/{agent_id}/{user_id}")
async def get_agent_conversation_memory(
    agent_id: str,
    user_id: str,
    current_user: dict = Depends(get_authenticated_user)
):
    """Get conversation history/memory for a specific agent and user"""
    try:
        from services.redis_service import redis_service
        
        # Get recent interactions
        memory_pattern = f"agent_interaction:{agent_id}:{user_id}:*"
        memory_keys = redis_service.redis_client.keys(memory_pattern)
        
        interactions = []
        for key in sorted(memory_keys)[-10:]:  # Last 10 interactions
            interaction_data = redis_service.redis_client.get(key)
            if interaction_data:
                interactions.append(json.loads(interaction_data))
        
        # Get agent memory from LangChain manager
        agent_memory = None
        if agent_id in langchain_agent_manager.memories:
            memory = langchain_agent_manager.memories[agent_id]
            agent_memory = {
                "buffer_length": len(memory.chat_memory.messages),
                "recent_messages": [msg.content for msg in memory.chat_memory.messages[-5:]]
            }
        
        return {
            "status": "success",
            "agent_id": agent_id,
            "user_id": user_id,
            "stored_interactions": len(interactions),
            "recent_interactions": interactions,
            "langchain_memory": agent_memory,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting agent memory: {str(e)}")