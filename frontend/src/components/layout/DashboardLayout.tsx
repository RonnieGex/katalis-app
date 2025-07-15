import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import gsap from 'gsap'
import { 
  LayoutDashboard, 
  DollarSign, 
  PieChart, 
  TrendingUp, 
  Calculator,
  FileText,
  BookOpen,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  Bell,
  Search,
  ChevronRight,
  Sparkles,
  X,
  Zap,
  Target,
  Bot
} from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

interface Notification {
  id: string
  title: string
  message: string
  type: string
  priority: string
  created_at: string
  read: boolean
  action_url?: string
}

interface LiveMetric {
  label: string
  value: string
  change: string
  trend: string
  color: string
  tooltip: string
}

interface SearchResult {
  id: string
  title: string
  description: string
  type: string
  url: string
  score: number
  category: string
  snippet?: string
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  // Backend integration states
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [liveMetrics, setLiveMetrics] = useState<{primary?: LiveMetric, secondary?: LiveMetric, status?: LiveMetric}>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showAIModal, setShowAIModal] = useState(false)
  const [aiQuestion, setAiQuestion] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [isLoadingAI, setIsLoadingAI] = useState(false)

  const menuItems = [
    // Company Data - Real business information
    { path: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard', badge: null, type: 'company' as const },
    { path: '/app/cash-flow', icon: DollarSign, label: 'Flujo de Caja', badge: null, type: 'company' as const },
    { path: '/app/unit-economics', icon: Calculator, label: 'Unit Economics', badge: null, type: 'company' as const },
    { path: '/app/costs-pricing', icon: TrendingUp, label: 'Costos y Precios', badge: null, type: 'company' as const },
    { path: '/app/profitability', icon: PieChart, label: 'Rentabilidad', badge: null, type: 'company' as const },
    { path: '/app/planning', icon: FileText, label: 'Planificación', badge: null, type: 'company' as const },
    { path: '/app/reports', icon: FileText, label: 'Reportes', badge: null, type: 'company' as const },
    
    // AI Agents - Intelligent analysis
    { path: '/app/ai-agents', icon: Bot, label: 'Agentes IA', badge: '🤖', type: 'ai' as const },
    { path: '/app/automation', icon: Zap, label: 'Automatización', badge: null, type: 'ai' as const },
    { path: '/app/growth', icon: Target, label: 'Crecimiento', badge: null, type: 'ai' as const },
  ]

  const bottomMenuItems = [
    { path: '/app/settings', icon: Settings, label: 'Configuración', type: 'company' as const },
  ]

  // Fetch data from backend APIs
  useEffect(() => {
    // Animate sidebar on mount
    if (sidebarRef.current) {
      gsap.fromTo(
        sidebarRef.current,
        { x: -280, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      )
    }

    // Load initial data
    fetchNotifications()
    fetchLiveMetrics()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications/')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setNotifications(data.notifications)
          setUnreadCount(data.notifications.filter((n: Notification) => !n.read).length)
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const fetchLiveMetrics = async () => {
    try {
      const response = await fetch('/api/metrics/summary')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setLiveMetrics(data.summary)
        }
      }
    } catch (error) {
      console.error('Error fetching live metrics:', error)
    }
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.length < 2) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    try {
      const response = await fetch(`/api/search/?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSearchResults(data.results)
          setShowSearchResults(true)
        }
      }
    } catch (error) {
      console.error('Error searching:', error)
    }
  }

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT'
      })
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const handleAIQuestion = async () => {
    if (!aiQuestion.trim()) return
    
    setIsLoadingAI(true)
    try {
      // Use RAG endpoint with book citations
      const response = await fetch('/api/agents/financial-advisor/book-qa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: aiQuestion,
          user_context: {
            company_name: user?.company_name || 'Tu negocio',
            industry: user?.industry || 'general'
          }
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.result) {
          let responseText = data.result.answer || data.result.analysis || 'Análisis completado.'
          
          // Add citations if available
          if (data.result.citations && data.result.citations.length > 0) {
            responseText += '\n\n📚 Referencias del libro:\n'
            data.result.citations.forEach((citation: any, index: number) => {
              responseText += `${index + 1}. ${citation.chapter} - "${citation.excerpt.substring(0, 100)}..."\n`
            })
          }
          
          setAiResponse(responseText)
        } else {
          setAiResponse('Basándome en las mejores prácticas financieras del libro "Finanzas para Emprendedores", te recomiendo enfocarte en analizar tu flujo de caja y unit economics primero.')
        }
      } else {
        setAiResponse('Basándome en las mejores prácticas financieras del libro "Finanzas para Emprendedores", te recomiendo enfocarte en analizar tu flujo de caja y unit economics primero.')
      }
    } catch (error) {
      setAiResponse('Te recomiendo revisar los módulos de Flujo de Caja y Unit Economics para obtener insights sobre tu negocio.')
    } finally {
      setIsLoadingAI(false)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <Link to="/app/dashboard" className="flex items-center space-x-2">
              <span className="text-3xl font-bold text-primary">K</span>
              <span className="text-xl font-semibold gradient-text">KatalisApp</span>
            </Link>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            {/* Company Data Section */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 px-2 mb-3">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Datos Empresa</span>
              </div>
              <div className="space-y-1">
                {menuItems.filter(item => item.type === 'company').map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 border-l-2 ${
                      location.pathname === item.path
                        ? 'bg-cyan-500/10 text-cyan-400 border-l-cyan-400'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-light border-l-transparent hover:border-l-cyan-400/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* AI Agents Section */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 px-2 mb-3">
                <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
                <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">Agentes IA</span>
              </div>
              <div className="space-y-1">
                {menuItems.filter(item => item.type === 'ai').map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 border-l-2 ${
                      location.pathname === item.path
                        ? 'bg-violet-500/10 text-violet-400 border-l-violet-400'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-light border-l-transparent hover:border-l-violet-400/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-xs bg-violet-500/20 text-violet-400 px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* Educational Content Link */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 px-2 mb-3">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Libro & Guías</span>
              </div>
              <div className="space-y-1">
                <Link
                  to="/guias-del-libro"
                  className="flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 border-l-2 border-l-transparent hover:border-l-emerald-400/50 text-text-secondary hover:text-text-primary hover:bg-surface-light"
                >
                  <div className="flex items-center space-x-3">
                    <BookOpen className="w-5 h-5" />
                    <span className="font-medium">Guías del Libro</span>
                  </div>
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full">
                    📚
                  </span>
                </Link>
                <Link
                  to="/centro-de-ayuda"
                  className="flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 border-l-2 border-l-transparent hover:border-l-emerald-400/50 text-text-secondary hover:text-text-primary hover:bg-surface-light"
                >
                  <div className="flex items-center space-x-3">
                    <HelpCircle className="w-5 h-5" />
                    <span className="font-medium">Centro de Ayuda</span>
                  </div>
                </Link>
              </div>
            </div>

            {/* Quick AI Assistant */}
            <div className="mt-6 p-4 bg-gradient-to-br from-violet-500/10 to-violet-500/5 rounded-lg border border-violet-500/20">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="w-5 h-5 text-violet-400" />
                <span className="font-semibold text-text-primary">Asistente IA</span>
              </div>
              <p className="text-sm text-text-secondary mb-3">
                Tu consultor financiero 24/7 está listo para ayudarte
              </p>
              <button 
                onClick={() => setShowAIModal(true)}
                className="w-full bg-violet-500 hover:bg-violet-600 text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm"
              >
                Hacer una pregunta
              </button>
            </div>
          </nav>

          {/* Bottom Navigation */}
          <div className="px-4 py-6 border-t border-border">
            <div className="space-y-1">
              {bottomMenuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 border-l-2 ${
                    location.pathname === item.path
                      ? 'bg-cyan-500/10 text-cyan-400 border-l-cyan-400'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-light border-l-transparent hover:border-l-cyan-400/50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-text-secondary hover:text-error hover:bg-error/10 transition-all duration-200 border-l-2 border-l-transparent"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Cerrar Sesión</span>
              </button>
            </div>
          </div>

          {/* User Profile */}
          <div className="px-4 py-4 border-t border-border">
            <Link 
              to="/app/settings"
              className="flex items-center space-x-3 hover:bg-surface-light rounded-lg p-2 transition-colors"
            >
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-primary font-semibold">
                  {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">
                  {user?.full_name || 'Usuario'}
                </p>
                <p className="text-xs text-text-secondary">
                  {user?.company_name || user?.email}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-surface border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button
                onClick={toggleSidebar}
                className="lg:hidden text-text-primary"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Buscar módulos, conceptos, acciones..."
                  className="pl-10 pr-4 py-2 bg-surface-light border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary w-96"
                  onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                  onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                />
                
                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    {searchResults.map((result) => (
                      <Link
                        key={result.id}
                        to={result.url}
                        className="block px-4 py-3 hover:bg-surface-light border-b border-border last:border-b-0"
                        onClick={() => {
                          setShowSearchResults(false)
                          setSearchQuery('')
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-text-primary text-sm">{result.title}</h4>
                            <p className="text-xs text-text-secondary mt-1">{result.description}</p>
                            {result.snippet && (
                              <p className="text-xs text-text-muted mt-1 italic">{result.snippet}</p>
                            )}
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            result.category === 'modules' ? 'bg-primary/20 text-primary' :
                            result.category === 'concepts' ? 'bg-blue-500/20 text-blue-600' :
                            'bg-green-500/20 text-green-600'
                          }`}>
                            {result.type}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative text-text-secondary hover:text-text-primary transition-colors"
                >
                  <Bell className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-background text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-surface border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    <div className="p-3 border-b border-border">
                      <h3 className="font-semibold text-text-primary">Notificaciones</h3>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-text-secondary">
                        No hay notificaciones
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 border-b border-border last:border-b-0 ${
                            !notification.read ? 'bg-primary/5' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-text-primary text-sm">{notification.title}</h4>
                              <p className="text-xs text-text-secondary mt-1">{notification.message}</p>
                              <p className="text-xs text-text-muted mt-1">
                                {new Date(notification.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            {!notification.read && (
                              <button
                                onClick={() => markNotificationAsRead(notification.id)}
                                className="text-xs text-primary hover:text-primary/80 ml-2"
                              >
                                Marcar leída
                              </button>
                            )}
                          </div>
                          {notification.action_url && (
                            <Link
                              to={notification.action_url}
                              className="inline-block mt-2 text-xs text-primary hover:text-primary/80"
                              onClick={() => setShowNotifications(false)}
                            >
                              Ver detalles →
                            </Link>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Live Quick Stats */}
              <div className="hidden lg:flex items-center space-x-6 text-sm">
                {liveMetrics.primary && (
                  <div>
                    <p className="text-text-secondary">{liveMetrics.primary.label}</p>
                    <p className={`text-lg font-semibold ${liveMetrics.primary.color}`}>
                      {liveMetrics.primary.value}
                    </p>
                  </div>
                )}
                {liveMetrics.status && (
                  <div>
                    <p className="text-text-secondary">{liveMetrics.status.label}</p>
                    <p className={`text-lg font-semibold ${liveMetrics.status.color}`}>
                      {liveMetrics.status.value}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* AI Assistant Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-primary/30 rounded-xl max-w-lg w-full max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/10 to-purple-500/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">Consultor Financiero IA</h3>
                  <p className="text-xs text-text-secondary">Powered by OpenAI + "Finanzas para Emprendedores"</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowAIModal(false)
                  setAiQuestion('')
                  setAiResponse('')
                }}
                className="text-text-muted hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-primary to-purple-500 rounded-md flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold text-primary">💡 Asistente IA</span>
                  </div>
                  <p className="text-sm text-text-secondary">
                    Basado en "Finanzas para Emprendedores" - Obtén recomendaciones personalizadas con citas del libro y análisis avanzado.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <input
                      type="text"
                      value={aiQuestion}
                      onChange={(e) => setAiQuestion(e.target.value)}
                      placeholder="Ej: ¿Cómo puedo mejorar mi flujo de caja?"
                      className="w-full input"
                      onKeyPress={(e) => e.key === 'Enter' && handleAIQuestion()}
                    />
                  </div>
                  
                  <button 
                    onClick={handleAIQuestion}
                    disabled={isLoadingAI || !aiQuestion.trim()}
                    className="w-full bg-gradient-to-r from-primary to-purple-500 hover:from-primary-dark hover:to-purple-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isLoadingAI ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Analizando con IA...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Obtener Recomendación IA</span>
                      </>
                    )}
                  </button>
                </div>

                {aiResponse && (
                  <div className="bg-surface-light border border-border rounded-lg p-4">
                    <h4 className="font-medium text-text-primary mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Recomendación:
                    </h4>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {aiResponse}
                    </p>
                  </div>
                )}

                <div className="text-xs text-text-muted">
                  <p>💡 <strong>Sugerencias:</strong></p>
                  <ul className="mt-1 space-y-1">
                    <li>• "¿Cómo calcular mi punto de equilibrio?"</li>
                    <li>• "¿Qué es unit economics?"</li>
                    <li>• "¿Cómo mejorar mi margen de contribución?"</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardLayout