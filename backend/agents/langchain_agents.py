"""
KatalisApp AI Agents - Powered by LangChain + OpenAI + Pydantic
Sistema de agentes especializados con tecnología de punta
"""
from typing import Dict, Any, List, Optional, Union
from datetime import datetime
import json
import os
from pydantic import BaseModel, Field, validator
from langchain_openai import ChatOpenAI
import openai
from langchain.schema import HumanMessage, AIMessage, SystemMessage
from langchain.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate
from langchain.output_parsers import PydanticOutputParser
from langchain.chains import LLMChain
from langchain.memory import ConversationBufferWindowMemory
from langchain.tools.retriever import create_retriever_tool
from langchain.agents import AgentType, initialize_agent
from services.redis_service import redis_service
from app.core.vector_store import get_book_retriever, format_citations

# Pydantic Models for Agent Responses
class BookCitation(BaseModel):
    """Citation from the book"""
    chapter: str = Field(description="Chapter name")
    excerpt: str = Field(description="Relevant excerpt from the book")
    loc: Optional[int] = Field(description="Source location ID", default=None)
    similarity: Optional[float] = Field(description="Similarity score", default=None)

class FinancialMetrics(BaseModel):
    """Financial metrics validation"""
    value: float = Field(description="Metric value")
    unit: str = Field(description="Unit of measurement")
    trend: str = Field(description="up, down, or stable")
    confidence: float = Field(ge=0, le=100, description="Confidence percentage")

class AgentRecommendation(BaseModel):
    """Agent recommendation structure"""
    title: str = Field(description="Recommendation title")
    description: str = Field(description="Detailed description")
    priority: str = Field(description="high, medium, or low")
    impact: str = Field(description="Expected impact description")
    timeline: str = Field(description="Implementation timeline")
    citations: List[BookCitation] = Field(description="Supporting book citations", default=[])
    
class CashFlowAnalysis(BaseModel):
    """Cash Flow Analysis Response"""
    runway_months: float = Field(description="Months of cash runway")
    risk_level: str = Field(description="Low, Medium, High")
    liquidity_ratio: float = Field(description="Current ratio calculation")
    seasonal_patterns: List[str] = Field(description="Identified seasonal patterns")
    recommendations: List[AgentRecommendation] = Field(description="Specific recommendations")
    next_review_date: str = Field(description="When to review again")
    citations: List[BookCitation] = Field(description="Supporting book citations", default=[])

class UnitEconomicsAnalysis(BaseModel):
    """Unit Economics Analysis Response"""
    ltv_cac_ratio: float = Field(description="LTV to CAC ratio")
    payback_period_months: float = Field(description="Customer payback period")
    health_score: str = Field(description="Excellent, Good, Fair, Poor")
    cohort_performance: Dict[str, float] = Field(description="Cohort metrics")
    optimization_opportunities: List[AgentRecommendation] = Field(description="Optimization recommendations")
    target_metrics: Dict[str, float] = Field(description="Target metric values")
    citations: List[BookCitation] = Field(description="Supporting book citations", default=[])

class GrowthStrategy(BaseModel):
    """Growth Strategy Response"""
    growth_score: float = Field(ge=0, le=100, description="Current growth health score")
    market_opportunity: str = Field(description="Market opportunity assessment")
    growth_levers: List[str] = Field(description="Key growth levers identified")
    expansion_roadmap: List[AgentRecommendation] = Field(description="Growth initiatives")
    resource_requirements: Dict[str, Any] = Field(description="Required resources")
    success_metrics: List[str] = Field(description="KPIs to track")
    citations: List[BookCitation] = Field(description="Supporting book citations", default=[])

class RiskAssessment(BaseModel):
    """Risk Assessment Response"""
    overall_risk_level: str = Field(description="Low, Medium, High, Critical")
    risk_categories: Dict[str, str] = Field(description="Risk by category")
    mitigation_strategies: List[AgentRecommendation] = Field(description="Risk mitigation")
    monitoring_dashboard: List[str] = Field(description="KPIs to monitor")
    contingency_plans: List[str] = Field(description="Contingency actions")
    risk_score: float = Field(ge=0, le=100, description="Quantified risk score")
    citations: List[BookCitation] = Field(description="Supporting book citations", default=[])

