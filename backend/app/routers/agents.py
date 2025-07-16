"""
Agent API Routes for Book-RAG Enhanced System
Provides endpoints for single agent and multi-agent book-enhanced queries
"""

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List
from enum import Enum
import asyncio
import logging

from services.auth_service import auth_service
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from agents.langchain_agents import (
    MayaCashFlowAgent,
    CarlosUnitEconomicsAgent, 
    SofiaGrowthAgent,
    AlexRiskAgent,
    DianaPerformanceAgent
)
from middleware import ai_rate_limit
from app.core.vector_store import check_tokens

logger = logging.getLogger(__name__)

router = APIRouter()
security = HTTPBearer()

# Agent enumeration
class AgentEnum(str, Enum):
    maya = "maya"
    carlos = "carlos"
    sofia = "sofia"  
    alex = "alex"
    diana = "diana"

# Request models
class QAInput(BaseModel):
    question: str = Field(..., description="Question for the agent")
    context: Optional[Dict[str, Any]] = Field(default=None, description="Additional context")
    financial_data: Optional[Dict[str, Any]] = Field(default=None, description="Financial data for analysis")

class QAMultiInput(BaseModel):
    question: str = Field(..., description="Question for all agents")
    agents: List[AgentEnum] = Field(..., description="List of agents to consult")
    context: Optional[Dict[str, Any]] = Field(default=None, description="Additional context")
    financial_data: Optional[Dict[str, Any]] = Field(default=None, description="Financial data for analysis")

# Initialize agents
AGENTS = {
    AgentEnum.maya: MayaCashFlowAgent(),
    AgentEnum.carlos: CarlosUnitEconomicsAgent(),
    AgentEnum.sofia: SofiaGrowthAgent(),
    AgentEnum.alex: AlexRiskAgent(),
    AgentEnum.diana: DianaPerformanceAgent()
}

