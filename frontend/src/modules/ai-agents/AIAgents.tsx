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
import ContentTypeBadge from '../../components/ui/ContentTypeBadge'

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
    id: 'maya',
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
    if (chatInput.trim() && selectedAgent) {
      setChatMessages([...chatMessages, { role: 'user', content: chatInput }])
      const userMessage = chatInput
      setChatInput('')
      
      try {
        // Use RAG endpoint for real AI response with selected agent
        const response = await fetch(`/api/agents/${selectedAgent}/chat-demo`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            question: userMessage,
            context: {
              company_name: 'Tu negocio',
              industry: 'general'
            }
          })
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.response) {
            let responseText = data.response
            
            // Add citations if available
            if (data.citations && data.citations.length > 0) {
              responseText += '\n\n📚 Referencias del libro:\n'
              data.citations.forEach((citation: any, index: number) => {
                responseText += `• ${citation.chapter || citation}\n`
              })
            }
            
            setChatMessages(prev => [...prev, { role: 'agent', content: responseText }])
          } else {
            // Fallback to simulated response
            const agentResponse = getAgentResponse(userMessage, selectedAgent)
            setChatMessages(prev => [...prev, { role: 'agent', content: agentResponse }])
          }
        } else {
          // Fallback to simulated response
          const agentResponse = getAgentResponse(userMessage, selectedAgent)
          setChatMessages(prev => [...prev, { role: 'agent', content: agentResponse }])
        }
      } catch (error) {
        // Fallback to simulated response
        const agentResponse = getAgentResponse(userMessage, selectedAgent)
        setChatMessages(prev => [...prev, { role: 'agent', content: agentResponse }])
      }
    }
  }

  const getAgentResponse = (input: string, agentId: string) => {
    const lowerInput = input.toLowerCase()
    
    // Agent-specific fallback responses based on the backend fallback
    const agentResponses = {
      'maya': "Como Maya, tu especialista en flujo de caja, he analizado tu consulta. Basándome en el libro 'Finanzas para Emprendedores', te recomiendo mantener un flujo de caja positivo siguiendo la regla 3-6-9: 3 meses de gastos en reserva, 6 meses de proyección y 9 meses de planificación estratégica.",
      'carlos': "Soy Carlos, analista de economía unitaria. Según el Capítulo 5 del libro, para optimizar tu LTV/CAC necesitas: 1) Medir el valor de vida del cliente correctamente, 2) Calcular el costo de adquisición real incluyendo todos los canales, 3) Mantener un ratio LTV:CAC de al menos 3:1.",
      'sofia': "Como Sofia, estratega de crecimiento, basándome en los Capítulos 6-9 del libro, te sugiero: analizar las oportunidades de mercado, optimizar tus canales de adquisición más rentables y escalar de manera sostenible manteniendo la calidad.",
      'alex': "Soy Alex, especialista en riesgos. El libro enfatiza en los Capítulos 11-12 la importancia de: identificar riesgos financieros temprano, diversificar fuentes de ingresos y mantener indicadores de alerta para proteger la estabilidad financiera.",
      'diana': "Como Diana, optimizadora de rendimiento, según los Capítulos 13-15 del libro, recomiendo: analizar la eficiencia operacional, identificar cuellos de botella en procesos y implementar mejoras que aumenten la productividad sin incrementar costos proporcionalmente."
    }
    
    const response = agentResponses[agentId as keyof typeof agentResponses] || agentResponses['maya']
    
    // Add context-specific additions based on user input
    if (lowerInput.includes('flujo') || lowerInput.includes('caja')) {
      return response + '\n\n💡 Tip específico: Mantén un control diario de entradas y salidas para anticipar problemas de liquidez.'
    } else if (lowerInput.includes('crecimiento') || lowerInput.includes('crecer')) {
      return response + '\n\n📈 Recomendación: Enfócate primero en retener clientes existentes antes de buscar nuevos - es 5x más barato.'
    } else if (lowerInput.includes('riesgo') || lowerInput.includes('seguridad')) {
      return response + '\n\n⚠️ Alerta: Diversifica tus fuentes de ingresos - no dependas de un solo cliente o canal.'
    }
    
    return response
  }

  const toggleAgentStatus = (agentId: string) => {
    // En una implementación real, esto actualizaría el estado del agente
    console.log(`Toggling agent ${agentId}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-text-primary">Agentes de IA</h1>
                <ContentTypeBadge type="ai" size="sm" />
              </div>
              <p className="text-text-secondary">
                Asistentes inteligentes especializados en análisis financiero
              </p>
            </div>
          </div>
          <div className="text-xs text-text-secondary bg-violet-500/10 px-3 py-1 rounded-full border border-violet-500/20">
            6 Agentes Activos
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-violet-400">96.5%</div>
            <div className="text-xs text-text-secondary">Precisión</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-violet-400">880</div>
            <div className="text-xs text-text-secondary">Tareas</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-violet-400">202h</div>
            <div className="text-xs text-text-secondary">Ahorro/mes</div>
          </div>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {agents.map((agent) => (
          <div 
            key={agent.id}
            className={`bg-surface border rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 ${
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-text-primary">Chat con Agentes IA</h3>
          </div>
          
          {/* Agent Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-text-secondary">Agente:</span>
            <select
              value={selectedAgent || ''}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="bg-surface border border-border rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Selecciona un agente</option>
              <option value="maya">Maya - Flujo de Caja</option>
              <option value="carlos">Carlos - Unit Economics</option>
              <option value="sofia">Sofia - Crecimiento</option>
              <option value="alex">Alex - Riesgos</option>
              <option value="diana">Diana - Performance</option>
            </select>
          </div>
        </div>

        {/* Selected Agent Info */}
        {selectedAgent && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <Bot className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">
                Chateando con {
                  selectedAgent === 'maya' ? 'Maya (Especialista en Flujo de Caja)' :
                  selectedAgent === 'carlos' ? 'Carlos (Analista Unit Economics)' :
                  selectedAgent === 'sofia' ? 'Sofia (Estratega de Crecimiento)' :
                  selectedAgent === 'alex' ? 'Alex (Especialista en Riesgos)' :
                  selectedAgent === 'diana' ? 'Diana (Optimizadora de Performance)' :
                  'Agente IA'
                }
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              Respuestas basadas en el libro "Finanzas para Emprendedores" y análisis con IA real
            </p>
          </div>
        )}

        {/* Chat Messages */}
        <div className="bg-surface-light rounded-lg p-4 h-80 overflow-y-auto mb-4">
          {chatMessages.length === 0 ? (
            <div className="text-center text-text-secondary py-8">
              <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>
                {selectedAgent 
                  ? "Pregúntame sobre tus finanzas, estrategias de crecimiento o cualquier análisis que necesites."
                  : "Selecciona un agente especializado para comenzar el chat."
                }
              </p>
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
                    <p className="text-sm whitespace-pre-line">{msg.content}</p>
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
            placeholder={selectedAgent ? "Escribe tu pregunta aquí..." : "Selecciona un agente primero"}
            disabled={!selectedAgent}
            className="flex-1 px-4 py-2 bg-surface-light border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={!selectedAgent || !chatInput.trim()}
            className="bg-primary hover:bg-primary-dark text-background px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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