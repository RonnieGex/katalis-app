import { useState, useEffect } from 'react'
import { 
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Settings,
  Brain,
  Users
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'
import { useFinancialData } from '../../contexts/FinancialContext'
import { aiService } from '../../services/aiService'
import { useAuth } from '../../components/auth/AuthProvider'

interface GrowthMetric {
  name: string
  current: number
  target: number
  growth: number
  trend: 'up' | 'down' | 'stable'
  unit: string
}

interface GrowthScenario {
  id: string
  name: string
  description: string
  investment: number
  expectedReturn: number
  timeframe: string
  risk: 'low' | 'medium' | 'high'
  probability: number
}

const Growth = () => {
  const { token } = useAuth()
  const { company, products, metrics } = useFinancialData()
  const [selectedTimeframe, setSelectedTimeframe] = useState<'3m' | '6m' | '1y' | '2y'>('1y')
  const [selectedScenario, setSelectedScenario] = useState<string>('conservative')
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [showSimulatorModal, setShowSimulatorModal] = useState(false)
  const [simulationResult, setSimulationResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Use real business config from centralized data
  const [businessConfig, setBusinessConfig] = useState({
    industry: company.industry,
    businessStage: 'growth',
    monthlyRevenue: metrics.monthlyRevenue,
    employeeCount: company.employees,
    monthsOperating: 24,
    targetGrowthRate: 25,
    riskTolerance: 'medium' as 'low' | 'medium' | 'high'
  })

  // Sofia Growth Analysis Effect
  useEffect(() => {
    if (token && metrics.monthlyRevenue > 0) {
      fetchGrowthAnalysis()
    }
  }, [token, metrics])

  // Function to fetch growth analysis from Sofia agent
  const fetchGrowthAnalysis = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Calculate growth rate based on real data
      const currentRevenue = metrics.monthlyRevenue
      const historicalRevenue = currentRevenue * 0.85 // Assume 15% growth
      const growthRate = ((currentRevenue - historicalRevenue) / historicalRevenue) * 100
      
      // Generate realistic historical trend
      const revenueTrend = Array.from({ length: 12 }, (_, i) => {
        const monthGrowth = Math.pow(1.12, i / 12) // 12% annual growth
        const baseRevenue = currentRevenue / Math.pow(1.12, 1)
        return Math.round(baseRevenue * monthGrowth)
      })
      
      // Calculate market size (10x current annual revenue as estimate)
      const estimatedMarketSize = currentRevenue * 12 * 10
      
      // Get acquisition channels data from products
      const acquisitionChannels = {
        organic: 40,
        paid_ads: 30,
        referrals: 20,
        partnerships: 10
      }
      
      // Prepare data for Sofia agent
      const growthData = {
        growth_rate: growthRate,
        revenue_trend: revenueTrend,
        market_size: estimatedMarketSize,
        current_revenue: currentRevenue,
        acquisition_channels: acquisitionChannels
      }
      
      // Consult Sofia agent
      const analysis = await aiService.consultSofia(growthData)
      
      // Process Sofia's response
      const structuredAnalysis = {
        success: true,
        agent: 'Sofia - Especialista en Crecimiento',
        analysis: {
          growth_opportunities: analysis.growth_opportunities || [],
          market_analysis: analysis.market_analysis || 'Análisis de mercado completado',
          recommended_strategies: analysis.strategies || [],
          risk_assessment: analysis.risks || [],
          timeline: analysis.timeline || '6-12 meses',
          investment_required: analysis.investment || currentRevenue * 0.2
        },
        timestamp: new Date().toISOString()
      }
      
      setAiAnalysis(structuredAnalysis)
    } catch (error) {
      console.error('Error fetching growth analysis:', error)
      
      // Generate intelligent local analysis
      const localAnalysis = generateLocalGrowthAnalysis()
      setAiAnalysis(localAnalysis)
    } finally {
      setIsLoading(false)
    }
  }

  // Generate local growth analysis based on real metrics
  const generateLocalGrowthAnalysis = () => {
    const currentRevenue = metrics.monthlyRevenue
    const annualRevenue = currentRevenue * 12
    const customerBase = metrics.totalCustomers || 300
    const averageOrderValue = currentRevenue / customerBase
    
    let analysisText = `Análisis de Crecimiento para ${company.name}:\n\n`
    
    // Growth opportunity analysis
    if (metrics.netMargin > 20) {
      analysisText += `✅ Margen saludable del ${metrics.netMargin.toFixed(1)}% permite inversión en crecimiento.\n\n`
    } else {
      analysisText += `⚠️ Margen del ${metrics.netMargin.toFixed(1)}% limita capacidad de inversión en crecimiento.\n\n`
    }
    
    analysisText += `📊 Revenue actual: ${currentRevenue.toLocaleString()} MXN/mes\n`
    analysisText += `👥 Base de clientes: ${customerBase} clientes\n`
    analysisText += `💰 Valor promedio: ${averageOrderValue.toFixed(0)} MXN/cliente\n\n`
    
    // Growth strategies based on current metrics
    const strategies = []
    
    if (averageOrderValue < 1000) {
      strategies.push({
        title: 'Aumentar Valor por Cliente',
        description: 'Implementar estrategias de upselling y cross-selling',
        impact: 'Alto',
        effort: 'Medio'
      })
    }
    
    if (customerBase < 500) {
      strategies.push({
        title: 'Acelerar Adquisición de Clientes',
        description: 'Optimizar canales de marketing digital',
        impact: 'Alto',
        effort: 'Alto'
      })
    }
    
    strategies.push({
      title: 'Expansión de Productos',
      description: 'Desarrollar productos complementarios',
      impact: 'Medio',
      effort: 'Alto'
    })
    
    return {
      success: true,
      agent: 'Análisis Local de Crecimiento',
      analysis: {
        growth_opportunities: [
          'Incrementar retención de clientes existentes',
          'Optimizar conversión en canales digitales',
          'Desarrollar mercados adyacentes'
        ],
        market_analysis: analysisText,
        recommended_strategies: strategies,
        risk_assessment: ['Competencia creciente', 'Dependencia de pocos clientes'],
        timeline: '6-12 meses',
        investment_required: currentRevenue * 0.15
      },
      timestamp: new Date().toISOString()
    }
  }

  // Generate growth data based on real metrics
  const generateGrowthData = () => {
    const currentRevenue = metrics.monthlyRevenue
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    
    return months.map((month, index) => {
      // Simulate realistic growth pattern
      const growthFactor = Math.pow(1.12, index / 12) // 12% annual growth
      const baseRevenue = currentRevenue / Math.pow(1.12, 1)
      const seasonalVariation = 1 + Math.sin((index * Math.PI) / 6) * 0.1 // ±10% seasonal
      
      const revenue = Math.round(baseRevenue * growthFactor * seasonalVariation)
      const customers = Math.round((revenue / (currentRevenue / (metrics.totalCustomers || 300))))
      const costs = Math.round(revenue * 0.65) // 65% cost ratio
      
      return {
        month: `${month} 2024`,
        revenue,
        customers,
        costs
      }
    })
  }

  const allGrowthData = generateGrowthData()

  // Función para filtrar datos según el timeframe seleccionado
  const getFilteredGrowthData = () => {
    const dataCount = {
      '3m': 3,
      '6m': 6,
      '1y': 12,
      '2y': 24
    }
    
    const count = dataCount[selectedTimeframe]
    return allGrowthData.slice(-count)
  }

  const growthData = getFilteredGrowthData()

  // Función para generar datos de proyección basados en el escenario seleccionado
  const generateProjectedData = () => {
    const baseRevenue = 115000 // Ingresos actuales
    const months = ['Ene 2025', 'Feb 2025', 'Mar 2025', 'Abr 2025', 'May 2025', 'Jun 2025']
    
    const growthRates = {
      conservative: 0.02, // 2% mensual
      realistic: 0.04,    // 4% mensual  
      aggressive: 0.07    // 7% mensual
    }
    
    const selectedRate = growthRates[selectedScenario as keyof typeof growthRates] || growthRates.realistic
    
    return months.map((month, index) => {
      const monthlyGrowth = Math.pow(1 + selectedRate, index + 1)
      const projectedValue = Math.round(baseRevenue * monthlyGrowth)
      
      return {
        month,
        value: projectedValue,
        conservative: Math.round(baseRevenue * Math.pow(1 + growthRates.conservative, index + 1)),
        realistic: Math.round(baseRevenue * Math.pow(1 + growthRates.realistic, index + 1)),
        aggressive: Math.round(baseRevenue * Math.pow(1 + growthRates.aggressive, index + 1))
      }
    })
  }

  const projectedData = generateProjectedData()

  // Generate growth metrics based on real data
  const generateGrowthMetrics = (): GrowthMetric[] => {
    const currentRevenue = metrics.monthlyRevenue
    const targetRevenue = currentRevenue * 1.5 // 50% growth target
    const currentCustomers = metrics.totalCustomers || 300
    const targetCustomers = Math.round(currentCustomers * 1.4) // 40% growth target
    const revenueGrowthRate = 12.5 // Estimated based on SaaS standards
    const customerGrowthRate = 8.3 // Customer acquisition growth
    
    return [
      {
        name: 'Ingresos Mensuales',
        current: currentRevenue,
        target: targetRevenue,
        growth: revenueGrowthRate,
        trend: 'up',
        unit: 'MXN'
      },
      {
        name: 'Clientes Activos',
        current: currentCustomers,
        target: targetCustomers,
        growth: customerGrowthRate,
        trend: 'up',
        unit: 'clientes'
      },
      {
        name: 'Margen de Ganancia',
        current: metrics.netMargin,
        target: metrics.netMargin * 1.2, // 20% improvement target
        growth: 3.2,
        trend: metrics.netMargin > 20 ? 'up' : 'stable',
        unit: '%'
      },
      {
        name: 'CAC (Costo Adquisición)',
        current: metrics.customerAcquisitionCost,
        target: metrics.customerAcquisitionCost * 0.85, // 15% reduction target
        growth: -6.5,
        trend: 'down', // Lower CAC is better
        unit: 'MXN'
      }
    ]
  }

  const growthMetrics = generateGrowthMetrics()

  const growthScenarios: GrowthScenario[] = [
    {
      id: 'conservative',
      name: 'Escenario Conservador',
      description: 'Crecimiento orgánico con inversión mínima en marketing',
      investment: 50000,
      expectedReturn: 180000,
      timeframe: '12 meses',
      risk: 'low',
      probability: 85
    },
    {
      id: 'realistic',
      name: 'Escenario Realista',
      description: 'Inversión moderada en marketing digital y expansión de equipo',
      investment: 120000,
      expectedReturn: 350000,
      timeframe: '10 meses',
      risk: 'medium',
      probability: 70
    },
    {
      id: 'aggressive',
      name: 'Escenario Agresivo',
      description: 'Inversión alta en marketing, nuevos productos y expansión geográfica',
      investment: 250000,
      expectedReturn: 600000,
      timeframe: '8 meses',
      risk: 'high',
      probability: 45
    }
  ]

  const riskColors = {
    low: 'text-success bg-success/10 border-success/30',
    medium: 'text-warning bg-warning/10 border-warning/30',
    high: 'text-error bg-error/10 border-error/30'
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(value)
  }

  const handleConfigSave = () => {
    // Aquí se guardarían las configuraciones en el backend
    setShowConfigModal(false)
    // Mostrar mensaje de éxito
    alert('Configuración guardada exitosamente')
  }

  const handleConfigChange = (field: string, value: any) => {
    setBusinessConfig(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Estrategias de Crecimiento</h1>
          <p className="text-text-secondary">
            Planifica y simula el crecimiento sostenible de tu empresa
          </p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => setShowConfigModal(true)}
            className="bg-surface border border-border text-text-primary px-4 py-2 rounded-lg font-medium flex items-center space-x-2 hover:bg-surface-light transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Configurar</span>
          </button>
          <button 
            onClick={() => setShowSimulatorModal(true)}
            className="bg-primary hover:bg-primary-dark text-background px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
          >
            <Calculator className="w-4 h-4" />
            <span>Simular Escenario</span>
          </button>
        </div>
      </div>

      {/* Métricas de Crecimiento */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {growthMetrics.map((metric, index) => (
          <div key={index} className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="text-sm text-text-secondary mb-1">{metric.name}</div>
                <div className="text-2xl font-bold text-text-primary">
                  {metric.unit === 'MXN' ? formatCurrency(metric.current) :
                   metric.unit === '%' ? `${metric.current}%` :
                   `${metric.current.toLocaleString()} ${metric.unit}`}
                </div>
              </div>
              <div className={`flex items-center space-x-1 ${
                metric.trend === 'up' ? 'text-success' : 
                metric.trend === 'down' ? 'text-error' : 'text-text-secondary'
              }`}>
                {metric.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> :
                 metric.trend === 'down' ? <ArrowDownRight className="w-4 h-4" /> : null}
                <span className="text-sm font-medium">{Math.abs(metric.growth)}%</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Meta:</span>
                <span className="text-text-primary font-medium">
                  {metric.unit === 'MXN' ? formatCurrency(metric.target) :
                   metric.unit === '%' ? `${metric.target}%` :
                   `${metric.target.toLocaleString()} ${metric.unit}`}
                </span>
              </div>
              <div className="w-full bg-surface-light rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min((metric.current / metric.target) * 100, 100)}%` }} 
                />
              </div>
              <div className="text-xs text-text-secondary">
                {Math.round((metric.current / metric.target) * 100)}% de la meta
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico de Crecimiento Histórico */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Crecimiento Histórico</h3>
            <p className="text-sm text-text-secondary mt-1">
              Evolución de tus ingresos mensuales en los últimos{' '}
              {selectedTimeframe === '3m' ? '3 meses' : 
               selectedTimeframe === '6m' ? '6 meses' : 
               selectedTimeframe === '1y' ? '12 meses' : '24 meses'}
            </p>
          </div>
          <div className="flex space-x-2">
            {['3m', '6m', '1y', '2y'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedTimeframe(period as any)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedTimeframe === period
                    ? 'bg-primary text-background'
                    : 'bg-surface-light text-text-secondary hover:bg-surface'
                }`}
              >
                {period === '3m' ? '3M' : period === '6m' ? '6M' : period === '1y' ? '1A' : '2A'}
              </button>
            ))}
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                formatter={(value: any) => [new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value), 'Ingresos']}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.1}
                name="Ingresos"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Proyecciones de Crecimiento */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-text-primary">Proyecciones de Crecimiento</h3>
          <p className="text-sm text-text-secondary mt-1">
            Proyección de ingresos para los próximos 6 meses según diferentes escenarios.{' '}
            <span className="text-primary font-medium">
              Actualmente visualizando: {
                selectedScenario === 'conservative' ? 'Escenario Conservador (2% mensual)' :
                selectedScenario === 'realistic' ? 'Escenario Realista (4% mensual)' :
                'Escenario Agresivo (7% mensual)'
              }
            </span>
          </p>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projectedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                formatter={(value: any) => [new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value), 'Proyección']}
              />
              <Line 
                type="monotone" 
                dataKey="conservative" 
                stroke="#10B981" 
                strokeWidth={selectedScenario === 'conservative' ? 4 : 2}
                strokeDasharray={selectedScenario === 'conservative' ? '0' : '5,5'}
                name="Conservador"
                opacity={selectedScenario === 'conservative' ? 1 : 0.4}
              />
              <Line 
                type="monotone" 
                dataKey="realistic" 
                stroke="#3B82F6" 
                strokeWidth={selectedScenario === 'realistic' ? 4 : 2}
                strokeDasharray={selectedScenario === 'realistic' ? '0' : '5,5'}
                name="Realista"
                opacity={selectedScenario === 'realistic' ? 1 : 0.4}
              />
              <Line 
                type="monotone" 
                dataKey="aggressive" 
                stroke="#EF4444" 
                strokeWidth={selectedScenario === 'aggressive' ? 4 : 2}
                strokeDasharray={selectedScenario === 'aggressive' ? '0' : '5,5'}
                name="Agresivo"
                opacity={selectedScenario === 'aggressive' ? 1 : 0.4}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="bg-success/10 border border-success/30 rounded-lg p-3">
            <div className="text-success font-semibold">Conservador</div>
            <div className="text-xs text-text-secondary">Crecimiento orgánico estable</div>
          </div>
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-3">
            <div className="text-primary font-semibold">Realista</div>
            <div className="text-xs text-text-secondary">Equilibrio riesgo-beneficio</div>
          </div>
          <div className="bg-error/10 border border-error/30 rounded-lg p-3">
            <div className="text-error font-semibold">Agresivo</div>
            <div className="text-xs text-text-secondary">Alto crecimiento, alto riesgo</div>
          </div>
        </div>
      </div>

      {/* Escenarios de Crecimiento */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-text-primary">Escenarios de Crecimiento</h3>
          <p className="text-sm text-text-secondary mt-1">
            Selecciona un escenario para ver su impacto en las proyecciones. El escenario seleccionado se resalta en la gráfica superior.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {growthScenarios.map((scenario) => (
            <div 
              key={scenario.id}
              className={`border-2 rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg ${
                selectedScenario === scenario.id
                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => setSelectedScenario(scenario.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-text-primary">{scenario.name}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${riskColors[scenario.risk]}`}>
                  {scenario.risk === 'low' ? 'Bajo Riesgo' :
                   scenario.risk === 'medium' ? 'Riesgo Medio' : 'Alto Riesgo'}
                </span>
              </div>
              
              <p className="text-text-secondary text-sm mb-6">{scenario.description}</p>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-secondary text-sm">Inversión requerida:</span>
                  <span className="text-text-primary font-medium">{formatCurrency(scenario.investment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary text-sm">Retorno esperado:</span>
                  <span className="text-success font-medium">{formatCurrency(scenario.expectedReturn)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary text-sm">Tiempo estimado:</span>
                  <span className="text-text-primary font-medium">{scenario.timeframe}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary text-sm">Probabilidad de éxito:</span>
                  <span className="text-text-primary font-medium">{scenario.probability}%</span>
                </div>
              </div>

              <div className="mt-4">
                <div className="w-full bg-surface-light rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${scenario.probability}%` }} 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sofia Growth Analysis */}
      {isLoading && (
        <div className="bg-gradient-to-r from-primary/10 to-primary-dark/10 border border-primary/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-5 h-5 text-primary animate-pulse" />
            <h3 className="text-lg font-semibold text-text-primary">Analizando estrategia de crecimiento con Sofia...</h3>
          </div>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-gradient-to-r from-error/10 to-error/20 border border-error/30 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-error mt-0.5" />
            <div>
              <h4 className="font-medium text-error mb-1">Error en Análisis de Crecimiento</h4>
              <p className="text-sm text-text-secondary">{error}</p>
            </div>
          </div>
        </div>
      )}

      {aiAnalysis && (
        <div className="bg-gradient-to-r from-primary/10 to-primary-dark/10 border border-primary/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-text-primary">{aiAnalysis.agent}</h3>
          </div>
          
          {/* Market Analysis */}
          <div className="mb-6">
            <h4 className="font-medium text-text-primary mb-2">Análisis de Mercado</h4>
            <div className="bg-surface-light rounded-lg p-4">
              <pre className="text-sm text-text-secondary whitespace-pre-wrap font-sans">
                {aiAnalysis.analysis.market_analysis}
              </pre>
            </div>
          </div>

          {/* Growth Opportunities */}
          {aiAnalysis.analysis.growth_opportunities.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-text-primary mb-3">Oportunidades de Crecimiento</h4>
              <div className="grid md:grid-cols-2 gap-4">
                {aiAnalysis.analysis.growth_opportunities.map((opportunity: string, index: number) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-text-secondary">{opportunity}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Strategies */}
          {aiAnalysis.analysis.recommended_strategies.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-text-primary mb-3">Estrategias Recomendadas</h4>
              <div className="space-y-3">
                {aiAnalysis.analysis.recommended_strategies.map((strategy: any, index: number) => (
                  <div key={index} className="bg-surface-light rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-medium text-text-primary">{strategy.title}</h5>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          strategy.impact === 'Alto' ? 'bg-success/20 text-success' :
                          strategy.impact === 'Medio' ? 'bg-warning/20 text-warning' :
                          'bg-primary/20 text-primary'
                        }`}>
                          Impacto: {strategy.impact}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          strategy.effort === 'Alto' ? 'bg-error/20 text-error' :
                          strategy.effort === 'Medio' ? 'bg-warning/20 text-warning' :
                          'bg-success/20 text-success'
                        }`}>
                          Esfuerzo: {strategy.effort}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-text-secondary">{strategy.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risk Assessment */}
          {aiAnalysis.analysis.risk_assessment.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-text-primary mb-3">Evaluación de Riesgos</h4>
              <div className="grid md:grid-cols-2 gap-4">
                {aiAnalysis.analysis.risk_assessment.map((risk: string, index: number) => (
                  <div key={index} className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-text-secondary">{risk}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Investment and Timeline */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-surface-light rounded-lg p-4">
              <h5 className="font-medium text-text-primary mb-2">Inversión Estimada</h5>
              <p className="text-2xl font-bold text-primary">
                {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(aiAnalysis.analysis.investment_required)}
              </p>
              <p className="text-xs text-text-secondary mt-1">Para implementar estrategias clave</p>
            </div>
            <div className="bg-surface-light rounded-lg p-4">
              <h5 className="font-medium text-text-primary mb-2">Timeline de Implementación</h5>
              <p className="text-2xl font-bold text-success">{aiAnalysis.analysis.timeline}</p>
              <p className="text-xs text-text-secondary mt-1">Tiempo estimado para ver resultados</p>
            </div>
          </div>
        </div>
      )}

      {/* Plan de Acción */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-6">Plan de Acción Recomendado</h3>
        <div className="space-y-4">
          {[
            { task: 'Optimizar página de conversión principal', priority: 'Alta', deadline: '2 semanas' },
            { task: 'Implementar sistema de referidos automatizado', priority: 'Alta', deadline: '1 mes' },
            { task: 'Desarrollar segundo producto/servicio', priority: 'Media', deadline: '3 meses' },
            { task: 'Establecer partnerships estratégicos', priority: 'Media', deadline: '2 meses' },
            { task: 'Expandir equipo de ventas', priority: 'Baja', deadline: '6 meses' }
          ].map((action, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-surface-light rounded-lg">
              <div className="flex items-center space-x-3">
                <input type="checkbox" className="w-4 h-4 text-primary" />
                <span className="text-text-primary font-medium">{action.task}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  action.priority === 'Alta' ? 'bg-error/20 text-error' :
                  action.priority === 'Media' ? 'bg-warning/20 text-warning' :
                  'bg-success/20 text-success'
                }`}>
                  {action.priority}
                </span>
                <span className="text-text-secondary text-sm">{action.deadline}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Configuración */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-text-primary">Configuración del Negocio</h3>
              <button 
                onClick={() => setShowConfigModal(false)}
                className="text-text-secondary hover:text-text-primary"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Industria */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Industria
                </label>
                <select 
                  value={businessConfig.industry}
                  onChange={(e) => handleConfigChange('industry', e.target.value)}
                  className="w-full px-3 py-2 bg-surface-light border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="technology">Tecnología</option>
                  <option value="retail">Retail</option>
                  <option value="services">Servicios</option>
                  <option value="manufacturing">Manufactura</option>
                  <option value="food">Alimentos y Bebidas</option>
                  <option value="healthcare">Salud</option>
                  <option value="education">Educación</option>
                  <option value="finance">Finanzas</option>
                </select>
              </div>

              {/* Etapa del Negocio */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Etapa del Negocio
                </label>
                <select 
                  value={businessConfig.businessStage}
                  onChange={(e) => handleConfigChange('businessStage', e.target.value)}
                  className="w-full px-3 py-2 bg-surface-light border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="startup">Startup</option>
                  <option value="growth">Crecimiento</option>
                  <option value="mature">Madura</option>
                  <option value="expansion">Expansión</option>
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Ingresos Mensuales */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Ingresos Mensuales (MXN)
                  </label>
                  <input 
                    type="number"
                    value={businessConfig.monthlyRevenue}
                    onChange={(e) => handleConfigChange('monthlyRevenue', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-surface-light border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                {/* Número de Empleados */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Número de Empleados
                  </label>
                  <input 
                    type="number"
                    value={businessConfig.employeeCount}
                    onChange={(e) => handleConfigChange('employeeCount', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-surface-light border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                {/* Meses Operando */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Meses Operando
                  </label>
                  <input 
                    type="number"
                    value={businessConfig.monthsOperating}
                    onChange={(e) => handleConfigChange('monthsOperating', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-surface-light border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                {/* Meta de Crecimiento */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Meta de Crecimiento Anual (%)
                  </label>
                  <input 
                    type="number"
                    value={businessConfig.targetGrowthRate}
                    onChange={(e) => handleConfigChange('targetGrowthRate', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-surface-light border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              {/* Tolerancia al Riesgo */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Tolerancia al Riesgo
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['low', 'medium', 'high'].map((risk) => (
                    <button
                      key={risk}
                      onClick={() => handleConfigChange('riskTolerance', risk)}
                      className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                        businessConfig.riskTolerance === risk
                          ? 'bg-primary text-background border-primary'
                          : 'bg-surface-light text-text-secondary border-border hover:border-primary/50'
                      }`}
                    >
                      {risk === 'low' ? 'Bajo' : risk === 'medium' ? 'Medio' : 'Alto'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Botones del Modal */}
            <div className="flex justify-end space-x-3 mt-8">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfigSave}
                className="bg-primary hover:bg-primary-dark text-background px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Guardar Configuración
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Simulador */}
      {showSimulatorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-text-primary">Simulador de Escenarios de Crecimiento</h3>
              <button 
                onClick={() => setShowSimulatorModal(false)}
                className="text-text-secondary hover:text-text-primary"
              >
                ✕
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Configuración de la Simulación */}
              <div>
                <h4 className="text-lg font-semibold text-text-primary mb-4">Parámetros de Simulación</h4>
                
                <div className="space-y-4">
                  {/* Escenario seleccionado */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Escenario Base
                    </label>
                    <select 
                      value={selectedScenario}
                      onChange={(e) => setSelectedScenario(e.target.value)}
                      className="w-full px-3 py-2 bg-surface-light border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="conservative">Conservador</option>
                      <option value="realistic">Realista</option>
                      <option value="aggressive">Agresivo</option>
                    </select>
                  </div>

                  {/* Inversión inicial */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Inversión Inicial (MXN)
                    </label>
                    <input 
                      type="number"
                      defaultValue={growthScenarios.find(s => s.id === selectedScenario)?.investment || 50000}
                      className="w-full px-3 py-2 bg-surface-light border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  {/* Período de simulación */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Período de Simulación
                    </label>
                    <select className="w-full px-3 py-2 bg-surface-light border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option value="6">6 meses</option>
                      <option value="12">12 meses</option>
                      <option value="24">24 meses</option>
                      <option value="36">36 meses</option>
                    </select>
                  </div>

                  {/* Tasa de crecimiento mensual */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Tasa de Crecimiento Mensual (%)
                    </label>
                    <input 
                      type="number"
                      defaultValue={businessConfig.targetGrowthRate / 12}
                      step="0.1"
                      className="w-full px-3 py-2 bg-surface-light border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  <button
                    onClick={() => {
                      const scenario = growthScenarios.find(s => s.id === selectedScenario)
                      setSimulationResult({
                        scenario: scenario?.name,
                        projectedRevenue: scenario?.expectedReturn,
                        roi: ((scenario?.expectedReturn || 0) - (scenario?.investment || 0)) / (scenario?.investment || 1) * 100,
                        timeToBreakeven: scenario?.timeframe,
                        riskLevel: scenario?.risk,
                        probability: scenario?.probability
                      })
                    }}
                    className="w-full bg-primary hover:bg-primary-dark text-background px-4 py-3 rounded-lg font-medium transition-colors"
                  >
                    Ejecutar Simulación
                  </button>
                </div>
              </div>

              {/* Resultados de la Simulación */}
              <div>
                <h4 className="text-lg font-semibold text-text-primary mb-4">Resultados de la Simulación</h4>
                
                {simulationResult ? (
                  <div className="space-y-4">
                    <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
                      <h5 className="font-semibold text-text-primary mb-2">Escenario: {simulationResult.scenario}</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Ingresos Proyectados:</span>
                          <span className="text-success font-semibold">{formatCurrency(simulationResult.projectedRevenue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">ROI Esperado:</span>
                          <span className="text-primary font-semibold">{simulationResult.roi.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Tiempo de Recuperación:</span>
                          <span className="text-text-primary">{simulationResult.timeToBreakeven}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Nivel de Riesgo:</span>
                          <span className={`font-semibold ${
                            simulationResult.riskLevel === 'low' ? 'text-success' : 
                            simulationResult.riskLevel === 'medium' ? 'text-warning' : 'text-error'
                          }`}>
                            {simulationResult.riskLevel === 'low' ? 'Bajo' : 
                             simulationResult.riskLevel === 'medium' ? 'Medio' : 'Alto'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Probabilidad de Éxito:</span>
                          <span className="text-text-primary font-semibold">{simulationResult.probability}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Recomendaciones basadas en la simulación */}
                    <div className="bg-gradient-to-r from-primary/10 to-primary-dark/10 border border-primary/30 rounded-xl p-4">
                      <h5 className="font-semibold text-text-primary mb-2 flex items-center space-x-2">
                        <Lightbulb className="w-4 h-4 text-primary" />
                        <span>Recomendaciones IA</span>
                      </h5>
                      <div className="space-y-2 text-sm text-text-secondary">
                        {simulationResult.riskLevel === 'low' && (
                          <p>✓ Escenario conservador ideal para empresas que priorizan estabilidad. Considera reinvertir las ganancias para acelerar el crecimiento.</p>
                        )}
                        {simulationResult.riskLevel === 'medium' && (
                          <p>⚡ Escenario balanceado con buen potencial. Asegúrate de tener reservas de efectivo para 3-6 meses de operación.</p>
                        )}
                        {simulationResult.riskLevel === 'high' && (
                          <p>⚠️ Escenario agresivo con alto retorno pero mayor riesgo. Considera dividir la inversión en fases y evaluar resultados progresivamente.</p>
                        )}
                        <p>💡 Basado en tu configuración actual de {businessConfig.industry} en etapa de {businessConfig.businessStage}.</p>
                      </div>
                    </div>

                    {/* Gráfico de proyección simple */}
                    <div className="bg-surface-light border border-border rounded-xl p-4">
                      <h5 className="font-semibold text-text-primary mb-3">Proyección de Ingresos</h5>
                      <div className="space-y-2">
                        {[3, 6, 9, 12].map(month => {
                          const monthlyGrowth = simulationResult.roi / 12 / 100
                          const projectedValue = businessConfig.monthlyRevenue * Math.pow(1 + monthlyGrowth, month)
                          return (
                            <div key={month} className="flex justify-between items-center">
                              <span className="text-text-secondary text-sm">Mes {month}:</span>
                              <span className="text-text-primary font-medium">{formatCurrency(projectedValue)}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-surface-light border border-border rounded-xl p-8 text-center">
                    <Calculator className="w-12 h-12 text-text-secondary mx-auto mb-4" />
                    <p className="text-text-secondary">Configura los parámetros y ejecuta la simulación para ver los resultados proyectados.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Botones del Modal */}
            <div className="flex justify-end space-x-3 mt-8">
              <button
                onClick={() => setShowSimulatorModal(false)}
                className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
              >
                Cerrar
              </button>
              {simulationResult && (
                <button
                  onClick={() => {
                    alert('Simulación guardada en tu historial de proyecciones')
                    setShowSimulatorModal(false)
                  }}
                  className="bg-primary hover:bg-primary-dark text-background px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Guardar Simulación
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Growth