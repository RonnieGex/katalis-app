"""
Simplified AI Insights API - for testing without pydantic-ai
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List, Optional
from datetime import datetime
import json

# Simulated dependencies
def get_current_user():
    """Mock authentication dependency"""
    return {"id": 1, "email": "demo@katalisapp.com", "username": "demo"}

router = APIRouter(prefix="/api/ai")

@router.get("/health-score")
async def get_health_score(current_user: dict = Depends(get_current_user)):
    """Obtener health score del negocio"""
    return {
        "total_score": 75,
        "health_level": "Bueno",
        "timestamp": datetime.now().isoformat(),
        "components": {
            "cash_flow": {"score": 80, "status": "good"},
            "profitability": {"score": 70, "status": "fair"},
            "growth": {"score": 85, "status": "excellent"},
            "efficiency": {"score": 65, "status": "fair"}
        },
        "recommendations": [
            "Optimizar márgenes de contribución",
            "Mejorar gestión de inventario",
            "Revisar estructura de costos"
        ]
    }

@router.post("/recommendations/quick")
async def get_quick_recommendations(
    request: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    """Obtener recomendaciones rápidas"""
    return {
        "recommendations": [
            {
                "id": "rec_001",
                "title": "Optimizar Flujo de Caja",
                "description": "Implementar mejor gestión de cuentas por cobrar",
                "priority": "high",
                "impact": "medium",
                "effort": "low"
            },
            {
                "id": "rec_002", 
                "title": "Revisar Precios",
                "description": "Analizar precios competitivos en el mercado",
                "priority": "medium",
                "impact": "high",
                "effort": "medium"
            }
        ],
        "context": request.get("context", "general"),
        "timestamp": datetime.now().isoformat()
    }

@router.get("/insights/financial")
async def get_financial_insights(current_user: dict = Depends(get_current_user)):
    """Obtener insights financieros"""
    return {
        "insights": [
            {
                "type": "warning",
                "title": "Flujo de Caja",
                "message": "Se detecta un patrón de flujo de caja irregular en los últimos 3 meses"
            },
            {
                "type": "opportunity",
                "title": "Optimización de Costos",
                "message": "Posible ahorro del 15% en costos operativos"
            },
            {
                "type": "info",
                "title": "Tendencia de Mercado",
                "message": "El sector muestra crecimiento del 8% anual"
            }
        ],
        "generated_at": datetime.now().isoformat()
    }

@router.post("/analyze")
async def analyze_financial_data(
    data: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    """Analizar datos financieros específicos"""
    return {
        "analysis": {
            "summary": "Análisis completado exitosamente",
            "score": 78,
            "trends": ["Crecimiento sostenido", "Margen estable", "Liquidez adecuada"],
            "risks": ["Dependencia de clientes principales", "Estacionalidad moderada"],
            "opportunities": ["Expansión de mercado", "Nuevos productos", "Optimización tecnológica"]
        },
        "data_quality": "good",
        "confidence": 0.85,
        "timestamp": datetime.now().isoformat()
    }