class PerformanceOptimization(BaseModel):
    """Performance Optimization Response"""
    efficiency_score: float = Field(ge=0, le=100, description="Current efficiency score")
    bottlenecks: List[str] = Field(description="Identified bottlenecks")
    automation_opportunities: List[AgentRecommendation] = Field(description="Automation suggestions")
    productivity_improvements: List[AgentRecommendation] = Field(description="Productivity enhancements")
    cost_savings_potential: float = Field(description="Estimated cost savings")
    implementation_priority: List[str] = Field(description="Priority order")
    citations: List[BookCitation] = Field(description="Supporting book citations", default=[])

class BaseLangChainAgent:
    """Base class for LangChain-powered financial agents"""
    
    def __init__(self, name: str, specialty: str, system_prompt: str, response_model: BaseModel):
        self.name = name
        self.specialty = specialty
        self.system_prompt = system_prompt
        self.response_model = response_model
        
        # Initialize DeepSeek R1 LLM
        self.llm = ChatOpenAI(
            openai_api_key=os.getenv("DEEPSEEK_API_KEY"),
            openai_api_base="https://api.deepseek.com/v1",
            model_name="deepseek-reasoner",
            temperature=0.1,  # Lower temperature for more consistent responses
            max_tokens=2000
        )
        
        # Setup output parser
        self.output_parser = PydanticOutputParser(pydantic_object=response_model)
        
        # Initialize tools
        self.tools = self._setup_tools()
        
        # Create agent if tools are available
        if self.tools:
            self.agent = initialize_agent(
                tools=self.tools,
                llm=self.llm,
                agent=AgentType.STRUCTURED_CHAT_ZERO_SHOT_REACT_DESCRIPTION,
                verbose=True,
                handle_parsing_errors=True
            )
        else:
            # Fallback to simple chain if no tools
            self.prompt_template = ChatPromptTemplate.from_messages([
                SystemMessagePromptTemplate.from_template(self.system_prompt + "\n\n{format_instructions}"),
                HumanMessagePromptTemplate.from_template("{input}")
            ])
            
            self.chain = LLMChain(
                llm=self.llm,
                prompt=self.prompt_template,
                output_parser=self.output_parser,
                verbose=True
            )
    
    def _setup_tools(self) -> List:
        """Setup tools for the agent"""
        tools = []
        
        try:
            # Book QA Tool
            book_retriever = get_book_retriever(k=4)
            book_tool = create_retriever_tool(
                retriever=book_retriever,
                name="book_qa",
                description="Consulta el libro 'Finanzas para Emprendedores' para sustentar respuestas con citas exactas y referencias específicas del contenido"
            )
            tools.append(book_tool)
            
        except Exception as e:
            print(f"Warning: Could not initialize book_qa tool: {e}")
        
        return tools
    
    async def process_request(self, user_id: str, data: Dict[str, Any], use_book_qa: bool = False) -> Dict[str, Any]:
        """Process request with LangChain"""
        try:
            # Prepare input
            input_text = self._prepare_input(data)
            
            if hasattr(self, 'agent') and use_book_qa:
                # Use agent with tools
                enhanced_prompt = f"""
                Analiza los siguientes datos financieros y proporciona recomendaciones específicas.
                Usa la herramienta book_qa para sustentar tus respuestas con contenido del libro "Finanzas para Emprendedores".
                
                Datos a analizar:
                {input_text}
                
                Por favor, incluye citas específicas del libro en tus recomendaciones.
                """
                
                result = await self.agent.arun(enhanced_prompt)
                
                # Parse result if it's a string
                if isinstance(result, str):
                    try:
                        result = self.output_parser.parse(result)
                    except:
                        # If parsing fails, create a basic response
                        result = self._create_fallback_response(result, input_text)
                
            else:
                # Use simple chain
                format_instructions = self.output_parser.get_format_instructions()
                result = await self.chain.arun(
                    input=input_text,
                    format_instructions=format_instructions
                )
            
            # Store in Redis for learning
            await self._store_interaction(user_id, data, result)
            
            return {
                "agent": self.name,
                "specialty": self.specialty,
                "analysis": result,
                "timestamp": datetime.now().isoformat(),
                "user_id": user_id
            }
            
        except Exception as e:
            # Fallback response
            return {
                "agent": self.name,
                "error": str(e),
                "fallback_analysis": "Error en el análisis. Por favor intenta de nuevo.",
                "timestamp": datetime.now().isoformat()
            }
    
    def _create_fallback_response(self, result_text: str, input_data: str):
        """Create a fallback response when parsing fails"""
        # This is a simplified fallback - in practice, you'd want more sophisticated handling
        return {
            "analysis_text": result_text,
            "recommendations": [],
            "citations": []
        }
    
    def _prepare_input(self, data: Dict[str, Any]) -> str:
        """Prepare input data for the agent"""
        return json.dumps(data, indent=2)
    
    async def _store_interaction(self, user_id: str, input_data: Dict[str, Any], result: Any):
        """Store interaction for learning system"""
        interaction_key = f"agent_interaction:{self.name}:{user_id}:{datetime.now().isoformat()}"
        interaction_data = {
            "agent": self.name,
            "user_id": user_id,
            "input_data": input_data,
            "result": result.dict() if hasattr(result, 'dict') else str(result),
            "timestamp": datetime.now().isoformat()
        }
        
        redis_service.redis_client.setex(
            interaction_key,
            7 * 24 * 60 * 60,  # 7 days
            json.dumps(interaction_data)
        )

