import { useState } from 'react'
import { 
  Bot, 
  Brain, 
  Sparkles, 
  MessageSquare, 
  Settings,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calculator,
  FileText,
  Target,
  Shield,
  Zap
} from 'lucide-react'

interface Agent {
  id: string
  name: string
  description: string
  status: 'active' | 'paused' | 'processing'
  icon: any
  color: string
  tasks: string[]
  metrics?: {
    accuracy: number
    tasksCompleted: number
    timeSaved: string
  }
}

// Constants
const MULTI_AGENT_PROGRESS = 65 // Progress percentage for multi-agent analysis
const AGENTS_COMPLETED = 4 // Number of agents that have completed analysis
const TOTAL_AGENTS = 6 // Total number of agents in the system

// Agent configurations
const AGENT_CONFIGS: Agent[] = [
  {
    id: 'sofia-growth',
    name: 'Sofia: Especialista en Crecimiento',
    description: 'Experta en estrategias de expansión y análisis de mercado',
    status: 'active',
    icon: TrendingUp,
    color: 'text-emerald-500',
    tasks: [
      'Identificación de oportunidades de mercado',
      'Análisis competitivo y benchmarking',
      'Estrategias de adquisición de clientes',
      'Optimización de canales de venta'
    ],
    metrics: {
      accuracy: 92.3,
      tasksCompleted: 178,
      timeSaved: '36 horas/mes'
    }
  },
  {
    id: 'alex-risk',
    name: 'Alex: Analista de Riesgos',
    description: 'Especialista en identificación y mitigación de riesgos financieros',
    status: 'active',
    icon: Shield,
    color: 'text-red-500',
    tasks: [
      'Evaluación de riesgos financieros',
      'Análisis de liquidez y solvencia',
      'Monitoreo de indicadores críticos',
      'Planes de contingencia'
    ],
    metrics: {
      accuracy: 95.8,
      tasksCompleted: 203,
      timeSaved: '42 horas/mes'
    }
  },
  {
    id: 'financial-advisor',
    name: 'Asesor Financiero IA',
    description: 'Analiza tus finanzas y proporciona recomendaciones personalizadas',
    status: 'active',
    icon: Brain,
    color: 'text-primary',
    tasks: [
      'Análisis de rentabilidad',
      'Optimización de costos',
      'Proyecciones financieras',
      'Alertas inteligentes'
    ],
    metrics: {
      accuracy: 94.5,
      tasksCompleted: 156,
      timeSaved: '24 horas/mes'
    }
  },
  {
    id: 'cash-flow-guardian',
    name: 'Guardián de Flujo de Caja',
    description: 'Monitorea y predice tu flujo de efectivo',
    status: 'active',
    icon: Calculator,
    color: 'text-warning',
    tasks: [
      'Predicción de flujo',
      'Alertas de liquidez',
      'Optimización de cobros',
      'Gestión de pagos'
    ],
    metrics: {
      accuracy: 96.8,
      tasksCompleted: 234,
      timeSaved: '32 horas/mes'
    }
  },
  {
    id: 'report-generator',
    name: 'Generador de Reportes',
    description: 'Crea reportes ejecutivos automáticamente',
    status: 'processing',
    icon: FileText,
    color: 'text-info',
    tasks: [
      'Reportes mensuales',
      'Dashboards ejecutivos',
      'Análisis comparativos',
      'Presentaciones'
    ],
    metrics: {
      accuracy: 98.1,
      tasksCompleted: 67,
      timeSaved: '40 horas/mes'
    }
  },
  {
    id: 'diana-performance',
    name: 'Diana: Optimización de Performance',
    description: 'Analiza y optimiza el rendimiento del negocio detectando ineficiencias',
    status: 'active',
    icon: Target,
    color: 'text-purple-500',
    tasks: [
      'Análisis de cuellos de botella',
      'Optimización de procesos',
      'Reducción de costos operativos',
      'Mejora de eficiencia'
    ],
    metrics: {
      accuracy: 93.7,
      tasksCompleted: 42,
      timeSaved: '28 horas/mes'
    }
  }
]

