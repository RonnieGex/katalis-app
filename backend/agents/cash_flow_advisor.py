"""
Agente especializado en análisis y optimización de flujo de caja
Basado en los Capítulos 3-4 del libro "Finanzas para Emprendedores"
"""

from typing import Dict, List, Optional
from pydantic import BaseModel, Field
from pydantic_ai import Agent
import pandas as pd
from datetime import datetime, timedelta
import json

class CashFlowEntry(BaseModel):
    """Entrada individual de flujo de caja"""
    date: str
    type: str = Field(description="income o expense")
    category: str
    description: str
    amount: float
    recurring: bool = False

class CashFlowProjection(BaseModel):
    """Proyección de flujo de caja"""
    period: str = Field(description="Período de la proyección")
    opening_balance: float
    total_inflows: float
    total_outflows: float
    net_cash_flow: float
    closing_balance: float
    cumulative_cash_flow: float

class CashFlowAlert(BaseModel):
    """Alerta de flujo de caja"""
    severity: str = Field(description="Critical, Warning, Info")
    title: str
    description: str
    projected_date: str
    impact_amount: float
    recommended_actions: List[str]

class CashFlowRecommendation(BaseModel):
    """Recomendación específica para flujo de caja"""
    category: str = Field(description="collections, payments, financing, operations")
    priority: str = Field(description="Alta, Media, Baja")
    title: str
    description: str
    potential_impact: float = Field(description="Impacto en cash flow (positivo/negativo)")
    implementation_time: str
    effort_required: str = Field(description="Bajo, Medio, Alto")
    risk_level: str = Field(description="Bajo, Medio, Alto")

class CashFlowAnalysis(BaseModel):
    """Análisis completo de flujo de caja"""
    current_position: str = Field(description="Excelente, Saludable, Ajustado, Crítico")
    cash_runway_months: float = Field(description="Meses de runway disponible")
    seasonal_patterns: List[str] = Field(description="Patrones estacionales identificados")
    key_risks: List[str] = Field(description="Principales riesgos identificados")
    opportunities: List[str] = Field(description="Oportunidades de optimización")
    alerts: List[CashFlowAlert]
    recommendations: List[CashFlowRecommendation]

# Agente especializado en análisis de flujo de caja
cash_flow_analyzer = Agent(
    'openai:gpt-4o-mini',
    result_type=CashFlowAnalysis,
    system_prompt="""
    Eres un especialista en gestión de flujo de caja para PyMEs y emprendimientos,
    con expertise en los conceptos de los Capítulos 3-4 de "Finanzas para Emprendedores".
    
    Tu especialización incluye:
    
    1. ANÁLISIS DE FLUJO DE CAJA:
       - Proyección de entradas y salidas
       - Identificación de patrones estacionales
       - Cálculo de runway financiero
       - Análisis de liquidez y solvencia
    
    2. GESTIÓN DE COBROS Y PAGOS:
       - Optimización de términos de cobro
       - Gestión estratégica de pagos
       - Manejo de cuentas por cobrar/pagar
       - Negociación con proveedores
    
    3. PLANIFICACIÓN FINANCIERA:
       - Presupuestos de efectivo
       - Escenarios optimista/pesimista
       - Puntos críticos de liquidez
       - Necesidades de financiamiento
    
    4. ALERTAS TEMPRANAS:
       - Identificación de riesgos de liquidez
       - Proyección de déficits futuros
       - Oportunidades de inversión temporal
       - Momentos óptimos para decisiones financieras
    
    PRINCIPIOS DE ANÁLISIS:
    - Prioriza la supervivencia del negocio (cash is king)
    - Identifica patrones y tendencias
    - Proporciona alertas tempranas y específicas
    - Sugiere acciones concretas y temporizadas
    - Considera el contexto del negocio y la industria
    
    ESTILO DE RECOMENDACIONES:
    - Específicas y accionables
    - Priorizadas por impacto y urgencia
    - Con tiempos de implementación claros
    - Considerando riesgos y beneficios
    """,
)