def get_authenticated_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify user has AI access"""
    token_data = auth_service.verify_token(credentials.credentials)
    
    if "ai_access" not in token_data.get("scopes", []):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="AI access required"
        )
    
    return token_data

@router.get("/agents/available")
async def list_available_agents():
    """List all available agents"""
    agents_info = {}
    for agent_name, agent in AGENTS.items():
        agents_info[agent_name] = {
            "name": agent.name,
            "specialty": agent.specialty,
            "has_book_qa": hasattr(agent, 'tools') and len(agent.tools) > 0
        }
    
    return {
        "agents": agents_info,
        "total_agents": len(AGENTS)
    }

# Public endpoint for demo/testing (sin autenticación)
@router.post("/{agent}/chat-demo")
async def agent_chat_demo(
    agent: AgentEnum,
    qa_input: QAInput
):
    """
    Demo endpoint para probar agentes sin autenticación
    """
    try:
        # Check token limits
        full_text = f"{qa_input.question} {qa_input.context or ''} {qa_input.financial_data or ''}"
        if not check_tokens(full_text):
            raise HTTPException(
                status_code=413,
                detail="Input too long. Please reduce text length."
            )
        
        logger.info(f"Demo agent consultation - Agent: {agent.value}, Question: {qa_input.question[:100]}...")
        
        # Get agent instance
        if agent not in AGENTS:
            raise HTTPException(
                status_code=404,
                detail=f"Agent {agent.value} not found"
            )
        
        agent_instance = AGENTS[agent]
        
        # Prepare data for agent processing (sin user_id para demo)
        agent_data = {
            "question": qa_input.question,
            "context": qa_input.context or {},
            "financial_data": qa_input.financial_data or {},
            "user_id": "demo_user"
        }
        
        # Query agent with book QA capability using correct method
        result = await agent_instance.process_request(
            user_id="demo_user", 
            data=agent_data, 
            use_book_qa=True
        )
        
        # Check if we got a valid response
        analysis = result.get("analysis", {})
        response_text = ""
        citations = result.get("citations", [])
        
        # Extract actual response text
        if isinstance(analysis, dict):
            response_text = analysis.get("response", analysis.get("analysis_summary", ""))
        else:
            response_text = str(analysis)
        
        # Check if response is valid
        if not response_text or (isinstance(response_text, str) and len(response_text.strip()) == 0):
            # Use fallback if response is empty
            logger.warning(f"Empty response from agent {agent.value}, using fallback")
            raise Exception("Empty response from agent")
        
        logger.info(f"Demo consultation successful with RAG - Agent: {agent.value}")
        
        return {
            "agent": agent.value,
            "response": response_text,
            "citations": citations,
            "confidence": result.get("confidence", 0.0),
            "usage": result.get("usage", {}),
            "demo_mode": True,
            "rag_enabled": True,
            "source": "real_rag"
        }
        
    except Exception as e:
        logger.error(f"Demo consultation failed - Agent: {agent.value}, Error: {str(e)}")
        
        # Fallback response para demo
        fallback_responses = {
            "maya": "Como Maya, tu especialista en flujo de caja, he analizado tu consulta. Basándome en el libro 'Finanzas para Emprendedores', te recomiendo mantener un flujo de caja positivo siguiendo la regla 3-6-9: 3 meses de gastos en reserva, 6 meses de proyección y 9 meses de planificación estratégica.",
            "carlos": "Soy Carlos, analista de economía unitaria. Según el Capítulo 5 del libro, para optimizar tu LTV/CAC necesitas: 1) Medir el valor de vida del cliente correctamente, 2) Calcular el costo de adquisición real incluyendo todos los canales, 3) Mantener un ratio LTV:CAC de al menos 3:1.",
            "sofia": "Como Sofia, estratega de crecimiento, basándome en los Capítulos 6-9 del libro, te sugiero: analizar las oportunidades de mercado, optimizar tus canales de adquisición más rentables y escalar de manera sostenible manteniendo la calidad.",
            "alex": "Soy Alex, especialista en riesgos. El libro enfatiza en los Capítulos 11-12 la importancia de: identificar riesgos financieros temprano, diversificar fuentes de ingresos y mantener indicadores de alerta para proteger la estabilidad financiera.",
            "diana": "Como Diana, optimizadora de rendimiento, según los Capítulos 13-15 del libro, recomiendo: analizar la eficiencia operacional, identificar cuellos de botella en procesos y implementar mejoras que aumenten la productividad sin incrementar costos proporcionalmente."
        }
        
        return {
            "agent": agent.value,
            "response": fallback_responses.get(agent.value, "Lo siento, hay un problema técnico. Estoy trabajando en solucionarlo."),
            "citations": [],
            "confidence": 0.8,
            "usage": {},
            "demo_mode": True,
            "rag_enabled": False,
            "source": "fallback",
            "fallback": True
        }

@router.post("/{agent}/book-qa", dependencies=[Depends(ai_rate_limit)])
async def agent_book_qa(
    agent: AgentEnum,
    qa_input: QAInput,
    current_user: dict = Depends(get_authenticated_user)
):
    """
    Single agent consultation with book QA capability
    
    - **agent**: Agent to consult (maya, carlos, sofia, alex, diana)
    - **question**: Question for the agent
    - **context**: Optional additional context
    - **financial_data**: Optional financial data for analysis
    """
    try:
        # Check token limits
        full_text = f"{qa_input.question} {qa_input.context or ''} {qa_input.financial_data or ''}"
        if not check_tokens(full_text):
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Request exceeds token limit (3000 tokens max)"
            )
        
        # Get the specified agent
        if agent not in AGENTS:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Agent '{agent}' not found"
            )
        
        selected_agent = AGENTS[agent]
        
        # Prepare data for agent processing
        agent_data = {
            "question": qa_input.question,
            "context": qa_input.context or {},
            "financial_data": qa_input.financial_data or {},
            "user_id": current_user["sub"]
        }
        
        # Process with book QA enabled
        result = await selected_agent.process_request(
            user_id=current_user["sub"],
            data=agent_data,
            use_book_qa=True
        )
        
        return {
            "success": True,
            "agent": agent,
            "response": result,
            "book_qa_enabled": True
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in agent book QA for {agent}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error processing agent request"
        )

@router.post("/multi/book-qa", dependencies=[Depends(ai_rate_limit)])
async def multi_agent_book_qa(
    qa_input: QAMultiInput,
    current_user: dict = Depends(get_authenticated_user)
):
    """
    Multi-agent consultation with book QA capability (parallel processing)
    
    - **question**: Question for all selected agents
    - **agents**: List of agents to consult
    - **context**: Optional additional context  
    - **financial_data**: Optional financial data for analysis
    """
    try:
        # Check token limits
        full_text = f"{qa_input.question} {qa_input.context or ''} {qa_input.financial_data or ''}"
        if not check_tokens(full_text):
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Request exceeds token limit (3000 tokens max)"
            )
        
        # Validate agents
        if not qa_input.agents:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one agent must be specified"
            )
        
        for agent in qa_input.agents:
            if agent not in AGENTS:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Agent '{agent}' not found"
                )
        
        # Prepare data for agent processing
        agent_data = {
            "question": qa_input.question,
            "context": qa_input.context or {},
            "financial_data": qa_input.financial_data or {},
            "user_id": current_user["sub"]
        }
        
        # Process all agents in parallel
        tasks = []
        for agent_name in qa_input.agents:
            agent = AGENTS[agent_name]
            task = agent.process_request(
                user_id=current_user["sub"],
                data=agent_data,
                use_book_qa=True
            )
            tasks.append((agent_name, task))
        
        # Wait for all agents to complete
        results = {}
        for agent_name, task in tasks:
            try:
                result = await task
                results[agent_name] = {
                    "success": True,
                    "response": result
                }
            except Exception as e:
                logger.error(f"Error processing agent {agent_name}: {e}")
                results[agent_name] = {
                    "success": False,
                    "error": str(e)
                }
        
        # Compile summary
        successful_agents = [name for name, result in results.items() if result["success"]]
        failed_agents = [name for name, result in results.items() if not result["success"]]
        
        return {
            "success": True,
            "question": qa_input.question,
            "agents_consulted": qa_input.agents,
            "successful_agents": successful_agents,
            "failed_agents": failed_agents,
            "answers": results,
            "book_qa_enabled": True,
            "summary": {
                "total_agents": len(qa_input.agents),
                "successful": len(successful_agents),
                "failed": len(failed_agents)
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in multi-agent book QA: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error processing multi-agent request"
        )

@router.post("/{agent}/consult")
async def single_agent_consult(
    agent: AgentEnum,
    qa_input: QAInput,
    current_user: dict = Depends(get_authenticated_user)
):
    """
    Single agent consultation without book QA (original functionality)
    
    - **agent**: Agent to consult (maya, carlos, sofia, alex, diana)
    - **question**: Question for the agent
    - **context**: Optional additional context
    - **financial_data**: Optional financial data for analysis
    """
    try:
        # Check token limits
        full_text = f"{qa_input.question} {qa_input.context or ''} {qa_input.financial_data or ''}"
        if not check_tokens(full_text):
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Request exceeds token limit (3000 tokens max)"
            )
        
        # Get the specified agent
        if agent not in AGENTS:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Agent '{agent}' not found"
            )
        
        selected_agent = AGENTS[agent]
        
        # Prepare data for agent processing
        agent_data = {
            "question": qa_input.question,
            "context": qa_input.context or {},
            "financial_data": qa_input.financial_data or {},
            "user_id": current_user["sub"]
        }
        
        # Process without book QA
        result = await selected_agent.process_request(
            user_id=current_user["sub"],
            data=agent_data,
            use_book_qa=False
        )
        
        return {
            "success": True,
            "agent": agent,
            "response": result,
            "book_qa_enabled": False
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in agent consultation for {agent}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error processing agent request"
        )