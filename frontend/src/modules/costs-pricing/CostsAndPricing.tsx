import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { 
  DollarSign,
  Calculator,
  TrendingUp,
  Target,
  AlertTriangle,
  CheckCircle,
  Info,
  BarChart3,
  Settings,
  Plus,
  Trash2,
  Eye,
  Activity,
  Zap
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { WisdomPill, WISDOM_PILLS, EducationalTooltip, EDUCATIONAL_CONTENT } from '../../components/ui/TooltipSystem'
import ExampleScenarios from '../../components/ui/ExampleScenarios'
import ContextualNavigation from '../../components/ui/ContextualNavigation'
import { useFinancialData } from '../../contexts/FinancialContext'

interface CostItem {
  id: string
  description: string
  amount: number
  category: 'fixed' | 'variable'
  frequency: 'monthly' | 'annual' | 'per_unit'
  type: 'material' | 'labor' | 'overhead' | 'marketing' | 'admin' | 'other'
}

interface Product {
  id: string
  name: string
  salePrice: number
  variableCostPerUnit: number
  monthlyVolume: number
  contributionMargin: number
  breakEvenUnits: number
}

interface PricingScenario {
  price: number
  volume: number
  revenue: number
  costs: number
  profit: number
  margin: number
}

const CostsAndPricing = () => {
  const pageRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<'costs' | 'pricing' | 'analysis' | 'scenarios'>('costs')
  
  // Cost structure data
  const [costs, setCosts] = useState<CostItem[]>([
    { id: '1', description: 'Renta de oficina', amount: 12000, category: 'fixed', frequency: 'monthly', type: 'overhead' },
    { id: '2', description: 'Salarios base', amount: 45000, category: 'fixed', frequency: 'monthly', type: 'labor' },
    { id: '3', description: 'Servicios (luz, agua, internet)', amount: 3500, category: 'fixed', frequency: 'monthly', type: 'overhead' },
    { id: '4', description: 'Material prima por unidad', amount: 25, category: 'variable', frequency: 'per_unit', type: 'material' },
    { id: '5', description: 'Empaque por unidad', amount: 8, category: 'variable', frequency: 'per_unit', type: 'material' },
    { id: '6', description: 'Comisiones de venta', amount: 15, category: 'variable', frequency: 'per_unit', type: 'marketing' },
    { id: '7', description: 'Software y licencias', amount: 2500, category: 'fixed', frequency: 'monthly', type: 'admin' },
    { id: '8', description: 'Publicidad digital', amount: 8000, category: 'fixed', frequency: 'monthly', type: 'marketing' }
  ])

  // Product data for pricing analysis
  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: 'Producto Principal', salePrice: 120, variableCostPerUnit: 48, monthlyVolume: 800, contributionMargin: 72, breakEvenUnits: 0 },
    { id: '2', name: 'Producto Avanzado', salePrice: 200, variableCostPerUnit: 65, monthlyVolume: 300, contributionMargin: 135, breakEvenUnits: 0 },
    { id: '3', name: 'Producto Básico', salePrice: 80, variableCostPerUnit: 35, monthlyVolume: 500, contributionMargin: 45, breakEvenUnits: 0 }
  ])

  // Pricing simulator
  const [selectedProduct, setSelectedProduct] = useState<string>('1')
  const [simulationPrice, setSimulationPrice] = useState<number>(120)
  const [expectedVolume, setExpectedVolume] = useState<number>(800)

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

  // Calculate metrics
  const totalFixedCosts = costs.filter(c => c.category === 'fixed' && c.frequency === 'monthly').reduce((sum, c) => sum + c.amount, 0)
  const totalVariableCostPerUnit = costs.filter(c => c.category === 'variable' && c.frequency === 'per_unit').reduce((sum, c) => sum + c.amount, 0)
  
  // Update break-even calculations for products
  useEffect(() => {
    setProducts(products.map(product => ({
      ...product,
      breakEvenUnits: totalFixedCosts / product.contributionMargin
    })))
  }, [totalFixedCosts])

  // Cost breakdown by type
  const costsByType = costs.reduce((acc, cost) => {
    const monthlyAmount = cost.frequency === 'annual' ? cost.amount / 12 : 
                         cost.frequency === 'per_unit' ? cost.amount * expectedVolume : cost.amount
    acc[cost.type] = (acc[cost.type] || 0) + monthlyAmount
    return acc
  }, {} as Record<string, number>)

  const costBreakdownData = Object.entries(costsByType).map(([type, amount]) => ({
    name: type === 'material' ? 'Materiales' :
          type === 'labor' ? 'Mano de Obra' :
          type === 'overhead' ? 'Gastos Generales' :
          type === 'marketing' ? 'Marketing' :
          type === 'admin' ? 'Administrativos' : 'Otros',
    value: amount,
    color: type === 'material' ? '#10B981' :
           type === 'labor' ? '#3ECF8E' :
           type === 'overhead' ? '#F59E0B' :
           type === 'marketing' ? '#EC4899' :
           type === 'admin' ? '#8B5CF6' : '#6B7280'
  }))

  // Pricing scenarios
  const generatePricingScenarios = () => {
    const selectedProd = products.find(p => p.id === selectedProduct)
    if (!selectedProd) return []

    const basePrice = selectedProd.salePrice
    const scenarios: PricingScenario[] = []
    
    for (let i = -20; i <= 30; i += 10) {
      const price = basePrice * (1 + i / 100)
      // Simulate demand elasticity (higher price = lower volume)
      const volumeChange = -i * 1.5 // 1.5x elasticity
      const volume = expectedVolume * (1 + volumeChange / 100)
      const revenue = price * volume
      const variableCosts = selectedProd.variableCostPerUnit * volume
      const profit = revenue - variableCosts - totalFixedCosts
      const margin = (profit / revenue) * 100

      scenarios.push({
        price: Math.round(price),
        volume: Math.round(volume),
        revenue: Math.round(revenue),
        costs: Math.round(variableCosts + totalFixedCosts),
        profit: Math.round(profit),
        margin: Math.round(margin * 10) / 10
      })
    }
    
    return scenarios
  }

  const pricingScenarios = generatePricingScenarios()

  // Product profitability comparison
  const productProfitabilityData = products.map(product => ({
    name: product.name,
    revenue: product.salePrice * product.monthlyVolume,
    variableCosts: product.variableCostPerUnit * product.monthlyVolume,
    contribution: product.contributionMargin * product.monthlyVolume,
    margin: ((product.contributionMargin / product.salePrice) * 100)
  }))

  const addCost = () => {
    const newCost: CostItem = {
      id: Date.now().toString(),
      description: 'Nuevo costo',
      amount: 0,
      category: 'fixed',
      frequency: 'monthly',
      type: 'other'
    }
    setCosts([...costs, newCost])
  }

  const updateCost = (id: string, updates: Partial<CostItem>) => {
    setCosts(costs.map(cost => cost.id === id ? { ...cost, ...updates } : cost))
  }

  const deleteCost = (id: string) => {
    setCosts(costs.filter(cost => cost.id !== id))
  }

  const addProduct = () => {
    const newProduct: Product = {
      id: Date.now().toString(),
      name: 'Nuevo Producto',
      salePrice: 100,
      variableCostPerUnit: totalVariableCostPerUnit,
      monthlyVolume: 100,
      contributionMargin: 100 - totalVariableCostPerUnit,
      breakEvenUnits: 0
    }
    setProducts([...products, newProduct])
  }

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(products.map(product => {
      if (product.id === id) {
        const updated = { ...product, ...updates }
        updated.contributionMargin = updated.salePrice - updated.variableCostPerUnit
        return updated
      }
      return product
    }))
  }

  const deleteProduct = (id: string) => {
    setProducts(products.filter(product => product.id !== id))
  }

  const getCostTypeIcon = (type: string) => {
    switch (type) {
      case 'material': return <DollarSign className="w-4 h-4" />
      case 'labor': return <Activity className="w-4 h-4" />
      case 'overhead': return <Settings className="w-4 h-4" />
      case 'marketing': return <TrendingUp className="w-4 h-4" />
      case 'admin': return <Calculator className="w-4 h-4" />
      default: return <Zap className="w-4 h-4" />
    }
  }

  const getCostTypeColor = (type: string) => {
    switch (type) {
      case 'material': return 'text-success bg-success/10'
      case 'labor': return 'text-primary bg-primary/10'
      case 'overhead': return 'text-warning bg-warning/10'
      case 'marketing': return 'text-purple-500 bg-purple-500/10'
      case 'admin': return 'text-blue-500 bg-blue-500/10'
      default: return 'text-text-secondary bg-surface-light'
    }
  }

  // Apply example scenario from the book
  const applyExampleScenario = (exampleData: any) => {
    if (exampleData.products) {
      setProducts(exampleData.products.map((p: any, index: number) => ({
        id: String(index + 1),
        name: p.name,
        salePrice: p.targetMargin ? p.variableCost / (1 - p.targetMargin / 100) : 100,
        variableCostPerUnit: p.variableCost,
        monthlyVolume: p.volume,
        contributionMargin: 0,
        breakEvenUnits: 0
      })))
    }
    
    if (exampleData.fixedCosts) {
      setCosts([
        { id: '1', description: 'Costos Fijos Mensuales', amount: exampleData.fixedCosts, category: 'fixed', frequency: 'monthly', type: 'overhead' },
        ...costs.filter(c => c.category === 'variable')
      ])
    }
  }

  return (
    <div ref={pageRef} className="space-y-8">
      {/* Header */}
      <div className="costs-header">
        <h1 className="text-3xl font-bold mb-2">Costos y Precios</h1>
        <p className="text-text-secondary mb-6">
          Gestiona tu estructura de costos y optimiza tus estrategias de precios.
          Basado en los Capítulos 6-9 de "Finanzas para Emprendedores".
        </p>

        {/* Educational content */}
        <div className="space-y-4 mb-6">
          {/* Primary Wisdom Pill */}
          <WisdomPill 
            title="Precios Basados en Valor, No en Costos"
            content="El precio debe reflejar el valor que percibe el cliente, no solo cubrir costos. Un error común es fijar precios sumando un margen a los costos sin considerar el mercado."
            chapter="Capítulo 7"
            variant="warning"
          />
          
          {/* Secondary Wisdom Pill */}
          <WisdomPill 
            title="El Punto de Equilibrio es Tu Norte"
            content="Conocer cuántas unidades necesitas vender para cubrir todos tus costos es fundamental. Por debajo de este punto, cada venta te acerca al objetivo; por encima, cada venta es pura ganancia."
            chapter="Capítulo 8"
            variant="success"
          />
        </div>
        
        {/* Enhanced Educational Section */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="glass rounded-lg p-4 border border-primary/20">
            <div className="flex items-start gap-3">
              <Calculator className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold text-primary mb-2">Estructura de Costos</h3>
                <div className="space-y-2 text-sm text-text-secondary">
                  <div><strong>Costos Fijos:</strong> Renta, salarios, seguros (no cambian con volumen)</div>
                  <div><strong>Costos Variables:</strong> Materiales, comisiones (cambian por unidad)</div>
                  <div><strong>Costos Semi-variables:</strong> Servicios con franquicia (teléfono, electricidad)</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="glass rounded-lg p-4 border border-success/20">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-success mt-0.5" />
              <div>
                <h3 className="font-semibold text-success mb-2">Estrategias de Precios</h3>
                <div className="space-y-2 text-sm text-text-secondary">
                  <div><strong>Penetración:</strong> Precio bajo para ganar mercado rápido</div>
                  <div><strong>Descremado:</strong> Precio alto inicial, luego reducir</div>
                  <div><strong>Competitivo:</strong> Seguir precios del mercado</div>
                  <div><strong>Valor:</strong> Precio basado en beneficio percibido</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Key Formulas */}
        <div className="bg-gradient-to-r from-primary/5 to-success/5 border border-primary/20 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Fórmulas Esenciales
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div><strong>Punto de Equilibrio (unidades):</strong></div>
              <div className="bg-surface/50 p-2 rounded font-mono">Costos Fijos ÷ (Precio - Costo Variable)</div>
              <div><strong>Margen de Contribución:</strong></div>
              <div className="bg-surface/50 p-2 rounded font-mono">Precio de Venta - Costo Variable</div>
            </div>
            <div className="space-y-2">
              <div><strong>Margen de Contribución %:</strong></div>
              <div className="bg-surface/50 p-2 rounded font-mono">(Margen Contribución ÷ Precio) × 100</div>
              <div><strong>Precio con Margen Deseado:</strong></div>
              <div className="bg-surface/50 p-2 rounded font-mono">Costo Variable ÷ (1 - Margen % Deseado)</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-surface-light rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab('costs')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'costs' ? 'bg-primary text-background' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Calculator className="w-4 h-4 inline mr-2" />
            Estructura de Costos
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'pricing' ? 'bg-primary text-background' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <DollarSign className="w-4 h-4 inline mr-2" />
            Análisis de Precios
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'analysis' ? 'bg-primary text-background' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Rentabilidad
          </button>
          <button
            onClick={() => setActiveTab('scenarios')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'scenarios' ? 'bg-primary text-background' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Eye className="w-4 h-4 inline mr-2" />
            Simulador de Precios
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="costs-card grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Fixed Costs */}
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
            content="Gastos que no cambian independientemente del volumen de producción o ventas. Incluyen renta, salarios base, seguros y depreciación."
            chapter="Capítulo 6"
            formula="Total mensual = Suma de todos los gastos fijos"
          >
            <h3 className="text-sm text-text-secondary mb-1">Costos Fijos Mensuales</h3>
          </EducationalTooltip>
          <p className="text-2xl font-bold text-error">${totalFixedCosts.toLocaleString()}</p>
        </div>

        {/* Variable Cost per Unit */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-warning/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-warning" />
            </div>
            <span className="text-xs text-warning bg-warning/10 px-2 py-1 rounded-full">
              Variables
            </span>
          </div>
          <EducationalTooltip
            type="concept"
            title="Costos Variables"
            content="Gastos que cambian directamente con el volumen de producción. Incluyen materiales, mano de obra directa y comisiones de venta."
            chapter="Capítulo 6"
            formula="Por unidad = Material + Mano de obra directa + Otros variables"
          >
            <h3 className="text-sm text-text-secondary mb-1">Costo Variable por Unidad</h3>
          </EducationalTooltip>
          <p className="text-2xl font-bold text-warning">${totalVariableCostPerUnit.toLocaleString()}</p>
        </div>

        {/* Break-even Point */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
              Equilibrio
            </span>
          </div>
          <EducationalTooltip
            type="formula"
            title="Punto de Equilibrio"
            content="Cantidad de unidades que debes vender para cubrir exactamente todos tus costos fijos y variables, sin generar ganancia ni pérdida."
            chapter="Capítulo 8"
            formula="Unidades = Costos Fijos ÷ (Precio de Venta - Costo Variable por Unidad)"
          >
            <h3 className="text-sm text-text-secondary mb-1">Punto de Equilibrio (Promedio)</h3>
          </EducationalTooltip>
          <p className="text-2xl font-bold text-primary">
            {products.length > 0 ? Math.round(products.reduce((sum, p) => sum + p.breakEvenUnits, 0) / products.length).toLocaleString() : 0} un.
          </p>
        </div>

        {/* Total Monthly Revenue */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-success/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
            <span className="text-xs text-success bg-success/10 px-2 py-1 rounded-full">
              Ingresos
            </span>
          </div>
          <h3 className="text-sm text-text-secondary mb-1">Ingresos Mensuales</h3>
          <p className="text-2xl font-bold text-success">
            ${products.reduce((sum, p) => sum + (p.salePrice * p.monthlyVolume), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'costs' && (
        <div className="space-y-8">
          {/* Cost Management */}
          <div className="costs-card card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Gestión de Costos</h3>
              <button
                onClick={addCost}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Agregar Costo
              </button>
            </div>

            <div className="space-y-3">
              {costs.map((cost) => (
                <div key={cost.id} className="grid grid-cols-6 gap-4 items-center p-4 bg-surface-light rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getCostTypeColor(cost.type)}`}>
                      {getCostTypeIcon(cost.type)}
                    </div>
                    <div>
                      <input
                        type="text"
                        value={cost.description}
                        onChange={(e) => updateCost(cost.id, { description: e.target.value })}
                        className="font-medium bg-transparent border-none p-0 w-full"
                      />
                      <span className={`text-xs px-2 py-1 rounded-full ${cost.category === 'fixed' ? 'text-error bg-error/10' : 'text-warning bg-warning/10'}`}>
                        {cost.category === 'fixed' ? 'Fijo' : 'Variable'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs text-text-secondary">Monto</label>
                    <input
                      type="number"
                      value={cost.amount}
                      onChange={(e) => updateCost(cost.id, { amount: Number(e.target.value) })}
                      className="input-sm w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-text-secondary">Categoría</label>
                    <select
                      value={cost.category}
                      onChange={(e) => updateCost(cost.id, { category: e.target.value as 'fixed' | 'variable' })}
                      className="input-sm w-full"
                    >
                      <option value="fixed">Fijo</option>
                      <option value="variable">Variable</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-xs text-text-secondary">Frecuencia</label>
                    <select
                      value={cost.frequency}
                      onChange={(e) => updateCost(cost.id, { frequency: e.target.value as any })}
                      className="input-sm w-full"
                    >
                      <option value="monthly">Mensual</option>
                      <option value="annual">Anual</option>
                      <option value="per_unit">Por Unidad</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-xs text-text-secondary">Tipo</label>
                    <select
                      value={cost.type}
                      onChange={(e) => updateCost(cost.id, { type: e.target.value as any })}
                      className="input-sm w-full"
                    >
                      <option value="material">Material</option>
                      <option value="labor">Mano de Obra</option>
                      <option value="overhead">Gastos Generales</option>
                      <option value="marketing">Marketing</option>
                      <option value="admin">Administrativo</option>
                      <option value="other">Otro</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => deleteCost(cost.id)}
                      className="btn-ghost p-2 text-error hover:bg-error/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cost Breakdown Chart */}
          <div className="costs-card card">
            <h3 className="text-lg font-semibold mb-4">Distribución de Costos por Tipo</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={costBreakdownData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {costBreakdownData.map((entry, index) => (
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
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'pricing' && (
        <div className="space-y-8">
          {/* Product Management */}
          <div className="costs-card card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Análisis de Productos</h3>
              <button
                onClick={addProduct}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Agregar Producto
              </button>
            </div>

            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="grid grid-cols-6 gap-4 items-center p-4 bg-surface-light rounded-lg">
                  <div>
                    <label className="text-xs text-text-secondary">Nombre</label>
                    <input
                      type="text"
                      value={product.name}
                      onChange={(e) => updateProduct(product.id, { name: e.target.value })}
                      className="input-sm w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-text-secondary">Precio de Venta</label>
                    <input
                      type="number"
                      value={product.salePrice}
                      onChange={(e) => updateProduct(product.id, { salePrice: Number(e.target.value) })}
                      className="input-sm w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-text-secondary">Costo Variable</label>
                    <input
                      type="number"
                      value={product.variableCostPerUnit}
                      onChange={(e) => updateProduct(product.id, { variableCostPerUnit: Number(e.target.value) })}
                      className="input-sm w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-text-secondary">Volumen Mensual</label>
                    <input
                      type="number"
                      value={product.monthlyVolume}
                      onChange={(e) => updateProduct(product.id, { monthlyVolume: Number(e.target.value) })}
                      className="input-sm w-full"
                    />
                  </div>
                  
                  <div>
                    <EducationalTooltip
                      type="formula"
                      title="Margen de Contribución"
                      content="Dinero que queda de cada venta después de cubrir los costos variables. Este dinero contribuye a pagar los costos fijos y generar utilidad."
                      chapter="Capítulo 7"
                      formula="Margen = Precio de Venta - Costo Variable por Unidad"
                    >
                      <label className="text-xs text-text-secondary">Margen de Contribución</label>
                    </EducationalTooltip>
                    <p className="text-lg font-bold text-primary">${product.contributionMargin}</p>
                    <p className="text-xs text-text-secondary">
                      {((product.contributionMargin / product.salePrice) * 100).toFixed(1)}%
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="btn-ghost p-2 text-error hover:bg-error/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Break-even Analysis */}
          <div className="costs-card card">
            <h3 className="text-lg font-semibold mb-4">Análisis de Punto de Equilibrio</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-surface-light rounded-lg p-4">
                  <h4 className="font-medium mb-3">{product.name}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-text-secondary">Precio:</span>
                      <span className="font-medium">${product.salePrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-text-secondary">Costo Variable:</span>
                      <span className="font-medium">${product.variableCostPerUnit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-text-secondary">Margen:</span>
                      <span className="font-medium text-primary">${product.contributionMargin}</span>
                    </div>
                    <hr className="border-border" />
                    <div className="flex justify-between">
                      <span className="text-sm text-text-secondary">Punto de Equilibrio:</span>
                      <span className="font-bold text-success">{Math.round(product.breakEvenUnits)} unidades</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-text-secondary">Ingresos Equilibrio:</span>
                      <span className="font-bold text-success">${Math.round(product.breakEvenUnits * product.salePrice).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analysis' && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Profitability Analysis */}
          <div className="costs-card card">
            <h3 className="text-lg font-semibold mb-4">Análisis de Rentabilidad por Producto</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productProfitabilityData}>
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
                <Bar dataKey="variableCosts" fill="#EF4444" radius={[4, 4, 0, 0]} name="Costos Variables" />
                <Bar dataKey="contribution" fill="#3ECF8E" radius={[4, 4, 0, 0]} name="Contribución" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Margin Analysis */}
          <div className="costs-card card">
            <h3 className="text-lg font-semibold mb-4">Márgenes por Producto</h3>
            <div className="space-y-4">
              {products.map((product) => {
                const marginPercent = (product.contributionMargin / product.salePrice) * 100
                return (
                  <div key={product.id} className="bg-surface-light rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{product.name}</span>
                      <div className="flex items-center gap-2">
                        {marginPercent >= 50 && <CheckCircle className="w-4 h-4 text-success" />}
                        {marginPercent >= 30 && marginPercent < 50 && <AlertTriangle className="w-4 h-4 text-warning" />}
                        {marginPercent < 30 && <AlertTriangle className="w-4 h-4 text-error" />}
                        <span className={`text-sm font-bold ${
                          marginPercent >= 50 ? 'text-success' :
                          marginPercent >= 30 ? 'text-warning' : 'text-error'
                        }`}>
                          {marginPercent.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 bg-surface rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            marginPercent >= 50 ? 'bg-success' :
                            marginPercent >= 30 ? 'bg-warning' : 'bg-error'
                          }`}
                          style={{ width: `${Math.min(marginPercent, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-text-secondary">
                        ${product.contributionMargin} / ${product.salePrice}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'scenarios' && (
        <div className="space-y-8">
          {/* Pricing Simulator Controls */}
          <div className="costs-card card">
            <h3 className="text-lg font-semibold mb-6">Simulador de Estrategias de Precios</h3>
            
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Producto a Simular</label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="input"
                >
                  {products.map(product => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Precio de Simulación (MXN)</label>
                <input
                  type="number"
                  value={simulationPrice}
                  onChange={(e) => setSimulationPrice(Number(e.target.value))}
                  className="input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Volumen Esperado (unidades)</label>
                <input
                  type="number"
                  value={expectedVolume}
                  onChange={(e) => setExpectedVolume(Number(e.target.value))}
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Pricing Scenarios Chart */}
          <div className="costs-card card">
            <h3 className="text-lg font-semibold mb-4">Escenarios de Precios vs Utilidad</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={pricingScenarios}>
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
                  dataKey="profit" 
                  stroke="#3ECF8E" 
                  strokeWidth={3}
                  name="Utilidad"
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Ingresos"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Scenario Analysis Table */}
          <div className="costs-card card">
            <h3 className="text-lg font-semibold mb-4">Análisis Detallado de Escenarios</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4">Precio</th>
                    <th className="text-left py-3 px-4">Volumen</th>
                    <th className="text-left py-3 px-4">Ingresos</th>
                    <th className="text-left py-3 px-4">Costos</th>
                    <th className="text-left py-3 px-4">Utilidad</th>
                    <th className="text-left py-3 px-4">Margen</th>
                  </tr>
                </thead>
                <tbody>
                  {pricingScenarios.map((scenario, index) => (
                    <tr key={index} className="border-b border-border hover:bg-surface-light">
                      <td className="py-3 px-4 font-medium">${scenario.price}</td>
                      <td className="py-3 px-4">{scenario.volume}</td>
                      <td className="py-3 px-4 text-success">${scenario.revenue.toLocaleString()}</td>
                      <td className="py-3 px-4 text-error">${scenario.costs.toLocaleString()}</td>
                      <td className={`py-3 px-4 font-bold ${scenario.profit >= 0 ? 'text-success' : 'text-error'}`}>
                        ${scenario.profit.toLocaleString()}
                      </td>
                      <td className={`py-3 px-4 font-medium ${scenario.margin >= 20 ? 'text-success' : scenario.margin >= 10 ? 'text-warning' : 'text-error'}`}>
                        {scenario.margin.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Pricing Strategies */}
      <div className="costs-card card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Estrategias Avanzadas de Precios
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="font-semibold text-blue-600 mb-2">🎯 Precios Psicológicos</h4>
              <div className="text-sm text-text-secondary space-y-1">
                <div><strong>$99 vs $100:</strong> El efecto ancla hace que $99 parezca mucho menor</div>
                <div><strong>Paquetes:</strong> Ofrece 3 opciones, la del medio será la más elegida</div>
                <div><strong>Descuentos:</strong> "50% más producto" vs "50% descuento"</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-4">
              <h4 className="font-semibold text-green-600 mb-2">💰 Precios Dinámicos</h4>
              <div className="text-sm text-text-secondary space-y-1">
                <div><strong>Temporada alta:</strong> Aumenta precios cuando hay mayor demanda</div>
                <div><strong>Volumen:</strong> Descuentos por cantidad para grandes pedidos</div>
                <div><strong>Segmentación:</strong> Precios diferentes por tipo de cliente</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-4">
              <h4 className="font-semibold text-purple-600 mb-2">📊 Análisis de Elasticidad</h4>
              <div className="text-sm text-text-secondary space-y-1">
                <div><strong>Productos avanzados:</strong> Menos sensibles al precio</div>
                <div><strong>Commodities:</strong> Muy sensibles, compite por costos</div>
                <div><strong>Test A/B:</strong> Prueba precios diferentes en grupos pequeños</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-lg p-4">
              <h4 className="font-semibold text-orange-600 mb-2">🔄 Modelos de Ingreso</h4>
              <div className="text-sm text-text-secondary space-y-1">
                <div><strong>Suscripción:</strong> Ingresos recurrentes predecibles</div>
                <div><strong>Freemium:</strong> Gratis básico, pago por funciones avanzadas</div>
                <div><strong>Uso:</strong> Pago por consumo o transacción</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Insights and Recommendations */}
      <div className="costs-card card">
        <h3 className="text-lg font-semibold mb-4">Insights y Recomendaciones</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {products.some(p => (p.contributionMargin / p.salePrice) * 100 < 30) && (
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                <div>
                  <h4 className="font-medium text-warning mb-1">Márgenes Bajos</h4>
                  <p className="text-sm text-text-secondary">
                    Algunos productos tienen márgenes menores al 30%. Considera revisar precios o costos.
                  </p>
                </div>
              </div>
            </div>
          )}

          {totalFixedCosts > products.reduce((sum, p) => sum + (p.contributionMargin * p.monthlyVolume), 0) && (
            <div className="bg-error/10 border border-error/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-error mt-0.5" />
                <div>
                  <h4 className="font-medium text-error mb-1">Costos Fijos Altos</h4>
                  <p className="text-sm text-text-secondary">
                    Tus costos fijos superan la contribución total. Necesitas aumentar volumen o precios.
                  </p>
                </div>
              </div>
            </div>
          )}

          {products.some(p => p.breakEvenUnits <= p.monthlyVolume) && (
            <div className="bg-success/10 border border-success/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                <div>
                  <h4 className="font-medium text-success mb-1">Productos Rentables</h4>
                  <p className="text-sm text-text-secondary">
                    Tienes productos que superan su punto de equilibrio. ¡Buen trabajo!
                  </p>
                </div>
              </div>
            </div>
          )}

          {costBreakdownData.find(c => c.name === 'Materiales')?.value && 
           costBreakdownData.find(c => c.name === 'Materiales')!.value > (costBreakdownData.reduce((sum, c) => sum + c.value, 0) * 0.6) && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium text-primary mb-1">Optimización de Materiales</h4>
                  <p className="text-sm text-text-secondary">
                    Los materiales representan más del 60% de tus costos. Busca proveedores alternativos.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Example Scenarios */}
      <div className="costs-card card">
        <ExampleScenarios 
          category="costs-pricing" 
          onApplyScenario={applyExampleScenario}
        />
      </div>

      {/* Contextual Navigation */}
      <ContextualNavigation currentModule="costs-pricing" />
    </div>
  )
}

export default CostsAndPricing