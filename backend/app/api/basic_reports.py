"""
Basic Reports API - Simplified endpoints for essential functionality
"""
from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
import json
from datetime import datetime, timedelta
import random

router = APIRouter(prefix="/api/reports", tags=["reports"])

# Sample data generators
def generate_financial_data(days: int = 30):
    """Generate sample financial data for the specified period"""
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    base_revenue = 100000
    base_expenses = 70000
    
    data = []
    current_date = start_date
    
    while current_date <= end_date:
        # Add some realistic variation
        revenue_variation = random.uniform(0.8, 1.2)
        expense_variation = random.uniform(0.9, 1.1)
        
        daily_revenue = (base_revenue / 30) * revenue_variation
        daily_expenses = (base_expenses / 30) * expense_variation
        
        data.append({
            "date": current_date.isoformat(),
            "revenue": round(daily_revenue, 2),
            "expenses": round(daily_expenses, 2),
            "profit": round(daily_revenue - daily_expenses, 2),
            "cash_flow": round(daily_revenue - daily_expenses + random.uniform(-1000, 1000), 2)
        })
        
        current_date += timedelta(days=1)
    
    return data

def calculate_kpis(data: List[Dict]) -> Dict[str, Any]:
    """Calculate KPIs from financial data"""
    total_revenue = sum(d["revenue"] for d in data)
    total_expenses = sum(d["expenses"] for d in data)
    total_profit = sum(d["profit"] for d in data)
    avg_cash_flow = sum(d["cash_flow"] for d in data) / len(data)
    
    return {
        "total_revenue": round(total_revenue, 2),
        "total_expenses": round(total_expenses, 2),
        "net_profit": round(total_profit, 2),
        "profit_margin": round((total_profit / total_revenue * 100), 2) if total_revenue > 0 else 0,
        "cash_flow": round(avg_cash_flow, 2),
        "ltv": 1200.0,  # Static for now
        "coca": 150.0,  # Static for now  
        "roi": round((total_profit / total_expenses * 100), 2) if total_expenses > 0 else 0,
        "growth_rate": round(random.uniform(5, 25), 2)
    }

@router.get("/dashboard-metrics")
async def get_dashboard_metrics(period_days: int = 30):
    """Get dashboard metrics for the specified period"""
    try:
        data = generate_financial_data(period_days)
        kpis = calculate_kpis(data)
        
        return {
            "success": True,
            "data": kpis,
            "period_days": period_days,
            "generated_at": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating metrics: {str(e)}")

@router.get("/historical-data")
async def get_historical_data(period_days: int = 30):
    """Get historical financial data"""
    try:
        data = generate_financial_data(period_days)
        return {
            "success": True,
            "data": data,
            "period_days": period_days,
            "total_records": len(data)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating historical data: {str(e)}")

@router.get("/kpis")
async def get_kpis():
    """Get list of available KPIs with definitions"""
    kpis = [
        {
            "id": "revenue",
            "name": "Ingresos Totales",
            "description": "Suma de todos los ingresos en el período",
            "category": "financial",
            "status": "excellent",
            "trend": "up"
        },
        {
            "id": "profit_margin",
            "name": "Margen de Ganancia",
            "description": "Porcentaje de ganancia sobre ingresos totales",
            "category": "profitability", 
            "status": "good",
            "trend": "stable"
        },
        {
            "id": "cash_flow",
            "name": "Flujo de Efectivo",
            "description": "Flujo de efectivo promedio mensual",
            "category": "liquidity",
            "status": "warning",
            "trend": "up"
        },
        {
            "id": "roi",
            "name": "Retorno de Inversión",
            "description": "Porcentaje de retorno sobre gastos",
            "category": "performance",
            "status": "good", 
            "trend": "up"
        }
    ]
    
    return {
        "success": True,
        "kpis": kpis,
        "total_count": len(kpis)
    }

@router.post("/generate")
async def generate_report(
    report_type: str = "financial",
    period_days: int = 30,
    format: str = "json"
):
    """Generate a report in the specified format"""
    try:
        # Get data
        data = generate_financial_data(period_days)
        kpis = calculate_kpis(data)
        
        report = {
            "report_type": report_type,
            "period_days": period_days,
            "generated_at": datetime.now().isoformat(),
            "summary": kpis,
            "detailed_data": data[-7:] if len(data) > 7 else data,  # Last 7 days for summary
            "recommendations": [
                "Considerar aumentar inversión en marketing para acelerar crecimiento",
                "Optimizar estructura de costos para mejorar margen de ganancia",
                "Implementar mejores controles de flujo de efectivo"
            ]
        }
        
        if format.lower() == "json":
            return {
                "success": True,
                "report": report,
                "download_url": f"/api/reports/download/{datetime.now().timestamp()}"
            }
        else:
            # For PDF/Excel/CSV we'd generate actual files
            return {
                "success": True,
                "message": f"Reporte {format.upper()} generado exitosamente",
                "download_url": f"/api/reports/download/{datetime.now().timestamp()}.{format}"
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating report: {str(e)}")

@router.get("/breakdown/{category}")
async def get_breakdown(category: str):
    """Get breakdown data for expenses, revenue, etc."""
    breakdowns = {
        "expenses": [
            {"name": "Nómina", "value": 35000, "percentage": 35, "color": "#3ECF8E"},
            {"name": "Marketing", "value": 20000, "percentage": 20, "color": "#F59E0B"}, 
            {"name": "Operaciones", "value": 25000, "percentage": 25, "color": "#8B5CF6"},
            {"name": "Tecnología", "value": 15000, "percentage": 15, "color": "#3B82F6"},
            {"name": "Otros", "value": 5000, "percentage": 5, "color": "#71717A"}
        ],
        "revenue": [
            {"name": "Producto A", "value": 45000, "percentage": 45, "color": "#3ECF8E"},
            {"name": "Producto B", "value": 30000, "percentage": 30, "color": "#F59E0B"},
            {"name": "Servicios", "value": 20000, "percentage": 20, "color": "#8B5CF6"},
            {"name": "Otros", "value": 5000, "percentage": 5, "color": "#71717A"}
        ]
    }
    
    if category not in breakdowns:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return {
        "success": True,
        "category": category,
        "data": breakdowns[category],
        "total": sum(item["value"] for item in breakdowns[category])
    }