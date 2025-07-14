import { useState } from 'react'
import { 
  Bot, 
  Settings, 
  Zap, 
  Clock, 
  Bell, 
  Database, 
  Link,
  CheckCircle,
  Play,
  Pause,
  Edit,
  Trash2,
  Plus
} from 'lucide-react'

interface AutomationRule {
  id: string
  name: string
  description: string
  type: 'financial' | 'notification' | 'report' | 'integration'
  status: 'active' | 'paused' | 'draft'
  trigger: string
  action: string
  lastRun?: string
  nextRun?: string
  executionCount: number
}

// Diana AI Agent Configuration
const DIANA_OPTIMIZATION_RULE: AutomationRule = {
  id: 'comp-4',
  name: 'Diana: Optimización de Performance',
  description: 'IA que analiza y optimiza el rendimiento del negocio en tiempo real',
  type: 'financial',
  status: 'active',
  trigger: 'Análisis continuo cada 4 horas',
  action: 'Detectar ineficiencias y proponer optimizaciones',
  nextRun: 'En 2 horas',
  executionCount: 0
}

const Automation = () => {
  const [isSettingUp, setIsSettingUp] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([
    {
      id: '1',
      name: 'Reporte Semanal Automático',
      description: 'Genera y envía por email el reporte financiero semanal',
      type: 'report',
      status: 'active',
      trigger: 'Todos los lunes a las 9:00 AM',
      action: 'Generar reporte y enviar por email',
      lastRun: '2024-01-08 09:00',
      nextRun: '2024-01-15 09:00',
      executionCount: 23
    },
    {
      id: '2',
      name: 'Alerta de Flujo de Efectivo Bajo',
      description: 'Notifica cuando el flujo de efectivo proyectado es menor a $10,000',
      type: 'notification',
      status: 'active',
      trigger: 'Flujo de efectivo < $10,000',
      action: 'Enviar notificación push y email',
      lastRun: '2024-01-10 14:30',
      nextRun: 'En tiempo real',
      executionCount: 5
    },
    {
      id: '3',
      name: 'Sincronización Bancaria',
      description: 'Sincroniza transacciones bancarias automáticamente',
      type: 'integration',
      status: 'active',
      trigger: 'Cada 6 horas',
      action: 'Importar transacciones del banco',
      lastRun: '2024-01-10 18:00',
      nextRun: '2024-01-11 00:00',
      executionCount: 145
    },
    {
      id: '4',
      name: 'Análisis de Rentabilidad Mensual',
      description: 'Analiza rentabilidad por producto y envía recomendaciones de IA',
      type: 'financial',
      status: 'draft',
      trigger: 'Primer día de cada mes',
      action: 'Generar análisis con IA',
      executionCount: 0
    }
  ])

  const [selectedType, setSelectedType] = useState<string>('all')

  const typeColors = {
    financial: 'text-primary bg-primary/10 border-primary/30',
    notification: 'text-warning bg-warning/10 border-warning/30',
    report: 'text-success bg-success/10 border-success/30',
    integration: 'text-info bg-info/10 border-info/30'
  }

  const statusColors = {
    active: 'text-success bg-success/10 border-success/30',
    paused: 'text-warning bg-warning/10 border-warning/30',
    draft: 'text-text-secondary bg-surface-light border-border'
  }

  const filteredRules = selectedType === 'all' 
    ? automationRules 
    : automationRules.filter(rule => rule.type === selectedType)

  const toggleStatus = (id: string) => {
    setAutomationRules(prev => prev.map(rule => 
      rule.id === id 
        ? { ...rule, status: rule.status === 'active' ? 'paused' : 'active' }
        : rule
    ))
  }

  const setupQuickPackage = async (packageType: 'basic' | 'professional' | 'complete') => {
    setIsSettingUp(true)
    setSuccessMessage('')
    
    // Simular delay de configuración
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    let newRules: AutomationRule[] = []

    if (packageType === 'basic') {
      newRules = [
        {
          id: 'basic-1',
          name: 'Reporte Financiero Semanal',
          description: 'Genera automáticamente el reporte financiero cada lunes',
          type: 'report',
          status: 'active',
          trigger: 'Todos los lunes a las 8:00 AM',
          action: 'Generar y enviar reporte por email',
          nextRun: 'Próximo lunes 08:00',
          executionCount: 0
        },
        {
          id: 'basic-2',
          name: 'Alerta de Flujo de Efectivo Crítico',
          description: 'Notifica cuando el flujo de efectivo baja del límite',
          type: 'notification',
          status: 'active',
          trigger: 'Flujo de efectivo < $5,000',
          action: 'Enviar alerta inmediata',
          nextRun: 'En tiempo real',
          executionCount: 0
        }
      ]
    } else if (packageType === 'professional') {
      newRules = [
        ...newRules,
        {
          id: 'prof-1',
          name: 'Sincronización Bancaria Automática',
          description: 'Sincroniza transacciones cada 4 horas',
          type: 'integration',
          status: 'active',
          trigger: 'Cada 4 horas',
          action: 'Importar transacciones bancarias',
          nextRun: 'En 3 horas',
          executionCount: 0
        },
        {
          id: 'prof-2',
          name: 'Análisis de Rentabilidad Mensual',
          description: 'Analiza rentabilidad por producto cada mes',
          type: 'financial',
          status: 'active',
          trigger: 'Primer día de cada mes',
          action: 'Generar análisis con IA',
          nextRun: '1 de febrero',
          executionCount: 0
        },
        {
          id: 'prof-3',
          name: 'Predicción de Inventario IA',
          description: 'Predice necesidades de inventario semanalmente',
          type: 'financial',
          status: 'active',
          trigger: 'Todos los viernes',
          action: 'Análisis predictivo de inventario',
          nextRun: 'Próximo viernes',
          executionCount: 0
        }
      ]
    } else if (packageType === 'complete') {
      newRules = [
        ...newRules,
        {
          id: 'comp-1',
          name: 'Optimización de Precios Dinámica',
          description: 'Ajusta precios basado en demanda y competencia',
          type: 'financial',
          status: 'active',
          trigger: 'Diariamente a las 6:00 AM',
          action: 'Optimizar precios con IA',
          nextRun: 'Mañana 06:00',
          executionCount: 0
        },
        {
          id: 'comp-2',
          name: 'Detección de Anomalías Financieras',
          description: 'Detecta patrones inusuales en gastos e ingresos',
          type: 'notification',
          status: 'active',
          trigger: 'Variación > 25% del promedio',
          action: 'Alerta de anomalía detectada',
          nextRun: 'En tiempo real',
          executionCount: 0
        },
        {
          id: 'comp-3',
          name: 'Automatización de Cobranza',
          description: 'Envía recordatorios automáticos de pago',
          type: 'integration',
          status: 'active',
          trigger: 'Facturas vencidas > 7 días',
          action: 'Enviar recordatorio personalizado',
          nextRun: 'En tiempo real',
          executionCount: 0
        },
        DIANA_OPTIMIZATION_RULE
      ]
    }

    // Agregar las reglas básicas para todos los paquetes
    if (packageType !== 'basic') {
      newRules = [
        {
          id: 'basic-1',
          name: 'Reporte Financiero Semanal',
          description: 'Genera automáticamente el reporte financiero cada lunes',
          type: 'report',
          status: 'active',
          trigger: 'Todos los lunes a las 8:00 AM',
          action: 'Generar y enviar reporte por email',
          nextRun: 'Próximo lunes 08:00',
          executionCount: 0
        },
        {
          id: 'basic-2',
          name: 'Alerta de Flujo de Efectivo Crítico',
          description: 'Notifica cuando el flujo de efectivo baja del límite',
          type: 'notification',
          status: 'active',
          trigger: 'Flujo de efectivo < $5,000',
          action: 'Enviar alerta inmediata',
          nextRun: 'En tiempo real',
          executionCount: 0
        },
        ...newRules
      ]
    }

    // Reemplazar reglas existentes con las nuevas
    setAutomationRules(newRules)
    
    const packageName = packageType === 'basic' ? 'Básico' : packageType === 'professional' ? 'Profesional' : 'Completo'
    setSuccessMessage(`¡Paquete ${packageName} configurado exitosamente! ${newRules.length} reglas automáticas activadas.`)
    setIsSettingUp(false)
    
    // Limpiar mensaje después de 5 segundos
    setTimeout(() => setSuccessMessage(''), 5000)
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-success/10 border border-success/30 rounded-xl p-4 flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-success" />
          <span className="text-success font-medium">{successMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Automatización Financiera</h1>
          <p className="text-text-secondary">
            Configura reglas automáticas para optimizar tu gestión financiera
          </p>
        </div>
        <button className="bg-primary hover:bg-primary-dark text-background px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors">
          <Plus className="w-4 h-4" />
          <span>Nueva Regla</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-text-primary">
                {automationRules.filter(r => r.status === 'active').length}
              </div>
              <div className="text-sm text-text-secondary">Reglas Activas</div>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
            <div>
              <div className="text-2xl font-bold text-text-primary">
                {automationRules.reduce((acc, rule) => acc + rule.executionCount, 0)}
              </div>
              <div className="text-sm text-text-secondary">Ejecuciones Exitosas</div>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-warning/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-warning" />
            </div>
            <div>
              <div className="text-2xl font-bold text-text-primary">24</div>
              <div className="text-sm text-text-secondary">Horas Ahorradas/Mes</div>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-info/20 rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-info" />
            </div>
            <div>
              <div className="text-2xl font-bold text-text-primary">95%</div>
              <div className="text-sm text-text-secondary">Precisión IA</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Filtrar por Tipo</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'Todas', icon: Settings },
            { key: 'financial', label: 'Financieras', icon: Database },
            { key: 'notification', label: 'Notificaciones', icon: Bell },
            { key: 'report', label: 'Reportes', icon: Settings },
            { key: 'integration', label: 'Integraciones', icon: Link }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSelectedType(key)}
              className={`px-4 py-2 rounded-lg border font-medium flex items-center space-x-2 transition-colors ${
                selectedType === key
                  ? 'bg-primary text-background border-primary'
                  : 'bg-surface-light text-text-secondary border-border hover:border-primary/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Automation Rules */}
      <div className="space-y-4">
        {filteredRules.map((rule) => (
          <div key={rule.id} className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-text-primary">{rule.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${typeColors[rule.type]}`}>
                    {rule.type === 'financial' ? 'Financiera' :
                     rule.type === 'notification' ? 'Notificación' :
                     rule.type === 'report' ? 'Reporte' : 'Integración'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[rule.status]}`}>
                    {rule.status === 'active' ? 'Activa' :
                     rule.status === 'paused' ? 'Pausada' : 'Borrador'}
                  </span>
                </div>
                <p className="text-text-secondary mb-4">{rule.description}</p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-text-primary mb-1">Disparador</div>
                    <div className="text-sm text-text-secondary">{rule.trigger}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-text-primary mb-1">Acción</div>
                    <div className="text-sm text-text-secondary">{rule.action}</div>
                  </div>
                  {rule.lastRun && (
                    <div>
                      <div className="text-sm font-medium text-text-primary mb-1">Última Ejecución</div>
                      <div className="text-sm text-text-secondary">{rule.lastRun}</div>
                    </div>
                  )}
                  {rule.nextRun && (
                    <div>
                      <div className="text-sm font-medium text-text-primary mb-1">Próxima Ejecución</div>
                      <div className="text-sm text-text-secondary">{rule.nextRun}</div>
                    </div>
                  )}
                </div>

                <div className="mt-4 text-sm text-text-secondary">
                  Ejecutada {rule.executionCount} veces
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => toggleStatus(rule.id)}
                  disabled={rule.status === 'draft'}
                  className={`p-2 rounded-lg transition-colors ${
                    rule.status === 'active'
                      ? 'text-warning hover:bg-warning/10'
                      : rule.status === 'paused'
                      ? 'text-success hover:bg-success/10'
                      : 'text-text-secondary cursor-not-allowed'
                  }`}
                  title={rule.status === 'active' ? 'Pausar' : 'Activar'}
                >
                  {rule.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button className="p-2 rounded-lg text-text-secondary hover:bg-surface-light transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg text-error hover:bg-error/10 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Setup */}
      <div className="bg-gradient-to-r from-primary/10 to-primary-dark/10 border border-primary/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center space-x-2">
          <Zap className="w-5 h-5 text-primary" />
          <span>Configuración Rápida</span>
        </h3>
        <p className="text-text-secondary mb-6">
          Configura automáticamente las reglas más comunes basadas en las mejores prácticas del libro "Finanzas para Emprendedores".
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <button 
            onClick={() => setupQuickPackage('basic')}
            disabled={isSettingUp}
            className="bg-background hover:bg-surface border border-border rounded-lg p-4 text-left transition-colors group hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="font-medium text-text-primary mb-2 group-hover:text-primary flex items-center space-x-2">
              {isSettingUp && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>}
              <span>Paquete Básico</span>
            </div>
            <div className="text-sm text-text-secondary mb-3">Reportes semanales + Alertas críticas</div>
            <div className="text-xs text-primary font-medium">2 reglas automáticas</div>
          </button>
          <button 
            onClick={() => setupQuickPackage('professional')}
            disabled={isSettingUp}
            className="bg-background hover:bg-surface border border-border rounded-lg p-4 text-left transition-colors group hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="font-medium text-text-primary mb-2 group-hover:text-primary flex items-center space-x-2">
              {isSettingUp && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>}
              <span>Paquete Profesional</span>
            </div>
            <div className="text-sm text-text-secondary mb-3">Básico + Integraciones + IA predictiva</div>
            <div className="text-xs text-primary font-medium">5 reglas automáticas</div>
          </button>
          <button 
            onClick={() => setupQuickPackage('complete')}
            disabled={isSettingUp}
            className="bg-background hover:bg-surface border border-border rounded-lg p-4 text-left transition-colors group hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="font-medium text-text-primary mb-2 group-hover:text-primary flex items-center space-x-2">
              {isSettingUp && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>}
              <span>Paquete Completo</span>
            </div>
            <div className="text-sm text-text-secondary mb-3">Todo incluido + Optimizaciones avanzadas</div>
            <div className="text-xs text-primary font-medium">9 reglas automáticas</div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Automation