class MayaCashFlowAgent(BaseLangChainAgent):
    """Maya - Especialista en Optimización de Flujo de Caja"""
    
    def __init__(self):
        system_prompt = """
        Eres Maya, una especialista experta en optimización de flujo de caja con más de 15 años de experiencia 
        en finanzas corporativas. Tu misión es analizar patrones de flujo de caja, identificar riesgos de liquidez 
        y proporcionar recomendaciones específicas para optimizar la gestión de efectivo.
        
        Características de tu análisis:
        - Identifica patrones estacionales y cíclicos
        - Calcula métricas clave de liquidez con precisión
        - Proporciona recomendaciones prácticas y accionables
        - Considera el contexto específico del negocio
        - Prioriza la estabilidad financiera a largo plazo
        
        Siempre sé específica con números, fechas y acciones concretas.
        """
        
        super().__init__(
            name="Maya - Cash Flow Optimizer",
            specialty="Optimización de Flujo de Caja",
            system_prompt=system_prompt,
            response_model=CashFlowAnalysis
        )
    
    def _prepare_input(self, data: Dict[str, Any]) -> str:
        current_balance = data.get('current_balance', 0)
        monthly_expenses = data.get('monthly_expenses', 0)
        cash_flow_history = data.get('cash_flow_history', [])
        receivables = data.get('accounts_receivable', 0)
        payables = data.get('accounts_payable', 0)
        
        return f"""
        Analiza el siguiente flujo de caja empresarial:
        
        SITUACIÓN ACTUAL:
        - Balance de efectivo: ${current_balance:,.2f}
        - Gastos mensuales promedio: ${monthly_expenses:,.2f}
        - Cuentas por cobrar: ${receivables:,.2f}
        - Cuentas por pagar: ${payables:,.2f}
        
        HISTORIAL DE FLUJO DE CAJA:
        {json.dumps(cash_flow_history, indent=2)}
        
        Proporciona un análisis completo incluyendo:
        1. Cálculo preciso de meses de runway
        2. Evaluación del nivel de riesgo de liquidez
        3. Identificación de patrones estacionales
        4. Recomendaciones específicas de optimización
        5. Fecha sugerida para próxima revisión
        """

class CarlosUnitEconomicsAgent(BaseLangChainAgent):
    """Carlos - Analista de Unit Economics"""
    
    def __init__(self):
        system_prompt = """
        Soy Carlos, analista senior especializado en Unit Economics con experiencia en startups y empresas 
        de crecimiento. Mi expertise incluye optimización de LTV/CAC, análisis de cohortes, y estrategias 
        de monetización. 
        
        Mi enfoque analítico:
        - Benchmarking contra estándares de la industria
        - Análisis profundo de cohorts de clientes
        - Identificación de oportunidades de optimización
        - Proyecciones basadas en data histórica
        - Recomendaciones para mejorar unit economics
        
        Proporciono insights accionables con métricas específicas y timelines claros.
        """
        
        super().__init__(
            name="Carlos - Unit Economics Analyst",
            specialty="Análisis de Unit Economics",
            system_prompt=system_prompt,
            response_model=UnitEconomicsAnalysis
        )
    
    def _prepare_input(self, data: Dict[str, Any]) -> str:
        ltv = data.get('ltv', 0)
        cac = data.get('cac', 0)
        churn_rate = data.get('churn_rate', 0)
        arpu = data.get('arpu', 0)
        customer_count = data.get('customer_count', 0)
        cohort_data = data.get('cohort_data', {})
        
        return f"""
        Analiza las siguientes métricas de unit economics:
        
        MÉTRICAS PRINCIPALES:
        - Customer Lifetime Value (LTV): ${ltv:,.2f}
        - Customer Acquisition Cost (CAC): ${cac:,.2f}
        - Ratio LTV/CAC: {(ltv/cac if cac > 0 else 0):.2f}
        - Tasa de Churn mensual: {churn_rate:.2%}
        - Average Revenue Per User (ARPU): ${arpu:,.2f}
        - Total de clientes: {customer_count:,}
        
        DATOS DE COHORTES:
        {json.dumps(cohort_data, indent=2)}
        
        Proporciona análisis completo incluyendo:
        1. Evaluación de la salud de unit economics vs benchmarks
        2. Cálculo de payback period y métricas derivadas
        3. Análisis de performance por cohorte
        4. Oportunidades específicas de optimización
        5. Métricas objetivo recomendadas
        """

