import React from 'react'
import { ArrowLeft, ArrowRight, BookOpen, Lightbulb, Target, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'

interface NavigationStep {
  id: string
  title: string
  route: string
  chapter: string
  description: string
  icon: React.ReactNode
}

interface ContextualNavigationProps {
  currentModule: string
  className?: string
}

// Flujo de navegación contextual basado en la secuencia del libro
const NAVIGATION_FLOW: NavigationStep[] = [
  {
    id: 'dashboard',
    title: 'Fundamentos Financieros',
    route: '/app/dashboard',
    chapter: 'Capítulo 1',
    description: 'Conceptos básicos y estados financieros',
    icon: <BookOpen className="w-4 h-4" />
  },
  {
    id: 'cash-flow',
    title: 'Flujo de Efectivo',
    route: '/app/cash-flow',
    chapter: 'Capítulo 3',
    description: 'Gestión de liquidez y proyecciones',
    icon: <TrendingUp className="w-4 h-4" />
  },
  {
    id: 'unit-economics',
    title: 'Unit Economics',
    route: '/app/unit-economics',
    chapter: 'Capítulo 5',
    description: 'LTV, COCA y viabilidad por unidad',
    icon: <Target className="w-4 h-4" />
  },
  {
    id: 'costs-pricing',
    title: 'Costos y Precios',
    route: '/app/costs-pricing',
    chapter: 'Capítulos 6-9',
    description: 'Estructura de costos y estrategia de precios',
    icon: <Lightbulb className="w-4 h-4" />
  },
  {
    id: 'profitability',
    title: 'Rentabilidad y ROI',
    route: '/app/profitability',
    chapter: 'Capítulos 10-12',
    description: 'Análisis de rentabilidad e inversiones',
    icon: <TrendingUp className="w-4 h-4" />
  },
  {
    id: 'planning',
    title: 'Planificación Financiera',
    route: '/app/planning',
    chapter: 'Capítulos 13-15',
    description: 'Metas, presupuestos y escenarios futuros',
    icon: <Target className="w-4 h-4" />
  }
]

// Relaciones entre módulos y qué conceptos conectan
const MODULE_CONNECTIONS = {
  'dashboard': {
    next: 'cash-flow',
    connection: 'Una vez que entiendas los fundamentos, el siguiente paso crítico es dominar tu flujo de efectivo'
  },
  'cash-flow': {
    prev: 'dashboard',
    next: 'unit-economics',
    connection: 'Con el flujo controlado, ahora analiza si cada venta realmente te genera ganancia'
  },
  'unit-economics': {
    prev: 'cash-flow',
    next: 'costs-pricing',
    connection: 'Para optimizar tus unit economics, necesitas entender a fondo tu estructura de costos'
  },
  'costs-pricing': {
    prev: 'unit-economics',
    next: 'profitability',
    connection: 'Una vez optimizados costos y precios, evalúa la rentabilidad total de tu negocio'
  },
  'profitability': {
    prev: 'costs-pricing',
    next: 'planning',
    connection: 'Con rentabilidad clara, ya puedes planificar el crecimiento sostenible'
  },
  'planning': {
    prev: 'profitability',
    connection: 'La planificación es el último paso para asegurar el éxito a largo plazo'
  }
}

export const ContextualNavigation: React.FC<ContextualNavigationProps> = ({ 
  currentModule, 
  className = '' 
}) => {
  const currentIndex = NAVIGATION_FLOW.findIndex(step => step.id === currentModule)
  const currentStep = NAVIGATION_FLOW[currentIndex]
  const prevStep = currentIndex > 0 ? NAVIGATION_FLOW[currentIndex - 1] : null
  const nextStep = currentIndex < NAVIGATION_FLOW.length - 1 ? NAVIGATION_FLOW[currentIndex + 1] : null
  const connections = MODULE_CONNECTIONS[currentModule as keyof typeof MODULE_CONNECTIONS]

  if (currentIndex === -1) return null

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Posición actual en el flujo */}
      <div className="card bg-primary/5 border-primary/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-background text-sm font-bold">
            {currentIndex + 1}
          </div>
          <div>
            <h3 className="font-semibold text-primary">{currentStep.title}</h3>
            <p className="text-sm text-text-secondary">{currentStep.chapter} • {currentStep.description}</p>
          </div>
        </div>
        
        {/* Barra de progreso */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-text-secondary">Progreso del libro:</span>
          <div className="flex-1 bg-surface-light rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentIndex + 1) / NAVIGATION_FLOW.length) * 100}%` }}
            />
          </div>
          <span className="text-xs font-medium text-primary">
            {currentIndex + 1}/{NAVIGATION_FLOW.length}
          </span>
        </div>

        {/* Conexión conceptual */}
        {connections?.connection && (
          <div className="bg-surface-light rounded-lg p-3">
            <p className="text-sm text-text-secondary">
              💡 <strong>Conexión:</strong> {connections.connection}
            </p>
          </div>
        )}
      </div>

      {/* Navegación anterior y siguiente */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Módulo anterior */}
        {prevStep && (
          <Link
            to={prevStep.route}
            className="group card hover:border-primary/30 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-surface-light rounded-lg group-hover:bg-primary/10 transition-colors">
                <ArrowLeft className="w-4 h-4 text-text-secondary group-hover:text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {prevStep.icon}
                  <span className="text-sm font-medium">Anterior</span>
                </div>
                <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">
                  {prevStep.title}
                </h4>
                <p className="text-xs text-text-secondary">{prevStep.chapter}</p>
              </div>
            </div>
          </Link>
        )}

        {/* Módulo siguiente */}
        {nextStep && (
          <Link
            to={nextStep.route}
            className="group card hover:border-primary/30 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="flex-1 text-right">
                <div className="flex items-center justify-end gap-2 mb-1">
                  <span className="text-sm font-medium">Siguiente</span>
                  {nextStep.icon}
                </div>
                <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">
                  {nextStep.title}
                </h4>
                <p className="text-xs text-text-secondary">{nextStep.chapter}</p>
              </div>
              <div className="p-2 bg-surface-light rounded-lg group-hover:bg-primary/10 transition-colors">
                <ArrowRight className="w-4 h-4 text-text-secondary group-hover:text-primary" />
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* Mapa completo del flujo (versión compacta) */}
      <div className="card">
        <h4 className="font-semibold mb-3 text-sm">Mapa de Aprendizaje</h4>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {NAVIGATION_FLOW.map((step, index) => (
            <React.Fragment key={step.id}>
              <Link
                to={step.route}
                className={`flex-shrink-0 group ${
                  step.id === currentModule 
                    ? 'text-primary' 
                    : index < currentIndex 
                    ? 'text-success'
                    : 'text-text-muted'
                }`}
                title={step.title}
              >
                <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-xs font-bold transition-all ${
                  step.id === currentModule
                    ? 'border-primary bg-primary text-background'
                    : index < currentIndex
                    ? 'border-success bg-success text-background'
                    : 'border-text-muted bg-transparent group-hover:border-primary'
                }`}>
                  {index + 1}
                </div>
              </Link>
              {index < NAVIGATION_FLOW.length - 1 && (
                <div className={`w-4 h-0.5 ${
                  index < currentIndex ? 'bg-success' : 'bg-border'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Sugerencia de acción */}
      {nextStep && (
        <div className="card bg-success/5 border-success/20">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-success/10 rounded-lg mt-0.5">
              <Target className="w-4 h-4 text-success" />
            </div>
            <div>
              <h4 className="font-semibold text-success mb-1">Próximo Paso Recomendado</h4>
              <p className="text-sm text-text-secondary mb-3">
                Continúa tu aprendizaje con <strong>{nextStep.title}</strong>. 
                Este módulo te ayudará a {nextStep.description.toLowerCase()}.
              </p>
              <Link
                to={nextStep.route}
                className="btn-sm btn-success flex items-center gap-2 w-fit"
              >
                Continuar Aprendizaje
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje de finalización */}
      {!nextStep && currentIndex === NAVIGATION_FLOW.length - 1 && (
        <div className="card bg-primary/5 border-primary/20">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg mt-0.5">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-primary mb-1">¡Felicitaciones!</h4>
              <p className="text-sm text-text-secondary mb-3">
                Has completado todo el flujo de "Finanzas para Emprendedores". 
                Ahora tienes las herramientas para tomar decisiones financieras informadas.
              </p>
              <div className="flex gap-2">
                <Link to="/reports" className="btn-sm btn-primary">
                  Ver Reportes Completos
                </Link>
                <Link to="/dashboard" className="btn-sm btn-outline">
                  Volver al Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContextualNavigation