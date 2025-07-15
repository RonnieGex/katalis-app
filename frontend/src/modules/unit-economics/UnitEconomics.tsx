import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { 
  Calculator,
  DollarSign,
  Users,
  Target,
  AlertCircle,
  CheckCircle,
  Info,
  BarChart3,
  Activity,
  Brain
} from 'lucide-react'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { EducationalTooltip, WisdomPill, EDUCATIONAL_CONTENT, WISDOM_PILLS } from '../../components/ui/TooltipSystem'
import ExampleScenarios from '../../components/ui/ExampleScenarios'
import ContextualNavigation from '../../components/ui/ContextualNavigation'
import { ContentSection } from '../../components/ui/ContentSection'
import { aiService } from '../../services/aiService'
import { useAuth } from '../../components/auth/AuthProvider'
import { useFinancialData } from '../../contexts/FinancialContext'

const UnitEconomics = () => {
  const pageRef = useRef<HTMLDivElement>(null)
  const { token } = useAuth()
  const { company, products, fixedCosts, metrics } = useFinancialData()
  const [isLoading, setIsLoading] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '1')
  
  // Get selected product data
  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0]
  
  // Use real data from centralized state
  const [formData, setFormData] = useState({
    pricePerUnit: selectedProduct?.price || 200,
    variableCosts: selectedProduct?.variableCost || 70,
    marketingSpend: metrics.monthlyMarketingCosts,
    newCustomers: metrics.monthlyNewCustomers,
    avgPurchaseFreq: metrics.averagePurchaseFrequency,
    retentionMonths: metrics.averageCustomerLifetime
  })

  const [results, setResults] = useState({
    contributionMargin: 0,
    coca: 0,
    ltv: 0,
    ltvCocaRatio: 0,
    paybackPeriod: 0,
    unitEconomics: 0
  })

  useEffect(() => {
    // Page animations
    const ctx = gsap.context(() => {
      gsap.fromTo('.unit-header',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 }
      )
      gsap.fromTo('.calculator-card',
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, delay: 0.2 }
      )
      gsap.fromTo('.results-card',
        { x: 50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, delay: 0.4 }
      )
    })

    return () => ctx.revert()
  }, [])

  // Update form data when selected product changes
  useEffect(() => {
    if (selectedProduct) {
      setFormData(prev => ({
        ...prev,
        pricePerUnit: selectedProduct.price,
        variableCosts: selectedProduct.variableCost
      }))
    }
  }, [selectedProduct])

  useEffect(() => {
    // Calculate Unit Economics whenever form data changes
    calculateResults()
  }, [formData])

  // Cargar análisis de Carlos cuando cambien los resultados
  useEffect(() => {
    if (results.ltv > 0 && results.coca > 0 && token) {
      fetchUnitEconomicsAnalysis()
    }
  }, [results, token])

  const calculateResults = () => {
    const contributionMargin = formData.pricePerUnit - formData.variableCosts
    const coca = formData.marketingSpend / formData.newCustomers
    const ltv = contributionMargin * formData.avgPurchaseFreq * formData.retentionMonths
    const ltvCocaRatio = ltv / coca
    const paybackPeriod = coca / (contributionMargin * formData.avgPurchaseFreq)
    const unitEconomics = contributionMargin - coca

    setResults({
      contributionMargin,
      coca,
      ltv,
      ltvCocaRatio,
      paybackPeriod,
      unitEconomics
    })
  }

  const handleInputChange = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const applyExampleScenario = (exampleData: any) => {
    setFormData(exampleData)
  }

  // Función para obtener análisis de Carlos (agente de unit economics)
  const fetchUnitEconomicsAnalysis = async () => {
    if (!token) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const analysis = await aiService.consultCarlos({
        ltv: results.ltv,
        cac: results.coca,
        churn_rate: 1 / formData.retentionMonths, // Convertir retención a churn rate
        arpu: formData.pricePerUnit * formData.avgPurchaseFreq,
        customer_count: formData.newCustomers,
        cohort_data: {
          retention_months: formData.retentionMonths,
          purchase_frequency: formData.avgPurchaseFreq,
          contribution_margin: results.contributionMargin
        }
      })

      setAiAnalysis(analysis)
    } catch (error) {
      console.error('Error fetching Carlos analysis:', error)
      setError('Error al obtener análisis de unit economics')
    } finally {
      setIsLoading(false)
    }
  }

  // Sample data for projections using real business data
  const projectionData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1
    // Use growth factor based on real SaaS patterns
    const growthFactor = Math.pow(1.15, i / 12) // 15% annual growth
    const monthlyCustomers = formData.newCustomers * growthFactor
    const monthlyRevenue = monthlyCustomers * formData.pricePerUnit * formData.avgPurchaseFreq
    const monthlyCosts = monthlyCustomers * formData.variableCosts * formData.avgPurchaseFreq
    
    return {
      month,
      revenue: Math.round(monthlyRevenue),
      costs: Math.round(monthlyCosts),
      cumulative: Math.round(results.unitEconomics * monthlyCustomers)
    }
  })

  const getStatusColor = (ratio: number) => {
    if (ratio >= 5) return 'text-success'
    if (ratio >= 3) return 'text-warning'
    return 'text-error'
  }

  const getStatusIcon = (ratio: number) => {
    if (ratio >= 3) return <CheckCircle className="w-5 h-5 text-success" />
    if (ratio >= 1) return <AlertCircle className="w-5 h-5 text-warning" />
    return <AlertCircle className="w-5 h-5 text-error" />
  }

  return (
    <div ref={pageRef} className="space-y-8">
      {/* Header */}
      <div className="unit-header">
        <h1 className="text-3xl font-bold mb-2">Unit Economics</h1>
        <p className="text-text-secondary mb-6">
          Analiza si cada unidad de tu negocio genera más dinero del que cuesta. 
          Basado en el Capítulo 5 de "Finanzas para Emprendedores".
        </p>
        
        {/* Wisdom Pill */}
        <WisdomPill 
          title={WISDOM_PILLS.PROFITABLE_GROWTH.title}
          content={WISDOM_PILLS.PROFITABLE_GROWTH.content}
          chapter={WISDOM_PILLS.PROFITABLE_GROWTH.chapter}
          variant={WISDOM_PILLS.PROFITABLE_GROWTH.variant}
        />
        
        {/* Quick explanation */}
        <ContentSection 
          type="educational" 
          title="Conceptos del Libro"
          icon={<Info className="w-4 h-4" />}
          className="mb-6"
        >
          <div>
            <h3 className="font-semibold mb-1">¿Qué son los Unit Economics?</h3>
            <p className="text-sm text-text-secondary">
              Es analizar si cada venta individual te deja ganancia después de considerar 
              los costos de producción y adquisición de clientes. Si pierdes dinero por unidad, 
              mientras más vendas, ¡más perderás!
            </p>
          </div>
        </ContentSection>

        {/* Product Selector */}
        <ContentSection 
          type="business" 
          title="Datos de tu Empresa"
          icon={<Target className="w-4 h-4" />}
          className="mb-6"
        >
          <label className="block text-sm font-medium mb-2">Producto a Analizar</label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {products.map(product => (
              <option key={product.id} value={product.id}>
                {product.name} - ${product.price}/mes
              </option>
            ))}
          </select>
          <p className="text-xs text-text-muted mt-2">
            Analizando: {selectedProduct?.name} | Precio: ${selectedProduct?.price} | Costo Variable: ${selectedProduct?.variableCost}
          </p>
        </ContentSection>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Calculator */}
        <div className="calculator-card card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Calculator className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Calculadora Unit Economics</h2>
          </div>

          <div className="space-y-6">
            {/* Price per Unit */}
            <div>
              <EducationalTooltip
                type="concept"
                title="Precio por Unidad"
                content="El precio es la base de tu modelo de negocio. Debe cubrir costos variables, contribuir a costos fijos y generar ganancia."
                chapter="Capítulo 5"
                example="Si tu costo variable es $70 y quieres 60% de margen, el precio debe ser $175 mínimo."
              >
                <label className="block text-sm font-medium mb-2">
                  Precio por Unidad (MXN)
                </label>
              </EducationalTooltip>
              <input
                type="number"
                value={formData.pricePerUnit}
                onChange={(e) => handleInputChange('pricePerUnit', Number(e.target.value))}
                className="input"
                placeholder="200"
              />
              <p className="text-xs text-text-muted mt-1">Precio que cobras por cada producto o servicio</p>
            </div>

            {/* Variable Costs */}
            <div>
              <EducationalTooltip
                type="concept"
                title={EDUCATIONAL_CONTENT.FIXED_VS_VARIABLE.title}
                content={EDUCATIONAL_CONTENT.FIXED_VS_VARIABLE.content}
                chapter={EDUCATIONAL_CONTENT.FIXED_VS_VARIABLE.chapter}
                example={EDUCATIONAL_CONTENT.FIXED_VS_VARIABLE.example}
              >
                <label className="block text-sm font-medium mb-2">
                  Costos Variables por Unidad (MXN)
                </label>
              </EducationalTooltip>
              <input
                type="number"
                value={formData.variableCosts}
                onChange={(e) => handleInputChange('variableCosts', Number(e.target.value))}
                className="input"
                placeholder="70"
              />
              <p className="text-xs text-text-muted mt-1">Materiales, producción, envío por unidad</p>
            </div>

            {/* Marketing Spend */}
            <div>
              <EducationalTooltip
                type="formula"
                title={EDUCATIONAL_CONTENT.COCA_DEFINITION.title}
                content={EDUCATIONAL_CONTENT.COCA_DEFINITION.content}
                chapter={EDUCATIONAL_CONTENT.COCA_DEFINITION.chapter}
                formula={EDUCATIONAL_CONTENT.COCA_DEFINITION.formula}
              >
                <label className="block text-sm font-medium mb-2">
                  Gasto en Marketing Mensual (MXN)
                </label>
              </EducationalTooltip>
              <input
                type="number"
                value={formData.marketingSpend}
                onChange={(e) => handleInputChange('marketingSpend', Number(e.target.value))}
                className="input"
                placeholder="5000"
              />
              <p className="text-xs text-text-muted mt-1">Total invertido en marketing y ventas</p>
            </div>

            {/* New Customers */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Nuevos Clientes por Mes
              </label>
              <input
                type="number"
                value={formData.newCustomers}
                onChange={(e) => handleInputChange('newCustomers', Number(e.target.value))}
                className="input"
                placeholder="50"
              />
              <p className="text-xs text-text-muted mt-1">Clientes nuevos que consigues mensualmente</p>
            </div>

            {/* Purchase Frequency */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Frecuencia de Compra (por mes)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.avgPurchaseFreq}
                onChange={(e) => handleInputChange('avgPurchaseFreq', Number(e.target.value))}
                className="input"
                placeholder="2"
              />
              <p className="text-xs text-text-muted mt-1">Veces que compra un cliente promedio al mes</p>
            </div>

            {/* Retention */}
            <div>
              <EducationalTooltip
                type="concept"
                title={EDUCATIONAL_CONTENT.LTV_DEFINITION.title}
                content={EDUCATIONAL_CONTENT.LTV_DEFINITION.content}
                chapter={EDUCATIONAL_CONTENT.LTV_DEFINITION.chapter}
                formula={EDUCATIONAL_CONTENT.LTV_DEFINITION.formula}
              >
                <label className="block text-sm font-medium mb-2">
                  Retención Promedio (meses)
                </label>
              </EducationalTooltip>
              <input
                type="number"
                value={formData.retentionMonths}
                onChange={(e) => handleInputChange('retentionMonths', Number(e.target.value))}
                className="input"
                placeholder="12"
              />
              <p className="text-xs text-text-muted mt-1">Tiempo que permanece un cliente contigo</p>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="results-card card">
            <h2 className="text-xl font-semibold mb-4">Resultados Clave</h2>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Contribution Margin */}
              <div className="bg-surface-light rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <EducationalTooltip
                    type="formula"
                    title={EDUCATIONAL_CONTENT.CONTRIBUTION_MARGIN.title}
                    content={EDUCATIONAL_CONTENT.CONTRIBUTION_MARGIN.content}
                    chapter={EDUCATIONAL_CONTENT.CONTRIBUTION_MARGIN.chapter}
                    formula={EDUCATIONAL_CONTENT.CONTRIBUTION_MARGIN.formula}
                  >
                    <span className="text-sm text-text-secondary">Margen Contribución</span>
                  </EducationalTooltip>
                  <DollarSign className="w-4 h-4 text-primary" />
                </div>
                <p className="text-2xl font-bold">${results.contributionMargin.toLocaleString()}</p>
                <p className="text-xs text-text-muted">Por unidad vendida</p>
              </div>

              {/* COCA */}
              <div className="bg-surface-light rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <EducationalTooltip
                    type="formula"
                    title={EDUCATIONAL_CONTENT.COCA_DEFINITION.title}
                    content={EDUCATIONAL_CONTENT.COCA_DEFINITION.content}
                    chapter={EDUCATIONAL_CONTENT.COCA_DEFINITION.chapter}
                    formula={EDUCATIONAL_CONTENT.COCA_DEFINITION.formula}
                  >
                    <span className="text-sm text-text-secondary">COCA</span>
                  </EducationalTooltip>
                  <Users className="w-4 h-4 text-warning" />
                </div>
                <p className="text-2xl font-bold">${results.coca.toLocaleString()}</p>
                <p className="text-xs text-text-muted">Costo por cliente</p>
              </div>

              {/* LTV */}
              <div className="bg-surface-light rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <EducationalTooltip
                    type="formula"
                    title={EDUCATIONAL_CONTENT.LTV_DEFINITION.title}
                    content={EDUCATIONAL_CONTENT.LTV_DEFINITION.content}
                    chapter={EDUCATIONAL_CONTENT.LTV_DEFINITION.chapter}
                    formula={EDUCATIONAL_CONTENT.LTV_DEFINITION.formula}
                  >
                    <span className="text-sm text-text-secondary">LTV</span>
                  </EducationalTooltip>
                  <Target className="w-4 h-4 text-success" />
                </div>
                <p className="text-2xl font-bold">${results.ltv.toLocaleString()}</p>
                <p className="text-xs text-text-muted">Valor del cliente</p>
              </div>

              {/* Unit Economics */}
              <div className="bg-surface-light rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <EducationalTooltip
                    type="concept"
                    title={EDUCATIONAL_CONTENT.UNIT_ECONOMICS.title}
                    content={EDUCATIONAL_CONTENT.UNIT_ECONOMICS.content}
                    chapter={EDUCATIONAL_CONTENT.UNIT_ECONOMICS.chapter}
                    formula={EDUCATIONAL_CONTENT.UNIT_ECONOMICS.formula}
                  >
                    <span className="text-sm text-text-secondary">Unit Economics</span>
                  </EducationalTooltip>
                  <Activity className="w-4 h-4 text-primary" />
                </div>
                <p className={`text-2xl font-bold ${results.unitEconomics >= 0 ? 'text-success' : 'text-error'}`}>
                  ${results.unitEconomics.toLocaleString()}
                </p>
                <p className="text-xs text-text-muted">Ganancia por unidad</p>
              </div>
            </div>
          </div>

          {/* LTV/COCA Analysis */}
          <div className="results-card card">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-lg font-semibold">Análisis LTV/COCA</h3>
              {getStatusIcon(results.ltvCocaRatio)}
            </div>
            
            <div className="bg-surface-light rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-secondary">Relación LTV/COCA</span>
                <BarChart3 className="w-4 h-4 text-primary" />
              </div>
              <p className={`text-3xl font-bold ${getStatusColor(results.ltvCocaRatio)}`}>
                {results.ltvCocaRatio.toFixed(1)}x
              </p>
            </div>

            <div className="space-y-2 text-sm">
              {results.ltvCocaRatio >= 5 && (
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle className="w-4 h-4" />
                  <span>Excelente! Tu negocio es muy rentable</span>
                </div>
              )}
              {results.ltvCocaRatio >= 3 && results.ltvCocaRatio < 5 && (
                <div className="flex items-center gap-2 text-warning">
                  <AlertCircle className="w-4 h-4" />
                  <span>Bueno. Modelo de negocio saludable</span>
                </div>
              )}
              {results.ltvCocaRatio < 3 && results.ltvCocaRatio >= 1 && (
                <div className="flex items-center gap-2 text-warning">
                  <AlertCircle className="w-4 h-4" />
                  <span>Marginal. Necesitas optimizar</span>
                </div>
              )}
              {results.ltvCocaRatio < 1 && (
                <div className="flex items-center gap-2 text-error">
                  <AlertCircle className="w-4 h-4" />
                  <span>Peligroso. Pierdes dinero con cada cliente</span>
                </div>
              )}
              
              <p className="text-text-muted">
                Tiempo de recuperación: <strong>{results.paybackPeriod.toFixed(1)} meses</strong>
              </p>
            </div>
          </div>

          {/* AI Analysis */}
          {isLoading && (
            <div className="results-card card">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="w-5 h-5 text-primary animate-pulse" />
                <h3 className="text-lg font-semibold">Analizando con IA...</h3>
              </div>
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            </div>
          )}

          {error && (
            <div className="results-card card">
              <div className="bg-error/10 border border-error/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-error mt-0.5" />
                  <div>
                    <h4 className="font-medium text-error mb-1">Error en Análisis IA</h4>
                    <p className="text-sm text-text-secondary">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {aiAnalysis && (
            <ContentSection 
              type="ai" 
              title="Análisis Inteligente"
              icon={<Brain className="w-4 h-4" />}
              className="results-card"
            >
              <div className="space-y-4">
                {aiAnalysis.recommendations && (
                  <div>
                    <h4 className="font-medium mb-2">Recomendaciones:</h4>
                    <ul className="space-y-2">
                      {aiAnalysis.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-success mt-0.5" />
                          <span className="text-sm text-text-secondary">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiAnalysis.insights && (
                  <div>
                    <h4 className="font-medium mb-2">Insights:</h4>
                    <p className="text-sm text-text-secondary">{aiAnalysis.insights}</p>
                  </div>
                )}
              </div>
            </ContentSection>
          )}

          {/* Recommendations */}
          <div className="results-card card">
            <h3 className="text-lg font-semibold mb-4">Recomendaciones IA</h3>
            <div className="space-y-3">
              {results.ltvCocaRatio < 3 && (
                <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                  <h4 className="font-medium text-warning mb-1">Optimizar Marketing</h4>
                  <p className="text-sm text-text-secondary">
                    Tu COCA es alto. Considera enfocar en canales de marketing más eficientes.
                  </p>
                </div>
              )}
              
              {results.contributionMargin < 100 && (
                <div className="bg-error/10 border border-error/20 rounded-lg p-3">
                  <h4 className="font-medium text-error mb-1">Revisar Precios</h4>
                  <p className="text-sm text-text-secondary">
                    Tu margen de contribución es bajo. Considera aumentar precios o reducir costos.
                  </p>
                </div>
              )}

              {results.ltvCocaRatio >= 5 && (
                <div className="bg-success/10 border border-success/20 rounded-lg p-3">
                  <h4 className="font-medium text-success mb-1">Acelerar Crecimiento</h4>
                  <p className="text-sm text-text-secondary">
                    Tus unit economics son excelentes. Considera invertir más en marketing para crecer.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Example Scenarios */}
      <div className="results-card card">
        <ExampleScenarios 
          category="unit-economics" 
          onApplyScenario={applyExampleScenario}
        />
      </div>

      {/* Projection Chart */}
      <div className="results-card card">
        <h3 className="text-lg font-semibold mb-4">Proyección de Ganancias por Cliente</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={projectionData}>
            <defs>
              <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
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
              dataKey="cumulative" 
              stroke="#3ECF8E" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorCumulative)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Contextual Navigation */}
      <ContextualNavigation currentModule="unit-economics" />
    </div>
  )
}

export default UnitEconomics