const AIAgents = () => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'agent', content: string}>>([])
  const [isMultiAgentAnalyzing, setIsMultiAgentAnalyzing] = useState(false)
  const [multiAgentProgress, setMultiAgentProgress] = useState(MULTI_AGENT_PROGRESS)

  const agents: Agent[] = AGENT_CONFIGS

  const sendMessage = async () => {
    if (chatInput.trim()) {
      setChatMessages([...chatMessages, { role: 'user', content: chatInput }])
      const userMessage = chatInput
      setChatInput('')
      
      try {
        // Use RAG endpoint for real AI response
        const response = await fetch('/api/agents/financial-advisor/book-qa', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: userMessage,
            user_context: {
              company_name: 'Tu negocio',
              industry: 'general'
            }
          })
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.result) {
            let responseText = data.result.answer || data.result.analysis || 'Análisis completado.'
            
            // Add citations if available
            if (data.result.citations && data.result.citations.length > 0) {
              responseText += '\n\n📚 Basado en:\n'
              data.result.citations.forEach((citation: any, index: number) => {
                responseText += `• ${citation.chapter}\n`
              })
            }
            
            setChatMessages(prev => [...prev, { role: 'agent', content: responseText }])
          } else {
            // Fallback to simulated response
            const agentResponse = getAgentResponse(userMessage)
            setChatMessages(prev => [...prev, { role: 'agent', content: agentResponse }])
          }
        } else {
          // Fallback to simulated response
          const agentResponse = getAgentResponse(userMessage)
          setChatMessages(prev => [...prev, { role: 'agent', content: agentResponse }])
        }
      } catch (error) {
        // Fallback to simulated response
        const agentResponse = getAgentResponse(userMessage)
        setChatMessages(prev => [...prev, { role: 'agent', content: agentResponse }])
      }
    }
  }

  const getAgentResponse = (input: string) => {
    const lowerInput = input.toLowerCase()
    
    if (lowerInput.includes('flujo') || lowerInput.includes('caja')) {
      return 'Analizando tu flujo de caja... Tu flujo actual es de $85,430 MXN con tendencia positiva. Te recomiendo mantener una reserva de al menos 2 meses de gastos operativos ($550,000 MXN).'
    } else if (lowerInput.includes('crecimiento') || lowerInput.includes('crecer')) {
      return 'Basado en tu desempeño actual, identifico 3 oportunidades clave: 1) Expandir tu línea de productos más rentable (45% margen), 2) Optimizar precios en productos con demanda elástica (+8% potencial), 3) Reducir CAC mediante referidos (-23% costo).'
    } else if (lowerInput.includes('reporte') || lowerInput.includes('informe')) {
      return 'Puedo generar varios tipos de reportes: Financiero mensual, Unit Economics, Análisis de rentabilidad por producto, o un Ejecutivo completo. ¿Cuál necesitas?'
    } else {
      return 'Entiendo tu consulta. Basándome en tus métricas actuales, tu negocio muestra indicadores saludables con un ROI del 28.5% y un ratio LTV/CAC de 3.1x. ¿En qué área específica puedo ayudarte más?'
    }
  }

  const toggleAgentStatus = (agentId: string) => {
    // En una implementación real, esto actualizaría el estado del agente
    console.log(`Toggling agent ${agentId}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Agentes de IA</h1>
        <p className="text-text-secondary">
          Tus asistentes inteligentes trabajando 24/7 para optimizar tu negocio
        </p>
      </div>

      {/* Agent Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {agents.map((agent) => (
          <div 
            key={agent.id}
            className={`bg-surface border rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg ${
              selectedAgent === agent.id ? 'border-primary shadow-lg' : 'border-border'
            }`}
            onClick={() => setSelectedAgent(agent.id)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div 
                  className={`w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center ${agent.color}`}
                  role="img"
                  aria-label={`Icono de ${agent.name}`}
                >
                  <agent.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">{agent.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${
                      agent.status === 'active' ? 'bg-success' : 
                      agent.status === 'processing' ? 'bg-warning animate-pulse' : 'bg-gray-500'
                    }`} />
                    <span className="text-xs text-text-secondary">
                      {agent.status === 'active' ? 'Activo' : 
                       agent.status === 'processing' ? 'Procesando' : 'Pausado'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleAgentStatus(agent.id)
                }}
                className={`p-2 rounded-lg transition-colors ${
                  agent.status === 'active' 
                    ? 'text-warning hover:bg-warning/10' 
                    : 'text-success hover:bg-success/10'
                }`}
              >
                {agent.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            </div>

            <p className="text-text-secondary text-sm mb-4">{agent.description}</p>

            {/* Tasks */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-text-primary mb-2">Tareas que realiza:</h4>
              <div className="flex flex-wrap gap-2">
                {agent.tasks.map((task, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-surface-light rounded-full text-xs text-text-secondary"
                  >
                    {task}
                  </span>
                ))}
              </div>
            </div>

            {/* Metrics */}
            {agent.metrics && (
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
                <div className="text-center">
                  <div className="text-lg font-bold text-success">{agent.metrics.accuracy}%</div>
                  <div className="text-xs text-text-secondary">Precisión</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">{agent.metrics.tasksCompleted}</div>
                  <div className="text-xs text-text-secondary">Tareas</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-warning">{agent.metrics.timeSaved}</div>
                  <div className="text-xs text-text-secondary">Ahorro</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Interactive Chat */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-text-primary">Chat con tus Agentes IA</h3>
        </div>

        {/* Chat Messages */}
        <div className="bg-surface-light rounded-lg p-4 h-80 overflow-y-auto mb-4">
          {chatMessages.length === 0 ? (
            <div className="text-center text-text-secondary py-8">
              <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Pregúntame sobre tus finanzas, estrategias de crecimiento o cualquier análisis que necesites.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {chatMessages.map((msg, index) => (
                <div 
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.role === 'user' 
                      ? 'bg-primary text-background' 
                      : 'bg-background border border-border'
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Escribe tu pregunta aquí..."
            className="flex-1 px-4 py-2 bg-surface-light border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            onClick={sendMessage}
            className="bg-primary hover:bg-primary-dark text-background px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Enviar
          </button>
        </div>
      </div>

      {/* Multi-Agent Analysis */}
      <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center space-x-2">
          <Brain className="w-5 h-5 text-purple-500" />
          <span>Análisis Multi-Agente</span>
        </h3>
        <p className="text-text-secondary mb-6">
          Los agentes trabajan en conjunto para proporcionarte análisis holísticos y recomendaciones integrales.
        </p>
        
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-background border border-border rounded-lg p-4">
            <h4 className="font-medium text-text-primary mb-2 flex items-center space-x-2">
              <Target className="w-4 h-4 text-primary" />
              <span>Análisis Sincronizado</span>
            </h4>
            <p className="text-sm text-text-secondary mb-3">
              Todos los agentes analizan tus datos simultáneamente desde diferentes perspectivas.
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Asesor Financiero + Guardián de Flujo</span>
                <span className="text-success font-medium">Activo</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Sofia + Alex (Crecimiento + Riesgos)</span>
                <span className="text-success font-medium">Activo</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Diana + Generador de Reportes</span>
                <span className="text-warning font-medium">Configurando</span>
              </div>
            </div>
          </div>
          
          <div className="bg-background border border-border rounded-lg p-4">
            <h4 className="font-medium text-text-primary mb-2 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-warning" />
              <span>Insights Combinados</span>
            </h4>
            <p className="text-sm text-text-secondary mb-3">
              Descubre patrones y oportunidades que solo emergen del análisis conjunto.
            </p>
            <div className="space-y-3">
              <div className="bg-success/10 border border-success/30 rounded-lg p-2">
                <p className="text-xs text-success">
                  <strong>Último insight:</strong> Reducir inventario en 15% liberaría $120k para inversión en marketing digital con ROI proyectado de 3.2x
                </p>
              </div>
              <button 
                onClick={() => setIsMultiAgentAnalyzing(true)}
                disabled={isMultiAgentAnalyzing}
                className="w-full bg-primary hover:bg-primary-dark text-background px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isMultiAgentAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin"></div>
                    <span>Analizando...</span>
                  </>
                ) : (
                  <span>Ver Análisis Completo</span>
                )}
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-surface-light rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-text-primary">Próximo Análisis Multi-Agente</h4>
            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">En 3 horas</span>
          </div>
          <div className="w-full bg-surface rounded-full h-2 mb-2">
            <div 
              className="bg-gradient-to-r from-primary to-purple-500 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${multiAgentProgress}%` }}
              aria-label={`Progreso del análisis: ${multiAgentProgress}%`}
            ></div>
          </div>
          <p className="text-xs text-text-secondary">{AGENTS_COMPLETED} de {TOTAL_AGENTS} agentes han completado su análisis preliminar</p>
        </div>
      </div>

      {/* Agent Capabilities */}
      <div className="bg-gradient-to-r from-primary/10 to-primary-dark/10 border border-primary/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">¿Qué pueden hacer los agentes?</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-text-primary mb-3 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-warning" />
              <span>Capacidades Actuales</span>
            </h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-success mt-0.5" />
                <span>Análisis predictivo de flujo de caja con 96% de precisión</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-success mt-0.5" />
                <span>Identificación automática de oportunidades de ahorro</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-success mt-0.5" />
                <span>Generación de reportes ejecutivos personalizados</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-success mt-0.5" />
                <span>Alertas inteligentes basadas en patrones históricos</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-text-primary mb-3 flex items-center space-x-2">
              <Target className="w-4 h-4 text-primary" />
              <span>Próximas Funciones</span>
            </h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-warning mt-0.5" />
                <span>Negociación automática con proveedores</span>
              </li>
              <li className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-warning mt-0.5" />
                <span>Optimización de inventario con IA</span>
              </li>
              <li className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-warning mt-0.5" />
                <span>Predicción de demanda por temporada</span>
              </li>
              <li className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-warning mt-0.5" />
                <span>Automatización de cobranza inteligente</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIAgents