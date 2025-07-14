import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { 
  TrendingUp,
  Target,
  AlertTriangle,
  CheckCircle,
  Info,
  Calculator,
  BarChart3,
  Calendar,
  DollarSign,
  Zap,
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { WisdomPill } from '../../components/ui/TooltipSystem'
import ExampleScenarios from '../../components/ui/ExampleScenarios'
import ContextualNavigation from '../../components/ui/ContextualNavigation'

interface FinancialGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string
  category: 'revenue' | 'savings' | 'investment' | 'expansion' | 'debt'
  priority: 'high' | 'medium' | 'low'
}

interface BudgetItem {
  id: string
  category: string
  planned: number
  actual: number
  variance: number
  type: 'income' | 'expense'
}

interface Scenario {
  id: string
  name: string
  probability: number
  revenueImpact: number
  costImpact: number
  description: string
}

const FinancialPlanning = () => {
  const pageRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<'goals' | 'budget' | 'forecast' | 'scenarios'>('goals')
  const [timeHorizon, setTimeHorizon] = useState<'6months' | '1year' | '3years' | '5years'>('1year')
  
  // Financial Goals
  const [goals, setGoals] = useState<FinancialGoal[]>([
    { id: '1', name: 'Ingresos Anuales', targetAmount: 1500000, currentAmount: 840000, deadline: '2025-12-31', category: 'revenue', priority: 'high' },
    { id: '2', name: 'Fondo de Emergencia', targetAmount: 300000, currentAmount: 150000, deadline: '2025-06-30', category: 'savings', priority: 'high' },
    { id: '3', name: 'Expansión Sucursal', targetAmount: 500000, currentAmount: 75000, deadline: '2026-03-31', category: 'expansion', priority: 'medium' },
    { id: '4', name: 'Equipamiento Nuevo', targetAmount: 200000, currentAmount: 50000, deadline: '2025-09-30', category: 'investment', priority: 'medium' }
  ])

  // Budget Planning
  const [budget, setBudget] = useState<BudgetItem[]>([
    { id: '1', category: 'Ventas Producto A', planned: 180000, actual: 165000, variance: -15000, type: 'income' },
    { id: '2', category: 'Ventas Producto B', planned: 120000, actual: 135000, variance: 15000, type: 'income' },
    { id: '3', category: 'Servicios', planned: 80000, actual: 75000, variance: -5000, type: 'income' },
    { id: '4', category: 'Nómina', planned: 45000, actual: 47000, variance: 2000, type: 'expense' },
    { id: '5', category: 'Marketing', planned: 25000, actual: 28000, variance: 3000, type: 'expense' },
    { id: '6', category: 'Operaciones', planned: 35000, actual: 32000, variance: -3000, type: 'expense' },
    { id: '7', category: 'Tecnología', planned: 15000, actual: 18000, variance: 3000, type: 'expense' }
  ])

  // Forecasting data
  const [forecastYears] = useState(3)
  
  // Scenario Planning
  const [scenarios, setScenarios] = useState<Scenario[]>([
    { id: '1', name: 'Crecimiento Optimista', probability: 25, revenueImpact: 30, costImpact: 15, description: 'Expansión exitosa y mayor demanda' },
    { id: '2', name: 'Escenario Base', probability: 50, revenueImpact: 10, costImpact: 5, description: 'Crecimiento estable y controlado' },
    { id: '3', name: 'Recesión Económica', probability: 20, revenueImpact: -20, costImpact: -5, description: 'Contracción del mercado' },
    { id: '4', name: 'Crisis Sectorial', probability: 5, revenueImpact: -40, costImpact: -15, description: 'Crisis específica del sector' }
  ])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.planning-header',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 }
      )
      gsap.fromTo('.planning-card',
        { scale: 0.95, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, stagger: 0.1, delay: 0.2 }
      )
    })

    return () => ctx.revert()
  }, [])

  // Calculate metrics
  const totalPlannedIncome = budget.filter(b => b.type === 'income').reduce((sum, b) => sum + b.planned, 0)
  const totalActualIncome = budget.filter(b => b.type === 'income').reduce((sum, b) => sum + b.actual, 0)
  const totalPlannedExpenses = budget.filter(b => b.type === 'expense').reduce((sum, b) => sum + b.planned, 0)
  const totalActualExpenses = budget.filter(b => b.type === 'expense').reduce((sum, b) => sum + b.actual, 0)
  
  const budgetVariance = (totalActualIncome - totalActualExpenses) - (totalPlannedIncome - totalPlannedExpenses)
  const budgetAccuracy = 100 - (Math.abs(budgetVariance) / (totalPlannedIncome - totalPlannedExpenses)) * 100

  // Goals completion
  const goalsProgress = goals.map(goal => ({
    ...goal,
    progress: (goal.currentAmount / goal.targetAmount) * 100,
    remaining: goal.targetAmount - goal.currentAmount,
    daysLeft: Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  }))

  // Forecast data
  const forecastData = Array.from({ length: forecastYears * 12 }, (_, i) => {
    const month = new Date(2025, i, 1).toLocaleDateString('es', { month: 'short', year: '2-digit' })
    const baseRevenue = totalActualIncome
    const baseExpenses = totalActualExpenses
    
    // Growth assumptions
    const growthRate = 0.08 / 12 // 8% annual growth
    const monthlyGrowth = 1 + (growthRate * (i + 1))
    
    const conservativeRevenue = baseRevenue * monthlyGrowth * 0.9
    const realisticRevenue = baseRevenue * monthlyGrowth
    const optimisticRevenue = baseRevenue * monthlyGrowth * 1.15
    
    const conservativeExpenses = baseExpenses * monthlyGrowth * 0.95
    const realisticExpenses = baseExpenses * monthlyGrowth * 1.02
    const optimisticExpenses = baseExpenses * monthlyGrowth * 1.05
    
    return {
      month,
      conservativeProfit: conservativeRevenue - conservativeExpenses,
      realisticProfit: realisticRevenue - realisticExpenses,
      optimisticProfit: optimisticRevenue - optimisticExpenses,
      revenue: realisticRevenue,
      expenses: realisticExpenses
    }
  })

  // Scenario impact data
  const scenarioImpacts = scenarios.map(scenario => {
    const impactedRevenue = totalActualIncome * (1 + scenario.revenueImpact / 100)
    const impactedCosts = totalActualExpenses * (1 + scenario.costImpact / 100)
    return {
      name: scenario.name,
      profit: impactedRevenue - impactedCosts,
      probability: scenario.probability,
      impact: ((impactedRevenue - impactedCosts) - (totalActualIncome - totalActualExpenses))
    }
  })

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'revenue': return <TrendingUp className="w-4 h-4" />
      case 'savings': return <DollarSign className="w-4 h-4" />
      case 'investment': return <Zap className="w-4 h-4" />
      case 'expansion': return <Target className="w-4 h-4" />
      case 'debt': return <Calculator className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'revenue': return 'text-success bg-success/10'
      case 'savings': return 'text-primary bg-primary/10'
      case 'investment': return 'text-warning bg-warning/10'
      case 'expansion': return 'text-purple-500 bg-purple-500/10'
      case 'debt': return 'text-error bg-error/10'
      default: return 'text-text-secondary bg-surface-light'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-error bg-error/10'
      case 'medium': return 'text-warning bg-warning/10'
      case 'low': return 'text-success bg-success/10'
      default: return 'text-text-secondary bg-surface-light'
    }
  }

  const addGoal = () => {
    const newGoal: FinancialGoal = {
      id: Date.now().toString(),
      name: 'Nueva Meta',
      targetAmount: 0,
      currentAmount: 0,
      deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      category: 'revenue',
      priority: 'medium'
    }
    setGoals([...goals, newGoal])
  }

  const updateGoal = (id: string, updates: Partial<FinancialGoal>) => {
    setGoals(goals.map(goal => goal.id === id ? { ...goal, ...updates } : goal))
  }

  const deleteGoal = (id: string) => {
    setGoals(goals.filter(goal => goal.id !== id))
  }

  const addBudgetItem = () => {
    const newItem: BudgetItem = {
      id: Date.now().toString(),
      category: 'Nueva Categoría',
      planned: 0,
      actual: 0,
      variance: 0,
      type: 'income'
    }
    setBudget([...budget, newItem])
  }

  const updateBudgetItem = (id: string, updates: Partial<BudgetItem>) => {
    setBudget(budget.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, ...updates }
        updatedItem.variance = updatedItem.actual - updatedItem.planned
        return updatedItem
      }
      return item
    }))
  }

  // Apply example scenario from the book
  const applyExampleScenario = (exampleData: any) => {
    if (exampleData.currentRevenue) {
      setBudget([
        { id: '1', category: 'Ingresos Actuales', planned: exampleData.currentRevenue, actual: exampleData.currentRevenue, variance: 0, type: 'income' },
        { id: '2', category: 'Costos de Expansión', planned: exampleData.expansionCost, actual: 0, variance: -exampleData.expansionCost, type: 'expense' }
      ])
    }
    
    if (exampleData.scenarios) {
      setScenarios(exampleData.scenarios.map((scenario: any, index: number) => ({
        id: String(index + 1),
        name: scenario.name,
        probability: scenario.probability,
        revenue: exampleData.currentRevenue * (1 + scenario.revenueGrowth / 100),
        expenses: exampleData.currentRevenue * (scenario.costIncrease / 100),
        profit: 0
      })))
    }
  }

  return (
    <div ref={pageRef} className="space-y-8">
      {/* Header */}
      <div className="planning-header">
        <h1 className="text-3xl font-bold mb-2">Planificación Financiera</h1>
        <p className="text-text-secondary mb-6">
          Planifica el futuro financiero de tu empresa con metas, presupuestos y escenarios.
          Basado en los Capítulos 13-15 de "Finanzas para Emprendedores".
        </p>

        {/* Wisdom Pill */}
        <WisdomPill 
          title="Planificación es Supervivencia"
          content="Los negocios que planifican tienen 3x más probabilidades de éxito. Un plan malo es mejor que no tener plan."
          chapter="Capítulo 13"
          variant="info"
        />
        
        {/* Educational info */}
        <div className="glass rounded-lg p-4 border border-primary/20 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold text-primary mb-1">Planificación Estratégica</h3>
              <p className="text-sm text-text-secondary">
                <strong>Metas SMART:</strong> Específicas, Medibles, Alcanzables, Relevantes y con Tiempo definido.
                <strong>Presupuesto:</strong> Planificación vs realidad para control financiero.
                <strong>Escenarios:</strong> Preparación para diferentes situaciones futuras.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-surface-light rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab('goals')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'goals' ? 'bg-primary text-background' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Target className="w-4 h-4 inline mr-2" />
            Metas Financieras
          </button>
          <button
            onClick={() => setActiveTab('budget')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'budget' ? 'bg-primary text-background' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Calculator className="w-4 h-4 inline mr-2" />
            Presupuesto
          </button>
          <button
            onClick={() => setActiveTab('forecast')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'forecast' ? 'bg-primary text-background' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Proyecciones
          </button>
          <button
            onClick={() => setActiveTab('scenarios')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'scenarios' ? 'bg-primary text-background' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Eye className="w-4 h-4 inline mr-2" />
            Escenarios
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="planning-card grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Goals Completion */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-success/10 rounded-lg">
              <Target className="w-6 h-6 text-success" />
            </div>
            <span className="text-xs text-success bg-success/10 px-2 py-1 rounded-full">
              {goalsProgress.filter(g => g.progress >= 100).length}/{goals.length}
            </span>
          </div>
          <h3 className="text-sm text-text-secondary mb-1">Metas Completadas</h3>
          <p className="text-2xl font-bold text-success">
            {((goalsProgress.filter(g => g.progress >= 100).length / goals.length) * 100).toFixed(0)}%
          </p>
        </div>

        {/* Budget Accuracy */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${budgetAccuracy >= 90 ? 'text-success bg-success/10' : budgetAccuracy >= 80 ? 'text-warning bg-warning/10' : 'text-error bg-error/10'}`}>
              Precisión
            </span>
          </div>
          <h3 className="text-sm text-text-secondary mb-1">Precisión Presupuestal</h3>
          <p className={`text-2xl font-bold ${budgetAccuracy >= 90 ? 'text-success' : budgetAccuracy >= 80 ? 'text-warning' : 'text-error'}`}>
            {budgetAccuracy.toFixed(1)}%
          </p>
        </div>

        {/* Budget Variance */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${budgetVariance >= 0 ? 'bg-success/10' : 'bg-error/10'}`}>
              <DollarSign className={`w-6 h-6 ${budgetVariance >= 0 ? 'text-success' : 'text-error'}`} />
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${budgetVariance >= 0 ? 'text-success bg-success/10' : 'text-error bg-error/10'}`}>
              {budgetVariance >= 0 ? 'Favorable' : 'Desfavorable'}
            </span>
          </div>
          <h3 className="text-sm text-text-secondary mb-1">Variación Presupuestal</h3>
          <p className={`text-2xl font-bold ${budgetVariance >= 0 ? 'text-success' : 'text-error'}`}>
            ${Math.abs(budgetVariance).toLocaleString()}
          </p>
        </div>

        {/* Planning Horizon */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-warning/10 rounded-lg">
              <Calendar className="w-6 h-6 text-warning" />
            </div>
            <select
              value={timeHorizon}
              onChange={(e) => setTimeHorizon(e.target.value as any)}
              className="text-xs bg-warning/10 text-warning border-none rounded-full px-2 py-1"
            >
              <option value="6months">6 meses</option>
              <option value="1year">1 año</option>
              <option value="3years">3 años</option>
              <option value="5years">5 años</option>
            </select>
          </div>
          <h3 className="text-sm text-text-secondary mb-1">Horizonte de Planeación</h3>
          <p className="text-2xl font-bold text-warning">
            {timeHorizon === '6months' ? '6M' : timeHorizon === '1year' ? '1A' : timeHorizon === '3years' ? '3A' : '5A'}
          </p>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'goals' && (
        <div className="space-y-8">
          {/* Goals Management */}
          <div className="planning-card card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Metas Financieras</h3>
              <button
                onClick={addGoal}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nueva Meta
              </button>
            </div>

            <div className="space-y-4">
              {goalsProgress.map((goal) => (
                <div key={goal.id} className="bg-surface-light rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getCategoryColor(goal.category)}`}>
                        {getCategoryIcon(goal.category)}
                      </div>
                      <div>
                        <input
                          type="text"
                          value={goal.name}
                          onChange={(e) => updateGoal(goal.id, { name: e.target.value })}
                          className="font-semibold text-lg bg-transparent border-none p-0"
                        />
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(goal.category)}`}>
                            {goal.category}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(goal.priority)}`}>
                            {goal.priority === 'high' ? 'Alta' : goal.priority === 'medium' ? 'Media' : 'Baja'}
                          </span>
                          {goal.daysLeft > 0 && (
                            <span className="text-xs text-text-secondary">
                              {goal.daysLeft} días restantes
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="btn-ghost p-2 text-error hover:bg-error/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="text-xs text-text-secondary">Meta (MXN)</label>
                      <input
                        type="number"
                        value={goal.targetAmount}
                        onChange={(e) => updateGoal(goal.id, { targetAmount: Number(e.target.value) })}
                        className="input-sm w-full"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-text-secondary">Actual (MXN)</label>
                      <input
                        type="number"
                        value={goal.currentAmount}
                        onChange={(e) => updateGoal(goal.id, { currentAmount: Number(e.target.value) })}
                        className="input-sm w-full"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-text-secondary">Fecha Límite</label>
                      <input
                        type="date"
                        value={goal.deadline}
                        onChange={(e) => updateGoal(goal.id, { deadline: e.target.value })}
                        className="input-sm w-full"
                      />
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progreso: {goal.progress.toFixed(1)}%</span>
                      <span className="text-text-secondary">
                        Faltan: ${goal.remaining.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-surface rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ${
                          goal.progress >= 100 ? 'bg-success' :
                          goal.progress >= 75 ? 'bg-primary' :
                          goal.progress >= 50 ? 'bg-warning' : 'bg-error'
                        }`}
                        style={{ width: `${Math.min(goal.progress, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Goals Overview Chart */}
          <div className="planning-card card">
            <h3 className="text-lg font-semibold mb-4">Progreso de Metas</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={goalsProgress.map(goal => ({
                name: goal.name.substring(0, 15),
                progress: goal.progress,
                target: 100
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3F3F46" />
                <XAxis dataKey="name" stroke="#A1A1AA" />
                <YAxis stroke="#A1A1AA" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#181818', 
                    border: '1px solid #3F3F46',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                />
                <Bar dataKey="target" fill="#4B5563" radius={[4, 4, 0, 0]} name="Meta" />
                <Bar dataKey="progress" fill="#3ECF8E" radius={[4, 4, 0, 0]} name="Progreso %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'budget' && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Budget Management */}
          <div className="planning-card card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Control Presupuestal</h3>
              <button
                onClick={addBudgetItem}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Agregar
              </button>
            </div>

            <div className="space-y-3">
              {budget.map((item) => (
                <div key={item.id} className="grid grid-cols-5 gap-3 items-center p-3 bg-surface-light rounded-lg">
                  <div>
                    <input
                      type="text"
                      value={item.category}
                      onChange={(e) => updateBudgetItem(item.id, { category: e.target.value })}
                      className="font-medium bg-transparent border-none p-0 w-full"
                    />
                    <span className={`text-xs px-2 py-1 rounded-full ${item.type === 'income' ? 'text-success bg-success/10' : 'text-error bg-error/10'}`}>
                      {item.type === 'income' ? 'Ingreso' : 'Gasto'}
                    </span>
                  </div>
                  
                  <div>
                    <label className="text-xs text-text-secondary">Planeado</label>
                    <input
                      type="number"
                      value={item.planned}
                      onChange={(e) => updateBudgetItem(item.id, { planned: Number(e.target.value) })}
                      className="input-sm w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-text-secondary">Real</label>
                    <input
                      type="number"
                      value={item.actual}
                      onChange={(e) => updateBudgetItem(item.id, { actual: Number(e.target.value) })}
                      className="input-sm w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-text-secondary">Variación</label>
                    <p className={`text-sm font-semibold ${item.variance >= 0 ? 'text-success' : 'text-error'}`}>
                      {item.variance >= 0 ? '+' : ''}${item.variance.toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <button className="btn-ghost p-2">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Budget Summary Chart */}
          <div className="planning-card card">
            <h3 className="text-lg font-semibold mb-4">Resumen Presupuestal</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: 'Ingresos', planned: totalPlannedIncome, actual: totalActualIncome },
                { name: 'Gastos', planned: totalPlannedExpenses, actual: totalActualExpenses },
                { name: 'Utilidad', planned: totalPlannedIncome - totalPlannedExpenses, actual: totalActualIncome - totalActualExpenses }
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
                <Bar dataKey="planned" fill="#71717A" radius={[4, 4, 0, 0]} name="Planeado" />
                <Bar dataKey="actual" fill="#3ECF8E" radius={[4, 4, 0, 0]} name="Real" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'forecast' && (
        <div className="space-y-8">
          {/* Forecast Chart */}
          <div className="planning-card card">
            <h3 className="text-lg font-semibold mb-4">Proyecciones Financieras ({forecastYears} años)</h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={forecastData}>
                <defs>
                  <linearGradient id="colorOptimistic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRealistic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3ECF8E" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3ECF8E" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorConservative" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
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
                  dataKey="optimisticProfit" 
                  stroke="#10B981" 
                  fill="url(#colorOptimistic)" 
                  name="Optimista"
                />
                <Area 
                  type="monotone" 
                  dataKey="realisticProfit" 
                  stroke="#3ECF8E" 
                  fill="url(#colorRealistic)" 
                  name="Realista"
                />
                <Area 
                  type="monotone" 
                  dataKey="conservativeProfit" 
                  stroke="#F59E0B" 
                  fill="url(#colorConservative)" 
                  name="Conservador"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Forecast Assumptions */}
          <div className="planning-card card">
            <h3 className="text-lg font-semibold mb-4">Supuestos de Proyección</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                <h4 className="font-medium text-success mb-2">Escenario Optimista</h4>
                <ul className="text-sm text-text-secondary space-y-1">
                  <li>• Crecimiento ingresos: +15% anual</li>
                  <li>• Crecimiento costos: +5% anual</li>
                  <li>• Expansión exitosa</li>
                  <li>• Nuevos productos/servicios</li>
                </ul>
              </div>
              
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <h4 className="font-medium text-primary mb-2">Escenario Realista</h4>
                <ul className="text-sm text-text-secondary space-y-1">
                  <li>• Crecimiento ingresos: +8% anual</li>
                  <li>• Crecimiento costos: +2% anual</li>
                  <li>• Crecimiento estable</li>
                  <li>• Mejoras graduales</li>
                </ul>
              </div>
              
              <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                <h4 className="font-medium text-warning mb-2">Escenario Conservador</h4>
                <ul className="text-sm text-text-secondary space-y-1">
                  <li>• Crecimiento ingresos: -10% anual</li>
                  <li>• Reducción costos: -5% anual</li>
                  <li>• Mercado desafiante</li>
                  <li>• Enfoque en eficiencia</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'scenarios' && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Scenario Planning */}
          <div className="planning-card card">
            <h3 className="text-lg font-semibold mb-6">Análisis de Escenarios</h3>
            
            <div className="space-y-4">
              {scenarios.map((scenario) => (
                <div key={scenario.id} className="bg-surface-light rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{scenario.name}</h4>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {scenario.probability}% probabilidad
                    </span>
                  </div>
                  
                  <p className="text-sm text-text-secondary mb-3">{scenario.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-text-secondary">Impacto Ingresos</p>
                      <p className={`font-semibold ${scenario.revenueImpact >= 0 ? 'text-success' : 'text-error'}`}>
                        {scenario.revenueImpact >= 0 ? '+' : ''}{scenario.revenueImpact}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary">Impacto Costos</p>
                      <p className={`font-semibold ${scenario.costImpact <= 0 ? 'text-success' : 'text-error'}`}>
                        {scenario.costImpact >= 0 ? '+' : ''}{scenario.costImpact}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scenario Impact Chart */}
          <div className="planning-card card">
            <h3 className="text-lg font-semibold mb-4">Impacto por Escenario</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scenarioImpacts}>
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
                <Bar 
                  dataKey="impact" 
                  fill="#3ECF8E" 
                  radius={[4, 4, 0, 0]} 
                  name="Impacto en Utilidad"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Insights and Recommendations */}
      <div className="planning-card card">
        <h3 className="text-lg font-semibold mb-4">Insights y Recomendaciones</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {goalsProgress.filter(g => g.daysLeft < 90 && g.progress < 80).length > 0 && (
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                <div>
                  <h4 className="font-medium text-warning mb-1">Metas en Riesgo</h4>
                  <p className="text-sm text-text-secondary">
                    {goalsProgress.filter(g => g.daysLeft < 90 && g.progress < 80).length} metas tienen menos de 90 días y bajo progreso.
                  </p>
                </div>
              </div>
            </div>
          )}

          {budgetAccuracy < 85 && (
            <div className="bg-error/10 border border-error/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-error mt-0.5" />
                <div>
                  <h4 className="font-medium text-error mb-1">Baja Precisión Presupuestal</h4>
                  <p className="text-sm text-text-secondary">
                    Tu precisión presupuestal es {budgetAccuracy.toFixed(1)}%. Revisa tus estimaciones.
                  </p>
                </div>
              </div>
            </div>
          )}

          {goalsProgress.filter(g => g.progress >= 100).length > 0 && (
            <div className="bg-success/10 border border-success/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                <div>
                  <h4 className="font-medium text-success mb-1">Metas Completadas</h4>
                  <p className="text-sm text-text-secondary">
                    ¡Felicidades! Has completado {goalsProgress.filter(g => g.progress >= 100).length} metas financieras.
                  </p>
                </div>
              </div>
            </div>
          )}

          {budgetVariance > 0 && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium text-primary mb-1">Superávit Presupuestal</h4>
                  <p className="text-sm text-text-secondary">
                    Tienes ${budgetVariance.toLocaleString()} por encima del presupuesto. Considera reinvertir.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Example Scenarios */}
      <div className="planning-card card">
        <ExampleScenarios 
          category="planning" 
          onApplyScenario={applyExampleScenario}
        />
      </div>

      {/* Contextual Navigation */}
      <ContextualNavigation currentModule="planning" />
    </div>
  )
}

export default FinancialPlanning