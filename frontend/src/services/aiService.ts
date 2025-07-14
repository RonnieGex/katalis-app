/**
 * AI Insights Service
 * Servicio para interactuar con los endpoints de análisis financiero inteligente
 */

import { apiClient } from './api';

// Tipos de datos para AI
export interface FinancialMetrics {
  revenue: number;
  expenses: number;
  net_profit: number;
  cash_flow: number;
  ltv: number;
  coca: number;
  fixed_costs: number;
  variable_costs: number;
}

export interface UnitEconomics {
  price_per_unit: number;
  variable_cost_per_unit: number;
  marketing_spend: number;
  new_customers: number;
  avg_purchase_frequency: number;
  retention_months: number;
}

export interface BusinessContext {
  industry: string;
  business_stage: string;
  monthly_revenue: number;
  employee_count: number;
  months_operating: number;
}

export interface BusinessAnalysisRequest {
  financial_metrics: FinancialMetrics;
  unit_economics: UnitEconomics;
  business_context: BusinessContext;
}

export interface BookCitation {
  chapter: string;
  excerpt: string;
  loc?: number;
  similarity?: number;
}

export interface FinancialRecommendation {
  category: string;
  priority: string;
  title: string;
  description: string;
  potential_impact: string;
  implementation_steps: string[];
  estimated_time: string;
  risk_level: string;
  citations?: BookCitation[];
}

export interface BusinessAnalysis {
  overall_health: string;
  key_strengths: string[];
  areas_of_concern: string[];
  growth_opportunities: string[];
  financial_recommendations: FinancialRecommendation[];
}

export interface HealthScoreResponse {
  total_score: number;
  health_level: string;
  component_scores: Record<string, number>;
  recommendations_priority: string;
}

export interface QuickRecommendationsResponse {
  recommendations: Array<{
    category: string;
    priority: string;
    title: string;
    description: string;
    actions: string[];
  }>;
  summary: string;
  overall_status: string;
  generated_at: string;
}

export interface CashFlowEntry {
  date: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  recurring?: boolean;
}

export interface CashFlowAnalysisRequest {
  historical_data?: CashFlowEntry[];
  current_balance: number;
  monthly_expenses?: number;
  cash_flow_history?: any[];
  accounts_receivable?: number;
  accounts_payable?: number;
  business_context?: Record<string, any>;
}

export interface IndustryBenchmarks {
  industry: string;
  benchmarks: Record<string, { min: number; avg: number; max: number }>;
  last_updated?: string;
  note?: string;
}

