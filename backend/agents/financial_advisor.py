"""
Agente de Asesoría Financiera Inteligente usando PydanticAI
Basado en los conceptos del libro "Finanzas para Emprendedores"
"""

from typing import Dict, List, Optional, Union
from pydantic import BaseModel, Field
from pydantic_ai import Agent, RunContext
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
import os
from services.dual_ai_service import dual_ai_service, TaskComplexity

# Modelos de datos financieros
class FinancialMetrics(BaseModel):
    """Métricas financieras básicas"""
    revenue: float = Field(description="Ingresos totales")
    expenses: float = Field(description="Gastos totales")
    net_profit: float = Field(description="Utilidad neta")
    cash_flow: float = Field(description="Flujo de caja")
    ltv: float = Field(description="Lifetime Value del cliente")
    coca: float = Field(description="Costo de adquisición de cliente")
    fixed_costs: float = Field(description="Costos fijos mensuales")
    variable_costs: float = Field(description="Costos variables por unidad")
    
class UnitEconomics(BaseModel):
    """Datos de Unit Economics"""
    price_per_unit: float
    variable_cost_per_unit: float
    marketing_spend: float
    new_customers: float
    avg_purchase_frequency: float
    retention_months: float

class BusinessContext(BaseModel):
    """Contexto completo del negocio"""
    industry: str = Field(description="Sector o industria del negocio")
    business_stage: str = Field(description="Etapa del negocio: startup, growth, mature")
    monthly_revenue: float = Field(description="Ingresos mensuales promedio")
    employee_count: int = Field(description="Número de empleados")
    months_operating: int = Field(description="Meses en operación")

class FinancialRecommendation(BaseModel):
    """Recomendación financiera estructurada"""
    category: str = Field(description="Categoría: costos, pricing, marketing, cash_flow, growth")
    priority: str = Field(description="Alta, Media, Baja")
    title: str = Field(description="Título de la recomendación")
    description: str = Field(description="Descripción detallada")
    potential_impact: str = Field(description="Impacto potencial esperado")
    implementation_steps: List[str] = Field(description="Pasos para implementar")
    estimated_time: str = Field(description="Tiempo estimado de implementación")
    risk_level: str = Field(description="Bajo, Medio, Alto")

class BusinessAnalysis(BaseModel):
    """Análisis completo del negocio"""
    overall_health: str = Field(description="Excelente, Bueno, Regular, Crítico")
    key_strengths: List[str] = Field(description="Fortalezas principales identificadas")
    areas_of_concern: List[str] = Field(description="Áreas que requieren atención")
    growth_opportunities: List[str] = Field(description="Oportunidades de crecimiento")
    financial_recommendations: List[FinancialRecommendation] = Field(description="Recomendaciones específicas")

# Configuración dinámica del modelo según disponibilidad
def get_ai_model_config():
    """Determina qué modelo usar según APIs disponibles"""
    status = dual_ai_service.get_service_status()
    
    if status['deepseek_available']:
        return 'deepseek:deepseek-reasoner'  # DeepSeek R1 para análisis complejo
    elif status['openai_available']:
        return 'openai:gpt-4o-mini'  # Fallback a OpenAI
    else:
        return 'mock:financial-advisor'  # Mock para desarrollo

# Agente especializado en análisis financiero
financial_advisor_agent = Agent(
    get_ai_model_config(),
    result_type=BusinessAnalysis,
    system_prompt="""
    Eres un consultor financiero experto especializado en PyMEs y emprendimientos, 
    con profundo conocimiento del libro "Finanzas para Emprendedores".
    
    Tu rol es analizar métricas financieras y proporcionar insights accionables basados en:
    
    1. UNIT ECONOMICS (Capítulo 5):
       - Analiza LTV/COCA ratios
       - Evalúa margen de contribución
       - Determina viabilidad del modelo de negocio
    
    2. FLUJO DE CAJA (Capítulos 3-4):
       - Evalúa salud del flujo de efectivo
       - Identifica riesgos de liquidez
       - Proyecta necesidades futuras
    
    3. COSTOS Y PRECIOS (Capítulos 6-9):
       - Analiza estructura de costos
       - Evalúa estrategias de pricing
       - Calcula puntos de equilibrio
    
    4. RENTABILIDAD (Capítulos 10-12):
       - Evalúa márgenes y ROI
       - Analiza centros de ganancia
       - Identifica inversiones prioritarias
    
    5. PLANEACIÓN FINANCIERA (Capítulos 13-15):
       - Evalúa cumplimiento de metas
       - Analiza escenarios futuros
       - Recomienda ajustes estratégicos
    
    PRINCIPIOS DE ANÁLISIS:
    - Sé específico y práctico en tus recomendaciones
    - Prioriza acciones con mayor impacto/menor esfuerzo
    - Considera el contexto y etapa del negocio
    - Usa benchmarks de la industria cuando sea relevante
    - Enfócate en métricas accionables
    
    ESTILO DE COMUNICACIÓN:
    - Usa lenguaje claro y profesional
    - Proporciona explicaciones didácticas
    - Incluye pasos específicos de implementación
    - Menciona riesgos y consideraciones importantes
    """,
)

# Agente especializado en recomendaciones de precios
pricing_optimizer_agent = Agent(
    get_ai_model_config(),
    result_type=List[FinancialRecommendation],
    system_prompt="""
    Eres un especialista en estrategias de precios para PyMEs, basado en los conceptos 
    de los Capítulos 6-9 del libro "Finanzas para Emprendedores".
    
    Tu especialidad es optimizar precios considerando:
    
    1. ANÁLISIS DE COSTOS:
       - Costos fijos vs variables
       - Punto de equilibrio
       - Margen de contribución óptimo
    
    2. ESTRATEGIAS DE PRICING:
       - Pricing basado en costos
       - Pricing basado en valor
       - Pricing competitivo
       - Estrategias de penetración vs premium
    
    3. ELASTICIDAD Y DEMANDA:
       - Sensibilidad al precio
       - Valor percibido
       - Disposición a pagar
    
    4. OPTIMIZACIÓN:
       - Maximización de utilidades
       - Posicionamiento en el mercado
       - Ciclo de vida del producto
    
    Proporciona recomendaciones específicas, prácticas y cuantificadas cuando sea posible.
    """,
)

# Agente especializado en análisis de crecimiento
growth_analyzer_agent = Agent(
    get_ai_model_config(),
    result_type=List[FinancialRecommendation],
    system_prompt="""
    Eres un analista de crecimiento empresarial especializado en PyMEs y startups,
    con expertise en métricas de crecimiento y unit economics.
    
    Tu enfoque está en:
    
    1. MÉTRICAS DE CRECIMIENTO:
       - Tasa de crecimiento de ingresos
       - Adquisición de clientes (CAC/COCA)
       - Retención y churn
       - Expansion revenue
    
    2. UNIT ECONOMICS SALUDABLES:
       - LTV/CAC ratios óptimos
       - Payback period
       - Contribución marginal
       - Escalabilidad del modelo
    
    3. ESTRATEGIAS DE CRECIMIENTO:
       - Optimización de funnel de ventas
       - Mejora en retención
       - Expansión de mercado
       - Desarrollo de productos
    
    4. FINANCIAMIENTO DEL CRECIMIENTO:
       - Crecimiento orgánico vs financiado
       - Momento óptimo para inversión
       - Métricas para inversores
    
    Identifica las palancas de crecimiento más efectivas y proporciona un roadmap claro.
    """,
)

class FinancialAdvisorService:
    """Servicio principal de asesoría financiera inteligente"""
    
    def __init__(self):
        self.financial_advisor = financial_advisor_agent
        self.pricing_optimizer = pricing_optimizer_agent
        self.growth_analyzer = growth_analyzer_agent
    
    async def analyze_business_health(
        self,
        metrics: FinancialMetrics,
        unit_economics: UnitEconomics,
        context: BusinessContext
    ) -> BusinessAnalysis:
        """Análisis completo de salud del negocio"""
        
        # Preparar datos para el análisis
        analysis_data = {
            "metricas_financieras": {
                "ingresos_mensuales": metrics.revenue,
                "gastos_mensuales": metrics.expenses,
                "utilidad_neta": metrics.net_profit,
                "flujo_de_caja": metrics.cash_flow,
                "margen_neto": (metrics.net_profit / metrics.revenue * 100) if metrics.revenue > 0 else 0,
                "ltv": metrics.ltv,
                "coca": metrics.coca,
                "ratio_ltv_coca": (metrics.ltv / metrics.coca) if metrics.coca > 0 else 0,
            },
            "unit_economics": {
                "precio_por_unidad": unit_economics.price_per_unit,
                "costo_variable_unitario": unit_economics.variable_cost_per_unit,
                "margen_contribucion": unit_economics.price_per_unit - unit_economics.variable_cost_per_unit,
                "margen_contribucion_porcentaje": ((unit_economics.price_per_unit - unit_economics.variable_cost_per_unit) / unit_economics.price_per_unit * 100) if unit_economics.price_per_unit > 0 else 0,
                "gasto_marketing": unit_economics.marketing_spend,
                "clientes_nuevos": unit_economics.new_customers,
                "coca_calculado": (unit_economics.marketing_spend / unit_economics.new_customers) if unit_economics.new_customers > 0 else 0,
                "frecuencia_compra": unit_economics.avg_purchase_frequency,
                "retencion_meses": unit_economics.retention_months,
            },
            "contexto_negocio": {
                "industria": context.industry,
                "etapa": context.business_stage,
                "empleados": context.employee_count,
                "meses_operacion": context.months_operating,
                "ingresos_mensuales": context.monthly_revenue,
            }
        }
        
        # Calcular métricas adicionales
        break_even_units = 0
        if unit_economics.price_per_unit > unit_economics.variable_cost_per_unit:
            contribution_margin = unit_economics.price_per_unit - unit_economics.variable_cost_per_unit
            break_even_units = metrics.fixed_costs / contribution_margin if contribution_margin > 0 else 0
        
        analysis_data["metricas_calculadas"] = {
            "unidades_punto_equilibrio": break_even_units,
            "payback_period_meses": (metrics.coca / (unit_economics.price_per_unit - unit_economics.variable_cost_per_unit)) if (unit_economics.price_per_unit - unit_economics.variable_cost_per_unit) > 0 else 0,
            "runway_meses": (metrics.cash_flow / abs(metrics.expenses)) if metrics.expenses < 0 else float('inf'),
        }
        
        prompt = f"""
        Analiza la salud financiera completa de este negocio basándote en los siguientes datos:
        
        {json.dumps(analysis_data, indent=2, ensure_ascii=False)}
        
        Proporciona un análisis integral que incluya:
        1. Evaluación de la salud general del negocio
        2. Identificación de fortalezas clave
        3. Áreas de preocupación o riesgo
        4. Oportunidades de crecimiento específicas
        5. Recomendaciones financieras priorizadas y accionables
        
        Considera la etapa del negocio y el contexto de la industria en tu análisis.
        """
        
        result = await self.financial_advisor.run(prompt)
        return result.data
    
    async def optimize_pricing_strategy(
        self,
        current_pricing: Dict,
        cost_structure: Dict,
        market_data: Dict
    ) -> List[FinancialRecommendation]:
        """Optimización de estrategia de precios"""
        
        prompt = f"""
        Analiza y optimiza la estrategia de precios actual basándote en:
        
        ESTRUCTURA ACTUAL DE PRECIOS:
        {json.dumps(current_pricing, indent=2, ensure_ascii=False)}
        
        ESTRUCTURA DE COSTOS:
        {json.dumps(cost_structure, indent=2, ensure_ascii=False)}
        
        DATOS DE MERCADO:
        {json.dumps(market_data, indent=2, ensure_ascii=False)}
        
        Proporciona recomendaciones específicas para:
        1. Optimización de precios actuales
        2. Nuevas estrategias de pricing
        3. Segmentación de precios
        4. Tactics de penetración o premium
        5. Adjustes estacionales o promocionales
        
        Cada recomendación debe incluir impacto estimado y pasos de implementación.
        """
        
        result = await self.pricing_optimizer.run(prompt)
        return result.data
    
    async def analyze_growth_opportunities(
        self,
        current_metrics: FinancialMetrics,
        growth_data: Dict,
        objectives: Dict
    ) -> List[FinancialRecommendation]:
        """Análisis de oportunidades de crecimiento"""
        
        # Calcular métricas de crecimiento
        growth_metrics = {
            "tasa_crecimiento_ingresos": growth_data.get("revenue_growth_rate", 0),
            "cac_eficiencia": (current_metrics.ltv / current_metrics.coca) if current_metrics.coca > 0 else 0,
            "margen_contribucion": ((current_metrics.revenue - current_metrics.expenses) / current_metrics.revenue * 100) if current_metrics.revenue > 0 else 0,
            "burn_rate": abs(current_metrics.cash_flow) if current_metrics.cash_flow < 0 else 0,
        }
        
        prompt = f"""
        Analiza las oportunidades de crecimiento para este negocio:
        
        MÉTRICAS ACTUALES:
        - Ingresos: ${current_metrics.revenue:,.2f}
        - LTV: ${current_metrics.ltv:,.2f}
        - COCA: ${current_metrics.coca:,.2f}
        - Ratio LTV/COCA: {(current_metrics.ltv/current_metrics.coca):.1f}x
        - Flujo de caja: ${current_metrics.cash_flow:,.2f}
        
        DATOS DE CRECIMIENTO:
        {json.dumps(growth_data, indent=2, ensure_ascii=False)}
        
        OBJETIVOS:
        {json.dumps(objectives, indent=2, ensure_ascii=False)}
        
        MÉTRICAS CALCULADAS:
        {json.dumps(growth_metrics, indent=2, ensure_ascii=False)}
        
        Identifica y prioriza oportunidades de crecimiento enfocándote en:
        1. Optimización de unit economics
        2. Mejora en adquisición de clientes
        3. Estrategias de retención
        4. Expansión de revenue per customer
        5. Nuevos canales o mercados
        6. Optimización operacional
        
        Cada recomendación debe ser específica, medible y incluir el ROI estimado.
        """
        
        result = await self.growth_analyzer.run(prompt)
        return result.data
    
    async def generate_scenario_analysis(
        self,
        base_metrics: FinancialMetrics,
        scenarios: List[Dict]
    ) -> Dict:
        """Análisis de escenarios financieros"""
        
        # Implementar análisis de escenarios usando los agentes
        analysis_results = {}
        
        for scenario in scenarios:
            scenario_name = scenario.get("name", "Escenario")
            scenario_data = scenario.get("changes", {})
            
            # Aplicar cambios del escenario a las métricas base
            modified_metrics = base_metrics.model_copy()
            
            for key, change in scenario_data.items():
                if hasattr(modified_metrics, key):
                    current_value = getattr(modified_metrics, key)
                    if isinstance(change, dict):
                        if "percentage" in change:
                            new_value = current_value * (1 + change["percentage"] / 100)
                        elif "absolute" in change:
                            new_value = current_value + change["absolute"]
                        else:
                            new_value = change.get("value", current_value)
                    else:
                        new_value = change
                    
                    setattr(modified_metrics, key, new_value)
            
            # Calcular impacto del escenario
            scenario_impact = {
                "original_profit": base_metrics.net_profit,
                "scenario_profit": modified_metrics.net_profit,
                "profit_change": modified_metrics.net_profit - base_metrics.net_profit,
                "profit_change_percentage": ((modified_metrics.net_profit - base_metrics.net_profit) / base_metrics.net_profit * 100) if base_metrics.net_profit != 0 else 0,
                "original_cash_flow": base_metrics.cash_flow,
                "scenario_cash_flow": modified_metrics.cash_flow,
                "cash_flow_change": modified_metrics.cash_flow - base_metrics.cash_flow,
            }
            
            analysis_results[scenario_name] = {
                "modified_metrics": modified_metrics,
                "impact_analysis": scenario_impact,
                "scenario_data": scenario_data
            }
        
        return analysis_results
    
    def calculate_financial_health_score(self, metrics: FinancialMetrics, unit_economics: UnitEconomics) -> Dict:
        """Calcula un score de salud financiera integral"""
        
        scores = {}
        
        # 1. Profitability Score (0-25 puntos)
        net_margin = (metrics.net_profit / metrics.revenue * 100) if metrics.revenue > 0 else 0
        if net_margin >= 20:
            scores["profitability"] = 25
        elif net_margin >= 15:
            scores["profitability"] = 20
        elif net_margin >= 10:
            scores["profitability"] = 15
        elif net_margin >= 5:
            scores["profitability"] = 10
        else:
            scores["profitability"] = max(0, 5 + net_margin)
        
        # 2. Unit Economics Score (0-25 puntos)
        ltv_coca_ratio = (metrics.ltv / metrics.coca) if metrics.coca > 0 else 0
        if ltv_coca_ratio >= 5:
            scores["unit_economics"] = 25
        elif ltv_coca_ratio >= 3:
            scores["unit_economics"] = 20
        elif ltv_coca_ratio >= 2:
            scores["unit_economics"] = 15
        elif ltv_coca_ratio >= 1:
            scores["unit_economics"] = 10
        else:
            scores["unit_economics"] = 0
        
        # 3. Cash Flow Score (0-25 puntos)
        cash_flow_margin = (metrics.cash_flow / metrics.revenue * 100) if metrics.revenue > 0 else 0
        if cash_flow_margin >= 15:
            scores["cash_flow"] = 25
        elif cash_flow_margin >= 10:
            scores["cash_flow"] = 20
        elif cash_flow_margin >= 5:
            scores["cash_flow"] = 15
        elif cash_flow_margin >= 0:
            scores["cash_flow"] = 10
        else:
            scores["cash_flow"] = max(0, 10 + cash_flow_margin * 2)
        
        # 4. Growth Efficiency Score (0-25 puntos)
        contribution_margin = unit_economics.price_per_unit - unit_economics.variable_cost_per_unit
        contribution_margin_pct = (contribution_margin / unit_economics.price_per_unit * 100) if unit_economics.price_per_unit > 0 else 0
        
        if contribution_margin_pct >= 60:
            scores["growth_efficiency"] = 25
        elif contribution_margin_pct >= 40:
            scores["growth_efficiency"] = 20
        elif contribution_margin_pct >= 30:
            scores["growth_efficiency"] = 15
        elif contribution_margin_pct >= 20:
            scores["growth_efficiency"] = 10
        else:
            scores["growth_efficiency"] = max(0, contribution_margin_pct / 4)
        
        # Score total
        total_score = sum(scores.values())
        
        # Determinar nivel de salud
        if total_score >= 80:
            health_level = "Excelente"
        elif total_score >= 60:
            health_level = "Bueno"
        elif total_score >= 40:
            health_level = "Regular"
        else:
            health_level = "Crítico"
        
        return {
            "total_score": total_score,
            "health_level": health_level,
            "component_scores": scores,
            "recommendations_priority": "Alta" if total_score < 60 else "Media" if total_score < 80 else "Mantenimiento"
        }

# Instancia global del servicio
financial_advisor_service = FinancialAdvisorService()