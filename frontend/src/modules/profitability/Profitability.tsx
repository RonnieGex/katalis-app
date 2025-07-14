import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { 
  TrendingUp,
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle,
  Info,
  Calculator,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Trophy,
  Eye,
  Plus,
  Edit,
  Brain,
  Shield
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { EducationalTooltip, WisdomPill, EDUCATIONAL_CONTENT } from '../../components/ui/TooltipSystem'
import ExampleScenarios from '../../components/ui/ExampleScenarios'
import ContextualNavigation from '../../components/ui/ContextualNavigation'
import { useFinancialData } from '../../contexts/FinancialContext'
import { aiService } from '../../services/aiService'
import { useAuth } from '../../components/auth/AuthProvider'

interface Investment {
  id: string
  name: string
  type: 'marketing' | 'equipment' | 'technology' | 'expansion' | 'other'
  initialCost: number
  monthlyReturn: number
  duration: number
  riskLevel: 'low' | 'medium' | 'high'
}

interface ProfitCenter {
  id: string
  name: string
  revenue: number
  costs: number
  profit: number
  margin: number
}

const Profitability = () => {
  const pageRef = useRef<HTMLDivElement>(null)
  const { token } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'roi' | 'margins' | 'centers'>('overview')
  
  // Business performance data
  // Alex agent states for risk analysis
  const [isLoadingRisk, setIsLoadingRisk] = useState(false)
  const [alexAnalysis, setAlexAnalysis] = useState<any>(null)
  const [riskError, setRiskError] = useState<string | null>(null)

  const [performanceData, setPerformanceData] = useState({
    totalRevenue: 280000,
    totalCosts: 195000,
    grossProfit: 85000,
    netProfit: 65000,
    operatingExpenses: 20000,
    taxes: 8000
  })

  // ROI Analysis data
  const [investments, setInvestments] = useState<Investment[]>([
    { id: '1', name: 'Campaña Digital Q1', type: 'marketing', initialCost: 25000, monthlyReturn: 8500, duration: 6, riskLevel: 'medium' },
    { id: '2', name: 'Software CRM', type: 'technology', initialCost: 15000, monthlyReturn: 3200, duration: 24, riskLevel: 'low' },
    { id: '3', name: 'Equipo Producción', type: 'equipment', initialCost: 85000, monthlyReturn: 12000, duration: 36, riskLevel: 'low' },
    { id: '4', name: 'Expansión Sucursal', type: 'expansion', initialCost: 120000, monthlyReturn: 18000, duration: 48, riskLevel: 'high' }
  ])

  // Profit centers data
  const [profitCenters] = useState<ProfitCenter[]>([
    { id: '1', name: 'Producto Principal', revenue: 180000, costs: 110000, profit: 70000, margin: 38.9 },
    { id: '2', name: 'Servicios Adicionales', revenue: 65000, costs: 35000, profit: 30000, margin: 46.2 },
    { id: '3', name: 'Consultoría', revenue: 35000, costs: 15000, profit: 20000, margin: 57.1 }
  ])

  // Time period selector (unused for now but prepared for future features)
  // const [timePeriod, setTimePeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly')

  // Fetch Alex risk analysis when financial data changes
  useEffect(() => {
    if (token && performanceData.totalRevenue > 0) {
      fetchRiskAnalysis()
    }
  }, [token, performanceData, investments])

  // Function to fetch risk analysis from Alex agent
  const fetchRiskAnalysis = async () => {
    setIsLoadingRisk(true)
    setRiskError(null)
    
    // Calculate key risk metrics from real data (moved outside try-catch)
    const totalAssets = performanceData.totalRevenue * 0.75 // Estimate assets
    const totalDebt = performanceData.totalCosts * 0.3 // Estimate debt
    const debtToEquity = totalDebt / (totalAssets - totalDebt)
    
    // Calculate customer concentration risk (assume top customer = 25% of revenue)
    const customerConcentration = 0.25
    
    // Calculate burn rate (monthly cash burn)
    const monthlyBurnRate = (performanceData.operatingExpenses + performanceData.taxes) / 12
    
    try {
      
      // Calculate revenue volatility (simulate based on investment diversity)
      const revenueVolatility = investments.length < 3 ? 0.3 : 0.15
      
      // Get cash balance from revenue patterns
      const cashBalance = performanceData.netProfit * 3 // 3 months of profit as cash
      
      const analysis = await aiService.consultAlex({
        debt_to_equity: debtToEquity,
        customer_concentration: customerConcentration,
        burn_rate: monthlyBurnRate,
        revenue_volatility: revenueVolatility,
        cash_balance: cashBalance,
        risk_context: {
          total_revenue: performanceData.totalRevenue,
          net_margin: (performanceData.netProfit / performanceData.totalRevenue) * 100,
          investment_count: investments.length,
          highest_risk_investments: investments.filter(inv => inv.riskLevel === 'high').length,
          operational_efficiency: (performanceData.grossProfit / performanceData.totalRevenue) * 100
        }
      })
      
      setAlexAnalysis(analysis)
    } catch (error) {
      console.error('Error fetching Alex analysis:', error)
      
      // Fallback local risk analysis
      const fallbackAnalysis = {
        risk_score: calculateLocalRiskScore(),
        risk_level: 'medium',
        key_risks: generateLocalRiskInsights(),
        recommendations: generateLocalRiskRecommendations(),
        risk_breakdown: {
          financial_risk: Math.min(debtToEquity * 100, 100),
          operational_risk: investments.filter(inv => inv.riskLevel === 'high').length > 2 ? 75 : 35,
          market_risk: customerConcentration > 0.3 ? 80 : 45,
          liquidity_risk: monthlyBurnRate > performanceData.netProfit ? 85 : 25
        }
      }
      setAlexAnalysis(fallbackAnalysis)
      setRiskError('Usando análisis local de riesgo')
    } finally {
      setIsLoadingRisk(false)
    }
  }

  const calculateLocalRiskScore = () => {
    const netMargin = (performanceData.netProfit / performanceData.totalRevenue) * 100
    const highRiskInvestments = investments.filter(inv => inv.riskLevel === 'high').length
    const investmentDiversity = investments.length
    
    let score = 75 // Base score
    
    // Adjust based on profitability
    if (netMargin > 20) score += 15
    else if (netMargin < 5) score -= 25
    
    // Adjust based on investment risk
    if (highRiskInvestments > 2) score -= 20
    if (investmentDiversity < 3) score -= 10
    
    return Math.max(0, Math.min(100, score))
  }

  const generateLocalRiskInsights = () => {
    const insights = []
    const netMargin = (performanceData.netProfit / performanceData.totalRevenue) * 100
    
    if (netMargin < 10) {
      insights.push('Margen neto bajo indica riesgo de rentabilidad')
    }
    
    if (investments.filter(inv => inv.riskLevel === 'high').length > 2) {
      insights.push('Alto número de inversiones de riesgo elevado')
    }
    
    if (investments.length < 3) {
      insights.push('Portafolio de inversiones poco diversificado')
    }
    
    return insights
  }

  const generateLocalRiskRecommendations = () => {
    const recommendations = []
    const netMargin = (performanceData.netProfit / performanceData.totalRevenue) * 100
    
    if (netMargin < 15) {
      recommendations.push('Optimizar costos operativos para mejorar margen')
    }
    
    recommendations.push('Diversificar portafolio de inversiones')
    recommendations.push('Mantener reserva de efectivo equivalente a 6 meses de gastos')
    
    return recommendations
  }

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.profit-header',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 }
      )
      gsap.fromTo('.profit-card',
        { scale: 0.95, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, stagger: 0.1, delay: 0.2 }
      )
    })

    return () => ctx.revert()
  }, [])

  // Calculate key metrics
  const grossMargin = (performanceData.grossProfit / performanceData.totalRevenue) * 100
  const netMargin = (performanceData.netProfit / performanceData.totalRevenue) * 100
  const operatingMargin = ((performanceData.grossProfit - performanceData.operatingExpenses) / performanceData.totalRevenue) * 100
  const ebitda = performanceData.grossProfit - performanceData.operatingExpenses

  // ROI calculations
  const calculateROI = (investment: Investment) => {
    const totalReturn = investment.monthlyReturn * investment.duration
    const roi = ((totalReturn - investment.initialCost) / investment.initialCost) * 100
    const paybackPeriod = investment.initialCost / investment.monthlyReturn
    const annualizedROI = roi / (investment.duration / 12)
    return { roi, paybackPeriod, annualizedROI, totalReturn }
  }

  // Profitability trend data
  const profitabilityTrend = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(2025, i, 1).toLocaleDateString('es', { month: 'short' })
    const baseRevenue = performanceData.totalRevenue
    const variance = 1 + (Math.random() - 0.5) * 0.3 // ±15% variance
    const revenue = baseRevenue * variance
    const costs = performanceData.totalCosts * variance * 0.9 // Costs grow slower
    return {
      month,
      revenue: Math.round(revenue),
      costs: Math.round(costs),
      grossProfit: Math.round(revenue - costs),
      netProfit: Math.round((revenue - costs) * 0.75) // After taxes and expenses
    }
  })

  // Margin comparison data
  const marginComparison = [
    { metric: 'Margen Bruto', value: grossMargin, benchmark: 45, color: '#10B981' },
    { metric: 'Margen Operativo', value: operatingMargin, benchmark: 25, color: '#F59E0B' },
    { metric: 'Margen Neto', value: netMargin, benchmark: 15, color: '#3ECF8E' }
  ]

  // Profit centers chart data
  const profitCentersChart = profitCenters.map(center => ({
    name: center.name,
    revenue: center.revenue,
    profit: center.profit,
    margin: center.margin
  }))

  const getMarginStatus = (current: number, benchmark: number) => {
    if (current >= benchmark * 1.2) return { status: 'excellent', color: 'text-success', icon: CheckCircle }
    if (current >= benchmark) return { status: 'good', color: 'text-primary', icon: CheckCircle }
    if (current >= benchmark * 0.8) return { status: 'warning', color: 'text-warning', icon: AlertTriangle }
    return { status: 'poor', color: 'text-error', icon: AlertTriangle }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-success bg-success/10'
      case 'medium': return 'text-warning bg-warning/10'
      case 'high': return 'text-error bg-error/10'
      default: return 'text-text-secondary bg-surface-light'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'marketing': return <TrendingUp className="w-4 h-4" />
      case 'equipment': return <Activity className="w-4 h-4" />
      case 'technology': return <Zap className="w-4 h-4" />
      case 'expansion': return <Target className="w-4 h-4" />
      default: return <Calculator className="w-4 h-4" />
    }
  }

  const addInvestment = () => {
    const newInvestment: Investment = {
      id: Date.now().toString(),
      name: 'Nueva Inversión',
      type: 'other',
      initialCost: 0,
      monthlyReturn: 0,
      duration: 12,
      riskLevel: 'medium'
    }
    setInvestments([...investments, newInvestment])
  }

  const updateInvestment = (id: string, updates: Partial<Investment>) => {
    setInvestments(investments.map(inv => inv.id === id ? { ...inv, ...updates } : inv))
  }

  // Apply example scenario from the book
  const applyExampleScenario = (exampleData: any) => {
    if (exampleData.services) {
      // Convert services to business data format
      const totalRevenue = exampleData.services.reduce((sum: number, s: any) => sum + s.revenue, 0)
      const totalCosts = exampleData.services.reduce((sum: number, s: any) => sum + s.costs, 0) + (exampleData.operatingExpenses || 0)
      setPerformanceData({
        totalRevenue,
        totalCosts,
        grossProfit: totalRevenue - totalCosts,
        netProfit: totalRevenue - totalCosts - (exampleData.operatingExpenses || 0),
        operatingExpenses: exampleData.operatingExpenses || 0,
        taxes: 0
      })
    }
    
    if (exampleData.investments) {
      setInvestments(exampleData.investments.map((inv: any, index: number) => ({
        id: String(index + 1),
        name: inv.name,
        type: 'other',
        initialCost: inv.cost,
        monthlyReturn: inv.monthlyReturn,
        duration: inv.duration,
        riskLevel: 'medium'
      })))
    }
  }

  return (
    <div ref={pageRef} className="space-y-8">
      {/* Header */}
      <div className="profit-header">
        <h1 className="text-3xl font-bold mb-2">Rentabilidad y ROI</h1>
        <p className="text-text-secondary mb-6">
          Analiza la rentabilidad de tu negocio y evalúa el retorno de inversión de tus proyectos.
          Basado en los Capítulos 10-12 de "Finanzas para Emprendedores".
        </p>

        {/* Wisdom Pill */}
        <WisdomPill 
          title="Rentabilidad Real vs Aparente"
          content="No confundas ingresos altos con rentabilidad. Un negocio puede vender millones pero quebrar si no controla márgenes y gastos operativos."
          chapter="Capítulo 10"
          variant="warning"
        />
        
        {/* Educational info */}
        <div className="glass rounded-lg p-4 border border-primary/20 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold text-primary mb-1">Conceptos de Rentabilidad</h3>
              <p className="text-sm text-text-secondary">
                <strong>ROI:</strong> Retorno sobre inversión = (Ganancia - Inversión) / Inversión × 100.
                <strong>Margen Bruto:</strong> (Ingresos - COGS) / Ingresos.
                <strong>EBITDA:</strong> Ganancias antes de intereses, impuestos, depreciación y amortización.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-surface-light rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'overview' ? 'bg-primary text-background' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Eye className="w-4 h-4 inline mr-2" />
            Vista General
          </button>
          <button
            onClick={() => setActiveTab('roi')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'roi' ? 'bg-primary text-background' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Target className="w-4 h-4 inline mr-2" />
            Análisis ROI
          </button>
          <button
            onClick={() => setActiveTab('margins')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'margins' ? 'bg-primary text-background' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Márgenes
          </button>
          <button
            onClick={() => setActiveTab('centers')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'centers' ? 'bg-primary text-background' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <PieChart className="w-4 h-4 inline mr-2" />
            Centros de Ganancia
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="profit-card grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Gross Profit */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-success/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-success" />
            </div>
            <span className="text-xs text-success bg-success/10 px-2 py-1 rounded-full">
              {grossMargin.toFixed(1)}%
            </span>
          </div>
          <EducationalTooltip
            type="formula"
            title={EDUCATIONAL_CONTENT.GROSS_MARGIN.title}
            content={EDUCATIONAL_CONTENT.GROSS_MARGIN.content}
            chapter={EDUCATIONAL_CONTENT.GROSS_MARGIN.chapter}
            formula={EDUCATIONAL_CONTENT.GROSS_MARGIN.formula}
          >
            <h3 className="text-sm text-text-secondary mb-1">Utilidad Bruta</h3>
          </EducationalTooltip>
          <p className="text-2xl font-bold text-success">${performanceData.grossProfit.toLocaleString()}</p>
        </div>

        {/* Net Profit */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
              {netMargin.toFixed(1)}%
            </span>
          </div>
          <h3 className="text-sm text-text-secondary mb-1">Utilidad Neta</h3>
          <p className="text-2xl font-bold text-primary">${performanceData.netProfit.toLocaleString()}</p>
        </div>

        {/* EBITDA */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-warning/10 rounded-lg">
              <Activity className="w-6 h-6 text-warning" />
            </div>
            <span className="text-xs text-warning bg-warning/10 px-2 py-1 rounded-full">
              EBITDA
            </span>
          </div>
          <EducationalTooltip
            type="concept"
            title={EDUCATIONAL_CONTENT.EBITDA.title}
            content={EDUCATIONAL_CONTENT.EBITDA.content}
            chapter={EDUCATIONAL_CONTENT.EBITDA.chapter}
            formula={EDUCATIONAL_CONTENT.EBITDA.formula}
          >
            <h3 className="text-sm text-text-secondary mb-1">EBITDA</h3>
          </EducationalTooltip>
          <p className="text-2xl font-bold text-warning">${ebitda.toLocaleString()}</p>
        </div>

        {/* Average ROI */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-error/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-error" />
            </div>
            <span className="text-xs text-error bg-error/10 px-2 py-1 rounded-full">
              Promedio
            </span>
          </div>
          <EducationalTooltip
            type="formula"
            title={EDUCATIONAL_CONTENT.ROI_ANALYSIS.title}
            content={EDUCATIONAL_CONTENT.ROI_ANALYSIS.content}
            chapter={EDUCATIONAL_CONTENT.ROI_ANALYSIS.chapter}
            formula={EDUCATIONAL_CONTENT.ROI_ANALYSIS.formula}
          >
            <h3 className="text-sm text-text-secondary mb-1">ROI Promedio</h3>
          </EducationalTooltip>
          <p className="text-2xl font-bold text-error">
            {investments.length > 0 
              ? (investments.reduce((sum, inv) => sum + calculateROI(inv).annualizedROI, 0) / investments.length).toFixed(1)
              : '0'
            }%
          </p>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Profitability Trend */}
          <div className="profit-card card">
            <h3 className="text-lg font-semibold mb-4">Tendencia de Rentabilidad</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={profitabilityTrend}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3ECF8E" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3ECF8E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                <XAxis dataKey="month" stroke="#71717A" />
                <YAxis stroke="#71717A" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#181818', 
                    border: '1px solid #27272A',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10B981" 
                  fill="url(#colorRevenue)" 
                  name="Ingresos"
                />
                <Area 
                  type="monotone" 
                  dataKey="netProfit" 
                  stroke="#3ECF8E" 
                  fill="url(#colorProfit)" 
                  name="Utilidad Neta"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Margin Comparison */}
          <div className="profit-card card">
            <h3 className="text-lg font-semibold mb-4">Comparación de Márgenes</h3>
            <div className="space-y-4">
              {marginComparison.map((margin, index) => {
                const status = getMarginStatus(margin.value, margin.benchmark)
                const StatusIcon = status.icon
                return (
                  <div key={index} className="bg-surface-light rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{margin.metric}</span>
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`w-4 h-4 ${status.color}`} />
                        <span className={`text-sm ${status.color}`}>
                          {margin.value.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 bg-surface rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${Math.min(margin.value / margin.benchmark * 100, 100)}%`,
                            backgroundColor: margin.color
                          }}
                        />
                      </div>
                      <span className="text-xs text-text-secondary">
                        Meta: {margin.benchmark}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'roi' && (
        <div className="space-y-8">
          {/* ROI Management */}
          <div className="profit-card card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Análisis de Inversiones</h3>
              <button
                onClick={addInvestment}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nueva Inversión
              </button>
            </div>

            <div className="space-y-4">
              {investments.map((investment) => {
                const roiData = calculateROI(investment)
                return (
                  <div key={investment.id} className="bg-surface-light rounded-lg p-4">
                    <div className="grid md:grid-cols-6 gap-4 items-center">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          {getTypeIcon(investment.type)}
                        </div>
                        <div>
                          <input
                            type="text"
                            value={investment.name}
                            onChange={(e) => updateInvestment(investment.id, { name: e.target.value })}
                            className="font-medium bg-transparent border-none p-0"
                          />
                          <p className="text-xs text-text-secondary capitalize">{investment.type}</p>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-text-secondary">Inversión Inicial</label>
                        <input
                          type="number"
                          value={investment.initialCost}
                          onChange={(e) => updateInvestment(investment.id, { initialCost: Number(e.target.value) })}
                          className="input-sm w-full"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-text-secondary">Retorno Mensual</label>
                        <input
                          type="number"
                          value={investment.monthlyReturn}
                          onChange={(e) => updateInvestment(investment.id, { monthlyReturn: Number(e.target.value) })}
                          className="input-sm w-full"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-text-secondary">ROI Anualizado</label>
                        <p className={`text-lg font-bold ${roiData.annualizedROI >= 20 ? 'text-success' : roiData.annualizedROI >= 10 ? 'text-warning' : 'text-error'}`}>
                          {roiData.annualizedROI.toFixed(1)}%
                        </p>
                      </div>

                      <div>
                        <label className="text-xs text-text-secondary">Payback</label>
                        <p className="text-sm font-medium">
                          {roiData.paybackPeriod.toFixed(1)} meses
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded-full ${getRiskColor(investment.riskLevel)}`}>
                          {investment.riskLevel === 'low' ? 'Bajo' : investment.riskLevel === 'medium' ? 'Medio' : 'Alto'}
                        </span>
                        <button className="btn-ghost p-2">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ROI Comparison Chart */}
          <div className="profit-card card">
            <h3 className="text-lg font-semibold mb-4">Comparación de ROI</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={investments.map(inv => ({
                name: inv.name.substring(0, 20),
                roi: calculateROI(inv).annualizedROI,
                payback: calculateROI(inv).paybackPeriod
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                <XAxis dataKey="name" stroke="#71717A" />
                <YAxis stroke="#71717A" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#181818', 
                    border: '1px solid #27272A',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="roi" fill="#3ECF8E" radius={[4, 4, 0, 0]} name="ROI Anualizado %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'margins' && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Margin Analysis */}
          <div className="profit-card card">
            <h3 className="text-lg font-semibold mb-6">Configurar Datos Financieros</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Ingresos Totales (MXN)</label>
                <input
                  type="number"
                  value={performanceData.totalRevenue}
                  onChange={(e) => setPerformanceData({...performanceData, totalRevenue: Number(e.target.value)})}
                  className="input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Costo de Ventas (MXN)</label>
                <input
                  type="number"
                  value={performanceData.totalCosts}
                  onChange={(e) => setPerformanceData({...performanceData, totalCosts: Number(e.target.value)})}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Gastos Operativos (MXN)</label>
                <input
                  type="number"
                  value={performanceData.operatingExpenses}
                  onChange={(e) => setPerformanceData({...performanceData, operatingExpenses: Number(e.target.value)})}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Impuestos (MXN)</label>
                <input
                  type="number"
                  value={performanceData.taxes}
                  onChange={(e) => setPerformanceData({...performanceData, taxes: Number(e.target.value)})}
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Margin Waterfall */}
          <div className="profit-card card">
            <h3 className="text-lg font-semibold mb-4">Cascada de Márgenes</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: 'Ingresos', value: performanceData.totalRevenue, color: '#10B981' },
                { name: 'Costo Ventas', value: -performanceData.totalCosts, color: '#EF4444' },
                { name: 'Utilidad Bruta', value: performanceData.grossProfit, color: '#3ECF8E' },
                { name: 'Gastos Operativos', value: -performanceData.operatingExpenses, color: '#F59E0B' },
                { name: 'EBITDA', value: ebitda, color: '#8B5CF6' },
                { name: 'Impuestos', value: -performanceData.taxes, color: '#EC4899' },
                { name: 'Utilidad Neta', value: performanceData.netProfit, color: '#06B6D4' }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                <XAxis dataKey="name" stroke="#71717A" />
                <YAxis stroke="#71717A" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#181818', 
                    border: '1px solid #27272A',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="value" fill="#3ECF8E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'centers' && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Profit Centers Management */}
          <div className="profit-card card">
            <h3 className="text-lg font-semibold mb-6">Centros de Ganancia</h3>
            
            <div className="space-y-4">
              {profitCenters.map((center) => (
                <div key={center.id} className="bg-surface-light rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{center.name}</h4>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      center.margin >= 50 ? 'text-success bg-success/10' :
                      center.margin >= 30 ? 'text-warning bg-warning/10' :
                      'text-error bg-error/10'
                    }`}>
                      {center.margin.toFixed(1)}% margen
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-text-secondary">Ingresos</p>
                      <p className="font-semibold text-success">${center.revenue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-text-secondary">Costos</p>
                      <p className="font-semibold text-error">${center.costs.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-text-secondary">Utilidad</p>
                      <p className="font-semibold text-primary">${center.profit.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Profit Centers Chart */}
          <div className="profit-card card">
            <h3 className="text-lg font-semibold mb-4">Contribución por Centro</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={profitCentersChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                <XAxis dataKey="name" stroke="#71717A" />
                <YAxis stroke="#71717A" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#181818', 
                    border: '1px solid #27272A',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} name="Ingresos" />
                <Bar dataKey="profit" fill="#3ECF8E" radius={[4, 4, 0, 0]} name="Utilidad" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Alex Risk Analysis */}
      {isLoadingRisk && (
        <div className="profit-card card">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-primary animate-pulse" />
            <h3 className="text-lg font-semibold">Analizando Riesgos...</h3>
          </div>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      )}

      {riskError && (
        <div className="profit-card card">
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
              <div>
                <h4 className="font-medium text-warning mb-1">Análisis de Riesgo Local</h4>
                <p className="text-sm text-text-secondary">{riskError}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {alexAnalysis && (
        <div className="profit-card card">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Análisis de Riesgo - Alex</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Risk Score */}
            <div className="bg-surface-light rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-text-secondary">Puntuación de Riesgo</span>
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <div className="flex items-center gap-3">
                <div className={`text-3xl font-bold ${
                  alexAnalysis.risk_score >= 80 ? 'text-success' :
                  alexAnalysis.risk_score >= 60 ? 'text-warning' : 'text-error'
                }`}>
                  {alexAnalysis.risk_score}/100
                </div>
                <span className={`text-sm px-2 py-1 rounded-full ${
                  alexAnalysis.risk_level === 'low' ? 'text-success bg-success/10' :
                  alexAnalysis.risk_level === 'medium' ? 'text-warning bg-warning/10' :
                  'text-error bg-error/10'
                }`}>
                  {alexAnalysis.risk_level === 'low' ? 'Bajo' : 
                   alexAnalysis.risk_level === 'medium' ? 'Medio' : 'Alto'}
                </span>
              </div>
            </div>

            {/* Risk Breakdown */}
            {alexAnalysis.risk_breakdown && (
              <div className="bg-surface-light rounded-lg p-4">
                <h4 className="font-medium mb-3">Desglose de Riesgos</h4>
                <div className="space-y-2">
                  {Object.entries(alexAnalysis.risk_breakdown).map(([key, value]) => {
                    const numValue = Number(value) || 0;
                    return (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{key.replace('_', ' ')}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-surface rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${
                              numValue < 30 ? 'bg-success' : 
                              numValue < 60 ? 'bg-warning' : 'bg-error'
                            }`}
                            style={{ width: `${Math.min(numValue, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-text-muted w-8">{numValue.toFixed(0)}%</span>
                      </div>
                    </div>
                  )})}
                </div>
              </div>
            )}
          </div>

          {/* Risk Insights and Recommendations */}
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            {alexAnalysis.key_risks && alexAnalysis.key_risks.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Riesgos Identificados:</h4>
                <ul className="space-y-2">
                  {alexAnalysis.key_risks.map((risk: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-warning mt-0.5" />
                      <span className="text-sm text-text-secondary">{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {alexAnalysis.recommendations && alexAnalysis.recommendations.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Recomendaciones:</h4>
                <ul className="space-y-2">
                  {alexAnalysis.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-success mt-0.5" />
                      <span className="text-sm text-text-secondary">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Insights and Recommendations */}
      <div className="profit-card card">
        <h3 className="text-lg font-semibold mb-4">Insights y Recomendaciones</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {netMargin < 10 && (
            <div className="bg-error/10 border border-error/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-error mt-0.5" />
                <div>
                  <h4 className="font-medium text-error mb-1">Margen Neto Bajo</h4>
                  <p className="text-sm text-text-secondary">
                    Tu margen neto es menor al 10%. Considera reducir costos operativos o aumentar precios.
                  </p>
                </div>
              </div>
            </div>
          )}

          {investments.some(inv => calculateROI(inv).annualizedROI < 15) && (
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                <div>
                  <h4 className="font-medium text-warning mb-1">ROI Subóptimo</h4>
                  <p className="text-sm text-text-secondary">
                    Algunas inversiones tienen ROI menor al 15%. Evalúa reasignar recursos.
                  </p>
                </div>
              </div>
            </div>
          )}

          {grossMargin >= 40 && (
            <div className="bg-success/10 border border-success/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                <div>
                  <h4 className="font-medium text-success mb-1">Margen Bruto Saludable</h4>
                  <p className="text-sm text-text-secondary">
                    Tu margen bruto del {grossMargin.toFixed(1)}% es excelente. Mantén esta eficiencia operativa.
                  </p>
                </div>
              </div>
            </div>
          )}

          {investments.length > 0 && investments.every(inv => calculateROI(inv).annualizedROI >= 20) && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Trophy className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium text-primary mb-1">Portafolio Excelente</h4>
                  <p className="text-sm text-text-secondary">
                    Todas tus inversiones tienen ROI superior al 20%. Considera escalar estrategias exitosas.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Example Scenarios */}
      <div className="profit-card card">
        <ExampleScenarios 
          category="profitability" 
          onApplyScenario={applyExampleScenario}
        />
      </div>

      {/* Contextual Navigation */}
      <ContextualNavigation currentModule="profitability" />
    </div>
  )
}

export default Profitability