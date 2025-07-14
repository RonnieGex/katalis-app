"""
Live Metrics API - Real-time business metrics for dashboard header
"""
from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import random
from pydantic import BaseModel

router = APIRouter(prefix="/api/metrics", tags=["live-metrics"])

class LiveMetric(BaseModel):
    label: str
    value: str
    change: str
    trend: str  # up, down, stable
    color: str
    tooltip: str

def generate_realistic_metrics() -> Dict[str, LiveMetric]:
    """Generate realistic business metrics based on current month"""
    current_date = datetime.now()
    
    # Base metrics with some realistic variation
    base_revenue = 125000
    base_expenses = 87000
    
    # Add monthly variation (±15%)
    revenue_variation = random.uniform(0.85, 1.15)
    expense_variation = random.uniform(0.90, 1.10)
    
    current_revenue = base_revenue * revenue_variation
    current_expenses = base_expenses * expense_variation
    net_profit = current_revenue - current_expenses
    
    # Calculate trends (compared to last month)
    revenue_change = random.uniform(-5, 25)  # -5% to +25%
    expense_change = random.uniform(-10, 15)  # -10% to +15%
    profit_change = random.uniform(-20, 40)   # More volatile
    
    # Cash flow calculation
    cash_flow = net_profit + random.uniform(-5000, 10000)  # Add working capital changes
    cash_flow_change = random.uniform(-15, 30)
    
    # Health score based on metrics
    profit_margin = (net_profit / current_revenue) * 100 if current_revenue > 0 else 0
    if profit_margin > 20:
        health_status = "Excelente"
        health_color = "text-success"
    elif profit_margin > 10:
        health_status = "Bueno"
        health_color = "text-primary"
    elif profit_margin > 5:
        health_status = "Regular"
        health_color = "text-warning"
    else:
        health_status = "Crítico"
        health_color = "text-error"
    
    return {
        "revenue": LiveMetric(
            label="Ingresos del Mes",
            value=f"${current_revenue:,.0f}",
            change=f"{'+' if revenue_change > 0 else ''}{revenue_change:.1f}%",
            trend="up" if revenue_change > 0 else "down" if revenue_change < -2 else "stable",
            color="text-success" if revenue_change > 5 else "text-primary" if revenue_change > 0 else "text-error",
            tooltip=f"Comparado con el mes anterior. Meta mensual: ${base_revenue:,.0f}"
        ),
        "expenses": LiveMetric(
            label="Gastos del Mes", 
            value=f"${current_expenses:,.0f}",
            change=f"{'+' if expense_change > 0 else ''}{expense_change:.1f}%",
            trend="down" if expense_change < 0 else "up" if expense_change > 5 else "stable",
            color="text-success" if expense_change < 0 else "text-warning" if expense_change < 10 else "text-error",
            tooltip=f"Incluye todos los gastos operativos. Objetivo: <${base_expenses:,.0f}"
        ),
        "profit": LiveMetric(
            label="Utilidad Neta",
            value=f"${net_profit:,.0f}",
            change=f"{'+' if profit_change > 0 else ''}{profit_change:.1f}%",
            trend="up" if profit_change > 0 else "down" if profit_change < -5 else "stable",
            color="text-success" if net_profit > 20000 else "text-primary" if net_profit > 0 else "text-error",
            tooltip=f"Margen: {profit_margin:.1f}%. Meta: >20% de margen neto"
        ),
        "cash_flow": LiveMetric(
            label="Flujo de Efectivo",
            value=f"${cash_flow:,.0f}",
            change=f"{'+' if cash_flow_change > 0 else ''}{cash_flow_change:.1f}%",
            trend="up" if cash_flow > 5000 else "down" if cash_flow < -2000 else "stable",
            color="text-success" if cash_flow > 10000 else "text-warning" if cash_flow > 0 else "text-error",
            tooltip="Efectivo disponible después de todas las operaciones"
        ),
        "health": LiveMetric(
            label="Salud Financiera",
            value=health_status,
            change=f"Score: {min(100, max(0, profit_margin * 3)):.0f}/100",
            trend="up" if profit_margin > 15 else "stable" if profit_margin > 8 else "down",
            color=health_color,
            tooltip=f"Basado en margen de ganancia ({profit_margin:.1f}%) y otros KPIs"
        )
    }

@router.get("/live")
async def get_live_metrics():
    """Get current live business metrics"""
    try:
        metrics = generate_realistic_metrics()
        
        return {
            "success": True,
            "metrics": {k: v.dict() for k, v in metrics.items()},
            "last_updated": datetime.now().isoformat(),
            "period": "current_month",
            "currency": "MXN"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching live metrics: {str(e)}")

@router.get("/summary")
async def get_metrics_summary():
    """Get summarized metrics for header display"""
    try:
        metrics = generate_realistic_metrics()
        
        # Select most important metrics for header
        summary = {
            "primary": metrics["profit"],  # Most important
            "secondary": metrics["cash_flow"],  # Second most important
            "status": metrics["health"]  # Overall health
        }
        
        return {
            "success": True,
            "summary": {k: v.dict() for k, v in summary.items()},
            "alerts": {
                "cash_flow_negative": float(metrics["cash_flow"].value.replace("$", "").replace(",", "")) < 0,
                "low_profit": float(metrics["profit"].value.replace("$", "").replace(",", "")) < 10000,
                "high_expenses": "up" in metrics["expenses"].trend
            },
            "last_updated": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching metrics summary: {str(e)}")

@router.get("/trends")
async def get_metrics_trends(days: int = 30):
    """Get metrics trends over time"""
    try:
        # Generate historical data for trends
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        trend_data = []
        current_date = start_date
        
        base_values = {
            "revenue": 125000 / 30,  # Daily revenue
            "expenses": 87000 / 30,   # Daily expenses
        }
        
        while current_date <= end_date:
            # Add realistic daily variation
            daily_revenue = base_values["revenue"] * random.uniform(0.7, 1.3)
            daily_expenses = base_values["expenses"] * random.uniform(0.8, 1.2)
            daily_profit = daily_revenue - daily_expenses
            
            trend_data.append({
                "date": current_date.isoformat()[:10],
                "revenue": round(daily_revenue, 2),
                "expenses": round(daily_expenses, 2),
                "profit": round(daily_profit, 2),
                "cash_flow": round(daily_profit + random.uniform(-500, 1000), 2)
            })
            
            current_date += timedelta(days=1)
        
        return {
            "success": True,
            "trends": trend_data,
            "period": f"last_{days}_days",
            "summary": {
                "avg_daily_revenue": sum(d["revenue"] for d in trend_data) / len(trend_data),
                "avg_daily_profit": sum(d["profit"] for d in trend_data) / len(trend_data),
                "total_revenue": sum(d["revenue"] for d in trend_data),
                "total_profit": sum(d["profit"] for d in trend_data)
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching trends: {str(e)}")

@router.get("/alerts")
async def get_metric_alerts():
    """Get metric-based alerts and warnings"""
    try:
        metrics = generate_realistic_metrics()
        alerts = []
        
        # Check each metric for alert conditions
        profit_value = float(metrics["profit"].value.replace("$", "").replace(",", ""))
        cash_flow_value = float(metrics["cash_flow"].value.replace("$", "").replace(",", ""))
        
        if profit_value < 0:
            alerts.append({
                "type": "critical",
                "metric": "profit",
                "message": "Utilidad negativa este mes",
                "action": "Revisar gastos urgentemente",
                "url": "/app/costs-pricing"
            })
        elif profit_value < 10000:
            alerts.append({
                "type": "warning", 
                "metric": "profit",
                "message": "Utilidad por debajo del objetivo",
                "action": "Analizar margen de ganancia",
                "url": "/app/profitability"
            })
        
        if cash_flow_value < 0:
            alerts.append({
                "type": "critical",
                "metric": "cash_flow",
                "message": "Flujo de efectivo negativo",
                "action": "Acelerar cobros y reducir pagos",
                "url": "/app/cash-flow"
            })
        elif cash_flow_value < 5000:
            alerts.append({
                "type": "warning",
                "metric": "cash_flow", 
                "message": "Flujo de efectivo bajo",
                "action": "Monitorear liquidez de cerca",
                "url": "/app/cash-flow"
            })
        
        return {
            "success": True,
            "alerts": alerts,
            "alert_count": len(alerts),
            "critical_count": sum(1 for a in alerts if a["type"] == "critical"),
            "last_checked": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking alerts: {str(e)}")

@router.post("/refresh")
async def refresh_metrics():
    """Manually refresh metrics (useful for demo purposes)"""
    try:
        # In a real app, this would trigger data recalculation
        metrics = generate_realistic_metrics()
        
        return {
            "success": True,
            "message": "Metrics refreshed successfully",
            "metrics": {k: v.dict() for k, v in metrics.items()},
            "refreshed_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error refreshing metrics: {str(e)}")