class AIService {
  /**
   * Analiza la salud integral del negocio usando IA
   */
  async analyzeBusinessHealth(request: BusinessAnalysisRequest): Promise<{
    analysis: BusinessAnalysis;
    health_score: HealthScoreResponse;
    timestamp: string;
  }> {
    try {
      // Usa los agentes LangChain para análisis múltiple
      const response = await apiClient.post('/api/agents/multi-agent-analysis', {
        comprehensive_data: {
          ...request.financial_metrics,
          ...request.unit_economics,
          ...request.business_context
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error in AI analysis:', error);
      // Fallback a análisis básico
      const response = await apiClient.post('/ai/analyze/business-health', request);
      return response.data;
    }
  }

  /**
   * Optimiza la estrategia de precios
   */
  async optimizePricing(data: {
    current_pricing: Record<string, any>;
    cost_structure: Record<string, any>;
    market_data: Record<string, any>;
  }): Promise<{
    recommendations: FinancialRecommendation[];
    optimization_date: string;
  }> {
    const response = await apiClient.post('/ai/optimize/pricing', data);
    return response.data;
  }

  /**
   * Analiza oportunidades de crecimiento
   */
  async analyzeGrowthOpportunities(data: {
    current_metrics: FinancialMetrics;
    growth_data: Record<string, any>;
    objectives: Record<string, any>;
  }): Promise<{
    opportunities: FinancialRecommendation[];
    analysis_date: string;
  }> {
    const response = await apiClient.post('/ai/analyze/growth-opportunities', data);
    return response.data;
  }

  /**
   * Analiza flujo de caja con IA
   */
  async analyzeCashFlow(request: CashFlowAnalysisRequest): Promise<{
    analysis: any;
    projections: any[];
    kpis: Record<string, number>;
    analysis_date: string;
  }> {
    try {
      // Usa agente Maya para análisis de flujo de caja
      const response = await apiClient.post('/api/agents/maya/cash-flow-analysis', {
        current_balance: request.current_balance,
        monthly_expenses: request.monthly_expenses,
        cash_flow_history: request.cash_flow_history,
        accounts_receivable: request.accounts_receivable || 0,
        accounts_payable: request.accounts_payable || 0
      });
      return response.data;
    } catch (error) {
      console.error('Error in cash flow analysis:', error);
      const response = await apiClient.post('/ai/analyze/cash-flow', request);
      return response.data;
    }
  }

  /**
   * Análisis de escenarios financieros
   */
  async analyzeScenarios(data: {
    base_metrics: FinancialMetrics;
    scenarios: Array<Record<string, any>>;
  }): Promise<{
    scenario_results: Record<string, any>;
    base_metrics: FinancialMetrics;
    analysis_date: string;
  }> {
    const response = await apiClient.post('/ai/scenario/analysis', data);
    return response.data;
  }

  /**
   * Obtiene score de salud financiera rápido
   */
  async getHealthScore(params: {
    revenue: number;
    expenses: number;
    net_profit: number;
    cash_flow: number;
    ltv: number;
    coca: number;
    price_per_unit: number;
    variable_cost_per_unit: number;
    marketing_spend?: number;
    new_customers?: number;
    avg_purchase_frequency?: number;
    retention_months?: number;
  }): Promise<HealthScoreResponse> {
    const response = await apiClient.get('/ai/health-score', { params });
    return response.data;
  }

  /**
   * Obtiene recomendaciones rápidas
   */
  async getQuickRecommendations(request: BusinessAnalysisRequest): Promise<QuickRecommendationsResponse> {
    const response = await apiClient.post('/ai/recommendations/quick', request);
    return response.data;
  }

  /**
   * Obtiene benchmarks de industria
   */
  async getIndustryBenchmarks(industry: string): Promise<IndustryBenchmarks> {
    const response = await apiClient.get(`/ai/benchmarks/${encodeURIComponent(industry)}`);
    return response.data;
  }

  /**
   * Obtiene definiciones de KPIs
   */
  async getKPIDefinitions(): Promise<{
    kpi_definitions: Record<string, {
      name: string;
      definition: string;
      formula: string;
      benchmark: string;
      importance: string;
    }>;
    total_kpis: number;
    categories: string[];
  }> {
    const response = await apiClient.get('/ai/kpis/definitions');
    return response.data;
  }

  /**
   * Genera análisis financiero completo
   */
  async generateCompleteAnalysis(
    financialMetrics: FinancialMetrics,
    unitEconomics: UnitEconomics,
    businessContext: BusinessContext,
    cashFlowData?: CashFlowEntry[]
  ): Promise<{
    business_analysis: BusinessAnalysis;
    health_score: HealthScoreResponse;
    quick_recommendations: QuickRecommendationsResponse;
    cash_flow_analysis?: any;
    industry_benchmarks?: IndustryBenchmarks;
  }> {
    const request: BusinessAnalysisRequest = {
      financial_metrics: financialMetrics,
      unit_economics: unitEconomics,
      business_context: businessContext
    };

    // Ejecutar análisis en paralelo
    const [businessAnalysis, quickRecommendationsResult, industryBenchmarks] = await Promise.all([
      this.analyzeBusinessHealth(request),
      this.getQuickRecommendations(request),
      this.getIndustryBenchmarks(businessContext.industry).catch(() => null) // Optional
    ]);

    let cashFlowAnalysis = null;
    if (cashFlowData && cashFlowData.length > 0) {
      cashFlowAnalysis = await this.analyzeCashFlow({
        historical_data: cashFlowData,
        current_balance: financialMetrics.cash_flow,
        business_context: businessContext
      });
    }

    return {
      business_analysis: businessAnalysis.analysis,
      health_score: businessAnalysis.health_score,
      quick_recommendations: quickRecommendationsResult,
      cash_flow_analysis: cashFlowAnalysis,
      industry_benchmarks: industryBenchmarks || undefined
    };
  }

  /**
   * Genera reporte de métricas clave con insights de IA
   */
  async generateMetricsReport(data: {
    financial_metrics: FinancialMetrics;
    unit_economics: UnitEconomics;
    period: string;
  }): Promise<{
    metrics_summary: Record<string, any>;
    health_score: HealthScoreResponse;
    key_insights: string[];
    action_items: Array<{
      priority: string;
      action: string;
      expected_impact: string;
    }>;
  }> {
    // Calcular métricas clave
    const metrics = data.financial_metrics;
    const unitEcon = data.unit_economics;

    const metricsCalculated = {
      net_margin: metrics.revenue > 0 ? (metrics.net_profit / metrics.revenue * 100) : 0,
      ltv_coca_ratio: metrics.coca > 0 ? (metrics.ltv / metrics.coca) : 0,
      contribution_margin: unitEcon.price_per_unit - unitEcon.variable_cost_per_unit,
      contribution_margin_pct: unitEcon.price_per_unit > 0 ? 
        ((unitEcon.price_per_unit - unitEcon.variable_cost_per_unit) / unitEcon.price_per_unit * 100) : 0,
      cash_flow_margin: metrics.revenue > 0 ? (metrics.cash_flow / metrics.revenue * 100) : 0,
      payback_period: (unitEcon.price_per_unit - unitEcon.variable_cost_per_unit) > 0 ?
        (metrics.coca / (unitEcon.price_per_unit - unitEcon.variable_cost_per_unit)) : 0
    };

    // Obtener health score
    const healthScore = await this.getHealthScore({
      revenue: metrics.revenue,
      expenses: metrics.expenses,
      net_profit: metrics.net_profit,
      cash_flow: metrics.cash_flow,
      ltv: metrics.ltv,
      coca: metrics.coca,
      price_per_unit: unitEcon.price_per_unit,
      variable_cost_per_unit: unitEcon.variable_cost_per_unit,
      marketing_spend: unitEcon.marketing_spend,
      new_customers: unitEcon.new_customers,
      avg_purchase_frequency: unitEcon.avg_purchase_frequency,
      retention_months: unitEcon.retention_months
    });

    // Generar insights clave
    const keyInsights = [];
    if (metricsCalculated.ltv_coca_ratio >= 3) {
      keyInsights.push(`Excelente ratio LTV/COCA de ${metricsCalculated.ltv_coca_ratio.toFixed(1)}x - modelo económico sólido`);
    } else if (metricsCalculated.ltv_coca_ratio < 1) {
      keyInsights.push(`Ratio LTV/COCA crítico de ${metricsCalculated.ltv_coca_ratio.toFixed(1)}x - requiere atención inmediata`);
    }

    if (metricsCalculated.net_margin >= 15) {
      keyInsights.push(`Margen neto saludable del ${metricsCalculated.net_margin.toFixed(1)}%`);
    } else if (metricsCalculated.net_margin < 5) {
      keyInsights.push(`Margen neto bajo del ${metricsCalculated.net_margin.toFixed(1)}% - optimizar costos o precios`);
    }

    if (metricsCalculated.cash_flow_margin < 0) {
      keyInsights.push('Flujo de caja negativo - riesgo de liquidez');
    }

    // Generar action items
    const actionItems = [];
    if (metricsCalculated.ltv_coca_ratio < 3) {
      actionItems.push({
        priority: 'Alta',
        action: 'Optimizar ratio LTV/COCA',
        expected_impact: 'Mejorar economía unitaria y sostenibilidad'
      });
    }

    if (metricsCalculated.contribution_margin_pct < 30) {
      actionItems.push({
        priority: 'Media',
        action: 'Aumentar margen de contribución',
        expected_impact: 'Mayor flexibilidad para cubrir costos fijos'
      });
    }

    return {
      metrics_summary: {
        ...metricsCalculated,
        period: data.period,
        calculated_at: new Date().toISOString()
      },
      health_score: healthScore,
      key_insights: keyInsights,
      action_items: actionItems
    };
  }

  /**
   * Agentes LangChain específicos
   */
  async consultMaya(data: {
    current_balance: number;
    monthly_expenses: number;
    cash_flow_history?: any[];
    accounts_receivable?: number;
    accounts_payable?: number;
  }) {
    try {
      const response = await apiClient.post('/api/agents/maya/cash-flow-analysis', data);
      return response.data;
    } catch (error) {
      console.error('Error consulting Maya:', error);
      throw error;
    }
  }

  async consultCarlos(data: {
    ltv: number;
    cac: number;
    churn_rate: number;
    arpu: number;
    customer_count: number;
    cohort_data?: any;
  }) {
    try {
      const response = await apiClient.post('/api/agents/carlos/unit-economics-analysis', data);
      return response.data;
    } catch (error) {
      console.error('Error consulting Carlos:', error);
      throw error;
    }
  }

  async consultSofia(data: {
    growth_rate: number;
    revenue_trend: any[];
    market_size: number;
    current_revenue: number;
    acquisition_channels?: any;
  }) {
    try {
      const response = await apiClient.post('/api/agents/sofia/growth-strategy', data);
      return response.data;
    } catch (error) {
      console.error('Error consulting Sofia:', error);
      throw error;
    }
  }

  async consultAlex(data: {
    debt_to_equity: number;
    customer_concentration: number;
    burn_rate: number;
    revenue_volatility: number;
    cash_balance: number;
    risk_context?: any;
  }) {
    try {
      const response = await apiClient.post('/api/agents/alex/risk-assessment', data);
      return response.data;
    } catch (error) {
      console.error('Error consulting Alex:', error);
      throw error;
    }
  }

  async consultDiana(data: {
    operating_margin: number;
    revenue_per_employee: number;
    automation_percentage: number;
    process_efficiency_score: number;
    department_metrics?: any;
    process_analysis?: any;
  }) {
    try {
      const response = await apiClient.post('/api/agents/diana/performance-optimization', data);
      return response.data;
    } catch (error) {
      console.error('Error consulting Diana:', error);
      throw error;
    }
  }

  async getAvailableAgents() {
    try {
      const response = await apiClient.get('/api/agents/available');
      return response.data;
    } catch (error) {
      console.error('Error getting available agents:', error);
      throw error;
    }
  }

  async multiAgentConsultation(data: any) {
    try {
      const response = await apiClient.post('/api/agents/multi-agent-analysis', {
        comprehensive_data: data
      });
      return response.data;
    } catch (error) {
      console.error('Error in multi-agent consultation:', error);
      throw error;
    }
  }
}

export const aiService = new AIService();
export default aiService;