class SofiaGrowthAgent(BaseLangChainAgent):
    """Sofia - Estratega de Crecimiento"""
    
    def __init__(self):
        system_prompt = """
        Soy Sofia, estratega de crecimiento con experiencia en escalamiento de empresas tecnológicas. 
        Mi especialidad es identificar oportunidades de crecimiento sostenible y diseñar roadmaps 
        de expansión basados en data.
        
        Mi metodología incluye:
        - Análisis de market opportunity y TAM/SAM/SOM
        - Identificación de growth levers más efectivos
        - Diseño de experimentos de crecimiento
        - Optimización de funnels de conversión
        - Estrategias de product-market fit
        
        Proporciono roadmaps detallados con métricas de éxito y resource requirements.
        """
        
        super().__init__(
            name="Sofia - Growth Strategist",
            specialty="Estrategia de Crecimiento",
            system_prompt=system_prompt,
            response_model=GrowthStrategy
        )
    
    def _prepare_input(self, data: Dict[str, Any]) -> str:
        growth_rate = data.get('growth_rate', 0)
        revenue_trend = data.get('revenue_trend', [])
        market_size = data.get('market_size', 0)
        current_revenue = data.get('current_revenue', 0)
        channels = data.get('acquisition_channels', {})
        
        return f"""
        Desarrolla estrategia de crecimiento basada en:
        
        MÉTRICAS DE CRECIMIENTO:
        - Tasa de crecimiento mensual: {growth_rate:.2f}%
        - Revenue actual: ${current_revenue:,.2f}
        - Tamaño de mercado (TAM): ${market_size:,.2f}
        - Penetración de mercado: {(current_revenue/market_size*100 if market_size > 0 else 0):.3f}%
        
        TENDENCIA DE REVENUE:
        {json.dumps(revenue_trend, indent=2)}
        
        CANALES DE ADQUISICIÓN:
        {json.dumps(channels, indent=2)}
        
        Diseña estrategia integral incluyendo:
        1. Assessment del potencial de crecimiento
        2. Identificación de growth levers principales
        3. Roadmap de expansión priorizado
        4. Resource requirements y timeline
        5. KPIs específicos para tracking
        """

class AlexRiskAgent(BaseLangChainAgent):
    """Alex - Especialista en Evaluación de Riesgos"""
    
    def __init__(self):
        system_prompt = """
        Soy Alex, especialista en gestión de riesgos financieros con certificación FRM y experiencia 
        en risk assessment corporativo. Mi enfoque es identificar, cuantificar y mitigar riesgos 
        que puedan impactar la estabilidad financiera.
        
        Mi framework de análisis:
        - Evaluación cuantitativa de probabilidad e impacto
        - Desarrollo de matrices de riesgo
        - Diseño de sistemas de alerta temprana
        - Planes de contingencia específicos
        - Stress testing de escenarios adversos
        
        Proporciono análisis objetivos con scoring cuantitativo y planes de acción específicos.
        """
        
        super().__init__(
            name="Alex - Risk Assessment Specialist",
            specialty="Evaluación y Gestión de Riesgos",
            system_prompt=system_prompt,
            response_model=RiskAssessment
        )
    
    def _prepare_input(self, data: Dict[str, Any]) -> str:
        debt_ratio = data.get('debt_to_equity', 0)
        concentration = data.get('customer_concentration', 0)
        burn_rate = data.get('burn_rate', 0)
        volatility = data.get('revenue_volatility', 0)
        cash_balance = data.get('cash_balance', 0)
        
        return f"""
        Evalúa el perfil de riesgo empresarial:
        
        INDICADORES DE RIESGO:
        - Ratio Deuda/Capital: {debt_ratio:.2f}
        - Concentración top cliente: {concentration:.1f}%
        - Burn rate mensual: ${burn_rate:,.2f}
        - Volatilidad de ingresos: {volatility:.1f}%
        - Balance de efectivo: ${cash_balance:,.2f}
        - Runway: {(cash_balance/burn_rate if burn_rate > 0 else 0):.1f} meses
        
        CONTEXTO ADICIONAL:
        {json.dumps(data.get('risk_context', {}), indent=2)}
        
        Proporciona evaluación completa incluyendo:
        1. Scoring cuantitativo de riesgo overall (0-100)
        2. Análisis por categorías de riesgo
        3. Estrategias específicas de mitigación
        4. Dashboard de KPIs para monitoreo
        5. Planes de contingencia por escenario
        """

