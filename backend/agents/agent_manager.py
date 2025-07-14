"""
KatalisApp AI Agent Manager - Sistema de Agentes Especializados
Tecnología de punta para análisis financiero automatizado
"""
from typing import Dict, Any, List, Optional
from datetime import datetime
import json
from services.ai_service import ai_service
from services.redis_service import redis_service

class FinancialAgent:
    """Base class for all financial agents"""
    def __init__(self, name: str, specialty: str, description: str):
        self.name = name
        self.specialty = specialty
        self.description = description
        self.conversations = []
        
    async def process_request(self, user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Process a request with agent-specific logic"""
        raise NotImplementedError

class CashFlowOptimizer(FinancialAgent):
    """Maya - Especialista en Optimización de Flujo de Caja"""
    
    def __init__(self):
        super().__init__(
            name="Maya - Cash Flow Optimizer",
            specialty="Optimización de Flujo de Caja",
            description="Especialista en predicción, análisis y optimización de flujo de caja. Identifica patrones estacionales, predice déficits y sugiere estrategias de mejora."
        )
    
    async def process_request(self, user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze cash flow patterns and provide optimization recommendations"""
        
        # Extract cash flow data
        cash_flow_data = data.get('cash_flow_history', [])
        current_balance = data.get('current_balance', 0)
        monthly_expenses = data.get('monthly_expenses', 0)
        
        # AI-powered analysis
        prompt = f"""
        Como Maya, especialista en optimización de flujo de caja, analiza los siguientes datos:
        
        Balance actual: ${current_balance:,.2f}
        Gastos mensuales: ${monthly_expenses:,.2f}
        Historial de flujo de caja: {json.dumps(cash_flow_data, indent=2)}
        
        Proporciona:
        1. Análisis de patrones y tendencias
        2. Identificación de riesgos de liquidez
        3. Recomendaciones específicas de optimización
        4. Proyección de flujo de caja próximos 3 meses
        5. Estrategias de mejora del ciclo de conversión de efectivo
        
        Sé específica y práctica en tus recomendaciones.
        """
        
        analysis = await ai_service.chat_with_user(user_id, prompt, {
            "agent": "Maya",
            "specialty": "cash_flow_optimization",
            "data_context": data
        })
        
        # Calculate additional metrics
        runway_months = current_balance / monthly_expenses if monthly_expenses > 0 else float('inf')
        risk_level = "Alto" if runway_months < 3 else "Medio" if runway_months < 6 else "Bajo"
        
        return {
            "agent": self.name,
            "analysis": analysis,
            "metrics": {
                "runway_months": round(runway_months, 1),
                "risk_level": risk_level,
                "liquidity_ratio": round(current_balance / monthly_expenses, 2) if monthly_expenses > 0 else 0
            },
            "recommendations": [
                "Mantener reserva mínima de 6 meses de gastos operativos",
                "Implementar pronóstico semanal de flujo de caja",
                "Optimizar términos de pago con proveedores y clientes",
                "Establecer línea de crédito preventiva"
            ],
            "timestamp": datetime.now().isoformat()
        }

class UnitEconomicsAnalyst(FinancialAgent):
    """Carlos - Analista de Unit Economics"""
    
    def __init__(self):
        super().__init__(
            name="Carlos - Unit Economics Analyst",
            specialty="Análisis de Unit Economics",
            description="Experto en métricas de negocio por unidad: LTV, CAC, payback period, churn. Optimiza la rentabilidad por cliente y canales de adquisición."
        )
    
    async def process_request(self, user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze unit economics and provide optimization insights"""
        
        # Extract unit economics data
        ltv = data.get('ltv', 0)
        cac = data.get('cac', 0)
        churn_rate = data.get('churn_rate', 0)
        avg_revenue_per_user = data.get('arpu', 0)
        customer_count = data.get('customer_count', 0)
        
        prompt = f"""
        Como Carlos, analista experto en Unit Economics, evalúa estas métricas:
        
        LTV (Customer Lifetime Value): ${ltv:,.2f}
        CAC (Customer Acquisition Cost): ${cac:,.2f}
        Ratio LTV/CAC: {ltv/cac:.2f} si CAC > 0 else "N/A"
        Churn Rate: {churn_rate:.2%}
        ARPU (Revenue per User): ${avg_revenue_per_user:,.2f}
        Total Customers: {customer_count:,}
        
        Analiza:
        1. Salud general de las unit economics
        2. Benchmarks vs industria (tecnología/SaaS)
        3. Oportunidades de optimización del LTV
        4. Estrategias de reducción del CAC
        5. Impacto de mejorar retención (reducir churn)
        6. Segmentación de clientes por rentabilidad
        
        Proporciona recomendaciones accionables y métricas objetivo.
        """
        
        analysis = await ai_service.chat_with_user(user_id, prompt, {
            "agent": "Carlos",
            "specialty": "unit_economics",
            "data_context": data
        })
        
        # Calculate health scores
        ltv_cac_ratio = ltv / cac if cac > 0 else 0
        payback_months = cac / (avg_revenue_per_user * (1 - churn_rate)) if avg_revenue_per_user > 0 and churn_rate < 1 else 0
        
        health_score = "Excelente" if ltv_cac_ratio > 3 else "Bueno" if ltv_cac_ratio > 2 else "Regular" if ltv_cac_ratio > 1 else "Crítico"
        
        return {
            "agent": self.name,
            "analysis": analysis,
            "metrics": {
                "ltv_cac_ratio": round(ltv_cac_ratio, 2),
                "payback_months": round(payback_months, 1),
                "health_score": health_score,
                "monthly_cohort_value": round(avg_revenue_per_user * customer_count, 2)
            },
            "optimization_opportunities": [
                f"Mejorar retención 5% aumentaría LTV en {(ltv * 1.05 - ltv):,.0f}",
                f"Reducir CAC 10% mejoraría ratio LTV/CAC a {(ltv / (cac * 0.9)):.2f}",
                "Implementar upselling/cross-selling para aumentar ARPU",
                "Segmentar canales de adquisición por ROI"
            ],
            "timestamp": datetime.now().isoformat()
        }

class GrowthStrategist(FinancialAgent):
    """Sofia - Estratega de Crecimiento"""
    
    def __init__(self):
        super().__init__(
            name="Sofia - Growth Strategist",
            specialty="Estrategia de Crecimiento",
            description="Especialista en escalamiento rentable. Analiza oportunidades de mercado, optimiza canales de crecimiento y diseña estrategias de expansión sostenible."
        )
    
    async def process_request(self, user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze growth opportunities and create scaling strategies"""
        
        growth_rate = data.get('growth_rate', 0)
        revenue_trend = data.get('revenue_trend', [])
        market_size = data.get('market_size', 0)
        current_revenue = data.get('current_revenue', 0)
        
        prompt = f"""
        Como Sofia, estratega de crecimiento, analiza esta situación:
        
        Tasa de crecimiento actual: {growth_rate:.1f}% mensual
        Revenue actual: ${current_revenue:,.2f}
        Tendencia de ingresos: {json.dumps(revenue_trend)}
        Tamaño de mercado: ${market_size:,.2f}
        
        Desarrolla estrategia de crecimiento considerando:
        1. Análisis de la tasa de crecimiento actual vs potencial
        2. Identificación de cuellos de botella para el escalamiento
        3. Oportunidades de expansión de mercado
        4. Estrategias de pricing para acelerar crecimiento
        5. Canales de distribución no explorados
        6. Partnerships estratégicos potenciales
        7. Timeline y métricas para objetivos de crecimiento
        
        Prioriza iniciativas por impacto vs esfuerzo.
        """
        
        analysis = await ai_service.chat_with_user(user_id, prompt, {
            "agent": "Sofia",
            "specialty": "growth_strategy",
            "data_context": data
        })
        
        # Calculate growth projections
        monthly_growth = growth_rate / 100
        projected_6m = current_revenue * ((1 + monthly_growth) ** 6)
        projected_12m = current_revenue * ((1 + monthly_growth) ** 12)
        market_penetration = (current_revenue / market_size * 100) if market_size > 0 else 0
        
        return {
            "agent": self.name,
            "analysis": analysis,
            "projections": {
                "revenue_6_months": round(projected_6m, 2),
                "revenue_12_months": round(projected_12m, 2),
                "market_penetration": round(market_penetration, 2),
                "growth_runway": "Alta" if market_penetration < 1 else "Media" if market_penetration < 5 else "Baja"
            },
            "growth_initiatives": [
                "Optimización de conversión en funnel de ventas",
                "Expansión a segmentos de mercado adyacentes",
                "Implementación de modelo freemium/trial",
                "Marketing de contenidos para SEO orgánico",
                "Programa de referidos para crecimiento viral"
            ],
            "kpis_to_track": [
                "Customer Acquisition Rate",
                "Revenue Growth Rate",
                "Market Share Expansion",
                "Channel Performance",
                "Product-Market Fit Score"
            ],
            "timestamp": datetime.now().isoformat()
        }

class RiskAssessmentSpecialist(FinancialAgent):
    """Alex - Especialista en Evaluación de Riesgos"""
    
    def __init__(self):
        super().__init__(
            name="Alex - Risk Assessment Specialist",
            specialty="Evaluación y Gestión de Riesgos",
            description="Experto en identificación, cuantificación y mitigación de riesgos financieros. Desarrolla planes de contingencia y sistemas de alerta temprana."
        )
    
    async def process_request(self, user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Assess financial risks and provide mitigation strategies"""
        
        debt_to_equity = data.get('debt_to_equity', 0)
        concentration_risk = data.get('customer_concentration', 0)
        burn_rate = data.get('burn_rate', 0)
        revenue_volatility = data.get('revenue_volatility', 0)
        
        prompt = f"""
        Como Alex, especialista en riesgos financieros, evalúa estos indicadores:
        
        Ratio Deuda/Capital: {debt_to_equity:.2f}
        Concentración de clientes: {concentration_risk:.1f}% (top cliente)
        Burn rate mensual: ${burn_rate:,.2f}
        Volatilidad de ingresos: {revenue_volatility:.1f}%
        
        Evalúa riesgos en:
        1. Riesgo de liquidez y solvencia
        2. Riesgo de concentración de clientes
        3. Riesgo operacional y de mercado
        4. Riesgo de flujo de caja
        5. Riesgos regulatorios y de compliance
        6. Riesgo tecnológico y ciberseguridad
        
        Para cada riesgo identifica:
        - Probabilidad (Alta/Media/Baja)
        - Impacto (Crítico/Alto/Medio/Bajo)
        - Estrategias de mitigación específicas
        - KPIs de monitoreo
        """
        
        analysis = await ai_service.chat_with_user(user_id, prompt, {
            "agent": "Alex",
            "specialty": "risk_assessment",
            "data_context": data
        })
        
        # Calculate risk scores
        liquidity_risk = "Alto" if burn_rate > 0 and (data.get('cash_balance', 0) / burn_rate) < 6 else "Medio" if (data.get('cash_balance', 0) / burn_rate) < 12 else "Bajo"
        concentration_risk_level = "Alto" if concentration_risk > 25 else "Medio" if concentration_risk > 15 else "Bajo"
        financial_risk = "Alto" if debt_to_equity > 2 else "Medio" if debt_to_equity > 1 else "Bajo"
        
        return {
            "agent": self.name,
            "analysis": analysis,
            "risk_matrix": {
                "liquidity_risk": liquidity_risk,
                "concentration_risk": concentration_risk_level,
                "financial_risk": financial_risk,
                "overall_risk_score": "Alto" if any(r == "Alto" for r in [liquidity_risk, concentration_risk_level, financial_risk]) else "Medio"
            },
            "mitigation_plan": [
                "Diversificar base de clientes para reducir concentración",
                "Establecer líneas de crédito de contingencia",
                "Implementar dashboard de monitoreo en tiempo real",
                "Crear plan de contingencia para escenarios adversos",
                "Revisar y optimizar estructura de capital"
            ],
            "monitoring_kpis": [
                "Días de efectivo disponible",
                "% de ingresos del top 5 clientes",
                "Ratio de cobertura de intereses",
                "Variabilidad mensual de ingresos",
                "Tiempo promedio de cobranza"
            ],
            "timestamp": datetime.now().isoformat()
        }

class PerformanceOptimizer(FinancialAgent):
    """Diana - Optimizadora de Rendimiento"""
    
    def __init__(self):
        super().__init__(
            name="Diana - Performance Optimizer",
            specialty="Optimización de Rendimiento Operacional",
            description="Especialista en eficiencia operativa y optimización de KPIs. Identifica cuellos de botella, automatizaciones y mejoras de productividad."
        )
    
    async def process_request(self, user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize operational performance and efficiency"""
        
        operating_margin = data.get('operating_margin', 0)
        employee_productivity = data.get('revenue_per_employee', 0)
        automation_level = data.get('automation_percentage', 0)
        process_efficiency = data.get('process_efficiency_score', 0)
        
        prompt = f"""
        Como Diana, especialista en optimización de rendimiento, analiza:
        
        Margen operativo: {operating_margin:.1f}%
        Ingresos por empleado: ${employee_productivity:,.2f}
        Nivel de automatización: {automation_level:.1f}%
        Score de eficiencia de procesos: {process_efficiency:.1f}/100
        
        Optimiza rendimiento en:
        1. Análisis de eficiencia operativa actual
        2. Identificación de procesos ineficientes
        3. Oportunidades de automatización
        4. Optimización de recursos humanos
        5. Mejora de productividad por departamento
        6. KPIs de rendimiento y benchmarks
        7. ROI de iniciativas de optimización
        
        Prioriza mejoras con mayor impacto en rentabilidad.
        """
        
        analysis = await ai_service.chat_with_user(user_id, prompt, {
            "agent": "Diana",
            "specialty": "performance_optimization",
            "data_context": data
        })
        
        # Calculate efficiency scores
        productivity_score = "Excelente" if employee_productivity > 200000 else "Bueno" if employee_productivity > 150000 else "Regular" if employee_productivity > 100000 else "Bajo"
        automation_score = "Alto" if automation_level > 70 else "Medio" if automation_level > 40 else "Bajo"
        
        return {
            "agent": self.name,
            "analysis": analysis,
            "efficiency_scores": {
                "productivity_level": productivity_score,
                "automation_readiness": automation_score,
                "operational_efficiency": f"{process_efficiency:.0f}/100",
                "improvement_potential": f"{max(0, 100 - process_efficiency):.0f}% de mejora posible"
            },
            "optimization_roadmap": [
                "Automatizar procesos manuales repetitivos",
                "Implementar dashboards de KPIs en tiempo real",
                "Optimizar flujos de trabajo interdepartamentales",
                "Capacitar equipos en mejores prácticas",
                "Establecer métricas de productividad por rol"
            ],
            "quick_wins": [
                "Automatizar reportes financieros mensuales",
                "Digitalizar procesos de aprobación",
                "Implementar herramientas de comunicación eficiente",
                "Optimizar reuniones y tiempo de coordinación"
            ],
            "timestamp": datetime.now().isoformat()
        }

class AgentManager:
    """Manager for all AI agents in KatalisApp"""
    
    def __init__(self):
        self.agents = {
            "maya": CashFlowOptimizer(),
            "carlos": UnitEconomicsAnalyst(),
            "sofia": GrowthStrategist(),
            "alex": RiskAssessmentSpecialist(),
            "diana": PerformanceOptimizer()
        }
    
    def get_available_agents(self) -> List[Dict[str, str]]:
        """Get list of available agents"""
        return [
            {
                "id": agent_id,
                "name": agent.name,
                "specialty": agent.specialty,
                "description": agent.description
            }
            for agent_id, agent in self.agents.items()
        ]
    
    async def consult_agent(self, agent_id: str, user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Consult with a specific agent"""
        if agent_id not in self.agents:
            raise ValueError(f"Agent {agent_id} not found")
        
        agent = self.agents[agent_id]
        result = await agent.process_request(user_id, data)
        
        # Store consultation in Redis for learning system
        consultation_key = f"agent_consultation:{user_id}:{agent_id}:{datetime.now().isoformat()}"
        redis_service.redis_client.setex(
            consultation_key,
            24 * 60 * 60,  # 24 hours
            json.dumps({
                "agent_id": agent_id,
                "user_id": user_id,
                "input_data": data,
                "result": result,
                "timestamp": datetime.now().isoformat()
            })
        )
        
        return result
    
    async def multi_agent_analysis(self, user_id: str, comprehensive_data: Dict[str, Any]) -> Dict[str, Any]:
        """Get analysis from multiple relevant agents"""
        
        # Determine which agents are most relevant
        relevant_agents = []
        
        if 'cash_flow' in comprehensive_data or 'current_balance' in comprehensive_data:
            relevant_agents.append('maya')
        
        if 'ltv' in comprehensive_data or 'cac' in comprehensive_data:
            relevant_agents.append('carlos')
        
        if 'growth_rate' in comprehensive_data:
            relevant_agents.append('sofia')
        
        if 'debt_to_equity' in comprehensive_data or 'burn_rate' in comprehensive_data:
            relevant_agents.append('alex')
        
        if 'operating_margin' in comprehensive_data:
            relevant_agents.append('diana')
        
        # If no specific data, use all agents
        if not relevant_agents:
            relevant_agents = list(self.agents.keys())
        
        # Get analysis from each relevant agent
        results = {}
        for agent_id in relevant_agents:
            try:
                results[agent_id] = await self.consult_agent(agent_id, user_id, comprehensive_data)
            except Exception as e:
                results[agent_id] = {
                    "error": str(e),
                    "agent": self.agents[agent_id].name
                }
        
        return {
            "multi_agent_analysis": results,
            "summary": f"Consulta realizada con {len(relevant_agents)} agentes especializados",
            "timestamp": datetime.now().isoformat()
        }

# Global instance
agent_manager = AgentManager()