# Agente para optimización de cobros
collections_optimizer = Agent(
    'openai:gpt-4o-mini',
    result_type=List[CashFlowRecommendation],
    system_prompt="""
    Eres un especialista en optimización de cobros y gestión de cuentas por cobrar.
    
    Tu enfoque está en:
    
    1. ACELERACIÓN DE COBROS:
       - Términos de pago óptimos
       - Incentivos por pronto pago
       - Métodos de cobro eficientes
       - Automatización de procesos
    
    2. REDUCCIÓN DE CARTERA VENCIDA:
       - Políticas de crédito
       - Seguimiento sistemático
       - Escalación de cobranza
       - Provisiones por incobrabilidad
    
    3. MEJORA EN FLUJO DE EFECTIVO:
       - Factoring y descuento
       - Anticipos de clientes
       - Pagos recurrentes
       - Diversificación de cartera
    
    Proporciona estrategias prácticas para acelerar la conversión de ventas en efectivo.
    """,
)

class CashFlowAdvisorService:
    """Servicio de asesoría especializada en flujo de caja"""
    
    def __init__(self):
        self.cash_flow_analyzer = cash_flow_analyzer
        self.collections_optimizer = collections_optimizer
    
    async def analyze_cash_flow_health(
        self,
        historical_data: List[CashFlowEntry],
        current_balance: float,
        projections: List[CashFlowProjection],
        business_context: Dict
    ) -> CashFlowAnalysis:
        """Análisis integral de salud del flujo de caja"""
        
        # Preparar datos históricos
        df = pd.DataFrame([entry.dict() for entry in historical_data])
        df['date'] = pd.to_datetime(df['date'])
        df['amount_signed'] = df.apply(lambda x: x['amount'] if x['type'] == 'income' else -x['amount'], axis=1)
        
        # Calcular métricas clave
        monthly_summary = df.groupby([df['date'].dt.year, df['date'].dt.month]).agg({
            'amount_signed': 'sum'
        }).reset_index()
        
        avg_monthly_flow = monthly_summary['amount_signed'].mean()
        cash_runway = current_balance / abs(avg_monthly_flow) if avg_monthly_flow < 0 else float('inf')
        
        # Analizar patrones estacionales
        seasonal_analysis = df.groupby(df['date'].dt.month)['amount_signed'].mean()
        seasonal_variance = seasonal_analysis.std() / seasonal_analysis.mean() if seasonal_analysis.mean() != 0 else 0
        
        # Preparar datos para el análisis
        analysis_data = {
            "balance_actual": current_balance,
            "flujo_promedio_mensual": avg_monthly_flow,
            "runway_calculado": cash_runway,
            "varianza_estacional": seasonal_variance,
            "ultimos_6_meses": monthly_summary.tail(6).to_dict('records'),
            "proyecciones": [proj.dict() for proj in projections],
            "contexto_negocio": business_context,
            "metricas_cobros": self._calculate_collections_metrics(df),
            "metricas_pagos": self._calculate_payments_metrics(df),
        }
        
        prompt = f"""
        Analiza la salud del flujo de caja de este negocio basándote en los siguientes datos:
        
        {json.dumps(analysis_data, indent=2, ensure_ascii=False, default=str)}
        
        Proporciona un análisis integral que incluya:
        
        1. POSICIÓN ACTUAL:
           - Evaluación de la salud del flujo de caja
           - Runway disponible y riesgos de liquidez
           - Comparación con benchmarks de la industria
        
        2. PATRONES Y TENDENCIAS:
           - Identificación de patrones estacionales
           - Tendencias de crecimiento/deterioro
           - Ciclos de cobros y pagos
        
        3. ALERTAS TEMPRANAS:
           - Riesgos próximos de liquidez
           - Oportunidades de optimización
           - Puntos críticos en proyecciones
        
        4. RECOMENDACIONES ESPECÍFICAS:
           - Acciones inmediatas (próximos 30 días)
           - Estrategias de mediano plazo (3-6 meses)
           - Optimizaciones estructurales
        
        Considera el contexto del negocio y prioriza la estabilidad financiera.
        """
        
        result = await self.cash_flow_analyzer.run(prompt)
        return result.data
    
    async def optimize_collections_strategy(
        self,
        current_collections_data: Dict,
        customer_portfolio: List[Dict],
        payment_terms: Dict
    ) -> List[CashFlowRecommendation]:
        """Optimización de estrategia de cobros"""
        
        # Analizar datos de cobros
        collections_analysis = {
            "dias_promedio_cobro": current_collections_data.get("avg_collection_days", 0),
            "cartera_vencida_porcentaje": current_collections_data.get("overdue_percentage", 0),
            "concentracion_clientes": self._analyze_customer_concentration(customer_portfolio),
            "terminos_pago_actuales": payment_terms,
            "eficiencia_cobros": current_collections_data.get("collection_efficiency", 0),
        }
        
        prompt = f"""
        Optimiza la estrategia de cobros basándote en:
        
        ANÁLISIS DE COBROS ACTUAL:
        {json.dumps(collections_analysis, indent=2, ensure_ascii=False)}
        
        PORTAFOLIO DE CLIENTES:
        {json.dumps(customer_portfolio[:10], indent=2, ensure_ascii=False)}  # Primeros 10 para contexto
        
        Proporciona recomendaciones específicas para:
        
        1. REDUCCIÓN DE DÍAS DE COBRO:
           - Optimización de términos de pago
           - Incentivos por pronto pago
           - Mejoras en procesos de facturación
        
        2. GESTIÓN DE CARTERA VENCIDA:
           - Estrategias de seguimiento
           - Escalación de cobranza
           - Políticas de crédito
        
        3. DIVERSIFICACIÓN Y RIESGO:
           - Reducción de concentración
           - Evaluación crediticia
           - Garantías y seguros
        
        4. AUTOMATIZACIÓN Y EFICIENCIA:
           - Herramientas tecnológicas
           - Procesos optimizados
           - KPIs y seguimiento
        
        Cada recomendación debe incluir:
        - Impacto estimado en días de cobro
        - Costo/esfuerzo de implementación
        - Tiempo para ver resultados
        """
        
        result = await self.collections_optimizer.run(prompt)
        return result.data
    
    def _calculate_collections_metrics(self, df: pd.DataFrame) -> Dict:
        """Calcula métricas de cobros"""
        income_df = df[df['type'] == 'income'].copy()
        
        if len(income_df) == 0:
            return {}
        
        # Simular días de cobro (en un sistema real vendría de datos de facturación)
        avg_collection_days = 30  # Placeholder
        collection_efficiency = 95.0  # Placeholder
        
        return {
            "total_income_last_month": income_df[income_df['date'] >= (datetime.now() - timedelta(days=30))]['amount'].sum(),
            "avg_collection_days": avg_collection_days,
            "collection_efficiency": collection_efficiency,
            "income_trend": income_df.groupby(income_df['date'].dt.month)['amount'].sum().pct_change().mean()
        }
    
    def _calculate_payments_metrics(self, df: pd.DataFrame) -> Dict:
        """Calcula métricas de pagos"""
        expense_df = df[df['type'] == 'expense'].copy()
        
        if len(expense_df) == 0:
            return {}
        
        return {
            "total_expenses_last_month": expense_df[expense_df['date'] >= (datetime.now() - timedelta(days=30))]['amount'].sum(),
            "avg_payment_days": 25,  # Placeholder
            "expense_categories": expense_df.groupby('category')['amount'].sum().to_dict(),
            "expense_trend": expense_df.groupby(expense_df['date'].dt.month)['amount'].sum().pct_change().mean()
        }
    
    def _analyze_customer_concentration(self, customer_portfolio: List[Dict]) -> Dict:
        """Analiza concentración de clientes"""
        if not customer_portfolio:
            return {}
        
        df = pd.DataFrame(customer_portfolio)
        total_revenue = df['revenue'].sum() if 'revenue' in df.columns else 0
        
        if total_revenue == 0:
            return {}
        
        # Calcular concentración
        df_sorted = df.sort_values('revenue', ascending=False) if 'revenue' in df.columns else df
        top_5_concentration = (df_sorted.head(5)['revenue'].sum() / total_revenue * 100) if len(df_sorted) >= 5 else 100
        
        return {
            "total_customers": len(customer_portfolio),
            "top_5_concentration_pct": top_5_concentration,
            "avg_customer_revenue": total_revenue / len(customer_portfolio),
            "revenue_distribution": df['revenue'].describe().to_dict() if 'revenue' in df.columns else {}
        }
    
    async def generate_cash_flow_forecast(
        self,
        historical_data: List[CashFlowEntry],
        assumptions: Dict,
        forecast_months: int = 12
    ) -> List[CashFlowProjection]:
        """Genera proyección de flujo de caja"""
        
        # Convertir datos históricos a DataFrame
        df = pd.DataFrame([entry.dict() for entry in historical_data])
        df['date'] = pd.to_datetime(df['date'])
        
        # Calcular promedios y tendencias
        monthly_income = df[df['type'] == 'income'].groupby([df['date'].dt.year, df['date'].dt.month])['amount'].sum()
        monthly_expenses = df[df['type'] == 'expense'].groupby([df['date'].dt.year, df['date'].dt.month])['amount'].sum()
        
        avg_monthly_income = monthly_income.mean() if len(monthly_income) > 0 else 0
        avg_monthly_expenses = monthly_expenses.mean() if len(monthly_expenses) > 0 else 0
        
        # Aplicar assumptions de crecimiento/cambios
        income_growth_rate = assumptions.get('income_growth_rate', 0) / 100
        expense_growth_rate = assumptions.get('expense_growth_rate', 0) / 100
        
        projections = []
        current_balance = assumptions.get('starting_balance', 0)
        
        for month in range(forecast_months):
            # Calcular ingresos y gastos proyectados
            projected_income = avg_monthly_income * (1 + income_growth_rate) ** month
            projected_expenses = avg_monthly_expenses * (1 + expense_growth_rate) ** month
            
            # Aplicar estacionalidad si está disponible
            if 'seasonal_factors' in assumptions:
                month_index = month % 12
                seasonal_factor = assumptions['seasonal_factors'].get(str(month_index), 1.0)
                projected_income *= seasonal_factor
            
            net_cash_flow = projected_income - projected_expenses
            new_balance = current_balance + net_cash_flow
            
            # Crear proyección
            projection = CashFlowProjection(
                period=f"Mes {month + 1}",
                opening_balance=current_balance,
                total_inflows=projected_income,
                total_outflows=projected_expenses,
                net_cash_flow=net_cash_flow,
                closing_balance=new_balance,
                cumulative_cash_flow=new_balance - assumptions.get('starting_balance', 0)
            )
            
            projections.append(projection)
            current_balance = new_balance
        
        return projections
    
    def calculate_cash_flow_kpis(self, data: List[CashFlowEntry], current_balance: float) -> Dict:
        """Calcula KPIs clave de flujo de caja"""
        
        df = pd.DataFrame([entry.dict() for entry in data])
        df['date'] = pd.to_datetime(df['date'])
        df['amount_signed'] = df.apply(lambda x: x['amount'] if x['type'] == 'income' else -x['amount'], axis=1)
        
        # Filtrar últimos 3 meses
        three_months_ago = datetime.now() - timedelta(days=90)
        recent_data = df[df['date'] >= three_months_ago]
        
        # Calcular KPIs
        kpis = {
            "current_cash_position": current_balance,
            "avg_monthly_burn": abs(recent_data[recent_data['amount_signed'] < 0]['amount_signed'].sum() / 3) if len(recent_data) > 0 else 0,
            "avg_monthly_income": recent_data[recent_data['amount_signed'] > 0]['amount_signed'].sum() / 3 if len(recent_data) > 0 else 0,
            "cash_runway_months": 0,
            "operating_cash_flow": recent_data['amount_signed'].sum(),
            "cash_conversion_cycle": 30,  # Placeholder - requiere datos adicionales
            "liquidity_ratio": 0,
            "cash_flow_volatility": recent_data.groupby(recent_data['date'].dt.month)['amount_signed'].sum().std() if len(recent_data) > 0 else 0
        }
        
        # Calcular runway
        if kpis["avg_monthly_burn"] > 0:
            kpis["cash_runway_months"] = current_balance / kpis["avg_monthly_burn"]
        
        # Calcular ratio de liquidez simple
        monthly_expenses = kpis["avg_monthly_burn"]
        kpis["liquidity_ratio"] = current_balance / monthly_expenses if monthly_expenses > 0 else float('inf')
        
        return kpis

# Instancia global del servicio
cash_flow_advisor_service = CashFlowAdvisorService()