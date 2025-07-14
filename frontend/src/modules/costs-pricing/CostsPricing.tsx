import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle,
  Info,
  BarChart3,
  Settings,
  Plus,
  Minus
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts'
import { EducationalTooltip, WisdomPill } from '../../components/ui/TooltipSystem'
import { useFinancialData } from '../../contexts/FinancialContext'

interface CostItem {
  id: string
  name: string
  type: 'fixed' | 'variable'
  amount: number
  category: string
}

const CostsPricing = () => {
  const pageRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<'breakdown' | 'pricing' | 'breakeven'>('breakdown')
  
  // Get centralized financial data
  const { 
    company, 
    products, 
    fixedCosts, 
    metrics, 
    updateProduct, 
    updateFixedCost, 
    addFixedCost, 
    removeFixedCost 
  } = useFinancialData()
  
  // Local state for variable costs management
  const [variableCosts, setVariableCosts] = useState<CostItem[]>([
    {
      id: 'var-hosting',
      name: 'Hosting y Cloud',
      type: 'variable' as const,
      amount: 25,
      category: 'Tecnología'
    },
    {
      id: 'var-support',
      name: 'Soporte Técnico',
      type: 'variable' as const,
      amount: 8,
      category: 'Operaciones'
    },
    {
      id: 'var-commission',
      name: 'Comisiones',
      type: 'variable' as const,
      amount: 12,
      category: 'Ventas'
    }
  ])
  
  // Convert centralized data to component format for editing
  const costs = [
    ...fixedCosts.map(cost => ({
      id: cost.id,
      name: cost.name,
      type: 'fixed' as const,
      amount: cost.amount,
      category: cost.category
    })),
    ...variableCosts
  ]

  // Use real pricing data from products (focus on main product)
  const mainProduct = products[0] // TechFlow Pro
  const [selectedProductId, setSelectedProductId] = useState(mainProduct?.id || '1')
  const selectedProduct = products.find(p => p.id === selectedProductId) || mainProduct
  
  const [pricingData, setPricingData] = useState({
    currentPrice: selectedProduct?.price || 199,
    targetMargin: 60, // Realistic SaaS target
    competitorPrice: 179, // Slightly below current
    demand: selectedProduct?.monthlySales || 450,
    priceElasticity: -1.5 // More elastic for SaaS
  })

  // Real break-even analysis using centralized metrics
  const breakEvenData = {
    unitsToSell: metrics.breakEvenUnits,
    revenue: metrics.breakEvenRevenue,
    timeframe: 'monthly'
  }

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.costs-header',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 }
      )
      gsap.fromTo('.costs-card',
        { scale: 0.95, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, stagger: 0.1, delay: 0.2 }
      )
    })

    return () => ctx.revert()
  }, [])

  // Use centralized metrics with real calculations
  const fixedCostsTotal = metrics.monthlyFixedCosts
  const variableCostPerUnit = selectedProduct ? selectedProduct.variableCost : metrics.averageVariableCost
  const contributionMargin = selectedProduct ? 
    (selectedProduct.price - selectedProduct.variableCost) : 
    metrics.contributionMargin
  const contributionMarginPercent = selectedProduct ?
    ((selectedProduct.price - selectedProduct.variableCost) / selectedProduct.price) * 100 :
    metrics.contributionMarginPercent
  const breakEvenUnits = metrics.breakEvenUnits
  const breakEvenRevenue = metrics.breakEvenRevenue

  // Pricing analysis for selected product
  const optimalPrice = variableCostPerUnit / (1 - pricingData.targetMargin / 100)
  const priceGap = pricingData.currentPrice - pricingData.competitorPrice
  const demandAtCurrentPrice = pricingData.demand * Math.pow(pricingData.currentPrice / (selectedProduct?.price || 200), pricingData.priceElasticity)

  // Cost breakdown for pie chart using real data
  const totalUnits = products.reduce((sum, p) => sum + p.monthlySales, 0)
  const costBreakdown = [
    { name: 'Costos Fijos', value: fixedCostsTotal, color: '#EF4444' },
    { name: 'Costos Variables', value: metrics.monthlyVariableCosts, color: '#F59E0B' }
  ]

  // Break-even chart data using real metrics
  const breakEvenChartData = Array.from({ length: 20 }, (_, i) => {
    const units = (i + 1) * Math.ceil(breakEvenUnits / 10) // Scale based on real break-even
    const revenue = units * (selectedProduct?.price || metrics.averageSellingPrice)
    const totalCosts = fixedCostsTotal + (units * variableCostPerUnit)
    return {
      units,
      revenue,
      costs: totalCosts,
      profit: revenue - totalCosts
    }
  })

  // Pricing sensitivity data based on selected product
  const basePriceRange = selectedProduct?.price || 199
  const pricingSensitivityData = Array.from({ length: 10 }, (_, i) => {
    const price = basePriceRange * 0.7 + (i * basePriceRange * 0.06) // ±30% range
    const demand = pricingData.demand * Math.pow(price / basePriceRange, pricingData.priceElasticity)
    const revenue = price * demand
    const contribution = (price - variableCostPerUnit) * demand
    return {
      price: Math.round(price),
      demand: Math.round(Math.max(0, demand)),
      revenue: Math.round(Math.max(0, revenue)),
      contribution: Math.round(Math.max(0, contribution))
    }
  })

  const addCost = () => {
    // Add to centralized fixed costs
    addFixedCost({
      name: 'Nuevo costo',
      amount: 0,
      category: 'Operaciones',
      recurring: 'monthly'
    })
  }

  const addVariableCost = () => {
    // Add to local variable costs
    const newId = `var-${Date.now()}`
    setVariableCosts(prev => [...prev, {
      id: newId,
      name: 'Nuevo costo variable',
      type: 'variable' as const,
      amount: 0,
      category: 'Operaciones'
    }])
  }

  const updateCost = (id: string, updates: Partial<CostItem>) => {
    // Update in centralized state if it's a fixed cost
    const fixedCost = fixedCosts.find(c => c.id === id)
    if (fixedCost && updates.type === 'fixed') {
      updateFixedCost(id, {
        name: updates.name,
        amount: updates.amount,
        category: updates.category
      })
      return
    }
    
    // Update variable costs in local state
    const variableCost = variableCosts.find(c => c.id === id)
    if (variableCost && updates.type === 'variable') {
      setVariableCosts(prev => prev.map(cost => 
        cost.id === id 
          ? { ...cost, ...updates }
          : cost
      ))
    }
  }

  const deleteCost = (id: string) => {
    // Check if it's a fixed cost
    const fixedCost = fixedCosts.find(c => c.id === id)
    if (fixedCost) {
      removeFixedCost(id)
      return
    }
    
    // Check if it's a variable cost
    const variableCost = variableCosts.find(c => c.id === id)
    if (variableCost) {
      setVariableCosts(prev => prev.filter(cost => cost.id !== id))
    }
  }

  return (
    <div ref={pageRef} className="space-y-8">
      {/* Header */}
      <div className="costs-header">
        <h1 className="text-3xl font-bold mb-2">Costos y Precios</h1>
        <p className="text-text-secondary mb-6">
          Analiza tu estructura de costos, optimiza precios y calcula el punto de equilibrio.
          Basado en los Capítulos 6-9 de "Finanzas para Emprendedores".
        </p>

        {/* Wisdom Pill */}
        <WisdomPill 
          title="El Secreto del Control de Costos"
          content="No basta con conocer tus costos totales. Debes saber exactamente cuánto cuesta cada venta para tomar decisiones inteligentes de precios y crecimiento."
          chapter="Capítulo 6"
          variant="primary"
        />

        {/* Educational info */}
        <div className="glass rounded-lg p-4 border border-primary/20 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold text-primary mb-1">Conceptos Clave</h3>
              <p className="text-sm text-text-secondary">
                <strong>Costos Fijos:</strong> No cambian con la producción (renta, salarios). 
                <strong>Costos Variables:</strong> Cambian con cada unidad (materiales, comisiones).
                <strong>Punto de Equilibrio:</strong> Unidades necesarias para cubrir todos los costos.
              </p>
            </div>
          </div>
        </div>

        {/* Product Selector */}
        <div className="bg-surface border border-border rounded-lg p-4 mb-6">
          <label className="block text-sm font-medium mb-2">Producto a Analizar</label>
          <select
            value={selectedProductId}
            onChange={(e) => {
              setSelectedProductId(e.target.value)
              const product = products.find(p => p.id === e.target.value)
              if (product) {
                setPricingData(prev => ({
                  ...prev,
                  currentPrice: product.price,
                  demand: product.monthlySales
                }))
              }
            }}
            className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {products.map(product => (
              <option key={product.id} value={product.id}>
                {product.name} - ${product.price}/mes
              </option>
            ))}
          </select>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-surface-light rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab('breakdown')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'breakdown' ? 'bg-primary text-background' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Estructura de Costos
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'pricing' ? 'bg-primary text-background' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Target className="w-4 h-4 inline mr-2" />
            Estrategia de Precios
          </button>
          <button
            onClick={() => setActiveTab('breakeven')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'breakeven' ? 'bg-primary text-background' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Punto de Equilibrio
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="costs-card grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Fixed Costs */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-error/10 rounded-lg">
              <Settings className="w-6 h-6 text-error" />
            </div>
            <span className="text-xs text-error bg-error/10 px-2 py-1 rounded-full">
              Fijos
            </span>
          </div>
          <EducationalTooltip
            type="concept"
            title="Costos Fijos"
            content="Son los gastos que permanecen constantes sin importar cuánto vendas: renta, salarios, seguros. Estos costos debes pagarlos aunque no vendas nada."
            chapter="Capítulo 6"
          >
            <h3 className="text-sm text-text-secondary mb-1">Costos Fijos</h3>
          </EducationalTooltip>
          <p className="text-2xl font-bold text-error">${fixedCostsTotal.toLocaleString()}</p>
        </div>

        {/* Variable Cost per Unit */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-warning/10 rounded-lg">
              <TrendingDown className="w-6 h-6 text-warning" />
            </div>
            <span className="text-xs text-warning bg-warning/10 px-2 py-1 rounded-full">
              Variables
            </span>
          </div>
          <EducationalTooltip
            type="concept"
            title="Costos Variables"
            content="Son los costos que cambian directamente con cada venta: materiales, comisiones, envíos. Si no vendes, no tienes estos costos."
            chapter="Capítulo 6"
          >
            <h3 className="text-sm text-text-secondary mb-1">Costo Variable/Unidad</h3>
          </EducationalTooltip>
          <p className="text-2xl font-bold text-warning">${variableCostPerUnit}</p>
        </div>

        {/* Contribution Margin */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
              {contributionMarginPercent.toFixed(1)}%
            </span>
          </div>
          <EducationalTooltip
            type="formula"
            title="Margen de Contribución"
            content="Es el dinero que queda de cada venta después de pagar los costos variables. Este dinero contribuye a cubrir los costos fijos y generar ganancia."
            chapter="Capítulo 7"
            formula="Margen = Precio de Venta - Costos Variables"
          >
            <h3 className="text-sm text-text-secondary mb-1">Margen Contribución</h3>
          </EducationalTooltip>
          <p className="text-2xl font-bold text-primary">${contributionMargin}</p>
        </div>

        {/* Break-even Units */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-success/10 rounded-lg">
              <Target className="w-6 h-6 text-success" />
            </div>
            <span className="text-xs text-success bg-success/10 px-2 py-1 rounded-full">
              Equilibrio
            </span>
          </div>
          <EducationalTooltip
            type="formula"
            title="Punto de Equilibrio"
            content="Es el número mínimo de unidades que debes vender para cubrir todos tus costos. Por debajo de este punto pierdes dinero, por encima generas ganancia."
            chapter="Capítulo 8"
            formula="Break-even = Costos Fijos ÷ Margen de Contribución"
          >
            <h3 className="text-sm text-text-secondary mb-1">Unidades Break-even</h3>
          </EducationalTooltip>
          <p className="text-2xl font-bold text-success">{breakEvenUnits}</p>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'breakdown' && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Cost Management */}
          <div className="costs-card card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Administrar Costos</h3>
              <button
                onClick={addCost}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Agregar
              </button>
            </div>

            <div className="space-y-3">
              {costs.map((cost) => (
                <div key={cost.id} className="flex items-center justify-between p-4 bg-surface-light rounded-lg">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`p-2 rounded-lg ${cost.type === 'fixed' ? 'bg-error/10' : 'bg-warning/10'}`}>
                      {cost.type === 'fixed' ? 
                        <Settings className="w-4 h-4 text-error" /> : 
                        <TrendingDown className="w-4 h-4 text-warning" />
                      }
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={cost.name}
                        onChange={(e) => updateCost(cost.id, { name: e.target.value })}
                        className="input-sm bg-transparent border-none p-0 font-medium"
                      />
                      <select
                        value={cost.type}
                        onChange={(e) => updateCost(cost.id, { type: e.target.value as 'fixed' | 'variable' })}
                        className="text-xs text-text-primary bg-surface-light border border-border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="fixed">Fijo</option>
                        <option value="variable">Variable</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={cost.amount}
                      onChange={(e) => updateCost(cost.id, { amount: Number(e.target.value) })}
                      className="input-sm w-24 text-right"
                    />
                    <button
                      onClick={() => deleteCost(cost.id)}
                      className="btn-ghost p-2 text-error hover:bg-error/10"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cost Breakdown Chart */}
          <div className="costs-card card h-full flex flex-col">
            <h3 className="text-lg font-semibold mb-4">Distribución de Costos</h3>
            <div className="flex-1 flex flex-col justify-center">
              <ResponsiveContainer width="100%" height={320}>
                <RechartsPieChart>
                  <Pie
                    data={costBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}\n${(percent * 100).toFixed(0)}%`}
                    outerRadius="85%"
                    innerRadius="50%"
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {costBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#181818', 
                      border: '1px solid #27272A',
                      borderRadius: '8px'
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
              
              {/* Legend */}
              <div className="mt-2 space-y-2">
                {costBreakdown.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-surface-light rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full`} style={{ backgroundColor: item.color }} />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold">${item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pricing' && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Pricing Strategy */}
          <div className="costs-card card">
            <h3 className="text-lg font-semibold mb-6">Configurar Precios</h3>
            
            <div className="space-y-6">
              {/* Current Price */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Precio Actual (MXN)
                </label>
                <input
                  type="number"
                  value={pricingData.currentPrice}
                  onChange={(e) => setPricingData({...pricingData, currentPrice: Number(e.target.value)})}
                  className="input"
                />
              </div>

              {/* Target Margin */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Margen Objetivo (%)
                </label>
                <input
                  type="number"
                  value={pricingData.targetMargin}
                  onChange={(e) => setPricingData({...pricingData, targetMargin: Number(e.target.value)})}
                  className="input"
                />
              </div>

              {/* Competitor Price */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Precio Competencia (MXN)
                </label>
                <input
                  type="number"
                  value={pricingData.competitorPrice}
                  onChange={(e) => setPricingData({...pricingData, competitorPrice: Number(e.target.value)})}
                  className="input"
                />
              </div>

              {/* Pricing Recommendations */}
              <div className="space-y-3">
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <h4 className="font-medium text-primary mb-1">Precio Óptimo</h4>
                  <p className="text-sm text-text-secondary">
                    Basado en tu margen objetivo: <strong>${optimalPrice.toFixed(0)}</strong>
                  </p>
                </div>

                {priceGap > 0 ? (
                  <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                    <h4 className="font-medium text-warning mb-1">Precio Premium</h4>
                    <p className="text-sm text-text-secondary">
                      Estás ${priceGap} por encima de la competencia. Asegúrate de justificar el valor.
                    </p>
                  </div>
                ) : (
                  <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                    <h4 className="font-medium text-success mb-1">Precio Competitivo</h4>
                    <p className="text-sm text-text-secondary">
                      Tu precio es competitivo. Considera si puedes aumentar el valor percibido.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Price Sensitivity Analysis */}
          <div className="costs-card card">
            <h3 className="text-lg font-semibold mb-4">Análisis de Sensibilidad</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={pricingSensitivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                <XAxis dataKey="price" stroke="#71717A" />
                <YAxis stroke="#71717A" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#181818', 
                    border: '1px solid #27272A',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3ECF8E" 
                  strokeWidth={2}
                  name="Ingresos"
                />
                <Line 
                  type="monotone" 
                  dataKey="contribution" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  name="Contribución"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'breakeven' && (
        <div className="space-y-8">
          {/* Break-even Analysis */}
          <div className="costs-card card">
            <h3 className="text-lg font-semibold mb-6">Análisis de Punto de Equilibrio</h3>
            
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="bg-surface-light rounded-lg p-4">
                <h4 className="font-medium mb-2">Unidades Necesarias</h4>
                <p className="text-2xl font-bold text-primary">{breakEvenUnits}</p>
                <p className="text-sm text-text-secondary">unidades por mes</p>
              </div>
              
              <div className="bg-surface-light rounded-lg p-4">
                <h4 className="font-medium mb-2">Ingresos Necesarios</h4>
                <p className="text-2xl font-bold text-success">${breakEvenRevenue.toLocaleString()}</p>
                <p className="text-sm text-text-secondary">pesos por mes</p>
              </div>
              
              <div className="bg-surface-light rounded-lg p-4">
                <h4 className="font-medium mb-2">Días para Break-even</h4>
                <p className="text-2xl font-bold text-warning">{Math.ceil(breakEvenUnits / (breakEvenData.unitsToSell / 30))}</p>
                <p className="text-sm text-text-secondary">días vendiendo {Math.round(breakEvenData.unitsToSell/30)} unid/día</p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={breakEvenChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                <XAxis dataKey="units" stroke="#71717A" />
                <YAxis stroke="#71717A" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#181818', 
                    border: '1px solid #27272A',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Ingresos"
                />
                <Line 
                  type="monotone" 
                  dataKey="costs" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  name="Costos Totales"
                />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#3ECF8E" 
                  strokeWidth={3}
                  name="Utilidad"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Scenario Analysis */}
          <div className="costs-card card">
            <h3 className="text-lg font-semibold mb-4">Análisis de Escenarios</h3>
            
            <div className="grid md:grid-cols-3 gap-4">
              {/* Conservative Scenario */}
              <div className="bg-error/10 border border-error/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-error" />
                  <h4 className="font-medium text-error">Escenario Conservador</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <p>Ventas: {Math.round(breakEvenData.unitsToSell * 0.7)} unid/mes</p>
                  <p>Pérdida: <span className="text-error font-semibold">
                    ${((breakEvenData.unitsToSell * 0.7 * contributionMargin) - fixedCostsTotal).toLocaleString()}
                  </span></p>
                  <p className="text-text-secondary">30% menos ventas esperadas</p>
                </div>
              </div>

              {/* Realistic Scenario */}
              <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-warning" />
                  <h4 className="font-medium text-warning">Escenario Realista</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <p>Ventas: {breakEvenData.unitsToSell} unid/mes</p>
                  <p>Utilidad: <span className="text-warning font-semibold">
                    ${((breakEvenData.unitsToSell * contributionMargin) - fixedCostsTotal).toLocaleString()}
                  </span></p>
                  <p className="text-text-secondary">Meta de ventas actual</p>
                </div>
              </div>

              {/* Optimistic Scenario */}
              <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <h4 className="font-medium text-success">Escenario Optimista</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <p>Ventas: {Math.round(breakEvenData.unitsToSell * 1.5)} unid/mes</p>
                  <p>Utilidad: <span className="text-success font-semibold">
                    ${((breakEvenData.unitsToSell * 1.5 * contributionMargin) - fixedCostsTotal).toLocaleString()}
                  </span></p>
                  <p className="text-text-secondary">50% más ventas esperadas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insights and Recommendations */}
      <div className="costs-card card">
        <h3 className="text-lg font-semibold mb-4">Insights y Recomendaciones</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {contributionMarginPercent < 30 && (
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                <div>
                  <h4 className="font-medium text-warning mb-1">Margen Bajo</h4>
                  <p className="text-sm text-text-secondary">
                    Tu margen de contribución es menor al 30%. Considera aumentar precios o reducir costos variables.
                  </p>
                </div>
              </div>
            </div>
          )}

          {breakEvenUnits > breakEvenData.unitsToSell && (
            <div className="bg-error/10 border border-error/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-error mt-0.5" />
                <div>
                  <h4 className="font-medium text-error mb-1">Meta Insuficiente</h4>
                  <p className="text-sm text-text-secondary">
                    Necesitas vender {breakEvenUnits} unidades para el break-even, pero tu meta es {breakEvenData.unitsToSell}.
                  </p>
                </div>
              </div>
            </div>
          )}

          {optimalPrice > pricingData.currentPrice && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium text-primary mb-1">Oportunidad de Precio</h4>
                  <p className="text-sm text-text-secondary">
                    Podrías aumentar tu precio a ${optimalPrice.toFixed(0)} para alcanzar tu margen objetivo del {pricingData.targetMargin}%.
                  </p>
                </div>
              </div>
            </div>
          )}

          {contributionMarginPercent >= 40 && breakEvenUnits <= breakEvenData.unitsToSell && (
            <div className="bg-success/10 border border-success/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                <div>
                  <h4 className="font-medium text-success mb-1">Estructura Saludable</h4>
                  <p className="text-sm text-text-secondary">
                    Tu estructura de costos y precios es saludable. Considera estrategias de crecimiento.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CostsPricing