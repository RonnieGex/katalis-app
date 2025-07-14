"""
Basic AI Insights API - Simplified AI responses without LangChain complexity
"""
from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from datetime import datetime
import random

router = APIRouter(prefix="/api/ai", tags=["ai"])

def generate_business_analysis(financial_data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate business analysis based on financial metrics"""
    
    revenue = financial_data.get("revenue", 0)
    expenses = financial_data.get("expenses", 0)
    net_profit = financial_data.get("net_profit", 0)
    cash_flow = financial_data.get("cash_flow", 0)
    
    # Calculate ratios
    profit_margin = (net_profit / revenue * 100) if revenue > 0 else 0
    expense_ratio = (expenses / revenue * 100) if revenue > 0 else 0
    
    # Generate insights based on metrics
    strengths = []
    concerns = []
    opportunities = []
    recommendations = []
    
    # Analyze profit margin
    if profit_margin > 20:
        strengths.append(f"Excelente margen de ganancia del {profit_margin:.1f}%")
    elif profit_margin > 10:
        strengths.append(f"Buen margen de ganancia del {profit_margin:.1f}%")
    else:
        concerns.append(f"Margen de ganancia bajo del {profit_margin:.1f}%")
        recommendations.append({
            "category": "Rentabilidad",
            "priority": "Alta",
            "title": "Optimizar Estructura de Costos",
            "description": "Revisar y reducir gastos operativos para mejorar margen de ganancia",
            "potential_impact": "Aumento del 5-10% en margen neto",
            "implementation_steps": [
                "Auditar gastos mensuales por categoría",
                "Identificar gastos no esenciales",
                "Negociar mejores tarifas con proveedores",
                "Implementar medidas de control de gastos"
            ],
            "estimated_time": "2-3 meses",
            "risk_level": "Bajo"
        })
    
    # Analyze cash flow
    if cash_flow > 0:
        strengths.append("Flujo de efectivo positivo y saludable")
    else:
        concerns.append("Flujo de efectivo negativo requiere atención")
        recommendations.append({
            "category": "Liquidez",
            "priority": "Crítica",
            "title": "Mejorar Gestión de Efectivo",
            "description": "Implementar estrategias para optimizar el flujo de efectivo",
            "potential_impact": "Estabilización del flujo de efectivo en 30-60 días",
            "implementation_steps": [
                "Acelerar cobros de cuentas por cobrar",
                "Negociar términos de pago con proveedores",
                "Implementar pronósticos de efectivo semanales",
                "Crear línea de crédito de emergencia"
            ],
            "estimated_time": "1-2 meses",
            "risk_level": "Alto"
        })
    
    # Growth opportunities
    if profit_margin > 15 and cash_flow > 0:
        opportunities.append("Condiciones favorables para inversión en crecimiento")
        opportunities.append("Posibilidad de expandir líneas de productos rentables")
    
    opportunities.append("Implementar automatización para reducir costos operativos")
    opportunities.append("Optimizar estrategia de precios basada en valor")
    
    # Additional recommendations
    recommendations.append({
        "category": "Análisis",
        "priority": "Media",
        "title": "Implementar Dashboards en Tiempo Real",
        "description": "Crear sistema de monitoreo continuo de métricas clave",
        "potential_impact": "Mejora en toma de decisiones y detección temprana de problemas",
        "implementation_steps": [
            "Definir KPIs críticos para el negocio",
            "Implementar herramientas de visualización",
            "Crear alertas automáticas",
            "Capacitar equipo en análisis de datos"
        ],
        "estimated_time": "1-2 meses", 
        "risk_level": "Bajo"
    })
    
    return {
        "overall_health": "Bueno" if profit_margin > 10 and cash_flow > 0 else "Regular" if profit_margin > 5 else "Necesita Atención",
        "key_strengths": strengths,
        "areas_of_concern": concerns,
        "growth_opportunities": opportunities,
        "financial_recommendations": recommendations
    }

def generate_health_score(financial_data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate health score based on financial metrics"""
    
    revenue = financial_data.get("revenue", 0)
    expenses = financial_data.get("expenses", 0) 
    net_profit = financial_data.get("net_profit", 0)
    cash_flow = financial_data.get("cash_flow", 0)
    
    # Component scores (0-100)
    scores = {}
    
    # Profitability score
    profit_margin = (net_profit / revenue * 100) if revenue > 0 else 0
    if profit_margin > 20:
        scores["profitability"] = 100
    elif profit_margin > 15:
        scores["profitability"] = 85
    elif profit_margin > 10:
        scores["profitability"] = 70
    elif profit_margin > 5:
        scores["profitability"] = 50
    else:
        scores["profitability"] = 25
    
    # Liquidity score based on cash flow
    if cash_flow > revenue * 0.1:  # 10% of revenue
        scores["liquidity"] = 100
    elif cash_flow > 0:
        scores["liquidity"] = 75
    elif cash_flow > -revenue * 0.05:  # Within 5% of revenue
        scores["liquidity"] = 50
    else:
        scores["liquidity"] = 25
    
    # Efficiency score based on expense ratio
    expense_ratio = (expenses / revenue * 100) if revenue > 0 else 100
    if expense_ratio < 60:
        scores["efficiency"] = 100
    elif expense_ratio < 70:
        scores["efficiency"] = 85
    elif expense_ratio < 80:
        scores["efficiency"] = 70
    elif expense_ratio < 90:
        scores["efficiency"] = 50
    else:
        scores["efficiency"] = 25
    
    # Growth score (simplified)
    scores["growth"] = random.randint(60, 90)  # Would be based on historical data
    
    # Calculate total score
    total_score = sum(scores.values()) / len(scores)
    
    # Determine health level
    if total_score >= 80:
        health_level = "Excelente"
    elif total_score >= 65:
        health_level = "Bueno"
    elif total_score >= 50:
        health_level = "Regular"
    else:
        health_level = "Crítico"
    
    return {
        "total_score": round(total_score, 1),
        "health_level": health_level,
        "component_scores": scores,
        "recommendations_priority": "Alta" if total_score < 60 else "Media" if total_score < 80 else "Baja"
    }

@router.post("/analyze/business-health")
async def analyze_business_health(financial_metrics: Dict[str, Any]):
    """Analyze business health based on financial metrics"""
    try:
        analysis = generate_business_analysis(financial_metrics)
        health_score = generate_health_score(financial_metrics)
        
        return {
            "analysis": analysis,
            "health_score": health_score,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in business analysis: {str(e)}")

@router.get("/health-score")
async def get_health_score(
    revenue: float,
    expenses: float,
    net_profit: float,
    cash_flow: float,
    ltv: float = 0,
    coca: float = 0
):
    """Get health score based on provided metrics"""
    try:
        financial_data = {
            "revenue": revenue,
            "expenses": expenses, 
            "net_profit": net_profit,
            "cash_flow": cash_flow,
            "ltv": ltv,
            "coca": coca
        }
        
        health_score = generate_health_score(financial_data)
        return health_score
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating health score: {str(e)}")

@router.post("/recommendations/quick")
async def get_quick_recommendations(business_data: Dict[str, Any]):
    """Get quick recommendations based on business data"""
    try:
        recommendations = []
        
        # Sample recommendations based on common scenarios
        financial_metrics = business_data.get("financial_metrics", {})
        unit_economics = business_data.get("unit_economics", {})
        
        revenue = financial_metrics.get("revenue", 0)
        expenses = financial_metrics.get("expenses", 0)
        profit_margin = (financial_metrics.get("net_profit", 0) / revenue * 100) if revenue > 0 else 0
        
        # Low profit margin recommendation
        if profit_margin < 15:
            recommendations.append({
                "category": "Rentabilidad",
                "priority": "Alta",
                "title": "Optimizar Margen de Ganancia",
                "description": f"Tu margen actual del {profit_margin:.1f}% está por debajo del objetivo del 15%",
                "actions": [
                    "Revisar estructura de precios",
                    "Reducir costos operativos no esenciales",
                    "Mejorar eficiencia en procesos"
                ]
            })
        
        # Cash flow recommendation
        cash_flow = financial_metrics.get("cash_flow", 0)
        if cash_flow < 0:
            recommendations.append({
                "category": "Liquidez",
                "priority": "Crítica", 
                "title": "Mejorar Flujo de Efectivo",
                "description": "Flujo de efectivo negativo requiere acción inmediata",
                "actions": [
                    "Acelerar cobranza",
                    "Negociar términos de pago",
                    "Reducir gastos no críticos"
                ]
            })
        
        # Growth recommendation
        if profit_margin > 15 and cash_flow > 0:
            recommendations.append({
                "category": "Crecimiento",
                "priority": "Media",
                "title": "Invertir en Expansión",
                "description": "Métricas saludables permiten inversión en crecimiento",
                "actions": [
                    "Aumentar inversión en marketing",
                    "Expandir equipo de ventas",
                    "Desarrollar nuevos productos"
                ]
            })
        
        return {
            "recommendations": recommendations,
            "summary": f"Se identificaron {len(recommendations)} áreas de mejora",
            "overall_status": "Saludable" if profit_margin > 10 and cash_flow > 0 else "Requiere Atención",
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")

@router.get("/benchmarks/{industry}")
async def get_industry_benchmarks(industry: str):
    """Get industry benchmarks for comparison"""
    # Sample benchmarks - in real app would come from database
    benchmarks = {
        "technology": {
            "profit_margin": {"min": 15, "avg": 25, "max": 40},
            "expense_ratio": {"min": 60, "avg": 75, "max": 85},
            "growth_rate": {"min": 20, "avg": 35, "max": 50},
            "ltv_cac_ratio": {"min": 3, "avg": 5, "max": 8}
        },
        "retail": {
            "profit_margin": {"min": 5, "avg": 12, "max": 20},
            "expense_ratio": {"min": 80, "avg": 88, "max": 95},
            "growth_rate": {"min": 5, "avg": 15, "max": 25},
            "ltv_cac_ratio": {"min": 2, "avg": 3, "max": 5}
        },
        "services": {
            "profit_margin": {"min": 10, "avg": 20, "max": 35},
            "expense_ratio": {"min": 65, "avg": 80, "max": 90},
            "growth_rate": {"min": 10, "avg": 20, "max": 30},
            "ltv_cac_ratio": {"min": 3, "avg": 6, "max": 10}
        }
    }
    
    industry_data = benchmarks.get(industry.lower(), benchmarks["technology"])
    
    return {
        "industry": industry,
        "benchmarks": industry_data,
        "last_updated": "2024-01-01",
        "note": "Benchmarks basados en promedios de la industria"
    }