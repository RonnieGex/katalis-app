from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from pydantic import BaseModel
import pandas as pd
import io
import json
import os
import tempfile
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from services.auth_service import auth_service
from services.ai_service import ai_service

security = HTTPBearer()

def get_authenticated_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify user has access"""
    token_data = auth_service.verify_token(credentials.credentials)
    return token_data

router = APIRouter(prefix="/reports", tags=["reports"])

class ReportRequest(BaseModel):
    report_type: str = "financial"  # financial, operational, marketing, comprehensive
    period_days: int = 30
    format: str = "json"  # json, pdf, excel, csv

class FinancialData(BaseModel):
    revenue: float
    expenses: float
    profit: float
    cash_flow: float
    customers: int
    units_sold: int
    date: str

@router.post("/generate")
async def generate_report(
    request: ReportRequest,
    current_user: dict = Depends(get_authenticated_user)
):
    """Generate comprehensive financial report with real data analysis"""
    try:
        # Simulate real financial data (in real app, get from database)
        end_date = datetime.now()
        start_date = end_date - timedelta(days=request.period_days)
        
        # Generate sample data for the period
        financial_data = []
        base_revenue = 300000
        base_expenses = 200000
        
        for i in range(request.period_days):
            date = start_date + timedelta(days=i)
            growth_factor = 1 + (i * 0.002)  # 0.2% daily growth
            
            revenue = base_revenue * growth_factor + (i % 7) * 5000  # Weekly cycles
            expenses = base_expenses * growth_factor + (i % 5) * 3000  # Different expense cycles
            
            financial_data.append({
                "date": date.strftime("%Y-%m-%d"),
                "revenue": round(revenue, 2),
                "expenses": round(expenses, 2),
                "profit": round(revenue - expenses, 2),
                "cash_flow": round((revenue - expenses) * 0.8, 2),  # 80% of profit as cash flow
                "customers": 400 + i * 2,  # Growing customer base
                "units_sold": int(revenue / 150)  # Average unit price 150
            })
        
        # Calculate metrics
        total_revenue = sum(d["revenue"] for d in financial_data)
        total_expenses = sum(d["expenses"] for d in financial_data)
        total_profit = total_revenue - total_expenses
        avg_cash_flow = sum(d["cash_flow"] for d in financial_data) / len(financial_data)
        
        # Unit economics
        total_customers = financial_data[-1]["customers"]
        ltv = 3000  # Example LTV
        coca = 100  # Example COCA
        roi = (total_profit / total_expenses) * 100
        
        metrics = {
            "period": {
                "start_date": start_date.strftime("%Y-%m-%d"),
                "end_date": end_date.strftime("%Y-%m-%d"),
                "days": request.period_days
            },
            "financial_summary": {
                "total_revenue": round(total_revenue, 2),
                "total_expenses": round(total_expenses, 2),
                "net_profit": round(total_profit, 2),
                "profit_margin": round((total_profit / total_revenue) * 100, 2),
                "average_daily_revenue": round(total_revenue / request.period_days, 2),
                "average_cash_flow": round(avg_cash_flow, 2)
            },
            "unit_economics": {
                "ltv": ltv,
                "coca": coca,
                "ltv_coca_ratio": round(ltv / coca, 2),
                "roi": round(roi, 2),
                "total_customers": total_customers,
                "revenue_per_customer": round(total_revenue / total_customers, 2)
            },
            "growth_metrics": {
                "revenue_growth": round(((financial_data[-1]["revenue"] / financial_data[0]["revenue"]) - 1) * 100, 2),
                "customer_growth": round(((total_customers / 400) - 1) * 100, 2),
                "daily_growth_rate": round(0.2, 2)  # 0.2% from simulation
            },
            "detailed_data": financial_data
        }
        
        # Get AI insights
        ai_insights = await ai_service.analyze_financial_data(
            current_user["sub"],
            "comprehensive_analysis",
            {
                "financial_summary": metrics["financial_summary"],
                "unit_economics": metrics["unit_economics"],
                "growth_metrics": metrics["growth_metrics"],
                "period_days": request.period_days
            }
        )
        
        metrics["ai_insights"] = ai_insights
        
        if request.format == "json":
            return metrics
        elif request.format == "pdf":
            pdf_path = await _generate_pdf_report(metrics, request.report_type)
            return FileResponse(pdf_path, filename=f"katalis_report_{datetime.now().strftime('%Y%m%d')}.pdf")
        elif request.format == "excel":
            excel_path = await _generate_excel_report(metrics, request.report_type)
            return FileResponse(excel_path, filename=f"katalis_report_{datetime.now().strftime('%Y%m%d')}.xlsx")
        elif request.format == "csv":
            csv_path = await _generate_csv_report(metrics, request.report_type)
            return FileResponse(csv_path, filename=f"katalis_report_{datetime.now().strftime('%Y%m%d')}.csv")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating report: {str(e)}")

@router.get("/kpis")
async def get_kpis(
    period_days: int = Query(30, description="Number of days for KPI analysis"),
    current_user: dict = Depends(get_authenticated_user)
):
    """Get real-time KPIs with actual calculations"""
    try:
        # Simulate current metrics (replace with real DB queries)
        current_metrics = {
            "revenue": 380430,
            "expenses": 275000,
            "customers": 565,
            "units_sold": 1902,
            "marketing_spend": 55000,
            "new_customers": 45,
            "active_users": 520
        }
        
        # Calculate KPIs
        kpis = [
            {
                "name": "Ingresos Mensuales",
                "value": current_metrics["revenue"],
                "target": 400000,
                "unit": "MXN",
                "trend": "down" if current_metrics["revenue"] < 400000 else "up",
                "variance": round(((current_metrics["revenue"] / 400000) - 1) * 100, 1),
                "status": "warning" if current_metrics["revenue"] < 400000 else "excellent"
            },
            {
                "name": "Margen Neto",
                "value": round(((current_metrics["revenue"] - current_metrics["expenses"]) / current_metrics["revenue"]) * 100, 1),
                "target": 30,
                "unit": "%",
                "trend": "up",
                "variance": 2.1,
                "status": "good"
            },
            {
                "name": "ROI Marketing",
                "value": round(((current_metrics["revenue"] - current_metrics["marketing_spend"]) / current_metrics["marketing_spend"]) * 100, 1),
                "target": 200,
                "unit": "%",
                "trend": "up",
                "variance": 42.5,
                "status": "excellent"
            },
            {
                "name": "Adquisición Clientes",
                "value": current_metrics["new_customers"],
                "target": 50,
                "unit": "clientes",
                "trend": "down",
                "variance": -10.0,
                "status": "warning"
            },
            {
                "name": "Ingresos por Cliente",
                "value": round(current_metrics["revenue"] / current_metrics["customers"], 2),
                "target": 600,
                "unit": "MXN",
                "trend": "up",
                "variance": 12.3,
                "status": "good"
            },
            {
                "name": "Retención",
                "value": 87.5,
                "target": 85,
                "unit": "%",
                "trend": "up",
                "variance": 2.9,
                "status": "excellent"
            }
        ]
        
        return {
            "period_days": period_days,
            "last_updated": datetime.now().isoformat(),
            "kpis": kpis,
            "summary": {
                "excellent_count": len([k for k in kpis if k["status"] == "excellent"]),
                "good_count": len([k for k in kpis if k["status"] == "good"]),
                "warning_count": len([k for k in kpis if k["status"] == "warning"]),
                "critical_count": len([k for k in kpis if k["status"] == "critical"])
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching KPIs: {str(e)}")

@router.post("/optimize-expenses")
async def optimize_expenses(
    current_user: dict = Depends(get_authenticated_user)
):
    """AI-powered expense optimization analysis"""
    try:
        # Get current expense data (simulate)
        expense_data = {
            "categories": [
                {"name": "Nómina", "amount": 110000, "percentage": 40},
                {"name": "Marketing", "amount": 55000, "percentage": 20},
                {"name": "Operaciones", "amount": 66000, "percentage": 24},
                {"name": "Tecnología", "amount": 24000, "percentage": 9},
                {"name": "Otros", "amount": 20000, "percentage": 7}
            ],
            "total_expenses": 275000,
            "target_reduction": 10  # 10% reduction goal
        }
        
        # AI analysis for optimization
        ai_analysis = await ai_service.analyze_financial_data(
            current_user["sub"],
            "expense_optimization",
            expense_data
        )
        
        # Generate optimization recommendations
        optimizations = [
            {
                "category": "Marketing",
                "current_amount": 55000,
                "recommended_amount": 48000,
                "savings": 7000,
                "impact": "low",
                "explanation": "Redirigir 12% del presupuesto a canales más eficientes",
                "priority": "high"
            },
            {
                "category": "Operaciones", 
                "current_amount": 66000,
                "recommended_amount": 58000,
                "savings": 8000,
                "impact": "medium",
                "explanation": "Automatizar procesos manuales y renegociar contratos",
                "priority": "medium"
            },
            {
                "category": "Tecnología",
                "current_amount": 24000,
                "recommended_amount": 20000,
                "savings": 4000,
                "impact": "low",
                "explanation": "Consolidar licencias y herramientas redundantes",
                "priority": "low"
            }
        ]
        
        total_savings = sum(opt["savings"] for opt in optimizations)
        
        return {
            "current_expenses": expense_data,
            "optimizations": optimizations,
            "projected_savings": {
                "total_amount": total_savings,
                "percentage": round((total_savings / expense_data["total_expenses"]) * 100, 1),
                "annual_impact": total_savings * 12
            },
            "ai_insights": ai_analysis,
            "implementation_timeline": "2-4 semanas",
            "confidence_score": 85
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error optimizing expenses: {str(e)}")

@router.post("/project-forecast")
async def project_next_month(
    current_user: dict = Depends(get_authenticated_user)
):
    """Project financial metrics for next month using AI"""
    try:
        # Get historical data for forecasting
        historical_data = [
            {"month": "2024-01", "revenue": 320000, "expenses": 240000, "customers": 450},
            {"month": "2024-02", "revenue": 335000, "expenses": 250000, "customers": 480},
            {"month": "2024-03", "revenue": 365000, "expenses": 260000, "customers": 520},
            {"month": "2024-04", "revenue": 380000, "expenses": 265000, "customers": 550},
            {"month": "2024-05", "revenue": 395000, "expenses": 270000, "customers": 580},
            {"month": "2024-06", "revenue": 380430, "expenses": 275000, "customers": 565}
        ]
        
        # Calculate trends
        revenue_trend = (historical_data[-1]["revenue"] - historical_data[0]["revenue"]) / len(historical_data)
        expense_trend = (historical_data[-1]["expenses"] - historical_data[0]["expenses"]) / len(historical_data)
        customer_trend = (historical_data[-1]["customers"] - historical_data[0]["customers"]) / len(historical_data)
        
        # AI-powered forecasting
        ai_forecast = await ai_service.analyze_financial_data(
            current_user["sub"],
            "financial_forecast",
            {
                "historical_data": historical_data,
                "trends": {
                    "revenue_trend": revenue_trend,
                    "expense_trend": expense_trend,
                    "customer_trend": customer_trend
                }
            }
        )
        
        # Generate projections
        next_month_base = historical_data[-1]
        
        # Conservative, realistic, optimistic scenarios
        scenarios = {
            "conservative": {
                "revenue": round(next_month_base["revenue"] * 1.02, 2),  # 2% growth
                "expenses": round(next_month_base["expenses"] * 1.03, 2),  # 3% expense increase
                "customers": round(next_month_base["customers"] * 1.015),  # 1.5% growth
                "probability": 70
            },
            "realistic": {
                "revenue": round(next_month_base["revenue"] * 1.05, 2),  # 5% growth
                "expenses": round(next_month_base["expenses"] * 1.02, 2),  # 2% expense increase
                "customers": round(next_month_base["customers"] * 1.03),  # 3% growth
                "probability": 60
            },
            "optimistic": {
                "revenue": round(next_month_base["revenue"] * 1.10, 2),  # 10% growth
                "expenses": round(next_month_base["expenses"] * 1.01, 2),  # 1% expense increase
                "customers": round(next_month_base["customers"] * 1.05),  # 5% growth
                "probability": 30
            }
        }
        
        # Calculate derived metrics for each scenario
        for scenario_name, scenario in scenarios.items():
            scenario["profit"] = scenario["revenue"] - scenario["expenses"]
            scenario["profit_margin"] = round((scenario["profit"] / scenario["revenue"]) * 100, 1)
            scenario["revenue_per_customer"] = round(scenario["revenue"] / scenario["customers"], 2)
        
        return {
            "forecast_date": datetime.now().isoformat(),
            "target_month": (datetime.now() + timedelta(days=30)).strftime("%Y-%m"),
            "historical_trends": {
                "revenue_monthly_growth": round((revenue_trend / next_month_base["revenue"]) * 100, 2),
                "expense_monthly_growth": round((expense_trend / next_month_base["expenses"]) * 100, 2),
                "customer_monthly_growth": round((customer_trend / next_month_base["customers"]) * 100, 2)
            },
            "scenarios": scenarios,
            "recommendations": [
                "Mantener crecimiento actual del 5% mensual en ingresos",
                "Controlar crecimiento de gastos por debajo del 2%",
                "Enfocar en retención de clientes actuales",
                "Invertir en canales de adquisición más eficientes"
            ],
            "key_metrics_to_monitor": [
                "Conversión de leads a clientes",
                "Costo de adquisición por canal",
                "Retención mensual de clientes",
                "Margen por producto/servicio"
            ],
            "ai_insights": ai_forecast,
            "confidence_level": 75
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating forecast: {str(e)}")

async def _generate_pdf_report(metrics: dict, report_type: str) -> str:
    """Generate PDF report"""
    # Create temporary file
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
    
    # Create PDF document
    doc = SimpleDocTemplate(temp_file.name, pagesize=A4)
    styles = getSampleStyleSheet()
    story = []
    
    # Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=20,
        spaceAfter=30,
        alignment=1  # Center
    )
    story.append(Paragraph(f"Reporte Financiero KatalisApp", title_style))
    story.append(Spacer(1, 20))
    
    # Financial Summary
    summary = metrics["financial_summary"]
    data = [
        ['Métrica', 'Valor'],
        ['Ingresos Totales', f"${summary['total_revenue']:,.2f}"],
        ['Gastos Totales', f"${summary['total_expenses']:,.2f}"],
        ['Utilidad Neta', f"${summary['net_profit']:,.2f}"],
        ['Margen de Utilidad', f"{summary['profit_margin']:.1f}%"],
        ['Flujo de Caja Promedio', f"${summary['average_cash_flow']:,.2f}"]
    ]
    
    table = Table(data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 14),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    story.append(table)
    
    # Build PDF
    doc.build(story)
    temp_file.close()
    
    return temp_file.name

async def _generate_excel_report(metrics: dict, report_type: str) -> str:
    """Generate Excel report"""
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx')
    
    with pd.ExcelWriter(temp_file.name, engine='openpyxl') as writer:
        # Financial Summary
        summary_df = pd.DataFrame([
            ['Ingresos Totales', metrics["financial_summary"]["total_revenue"]],
            ['Gastos Totales', metrics["financial_summary"]["total_expenses"]],
            ['Utilidad Neta', metrics["financial_summary"]["net_profit"]],
            ['Margen de Utilidad (%)', metrics["financial_summary"]["profit_margin"]]
        ], columns=['Métrica', 'Valor'])
        
        summary_df.to_excel(writer, sheet_name='Resumen', index=False)
        
        # Detailed Data
        detailed_df = pd.DataFrame(metrics["detailed_data"])
        detailed_df.to_excel(writer, sheet_name='Datos Detallados', index=False)
        
        # Unit Economics
        unit_econ_df = pd.DataFrame([
            ['LTV', metrics["unit_economics"]["ltv"]],
            ['COCA', metrics["unit_economics"]["coca"]],
            ['Ratio LTV/COCA', metrics["unit_economics"]["ltv_coca_ratio"]],
            ['ROI (%)', metrics["unit_economics"]["roi"]]
        ], columns=['Métrica', 'Valor'])
        
        unit_econ_df.to_excel(writer, sheet_name='Unit Economics', index=False)
    
    temp_file.close()
    return temp_file.name

async def _generate_csv_report(metrics: dict, report_type: str) -> str:
    """Generate CSV report"""
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.csv', mode='w')
    
    # Combine all data
    all_data = []
    
    # Financial summary
    for key, value in metrics["financial_summary"].items():
        all_data.append([key, value])
    
    # Write to CSV
    df = pd.DataFrame(all_data, columns=['Métrica', 'Valor'])
    df.to_csv(temp_file.name, index=False)
    
    temp_file.close()
    return temp_file.name