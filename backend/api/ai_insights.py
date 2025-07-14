"""
API endpoints para insights y análisis de IA usando PydanticAI
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Dict, List, Optional
import json
from datetime import datetime

import os
from services.dual_ai_service import dual_ai_service

# Detectar qué servicios de IA están disponibles
ai_status = dual_ai_service.get_service_status()
USE_MOCK_AI = not ai_status['openai_available'] and not ai_status['deepseek_available']

if USE_MOCK_AI:
    print("⚠️ Usando Mock AI Service - Configura OPENAI_API_KEY y DEEPSEEK_API_KEY para IA real")
    from agents.mock_ai_service import mock_financial_advisor
    from agents.financial_advisor import FinancialMetrics, UnitEconomics, BusinessContext
else:
    print(f"✅ Usando IA Real - Estrategia: {ai_status['strategy']}")
    print(f"   💡 Tareas simples: {ai_status['models']['simple_tasks']}")
    print(f"   🧠 Razonamiento complejo: {ai_status['models']['complex_reasoning']}")
    from agents.financial_advisor import (
        FinancialAdvisorService, 
        FinancialMetrics, 
        UnitEconomics, 
        BusinessContext,
        financial_advisor_service
    )
from agents.cash_flow_advisor import (
    CashFlowAdvisorService,
    CashFlowEntry,
    CashFlowProjection,
    cash_flow_advisor_service
)

router = APIRouter(prefix="/api/ai", tags=["AI Insights"])

# Modelos de request/response
class BusinessAnalysisRequest(BaseModel):
    financial_metrics: FinancialMetrics
    unit_economics: UnitEconomics
    business_context: BusinessContext

class PricingOptimizationRequest(BaseModel):
    current_pricing: Dict
    cost_structure: Dict
    market_data: Dict

class GrowthAnalysisRequest(BaseModel):
    current_metrics: FinancialMetrics
    growth_data: Dict
    objectives: Dict

class CashFlowAnalysisRequest(BaseModel):
    historical_data: List[CashFlowEntry]
    current_balance: float
    business_context: Dict

class ScenarioAnalysisRequest(BaseModel):
    base_metrics: FinancialMetrics
    scenarios: List[Dict]

class HealthScoreResponse(BaseModel):
    total_score: float
    health_level: str
    component_scores: Dict
    recommendations_priority: str

# Endpoints principales
@router.post("/analyze/business-health")
async def analyze_business_health(request: BusinessAnalysisRequest):
    """Análisis integral de salud del negocio"""
    try:
        if USE_MOCK_AI:
            # Usar mock service
            analysis = mock_financial_advisor.analyze_business_health(
                metrics=request.financial_metrics,
                unit_economics=request.unit_economics,
                context=request.business_context
            )
            health_score = mock_financial_advisor.calculate_health_score(
                metrics=request.financial_metrics,
                unit_economics=request.unit_economics
            )
        else:
            # Usar IA real
            analysis = await financial_advisor_service.analyze_business_health(
                metrics=request.financial_metrics,
                unit_economics=request.unit_economics,
                context=request.business_context
            )
            health_score = financial_advisor_service.calculate_financial_health_score(
                metrics=request.financial_metrics,
                unit_economics=request.unit_economics
            )
        
        return {
            "analysis": analysis,
            "health_score": health_score,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en análisis de negocio: {str(e)}")

@router.post("/optimize/pricing")
async def optimize_pricing(request: PricingOptimizationRequest):
    """Optimización de estrategia de precios"""
    try:
        if USE_MOCK_AI:
            # Simular optimización de precios
            recommendations = [
                {
                    "category": "pricing",
                    "priority": "Alta",
                    "title": "Optimización de Precios (Simulado)",
                    "description": "Análisis de precios basado en estructura de costos actual",
                    "potential_impact": "Incremento estimado en margen del 5-15%",
                    "implementation_steps": [
                        "Revisar precios competitivos del mercado",
                        "Calcular margen de contribución óptimo",
                        "Implementar pruebas A/B de precios"
                    ],
                    "estimated_time": "2-4 semanas",
                    "risk_level": "Medio"
                }
            ]
        else:
            # Usar IA real
            recommendations = await financial_advisor_service.optimize_pricing_strategy(
                current_pricing=request.current_pricing,
                cost_structure=request.cost_structure,
                market_data=request.market_data
            )
        
        return {
            "recommendations": recommendations,
            "optimization_date": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en optimización de precios: {str(e)}")

@router.post("/analyze/growth-opportunities")
async def analyze_growth_opportunities(request: GrowthAnalysisRequest):
    """Análisis de oportunidades de crecimiento"""
    try:
        if USE_MOCK_AI:
            # Simular análisis de crecimiento
            opportunities = [
                {
                    "category": "growth",
                    "priority": "Alta",
                    "title": "Optimización de Adquisición (Simulado)",
                    "description": "Mejorar eficiencia en canales de marketing digital",
                    "potential_impact": "Reducción del 20-30% en COCA",
                    "implementation_steps": [
                        "Analizar ROI por canal de marketing",
                        "Optimizar campañas de mayor rendimiento",
                        "Implementar automatización de marketing"
                    ],
                    "estimated_time": "1-3 meses",
                    "risk_level": "Bajo"
                }
            ]
        else:
            # Usar IA real
            opportunities = await financial_advisor_service.analyze_growth_opportunities(
                current_metrics=request.current_metrics,
                growth_data=request.growth_data,
                objectives=request.objectives
            )
        
        return {
            "opportunities": opportunities,
            "analysis_date": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en análisis de crecimiento: {str(e)}")

@router.post("/analyze/cash-flow")
async def analyze_cash_flow(request: CashFlowAnalysisRequest):
    """Análisis integral de flujo de caja"""
    try:
        if USE_MOCK_AI:
            # Simular análisis de flujo de caja
            analysis = {
                "summary": "Análisis simulado de flujo de caja",
                "health_score": 75,
                "trends": ["Flujo positivo últimos 3 meses", "Estacionalidad detectada"],
                "risks": ["Concentración en pocos clientes"],
                "recommendations": ["Diversificar base de clientes", "Mejorar términos de cobro"]
            }
            projections = [
                {"month": 1, "projected_cash_flow": request.current_balance + 5000},
                {"month": 2, "projected_cash_flow": request.current_balance + 8000},
                {"month": 3, "projected_cash_flow": request.current_balance + 12000}
            ]
            kpis = {
                "avg_collection_days": 45,
                "cash_runway_months": 8,
                "operating_cash_flow_margin": 0.15
            }
        else:
            # Usar IA real
            projections = await cash_flow_advisor_service.generate_cash_flow_forecast(
                historical_data=request.historical_data,
                assumptions={"starting_balance": request.current_balance},
                forecast_months=6
            )
            
            analysis = await cash_flow_advisor_service.analyze_cash_flow_health(
                historical_data=request.historical_data,
                current_balance=request.current_balance,
                projections=projections,
                business_context=request.business_context
            )
            
            kpis = cash_flow_advisor_service.calculate_cash_flow_kpis(
                data=request.historical_data,
                current_balance=request.current_balance
            )
        
        return {
            "analysis": analysis,
            "projections": projections,
            "kpis": kpis,
            "analysis_date": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en análisis de flujo de caja: {str(e)}")

@router.post("/scenario/analysis")
async def scenario_analysis(request: ScenarioAnalysisRequest):
    """Análisis de escenarios financieros"""
    try:
        if USE_MOCK_AI:
            # Simular análisis de escenarios
            scenario_results = {
                "optimistic": {
                    "profit_change_percentage": 25,
                    "cash_flow_change": 15000,
                    "summary": "Escenario optimista con crecimiento del 25%"
                },
                "realistic": {
                    "profit_change_percentage": 10,
                    "cash_flow_change": 8000,
                    "summary": "Escenario realista con crecimiento moderado"
                },
                "pessimistic": {
                    "profit_change_percentage": -5,
                    "cash_flow_change": -2000,
                    "summary": "Escenario pesimista con desafíos de mercado"
                }
            }
        else:
            # Usar IA real
            scenario_results = await financial_advisor_service.generate_scenario_analysis(
                base_metrics=request.base_metrics,
                scenarios=request.scenarios
            )
        
        return {
            "scenario_results": scenario_results,
            "base_metrics": request.base_metrics,
            "analysis_date": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en análisis de escenarios: {str(e)}")

@router.get("/health-score")
async def get_health_score(
    revenue: float,
    expenses: float,
    net_profit: float,
    cash_flow: float,
    ltv: float,
    coca: float,
    price_per_unit: float,
    variable_cost_per_unit: float,
    marketing_spend: float = 0,
    new_customers: float = 1,
    avg_purchase_frequency: float = 1,
    retention_months: float = 12
):
    """Cálculo rápido de score de salud financiera"""
    try:
        metrics = FinancialMetrics(
            revenue=revenue,
            expenses=expenses,
            net_profit=net_profit,
            cash_flow=cash_flow,
            ltv=ltv,
            coca=coca,
            fixed_costs=expenses * 0.6,  # Estimación
            variable_costs=variable_cost_per_unit
        )
        
        unit_economics = UnitEconomics(
            price_per_unit=price_per_unit,
            variable_cost_per_unit=variable_cost_per_unit,
            marketing_spend=marketing_spend,
            new_customers=new_customers,
            avg_purchase_frequency=avg_purchase_frequency,
            retention_months=retention_months
        )
        
        if USE_MOCK_AI:
            health_score = mock_financial_advisor.calculate_health_score(
                metrics=metrics,
                unit_economics=unit_economics
            )
        else:
            health_score = financial_advisor_service.calculate_financial_health_score(
                metrics=metrics,
                unit_economics=unit_economics
            )
        
        return health_score
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculando health score: {str(e)}")

@router.post("/recommendations/quick")
async def get_quick_recommendations(request: BusinessAnalysisRequest):
    """Recomendaciones rápidas basadas en métricas clave"""
    try:
        # Calcular ratios clave
        metrics = request.financial_metrics
        unit_econ = request.unit_economics
        
        ltv_coca_ratio = metrics.ltv / metrics.coca if metrics.coca > 0 else 0
        net_margin = (metrics.net_profit / metrics.revenue * 100) if metrics.revenue > 0 else 0
        contribution_margin = unit_econ.price_per_unit - unit_econ.variable_cost_per_unit
        contribution_margin_pct = (contribution_margin / unit_econ.price_per_unit * 100) if unit_econ.price_per_unit > 0 else 0
        
        quick_recommendations = []
        
        # Recomendaciones basadas en ratios
        if ltv_coca_ratio < 3:
            quick_recommendations.append({
                "category": "unit_economics",
                "priority": "Alta",
                "title": "Optimizar Ratio LTV/COCA",
                "description": f"Tu ratio LTV/COCA es {ltv_coca_ratio:.1f}x, por debajo del mínimo recomendado de 3x. Considera reducir costos de adquisición o aumentar el valor del cliente.",
                "actions": [
                    "Revisar canales de marketing más eficientes",
                    "Implementar estrategias de retención",
                    "Optimizar el precio o reducir costos variables"
                ]
            })
        
        if net_margin < 10:
            quick_recommendations.append({
                "category": "profitability",
                "priority": "Alta",
                "title": "Mejorar Margen Neto",
                "description": f"Tu margen neto de {net_margin:.1f}% está por debajo del 10% recomendado. Es crucial mejorar la rentabilidad.",
                "actions": [
                    "Revisar estructura de costos",
                    "Optimizar precios",
                    "Eliminar gastos innecesarios"
                ]
            })
        
        if contribution_margin_pct < 30:
            quick_recommendations.append({
                "category": "pricing",
                "priority": "Media",
                "title": "Aumentar Margen de Contribución",
                "description": f"Tu margen de contribución de {contribution_margin_pct:.1f}% podría mejorarse para tener más flexibilidad financiera.",
                "actions": [
                    "Analizar posibilidad de aumento de precios",
                    "Optimizar costos variables",
                    "Añadir servicios de mayor valor"
                ]
            })
        
        if metrics.cash_flow < 0:
            quick_recommendations.append({
                "category": "cash_flow",
                "priority": "Crítica",
                "title": "Resolver Flujo de Caja Negativo",
                "description": "Tu flujo de caja es negativo, lo que representa un riesgo inmediato para la operación.",
                "actions": [
                    "Acelerar cobros a clientes",
                    "Negociar términos de pago con proveedores",
                    "Reducir gastos no esenciales",
                    "Considerar línea de crédito de emergencia"
                ]
            })
        
        # Si todo está bien
        if not quick_recommendations and ltv_coca_ratio >= 3 and net_margin >= 15:
            quick_recommendations.append({
                "category": "growth",
                "priority": "Media",
                "title": "Acelerar Crecimiento",
                "description": "Tus métricas financieras son saludables. Es momento de considerar estrategias de crecimiento.",
                "actions": [
                    "Invertir más en marketing con ROI comprobado",
                    "Expandir a nuevos mercados o segmentos",
                    "Desarrollar nuevos productos/servicios",
                    "Optimizar operaciones para escalar"
                ]
            })
        
        return {
            "recommendations": quick_recommendations,
            "summary": f"Analizadas {len(quick_recommendations)} áreas prioritarias",
            "overall_status": "Crítico" if any(r["priority"] == "Crítica" for r in quick_recommendations) else 
                            "Necesita atención" if any(r["priority"] == "Alta" for r in quick_recommendations) else
                            "Saludable",
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generando recomendaciones: {str(e)}")

@router.post("/test-dual-ai")
async def test_dual_ai(request: Dict):
    """Endpoint para probar la estrategia dual de IA"""
    try:
        question = request.get("question", "¿Cómo puedo mejorar la rentabilidad de mi negocio?")
        force_provider = request.get("provider")  # "openai", "deepseek", o None para auto
        
        # Determinar tipo de tarea
        task_type = "complex_analysis" if any(word in question.lower() for word in 
                   ["analizar", "estrategia", "optimizar", "proyección"]) else "simple_query"
        
        # Generar respuesta usando servicio dual
        ai_response = await dual_ai_service.generate_response(
            prompt=question,
            task_type=task_type,
            context={"industry": "general", "business_stage": "growth"},
            force_provider=force_provider
        )
        
        return {
            "question": question,
            "response": ai_response.content,
            "model_used": ai_response.model_used,
            "provider": ai_response.provider,
            "reasoning_steps": ai_response.reasoning_steps,
            "confidence": ai_response.confidence,
            "task_complexity": task_type,
            "timestamp": datetime.now().isoformat(),
            "ai_status": dual_ai_service.get_service_status()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en test dual AI: {str(e)}")

@router.post("/reasoning-analysis")
async def complex_reasoning_analysis(request: BusinessAnalysisRequest):
    """Análisis complejo usando DeepSeek R1 para razonamiento profundo"""
    try:
        # Este endpoint está diseñado para usar DeepSeek R1 específicamente
        analysis_prompt = f"""
        Realiza un análisis financiero profundo y estrategia de optimización para este negocio:
        
        MÉTRICAS FINANCIERAS:
        - Ingresos: ${request.financial_metrics.revenue:,.2f}
        - Gastos: ${request.financial_metrics.expenses:,.2f}
        - Utilidad neta: ${request.financial_metrics.net_profit:,.2f}
        - Flujo de caja: ${request.financial_metrics.cash_flow:,.2f}
        - LTV: ${request.financial_metrics.ltv:,.2f}
        - COCA: ${request.financial_metrics.coca:,.2f}
        
        UNIT ECONOMICS:
        - Precio por unidad: ${request.unit_economics.price_per_unit:,.2f}
        - Costo variable unitario: ${request.unit_economics.variable_cost_per_unit:,.2f}
        - Gasto en marketing: ${request.unit_economics.marketing_spend:,.2f}
        - Nuevos clientes: {request.unit_economics.new_customers}
        
        CONTEXTO DEL NEGOCIO:
        - Industria: {request.business_context.industry}
        - Etapa: {request.business_context.business_stage}
        - Empleados: {request.business_context.employee_count}
        - Meses operando: {request.business_context.months_operating}
        
        Proporciona:
        1. Análisis detallado de la situación actual
        2. Identificación de problemas críticos y oportunidades
        3. Estrategia de optimización paso a paso
        4. Proyecciones financieras realistas
        5. Plan de acción con prioridades y tiempos
        """
        
        # Forzar uso de DeepSeek para razonamiento complejo
        ai_response = await dual_ai_service.generate_response(
            prompt=analysis_prompt,
            task_type="complex_reasoning_analysis",
            context={
                "business_context": request.business_context.dict(),
                "analysis_type": "comprehensive_business_analysis"
            },
            force_provider="deepseek"  # Forzar DeepSeek R1
        )
        
        return {
            "analysis": ai_response.content,
            "reasoning_steps": ai_response.reasoning_steps,
            "model_used": ai_response.model_used,
            "provider": ai_response.provider,
            "confidence": ai_response.confidence,
            "analysis_type": "deep_reasoning",
            "timestamp": datetime.now().isoformat(),
            "recommendation": "Este análisis usa DeepSeek R1 para razonamiento profundo y estrategias complejas"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en análisis de razonamiento: {str(e)}")

# Endpoints de utilidad
@router.get("/benchmarks/{industry}")
async def get_industry_benchmarks(industry: str):
    """Obtiene benchmarks de la industria"""
    
    # Benchmarks básicos por industria (en un sistema real vendrían de una base de datos)
    benchmarks = {
        "retail": {
            "gross_margin": {"min": 20, "avg": 35, "max": 50},
            "net_margin": {"min": 2, "avg": 5, "max": 10},
            "ltv_coca_ratio": {"min": 3, "avg": 5, "max": 8},
            "inventory_turnover": {"min": 6, "avg": 12, "max": 20}
        },
        "saas": {
            "gross_margin": {"min": 70, "avg": 80, "max": 90},
            "net_margin": {"min": 10, "avg": 20, "max": 30},
            "ltv_coca_ratio": {"min": 3, "avg": 7, "max": 15},
            "churn_rate": {"min": 2, "avg": 5, "max": 10}
        },
        "manufacturing": {
            "gross_margin": {"min": 15, "avg": 25, "max": 40},
            "net_margin": {"min": 3, "avg": 8, "max": 15},
            "ltv_coca_ratio": {"min": 4, "avg": 6, "max": 10},
            "asset_turnover": {"min": 0.5, "avg": 1.0, "max": 2.0}
        },
        "services": {
            "gross_margin": {"min": 40, "avg": 60, "max": 80},
            "net_margin": {"min": 5, "avg": 15, "max": 25},
            "ltv_coca_ratio": {"min": 5, "avg": 8, "max": 12},
            "utilization_rate": {"min": 60, "avg": 75, "max": 90}
        }
    }
    
    industry_lower = industry.lower()
    if industry_lower not in benchmarks:
        # Devolver benchmarks genéricos
        return {
            "industry": industry,
            "benchmarks": {
                "gross_margin": {"min": 20, "avg": 40, "max": 60},
                "net_margin": {"min": 5, "avg": 12, "max": 20},
                "ltv_coca_ratio": {"min": 3, "avg": 6, "max": 10}
            },
            "note": "Benchmarks genéricos - industria específica no encontrada"
        }
    
    return {
        "industry": industry,
        "benchmarks": benchmarks[industry_lower],
        "last_updated": datetime.now().isoformat()
    }

@router.get("/ai-status")
async def get_ai_status():
    """Estado actual de los servicios de IA"""
    status = dual_ai_service.get_service_status()
    return {
        "ai_services": status,
        "current_strategy": "dual" if status['deepseek_available'] and status['openai_available'] else "single",
        "available_models": {
            "reasoning": "DeepSeek R1" if status['deepseek_available'] else "GPT-4o-mini" if status['openai_available'] else "Mock",
            "simple_tasks": "GPT-4o-mini" if status['openai_available'] else "Mock"
        },
        "recommendation": "Configure both APIs for optimal performance" if not (status['deepseek_available'] and status['openai_available']) else "All AI services active"
    }

@router.get("/kpis/definitions")
async def get_kpi_definitions():
    """Definiciones y explicaciones de KPIs financieros (tarea simple - usa OpenAI)"""
    
    kpi_definitions = {
        "ltv": {
            "name": "Lifetime Value",
            "definition": "Valor total que un cliente genera durante toda su relación con el negocio",
            "formula": "LTV = (Precio promedio por transacción) × (Frecuencia de compra anual) × (Años de retención)",
            "benchmark": "Debe ser al menos 3x el costo de adquisición",
            "importance": "Indica el valor real de cada cliente para el negocio"
        },
        "coca": {
            "name": "Costo de Adquisición de Cliente",
            "definition": "Costo promedio para adquirir un nuevo cliente",
            "formula": "COCA = (Gasto total en marketing y ventas) / (Número de nuevos clientes)",
            "benchmark": "Debe recuperarse en menos de 12 meses",
            "importance": "Determina la eficiencia de las estrategias de adquisición"
        },
        "contribution_margin": {
            "name": "Margen de Contribución",
            "definition": "Dinero que queda después de cubrir costos variables para cubrir costos fijos",
            "formula": "Margen = (Precio - Costos Variables) / Precio × 100",
            "benchmark": "Mínimo 30%, óptimo 50%+",
            "importance": "Indica la rentabilidad por unidad vendida"
        },
        "cash_runway": {
            "name": "Runway de Efectivo",
            "definition": "Tiempo que puede operar el negocio con el efectivo actual",
            "formula": "Runway = Efectivo Actual / Burn Rate Mensual",
            "benchmark": "Mínimo 6 meses, recomendado 12+ meses",
            "importance": "Indica la supervivencia financiera del negocio"
        },
        "gross_margin": {
            "name": "Margen Bruto",
            "definition": "Porcentaje de ingresos que queda después de costos directos",
            "formula": "Margen Bruto = (Ingresos - COGS) / Ingresos × 100",
            "benchmark": "Varía por industria: 20-80%",
            "importance": "Eficiencia en la producción y entrega"
        },
        "net_margin": {
            "name": "Margen Neto",
            "definition": "Porcentaje de ingresos que queda como utilidad final",
            "formula": "Margen Neto = Utilidad Neta / Ingresos × 100",
            "benchmark": "Mínimo 5%, bueno 10%+, excelente 15%+",
            "importance": "Rentabilidad general del negocio"
        }
    }
    
    response_data = {
        "kpi_definitions": kpi_definitions,
        "total_kpis": len(kpi_definitions),
        "categories": ["profitability", "efficiency", "growth", "sustainability"]
    }
    
    # Si tenemos IA disponible, agregar explicaciones generadas
    if not USE_MOCK_AI:
        try:
            # Usar OpenAI para tarea simple de definiciones
            ai_response = await dual_ai_service.generate_response(
                "Proporciona un resumen ejecutivo de por qué estos KPIs son importantes para emprendedores",
                task_type="kpi_definitions",
                force_provider="openai"  # Forzar OpenAI para tarea simple
            )
            response_data["ai_summary"] = ai_response.content
            response_data["generated_by"] = ai_response.model_used
        except Exception as e:
            print(f"Error generating AI summary: {e}")
    
    return response_data