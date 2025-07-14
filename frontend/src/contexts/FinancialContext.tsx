import React, { createContext, useContext, useState, useEffect } from 'react'

// Tipos de datos financieros centralizados
export interface Product {
  id: string
  name: string
  price: number
  variableCost: number
  monthlySales: number
  category: string
}

export interface FixedCost {
  id: string
  name: string
  amount: number
  category: string
  recurring: 'monthly' | 'annual'
}

export interface CashFlowEntry {
  id: string
  date: string
  type: 'income' | 'expense'
  amount: number
  description: string
  category: string
  recurring: boolean
}

export interface CompanyProfile {
  name: string
  industry: string
  foundedDate: string
  employees: number
  businessModel: 'saas' | 'product' | 'service' | 'marketplace'
  stage: 'startup' | 'growth' | 'mature'
}

// Métricas calculadas automáticamente
export interface CalculatedMetrics {
  // Ingresos y gastos
  monthlyRevenue: number
  monthlyVariableCosts: number
  monthlyFixedCosts: number
  monthlyNetProfit: number
  
  // Unit Economics
  averageSellingPrice: number
  averageVariableCost: number
  contributionMargin: number
  contributionMarginPercent: number
  
  // Break-even
  breakEvenUnits: number
  breakEvenRevenue: number
  currentMarginOfSafety: number
  
  // Cash Flow
  operatingCashFlow: number
  runwayMonths: number
  burnRate: number
  
  // Health metrics
  grossMargin: number
  netMargin: number
  liquidityRatio: number
  healthScore: number
  
  // Growth metrics
  totalCustomers: number
  customerAcquisitionCost: number
  monthlyMarketingCosts: number
  monthlyNewCustomers: number
  averagePurchaseFrequency: number
  averageCustomerLifetime: number
}

interface FinancialContextType {
  // Data
  company: CompanyProfile
  products: Product[]
  fixedCosts: FixedCost[]
  cashFlow: CashFlowEntry[]
  metrics: CalculatedMetrics
  
  // Actions
  updateCompany: (updates: Partial<CompanyProfile>) => void
  updateProduct: (id: string, updates: Partial<Product>) => void
  addProduct: (product: Omit<Product, 'id'>) => void
  removeProduct: (id: string) => void
  updateFixedCost: (id: string, updates: Partial<FixedCost>) => void
  addFixedCost: (cost: Omit<FixedCost, 'id'>) => void
  removeFixedCost: (id: string) => void
  addCashFlowEntry: (entry: Omit<CashFlowEntry, 'id'>) => void
  updateCashFlowEntry: (id: string, updates: Partial<CashFlowEntry>) => void
  removeCashFlowEntry: (id: string) => void
  setCashFlowEntries: (entries: CashFlowEntry[]) => void
  
  // Utility functions
  recalculateMetrics: () => void
  exportFinancialData: () => any
  importFinancialData: (data: any) => void
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined)

// Datos iniciales realistas para "TechFlow Solutions"
const initialCompany: CompanyProfile = {
  name: "TechFlow Solutions",
  industry: "Software as a Service (SaaS)",
  foundedDate: "2022-01-15",
  employees: 12,
  businessModel: "saas",
  stage: "growth"
}

const initialProducts: Product[] = [
  {
    id: "1",
    name: "TechFlow Pro (Licencia Mensual)",
    price: 199,
    variableCost: 35,
    monthlySales: 450,
    category: "Software"
  },
  {
    id: "2", 
    name: "TechFlow Enterprise",
    price: 499,
    variableCost: 75,
    monthlySales: 85,
    category: "Software"
  },
  {
    id: "3",
    name: "Servicios de Implementación",
    price: 2500,
    variableCost: 800,
    monthlySales: 8,
    category: "Servicios"
  }
]

const initialFixedCosts: FixedCost[] = [
  { id: "1", name: "Renta de Oficina", amount: 15000, category: "Operaciones", recurring: "monthly" },
  { id: "2", name: "Salarios y Prestaciones", amount: 285000, category: "Personal", recurring: "monthly" },
  { id: "3", name: "Servicios (Internet, Teléfono, Utilities)", amount: 8500, category: "Operaciones", recurring: "monthly" },
  { id: "4", name: "Software y Herramientas", amount: 12000, category: "Tecnología", recurring: "monthly" },
  { id: "5", name: "Marketing Digital", amount: 25000, category: "Marketing", recurring: "monthly" },
  { id: "6", name: "Seguros y Legal", amount: 6500, category: "Administración", recurring: "monthly" },
  { id: "7", name: "Hosting y Cloud Services", amount: 8000, category: "Tecnología", recurring: "monthly" }
]

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [company, setCompany] = useState<CompanyProfile>(initialCompany)
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>(initialFixedCosts)
  const [cashFlow, setCashFlow] = useState<CashFlowEntry[]>([])
  const [metrics, setMetrics] = useState<CalculatedMetrics>({} as CalculatedMetrics)

  // Función para calcular todas las métricas automáticamente
  const calculateMetrics = (): CalculatedMetrics => {
    // Cálculos de ingresos y costos
    const monthlyRevenue = products.reduce((sum, p) => sum + (p.price * p.monthlySales), 0)
    const monthlyVariableCosts = products.reduce((sum, p) => sum + (p.variableCost * p.monthlySales), 0)
    const monthlyFixedCosts = fixedCosts.reduce((sum, c) => 
      sum + (c.recurring === 'monthly' ? c.amount : c.amount / 12), 0)
    const monthlyNetProfit = monthlyRevenue - monthlyVariableCosts - monthlyFixedCosts
    
    // Unit Economics
    const totalUnits = products.reduce((sum, p) => sum + p.monthlySales, 0)
    const averageSellingPrice = totalUnits > 0 ? monthlyRevenue / totalUnits : 0
    const averageVariableCost = totalUnits > 0 ? monthlyVariableCosts / totalUnits : 0
    const contributionMargin = averageSellingPrice - averageVariableCost
    const contributionMarginPercent = averageSellingPrice > 0 ? (contributionMargin / averageSellingPrice) * 100 : 0
    
    // Break-even
    const breakEvenUnits = contributionMargin > 0 ? Math.ceil(monthlyFixedCosts / contributionMargin) : 0
    const breakEvenRevenue = breakEvenUnits * averageSellingPrice
    const currentMarginOfSafety = totalUnits > breakEvenUnits ? 
      ((totalUnits - breakEvenUnits) / totalUnits) * 100 : 0
    
    // Cash Flow básico
    const operatingCashFlow = monthlyNetProfit // Simplificado
    const burnRate = monthlyFixedCosts + monthlyVariableCosts
    const runwayMonths = monthlyNetProfit > 0 ? Infinity : (100000 / Math.abs(monthlyNetProfit)) // Asumiendo $100k en banco
    
    // Health metrics
    const grossMargin = monthlyRevenue > 0 ? ((monthlyRevenue - monthlyVariableCosts) / monthlyRevenue) * 100 : 0
    const netMargin = monthlyRevenue > 0 ? (monthlyNetProfit / monthlyRevenue) * 100 : 0
    const liquidityRatio = monthlyFixedCosts > 0 ? (operatingCashFlow / monthlyFixedCosts) : 0
    
    // Health Score (0-100)
    let healthScore = 0
    if (netMargin >= 15) healthScore += 25
    else if (netMargin >= 5) healthScore += 15
    else if (netMargin >= 0) healthScore += 5
    
    if (grossMargin >= 70) healthScore += 25
    else if (grossMargin >= 50) healthScore += 15
    else if (grossMargin >= 30) healthScore += 10
    
    if (currentMarginOfSafety >= 30) healthScore += 25
    else if (currentMarginOfSafety >= 15) healthScore += 15
    else if (currentMarginOfSafety >= 5) healthScore += 10
    
    if (contributionMarginPercent >= 60) healthScore += 25
    else if (contributionMarginPercent >= 40) healthScore += 15
    else if (contributionMarginPercent >= 20) healthScore += 10

    // Calculate growth metrics (basic estimates)
    const marketingCosts = fixedCosts.find(c => c.category === 'Marketing')?.amount || 0
    const estimatedCustomers = Math.round(totalUnits * 0.7) // Estimate customers from total units
    const estimatedNewCustomersMonthly = Math.round(estimatedCustomers * 0.1) // 10% growth rate
    const estimatedCAC = estimatedNewCustomersMonthly > 0 ? marketingCosts / estimatedNewCustomersMonthly : 0
    
    return {
      monthlyRevenue,
      monthlyVariableCosts,
      monthlyFixedCosts,
      monthlyNetProfit,
      averageSellingPrice,
      averageVariableCost,
      contributionMargin,
      contributionMarginPercent,
      breakEvenUnits,
      breakEvenRevenue,
      currentMarginOfSafety,
      operatingCashFlow,
      runwayMonths,
      burnRate,
      grossMargin,
      netMargin,
      liquidityRatio,
      healthScore,
      // Growth metrics
      totalCustomers: estimatedCustomers,
      customerAcquisitionCost: estimatedCAC,
      monthlyMarketingCosts: marketingCosts,
      monthlyNewCustomers: estimatedNewCustomersMonthly,
      averagePurchaseFrequency: 1.2, // Estimate
      averageCustomerLifetime: 24 // Estimate in months
    }
  }

  // Recalcular métricas cada vez que cambien los datos
  useEffect(() => {
    setMetrics(calculateMetrics())
  }, [products, fixedCosts, cashFlow])

  // Generar entradas de cash flow basadas en productos y costos
  useEffect(() => {
    const generateCashFlowEntries = () => {
      const entries: CashFlowEntry[] = []
      const currentDate = new Date()
      
      // Ingresos por producto
      products.forEach(product => {
        entries.push({
          id: `income-${product.id}-${Date.now()}`,
          date: currentDate.toISOString().split('T')[0],
          type: 'income',
          amount: product.price * product.monthlySales,
          description: `Ventas de ${product.name}`,
          category: product.category,
          recurring: true
        })
      })
      
      // Costos fijos
      fixedCosts.forEach(cost => {
        entries.push({
          id: `expense-${cost.id}-${Date.now()}`,
          date: currentDate.toISOString().split('T')[0],
          type: 'expense',
          amount: cost.amount,
          description: cost.name,
          category: cost.category,
          recurring: true
        })
      })
      
      // Costos variables totales
      const totalVariableCosts = products.reduce((sum, p) => sum + (p.variableCost * p.monthlySales), 0)
      if (totalVariableCosts > 0) {
        entries.push({
          id: `expense-variable-${Date.now()}`,
          date: currentDate.toISOString().split('T')[0],
          type: 'expense',
          amount: totalVariableCosts,
          description: 'Costos Variables Totales',
          category: 'Producción',
          recurring: true
        })
      }
      
      setCashFlow(entries)
    }
    
    generateCashFlowEntries()
  }, [products, fixedCosts])

  // Actions
  const updateCompany = (updates: Partial<CompanyProfile>) => {
    setCompany(prev => ({ ...prev, ...updates }))
  }

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = { ...product, id: Date.now().toString() }
    setProducts(prev => [...prev, newProduct])
  }

  const removeProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  const updateFixedCost = (id: string, updates: Partial<FixedCost>) => {
    setFixedCosts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
  }

  const addFixedCost = (cost: Omit<FixedCost, 'id'>) => {
    const newCost = { ...cost, id: Date.now().toString() }
    setFixedCosts(prev => [...prev, newCost])
  }

  const removeFixedCost = (id: string) => {
    setFixedCosts(prev => prev.filter(c => c.id !== id))
  }

  const addCashFlowEntry = (entry: Omit<CashFlowEntry, 'id'>) => {
    const newEntry = { ...entry, id: Date.now().toString() }
    setCashFlow(prev => [...prev, newEntry])
  }

  const updateCashFlowEntry = (id: string, updates: Partial<CashFlowEntry>) => {
    setCashFlow(prev => prev.map(entry => 
      entry.id === id ? { ...entry, ...updates } : entry
    ))
  }

  const removeCashFlowEntry = (id: string) => {
    setCashFlow(prev => prev.filter(entry => entry.id !== id))
  }

  const setCashFlowEntries = (entries: CashFlowEntry[]) => {
    setCashFlow(entries)
  }

  const recalculateMetrics = () => {
    setMetrics(calculateMetrics())
  }

  const exportFinancialData = () => {
    return {
      company,
      products,
      fixedCosts,
      cashFlow,
      metrics,
      exportedAt: new Date().toISOString()
    }
  }

  const importFinancialData = (data: any) => {
    if (data.company) setCompany(data.company)
    if (data.products) setProducts(data.products)
    if (data.fixedCosts) setFixedCosts(data.fixedCosts)
    if (data.cashFlow) setCashFlow(data.cashFlow)
  }

  const value: FinancialContextType = {
    company,
    products,
    fixedCosts,
    cashFlow,
    metrics,
    updateCompany,
    updateProduct,
    addProduct,
    removeProduct,
    updateFixedCost,
    addFixedCost,
    removeFixedCost,
    addCashFlowEntry,
    updateCashFlowEntry,
    removeCashFlowEntry,
    setCashFlowEntries,
    recalculateMetrics,
    exportFinancialData,
    importFinancialData
  }

  return (
    <FinancialContext.Provider value={value}>
      {children}
    </FinancialContext.Provider>
  )
}

export const useFinancialData = () => {
  const context = useContext(FinancialContext)
  if (context === undefined) {
    throw new Error('useFinancialData must be used within a FinancialProvider')
  }
  return context
}

export default FinancialContext