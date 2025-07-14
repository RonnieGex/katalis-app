from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime, timedelta
import random

router = APIRouter()

class DashboardStats(BaseModel):
    title: str
    value: str
    change: str
    trend: str
    
class DashboardData(BaseModel):
    stats: List[DashboardStats]
    revenue_data: List[Dict[str, Any]]
    cash_flow_data: List[Dict[str, Any]]
    expenses_data: List[Dict[str, Any]]

@router.get("/stats", response_model=DashboardData)
async def get_dashboard_stats():
    """Get dashboard statistics and data"""
    try:
        # Generate sample data (replace with real data later)
        stats = [
            {
                "title": "Ingresos del Mes",
                "value": "$125,430",
                "change": "+12%",
                "trend": "up"
            },
            {
                "title": "Gastos del Mes", 
                "value": "$87,650",
                "change": "-5%",
                "trend": "down"
            },
            {
                "title": "Utilidad Neta",
                "value": "$37,780",
                "change": "+18%",
                "trend": "up"
            },
            {
                "title": "Flujo de Caja",
                "value": "Saludable",
                "change": "+$12,500",
                "trend": "up"
            }
        ]

        # Sample revenue data
        revenue_data = [
            {"month": "Ene", "revenue": 65000, "expenses": 45000},
            {"month": "Feb", "revenue": 72000, "expenses": 48000},
            {"month": "Mar", "revenue": 68000, "expenses": 46000},
            {"month": "Abr", "revenue": 85000, "expenses": 52000},
            {"month": "May", "revenue": 92000, "expenses": 55000},
            {"month": "Jun", "revenue": 125430, "expenses": 87650},
        ]

        # Sample cash flow data
        cash_flow_data = [
            {"day": "1", "inflow": 15000, "outflow": 12000},
            {"day": "5", "inflow": 22000, "outflow": 18000},
            {"day": "10", "inflow": 18000, "outflow": 15000},
            {"day": "15", "inflow": 25000, "outflow": 20000},
            {"day": "20", "inflow": 30000, "outflow": 22000},
            {"day": "25", "inflow": 28000, "outflow": 24000},
            {"day": "30", "inflow": 35000, "outflow": 26000},
        ]

        # Sample expenses data
        expenses_data = [
            {"name": "Nómina", "value": 35, "color": "#3ECF8E"},
            {"name": "Marketing", "value": 20, "color": "#F59E0B"},
            {"name": "Operaciones", "value": 25, "color": "#8B5CF6"},
            {"name": "Tecnología", "value": 15, "color": "#3B82F6"},
            {"name": "Otros", "value": 5, "color": "#71717A"},
        ]

        return DashboardData(
            stats=stats,
            revenue_data=revenue_data,
            cash_flow_data=cash_flow_data,
            expenses_data=expenses_data
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/insights")
async def get_ai_insights():
    """Get AI-generated financial insights"""
    try:
        # TODO: Implement PydanticAI agent for insights
        insights = [
            {
                "type": "warning",
                "title": "Gasto en Marketing Alto",
                "description": "Tus gastos de marketing han aumentado 15% este mes. Considera revisar el ROI de tus campañas.",
                "action": "Revisar métricas de marketing"
            },
            {
                "type": "success", 
                "title": "Flujo de Caja Positivo",
                "description": "Tu flujo de caja se mantiene saludable con un crecimiento del 12% mensual.",
                "action": "Mantener estrategia actual"
            },
            {
                "type": "info",
                "title": "Oportunidad de Optimización",
                "description": "Podrías reducir costos operativos en un 8% automatizando ciertos procesos.",
                "action": "Evaluar automatización"
            }
        ]
        
        return {"insights": insights}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))