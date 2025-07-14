import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download
} from 'lucide-react'
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import LearningProgress from '../../components/ui/LearningProgress'
import { useNavigate } from 'react-router-dom'
import { useFinancialData } from '../../contexts/FinancialContext'

const Overview = () => {
  const statsRef = useRef<HTMLDivElement>(null)
  const chartsRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | '90d'>('30d')
  const [isExporting, setIsExporting] = useState(false)
  
  // Get centralized financial data
  const { company, products, fixedCosts, metrics } = useFinancialData()

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate stats cards
      gsap.fromTo('.stat-card',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 }
      )

      // Animate charts
      gsap.fromTo('.chart-card',
        { scale: 0.95, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, stagger: 0.15, delay: 0.3 }
      )
    })

    return () => ctx.revert()
  }, [])

  // Generate realistic historical data based on current metrics
  const generateHistoricalData = () => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun']
    return months.map((month, index) => {
      // Simulate growth over time (90% to 100% of current numbers)
      const growthFactor = 0.85 + (index * 0.025)
      return {
        month,
        revenue: Math.round(metrics.monthlyRevenue * growthFactor),
        expenses: Math.round((metrics.monthlyFixedCosts + metrics.monthlyVariableCosts) * growthFactor),
      }
    })
  }

  const revenueData = generateHistoricalData()

  // Generate cash flow data based on real business patterns
  const generateCashFlowData = () => {
    const days = [1, 5, 10, 15, 20, 25, 30]
    return days.map(day => {
      // More realistic cash flow patterns (front-loaded for SaaS)
      const dailyRevenue = metrics.monthlyRevenue / 30
      const dailyExpenses = (metrics.monthlyFixedCosts + metrics.monthlyVariableCosts) / 30
      
      // SaaS typically gets more revenue early in month
      const revenueMultiplier = day <= 15 ? 1.2 : 0.8
      
      return {
        day: day.toString(),
        inflow: Math.round(dailyRevenue * revenueMultiplier),
        outflow: Math.round(dailyExpenses)
      }
    })
  }

  const cashFlowData = generateCashFlowData()

  // Generate expense breakdown based on real fixed costs
  const generateExpenseBreakdown = () => {
    const totalExpenses = metrics.monthlyFixedCosts + metrics.monthlyVariableCosts
    const categories = {
      'Personal': fixedCosts.filter(c => c.category === 'Personal').reduce((sum, c) => sum + c.amount, 0),
      'Marketing': fixedCosts.filter(c => c.category === 'Marketing').reduce((sum, c) => sum + c.amount, 0),
      'Operaciones': fixedCosts.filter(c => c.category === 'Operaciones').reduce((sum, c) => sum + c.amount, 0),
      'Tecnología': fixedCosts.filter(c => c.category === 'Tecnología').reduce((sum, c) => sum + c.amount, 0),
      'Variables': metrics.monthlyVariableCosts
    }

    const colors = ['#3ECF8E', '#F59E0B', '#8B5CF6', '#3B82F6', '#EF4444']
    
    return Object.entries(categories).map(([name, value], index) => ({
      name,
      value: Math.round((value / totalExpenses) * 100),
      color: colors[index] || '#71717A'
    })).filter(item => item.value > 0)
  }

  const expensesData = generateExpenseBreakdown()

  // Functions
  const handleTimeFilter = (filter: '7d' | '30d' | '90d') => {
    setTimeFilter(filter)
    // Here you would typically fetch new data based on the filter
    console.log(`Filtering data for: ${filter}`)
  }

  const handleExportReport = async () => {
    setIsExporting(true)
    try {
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('Exporting dashboard report...')
      // Here you would call the actual export API
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleGenerateMonthlyReport = () => {
    navigate('/app/reports')
  }

  const handleOptimizeExpenses = () => {
    navigate('/app/ai-agents')
  }

  const handleProjectNextMonth = () => {
    navigate('/app/planning')
  }

  const getFilteredStats = () => {
    // Calculate values based on timeFilter and real data
    const periodMultiplier = timeFilter === '7d' ? 0.25 : timeFilter === '30d' ? 1 : 3
    const previousPeriodRevenue = metrics.monthlyRevenue * 0.92 // Assuming 8% growth
    const previousPeriodExpenses = (metrics.monthlyFixedCosts + metrics.monthlyVariableCosts) * 0.95
    const previousPeriodProfit = previousPeriodRevenue - previousPeriodExpenses
    
    const currentRevenue = metrics.monthlyRevenue * periodMultiplier
    const currentExpenses = (metrics.monthlyFixedCosts + metrics.monthlyVariableCosts) * periodMultiplier
    const currentProfit = metrics.monthlyNetProfit * periodMultiplier
    
    const revenueChange = previousPeriodRevenue > 0 ? ((currentRevenue - (previousPeriodRevenue * periodMultiplier)) / (previousPeriodRevenue * periodMultiplier)) * 100 : 0
    const expenseChange = previousPeriodExpenses > 0 ? ((currentExpenses - (previousPeriodExpenses * periodMultiplier)) / (previousPeriodExpenses * periodMultiplier)) * 100 : 0
    const profitChange = previousPeriodProfit !== 0 ? ((currentProfit - (previousPeriodProfit * periodMultiplier)) / Math.abs(previousPeriodProfit * periodMultiplier)) * 100 : 0

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 0
      }).format(Math.abs(amount))
    }

    const cashFlowStatus = metrics.monthlyNetProfit > 0 ? 'Positivo' : 'Crítico'
    const healthColor = metrics.monthlyNetProfit > 0 ? 'text-success' : 'text-error'
    const healthBg = metrics.monthlyNetProfit > 0 ? 'bg-success/10' : 'bg-error/10'

    return [
      {
        title: 'Ingresos del Período',
        value: formatCurrency(currentRevenue),
        change: `${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(1)}%`,
        trend: revenueChange >= 0 ? 'up' : 'down',
        icon: DollarSign,
        color: 'text-primary',
        bgColor: 'bg-primary/10'
      },
      {
        title: 'Gastos del Período',
        value: formatCurrency(currentExpenses),
        change: `${expenseChange >= 0 ? '+' : ''}${expenseChange.toFixed(1)}%`,
        trend: expenseChange <= 0 ? 'up' : 'down', // Lower expenses is good
        icon: ShoppingCart,
        color: 'text-warning',
        bgColor: 'bg-warning/10'
      },
      {
        title: 'Utilidad Neta',
        value: currentProfit >= 0 ? formatCurrency(currentProfit) : `-${formatCurrency(currentProfit)}`,
        change: `${profitChange >= 0 ? '+' : ''}${profitChange.toFixed(1)}%`,
        trend: currentProfit >= 0 ? 'up' : 'down',
        icon: TrendingUp,
        color: currentProfit >= 0 ? 'text-success' : 'text-error',
        bgColor: currentProfit >= 0 ? 'bg-success/10' : 'bg-error/10'
      },
      {
        title: 'Flujo de Caja',
        value: cashFlowStatus,
        change: formatCurrency(metrics.operatingCashFlow * periodMultiplier),
        trend: metrics.operatingCashFlow >= 0 ? 'up' : 'down',
        icon: Activity,
        color: healthColor,
        bgColor: healthBg
      },
    ]
  }

  const stats = getFilteredStats()

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard - {company.name}</h1>
            <p className="text-text-secondary">
              {company.industry} • {company.employees} empleados • Resumen al {new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-text-secondary" />
              <select 
                value={timeFilter}
                onChange={(e) => handleTimeFilter(e.target.value as '7d' | '30d' | '90d')}
                className="bg-surface border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="7d">Últimos 7 días</option>
                <option value="30d">Último mes</option>
                <option value="90d">Últimos 3 meses</option>
              </select>
            </div>
            <button 
              onClick={handleExportReport}
              disabled={isExporting}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Exportando...' : 'Exportar reporte'}
            </button>
          </div>
        </div>
      </div>

      {/* Learning Progress */}
      <div className="mb-8">
        <LearningProgress 
          currentModule="dashboard"
          onNavigate={(route) => {
            if (route.startsWith('/app/')) {
              navigate(route)
            } else {
              window.location.href = route
            }
          }}
        />
      </div>

      {/* Stats Grid */}
      <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card card hover-lift">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className={`flex items-center text-sm ${stat.trend === 'up' ? 'text-success' : 'text-error'}`}>
                {stat.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {stat.change}
              </div>
            </div>
            <p className="text-sm text-text-secondary mb-1">{stat.title}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div ref={chartsRef} className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Revenue vs Expenses Chart */}
        <div className="chart-card card col-span-1 lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Ingresos vs Gastos</h3>
            <p className="text-sm text-text-secondary mt-1">
              Comparación mensual de ingresos (verde) y gastos (naranja) para analizar la rentabilidad
            </p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3ECF8E" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3ECF8E" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
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
                dataKey="revenue" 
                stroke="#3ECF8E" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
              />
              <Area 
                type="monotone" 
                dataKey="expenses" 
                stroke="#F59E0B" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorExpenses)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Expenses Distribution */}
        <div className="chart-card card">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Distribución de Gastos</h3>
            <p className="text-sm text-text-secondary mt-1">
              Porcentaje de gastos por categoría para identificar las áreas de mayor inversión
            </p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expensesData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {expensesData.map((entry, index) => (
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
          <div className="mt-4 space-y-2">
            {expensesData.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: item.color }} />
                  <span className="text-text-secondary">{item.name}</span>
                </div>
                <span className="font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cash Flow Chart */}
        <div className="chart-card card col-span-1 lg:col-span-3">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Flujo de Caja del Mes</h3>
            <p className="text-sm text-text-secondary mt-1">
              Entradas (verde) y salidas (rojo) diarias de efectivo para monitorear la liquidez
            </p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
              <XAxis dataKey="day" stroke="#71717A" />
              <YAxis stroke="#71717A" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#181818', 
                  border: '1px solid #27272A',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="inflow" fill="#3ECF8E" radius={[4, 4, 0, 0]} />
              <Bar dataKey="outflow" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-6">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            onClick={handleGenerateMonthlyReport}
            className="tool-card-enhanced cursor-pointer"
          >
            <span className="tool-badge-enhanced">
              Reportes
            </span>
            
            <div className="tool-icon-enhanced">
              📊
            </div>
            
            <h4 className="tool-title-enhanced">Generar Reporte Mensual</h4>
            <p className="tool-description-enhanced">Crea un informe completo de este mes con todos los datos financieros</p>
            
            <div className="tool-cta-enhanced">
              Crear reporte
              <span className="tool-cta-arrow">→</span>
            </div>
          </div>

          <div 
            onClick={handleOptimizeExpenses}
            className="tool-card-enhanced cursor-pointer"
          >
            <span className="tool-badge-enhanced">
              IA
            </span>
            
            <div className="tool-icon-enhanced">
              💡
            </div>
            
            <h4 className="tool-title-enhanced">Optimizar Gastos</h4>
            <p className="tool-description-enhanced">Recibe sugerencias de la IA para reducir costos y mejorar eficiencia</p>
            
            <div className="tool-cta-enhanced">
              Ver sugerencias
              <span className="tool-cta-arrow">→</span>
            </div>
          </div>

          <div 
            onClick={handleProjectNextMonth}
            className="tool-card-enhanced cursor-pointer"
          >
            <span className="tool-badge-enhanced">
              Proyección
            </span>
            
            <div className="tool-icon-enhanced">
              📈
            </div>
            
            <h4 className="tool-title-enhanced">Proyectar Próximo Mes</h4>
            <p className="tool-description-enhanced">Simula escenarios futuros y planifica tu crecimiento</p>
            
            <div className="tool-cta-enhanced">
              Crear proyección
              <span className="tool-cta-arrow">→</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Overview