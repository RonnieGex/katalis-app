import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../components/auth/AuthProvider'
import DashboardLayout from '../components/layout/DashboardLayout'

// Dashboard views
import Overview from '../modules/dashboard/Overview'
import CashFlow from '../modules/cash-flow/CashFlow'
import UnitEconomics from '../modules/unit-economics/UnitEconomics'
import CostsPricing from '../modules/costs-pricing/CostsPricing'
import Profitability from '../modules/profitability/Profitability'
import FinancialPlanning from '../modules/planning/FinancialPlanning'
import Reports from '../modules/reports/Reports'
import Settings from '../modules/settings/Settings'
import Automation from '../modules/automation/Automation'
import Growth from '../modules/growth/Growth'
import AIAgents from '../modules/ai-agents/AIAgents'

const DashboardPage = () => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/app/dashboard" />} />
        <Route path="/dashboard" element={<Overview />} />
        <Route path="/cash-flow" element={<CashFlow />} />
        <Route path="/unit-economics" element={<UnitEconomics />} />
        <Route path="/costs-pricing" element={<CostsPricing />} />
        <Route path="/profitability" element={<Profitability />} />
        <Route path="/planning" element={<FinancialPlanning />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/automation" element={<Automation />} />
        <Route path="/growth" element={<Growth />} />
        <Route path="/ai-agents" element={<AIAgents />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </DashboardLayout>
  )
}

export default DashboardPage