class DianaPerformanceAgent(BaseLangChainAgent):
    """Diana - Optimizadora de Rendimiento"""
    
    def __init__(self):
        system_prompt = """
        Soy Diana, consultora en optimización de performance operacional con expertise en lean management 
        y transformación digital. Mi misión es identificar ineficiencias y diseñar mejoras que 
        maximicen la productividad y rentabilidad.
        
        Mi metodología incluye:
        - Análisis de eficiencia por proceso y departamento
        - Identificación de automation opportunities
        - Benchmarking de productividad vs industria
        - Diseño de KPIs y dashboards de performance
        - ROI analysis de iniciativas de mejora
        
        Proporciono roadmaps de optimización con quick wins y proyectos de largo plazo.
        """
        
        super().__init__(
            name="Diana - Performance Optimizer",
            specialty="Optimización de Rendimiento Operacional",
            system_prompt=system_prompt,
            response_model=PerformanceOptimization
        )
    
    def _prepare_input(self, data: Dict[str, Any]) -> str:
        operating_margin = data.get('operating_margin', 0)
        revenue_per_employee = data.get('revenue_per_employee', 0)
        automation_level = data.get('automation_percentage', 0)
        process_efficiency = data.get('process_efficiency_score', 0)
        department_metrics = data.get('department_metrics', {})
        
        return f"""
        Optimiza el rendimiento operacional basado en:
        
        MÉTRICAS DE EFICIENCIA:
        - Margen operativo: {operating_margin:.1f}%
        - Revenue por empleado: ${revenue_per_employee:,.2f}
        - Nivel de automatización: {automation_level:.1f}%
        - Score de eficiencia de procesos: {process_efficiency:.0f}/100
        
        MÉTRICAS POR DEPARTAMENTO:
        {json.dumps(department_metrics, indent=2)}
        
        ANÁLISIS DE PROCESOS:
        {json.dumps(data.get('process_analysis', {}), indent=2)}
        
        Desarrolla plan de optimización incluyendo:
        1. Score de eficiencia actual vs potencial
        2. Identificación específica de bottlenecks
        3. Oportunidades de automatización priorizadas
        4. Mejoras de productividad por área
        5. Estimación de cost savings y ROI
        """

class LangChainAgentManager:
    """Manager for LangChain-powered AI agents"""
    
    def __init__(self):
        self.agents = {
            "maya": MayaCashFlowAgent(),
            "carlos": CarlosUnitEconomicsAgent(),
            "sofia": SofiaGrowthAgent(),
            "alex": AlexRiskAgent(),
            "diana": DianaPerformanceAgent()
        }
        
        # Initialize conversation memories for each agent
        self.memories = {
            agent_id: ConversationBufferWindowMemory(
                k=5,  # Keep last 5 interactions
                return_messages=True
            ) for agent_id in self.agents.keys()
        }
    
    def get_available_agents(self) -> List[Dict[str, str]]:
        """Get list of available agents with their specialties"""
        return [
            {
                "id": agent_id,
                "name": agent.name,
                "specialty": agent.specialty,
                "description": f"Especialista en {agent.specialty.lower()} usando IA avanzada",
                "technology": "LangChain + OpenAI GPT-4 + Pydantic"
            }
            for agent_id, agent in self.agents.items()
        ]
    
    async def consult_agent(self, agent_id: str, user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Consult with a specific LangChain agent"""
        if agent_id not in self.agents:
            raise ValueError(f"Agent {agent_id} not found")
        
        agent = self.agents[agent_id]
        
        try:
            result = await agent.process_request(user_id, data)
            
            # Update conversation memory
            if agent_id in self.memories:
                self.memories[agent_id].chat_memory.add_user_message(
                    f"Data: {json.dumps(data, indent=2)}"
                )
                self.memories[agent_id].chat_memory.add_ai_message(
                    f"Analysis: {json.dumps(result, indent=2)}"
                )
            
            return result
            
        except Exception as e:
            return {
                "agent": agent.name,
                "error": str(e),
                "status": "error",
                "message": "Error en el análisis del agente. Intenta de nuevo.",
                "timestamp": datetime.now().isoformat()
            }
    
    async def multi_agent_consultation(self, user_id: str, comprehensive_data: Dict[str, Any]) -> Dict[str, Any]:
        """Get comprehensive analysis from multiple relevant agents"""
        
        # Determine relevant agents based on data
        relevant_agents = self._determine_relevant_agents(comprehensive_data)
        
        # Consult each relevant agent
        agent_results = {}
        for agent_id in relevant_agents:
            try:
                result = await self.consult_agent(agent_id, user_id, comprehensive_data)
                agent_results[agent_id] = result
            except Exception as e:
                agent_results[agent_id] = {
                    "error": str(e),
                    "agent": self.agents[agent_id].name
                }
        
        # Generate executive summary
        executive_summary = await self._generate_executive_summary(agent_results, comprehensive_data)
        
        return {
            "consultation_type": "multi_agent_analysis",
            "agents_consulted": len(relevant_agents),
            "agent_results": agent_results,
            "executive_summary": executive_summary,
            "timestamp": datetime.now().isoformat(),
            "user_id": user_id
        }
    
    def _determine_relevant_agents(self, data: Dict[str, Any]) -> List[str]:
        """Determine which agents are most relevant for the given data"""
        relevant = []
        
        # Cash flow related data
        if any(key in data for key in ['current_balance', 'cash_flow_history', 'burn_rate']):
            relevant.append('maya')
        
        # Unit economics data
        if any(key in data for key in ['ltv', 'cac', 'churn_rate', 'arpu']):
            relevant.append('carlos')
        
        # Growth related data
        if any(key in data for key in ['growth_rate', 'market_size', 'revenue_trend']):
            relevant.append('sofia')
        
        # Risk indicators
        if any(key in data for key in ['debt_to_equity', 'customer_concentration', 'revenue_volatility']):
            relevant.append('alex')
        
        # Performance metrics
        if any(key in data for key in ['operating_margin', 'revenue_per_employee', 'automation_percentage']):
            relevant.append('diana')
        
        # If no specific indicators, use all agents
        if not relevant:
            relevant = list(self.agents.keys())
        
        return relevant
    
    async def _generate_executive_summary(self, agent_results: Dict[str, Any], data: Dict[str, Any]) -> str:
        """Generate executive summary from multi-agent analysis"""
        
        summary_prompt = f"""
        Como consultor ejecutivo senior, sintetiza los siguientes análisis de agentes especializados 
        en un resumen ejecutivo conciso para el CEO/Founder:
        
        DATOS ANALIZADOS:
        {json.dumps(data, indent=2)}
        
        ANÁLISIS DE AGENTES:
        {json.dumps(agent_results, indent=2)}
        
        Proporciona un resumen ejecutivo que incluya:
        1. Estado general del negocio (2-3 líneas)
        2. Top 3 oportunidades identificadas
        3. Top 3 riesgos que requieren atención
        4. Recomendaciones prioritarias (máximo 5)
        5. Métricas clave a monitorear
        
        Mantén el resumen bajo 200 palabras, enfocado en insights accionables.
        """
        
        try:
            # Use one of the agents' LLM for summary generation
            llm = list(self.agents.values())[0].llm
            response = await llm.agenerate([[HumanMessage(content=summary_prompt)]])
            return response.generations[0][0].text
        except Exception as e:
            return f"Resumen ejecutivo: Análisis completado por {len(agent_results)} agentes especializados. Revisa los análisis individuales para insights detallados."

# Global instance
langchain_agent_manager = LangChainAgentManager()