import React, { useState, useEffect } from 'react'
import { CheckCircle, Circle, Lock, Star, Trophy, BookOpen, Target } from 'lucide-react'

interface LearningModule {
  id: string
  title: string
  chapter: string
  difficulty: 'basic' | 'intermediate' | 'advanced'
  estimatedTime: string
  prerequisites: string[]
  learningPath: string
  status: 'locked' | 'available' | 'in_progress' | 'completed'
  progress: number
  route: string
}

interface LearningProgressProps {
  currentModule?: string
  onNavigate: (route: string) => void
}

// Flujo de aprendizaje progresivo basado en el libro
const LEARNING_MODULES: LearningModule[] = [
  {
    id: 'fundamentals',
    title: 'Fundamentos Financieros',
    chapter: 'Capítulo 1',
    difficulty: 'basic',
    estimatedTime: '15 min',
    prerequisites: [],
    learningPath: 'foundation',
    status: 'available',
    progress: 0,
    route: '/guias-del-libro'
  },
  {
    id: 'cash-flow',
    title: 'Gestión de Flujo de Efectivo',
    chapter: 'Capítulo 3',
    difficulty: 'basic',
    estimatedTime: '20 min',
    prerequisites: ['fundamentals'],
    learningPath: 'foundation',
    status: 'locked',
    progress: 0,
    route: '/app/cash-flow'
  },
  {
    id: 'unit-economics',
    title: 'Unit Economics y LTV/COCA',
    chapter: 'Capítulo 5',
    difficulty: 'intermediate',
    estimatedTime: '25 min',
    prerequisites: ['cash-flow'],
    learningPath: 'analysis',
    status: 'locked',
    progress: 0,
    route: '/app/unit-economics'
  },
  {
    id: 'costs-pricing',
    title: 'Costos y Estrategia de Precios',
    chapter: 'Capítulos 6-9',
    difficulty: 'intermediate',
    estimatedTime: '30 min',
    prerequisites: ['unit-economics'],
    learningPath: 'analysis',
    status: 'locked',
    progress: 0,
    route: '/app/costs-pricing'
  },
  {
    id: 'profitability',
    title: 'Análisis de Rentabilidad y ROI',
    chapter: 'Capítulos 10-12',
    difficulty: 'intermediate',
    estimatedTime: '25 min',
    prerequisites: ['costs-pricing'],
    learningPath: 'optimization',
    status: 'locked',
    progress: 0,
    route: '/app/profitability'
  },
  {
    id: 'planning',
    title: 'Planificación Financiera',
    chapter: 'Capítulos 13-15',
    difficulty: 'advanced',
    estimatedTime: '35 min',
    prerequisites: ['profitability'],
    learningPath: 'strategy',
    status: 'locked',
    progress: 0,
    route: '/app/planning'
  }
]

const LEARNING_PATHS = {
  foundation: { 
    name: 'Fundamentos', 
    color: 'text-blue-500', 
    bgColor: 'bg-blue-500/10',
    description: 'Conceptos básicos esenciales'
  },
  analysis: { 
    name: 'Análisis', 
    color: 'text-green-500', 
    bgColor: 'bg-green-500/10',
    description: 'Herramientas de análisis financiero'
  },
  optimization: { 
    name: 'Optimización', 
    color: 'text-yellow-500', 
    bgColor: 'bg-yellow-500/10',
    description: 'Mejora de rentabilidad'
  },
  strategy: { 
    name: 'Estrategia', 
    color: 'text-purple-500', 
    bgColor: 'bg-purple-500/10',
    description: 'Planificación a largo plazo'
  }
}

export const LearningProgress: React.FC<LearningProgressProps> = ({ 
  currentModule, 
  onNavigate 
}) => {
  const [modules, setModules] = useState<LearningModule[]>(LEARNING_MODULES)
  const [expandedPath, setExpandedPath] = useState<string | null>('foundation')

  // Simular progreso del usuario
  useEffect(() => {
    const updatedModules = modules.map(module => {
      if (module.id === 'fundamentals') {
        return { ...module, status: 'completed' as const, progress: 100 }
      }
      if (module.id === 'cash-flow') {
        return { ...module, status: 'in_progress' as const, progress: 60 }
      }
      if (module.id === 'unit-economics') {
        return { ...module, status: 'available' as const }
      }
      return module
    })
    setModules(updatedModules)
  }, [])

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'basic': return <Circle className="w-4 h-4" />
      case 'intermediate': return <Target className="w-4 h-4" />
      case 'advanced': return <Star className="w-4 h-4" />
      default: return <Circle className="w-4 h-4" />
    }
  }

  const getStatusIcon = (status: string, progress: number) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-success" />
      case 'in_progress': return (
        <div className="relative w-5 h-5">
          <Circle className="w-5 h-5 text-primary" />
          <div 
            className="absolute inset-0 rounded-full border-2 border-primary"
            style={{
              background: `conic-gradient(from 0deg, #3ECF8E ${progress * 3.6}deg, transparent ${progress * 3.6}deg)`
            }}
          />
        </div>
      )
      case 'available': return <Circle className="w-5 h-5 text-primary" />
      case 'locked': return <Lock className="w-5 h-5 text-text-muted" />
      default: return <Circle className="w-5 h-5 text-text-muted" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-success'
      case 'in_progress': return 'text-primary'
      case 'available': return 'text-text-primary'
      case 'locked': return 'text-text-muted'
      default: return 'text-text-muted'
    }
  }

  const calculateOverallProgress = () => {
    const totalModules = modules.length
    const completedWeight = modules.filter(m => m.status === 'completed').length * 100
    const inProgressWeight = modules.filter(m => m.status === 'in_progress').reduce((sum, m) => sum + m.progress, 0)
    return Math.round((completedWeight + inProgressWeight) / (totalModules * 100) * 100)
  }

  const groupModulesByPath = () => {
    const groups: { [key: string]: LearningModule[] } = {}
    modules.forEach(module => {
      if (!groups[module.learningPath]) {
        groups[module.learningPath] = []
      }
      groups[module.learningPath].push(module)
    })
    return groups
  }

  const moduleGroups = groupModulesByPath()
  const overallProgress = calculateOverallProgress()

  return (
    <div className="space-y-6">
      {/* Header con progreso general */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Tu Progreso de Aprendizaje
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-secondary">Progreso Total:</span>
            <div className="flex items-center gap-2">
              <div className="w-20 bg-surface-light rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <span className="text-sm font-bold text-primary">{overallProgress}%</span>
            </div>
          </div>
        </div>

        {overallProgress < 30 && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
            <p className="text-sm text-primary">
              💡 <strong>Consejo:</strong> Completa los módulos en orden para maximizar tu aprendizaje. 
              Cada concepto se construye sobre el anterior.
            </p>
          </div>
        )}

        {overallProgress >= 80 && (
          <div className="bg-success/10 border border-success/20 rounded-lg p-3 flex items-center gap-3">
            <Trophy className="w-5 h-5 text-success" />
            <p className="text-sm text-success">
              <strong>¡Excelente progreso!</strong> Estás dominando las finanzas para emprendedores. 
              Considera aplicar estos conceptos en tu negocio real.
            </p>
          </div>
        )}
      </div>

      {/* Rutas de aprendizaje */}
      <div className="space-y-4">
        {Object.entries(moduleGroups).map(([pathKey, pathModules]) => {
          const pathInfo = LEARNING_PATHS[pathKey as keyof typeof LEARNING_PATHS]
          const pathProgress = Math.round(
            pathModules.reduce((sum, m) => sum + (m.status === 'completed' ? 100 : m.progress), 0) / 
            (pathModules.length * 100) * 100
          )
          
          return (
            <div key={pathKey} className="card">
              <button
                onClick={() => setExpandedPath(expandedPath === pathKey ? null : pathKey)}
                className="w-full flex items-center justify-between p-0 bg-transparent border-none"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      const firstAvailableModule = pathModules.find(m => m.status !== 'locked')
                      if (firstAvailableModule) {
                        onNavigate(firstAvailableModule.route)
                      }
                    }}
                    className={`w-10 h-10 rounded-lg ${pathInfo.bgColor} flex items-center justify-center hover:scale-105 transition-transform cursor-pointer`}
                  >
                    <span className={`text-sm font-bold ${pathInfo.color}`}>
                      {pathModules.length}
                    </span>
                  </button>
                  <div className="text-left">
                    <h4 className="font-semibold">{pathInfo.name}</h4>
                    <p className="text-text-secondary text-sm">{pathInfo.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-16 bg-surface-light rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${pathInfo.color.replace('text-', 'bg-')}`}
                      style={{ width: `${pathProgress}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{pathProgress}%</span>
                </div>
              </button>

              {expandedPath === pathKey && (
                <div className="mt-4 space-y-3">
                  {pathModules.map((module) => (
                    <div 
                      key={module.id}
                      className={`p-4 rounded-lg border transition-all duration-200 ${
                        currentModule === module.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border bg-surface-light'
                      } ${
                        module.status === 'locked' ? 'opacity-60' : 'hover:bg-surface'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(module.status, module.progress)}
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className={`font-medium ${getStatusColor(module.status)}`}>
                                {module.title}
                              </h5>
                              <span className="text-xs text-text-muted">{module.chapter}</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-text-secondary">
                              <span className="flex items-center gap-1">
                                {getDifficultyIcon(module.difficulty)}
                                {module.difficulty === 'basic' ? 'Básico' : 
                                 module.difficulty === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                              </span>
                              <span>⏱️ {module.estimatedTime}</span>
                              {module.prerequisites.length > 0 && (
                                <span>📋 Prerrequisitos: {module.prerequisites.length}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {module.status !== 'locked' && (
                          <button
                            onClick={() => onNavigate(module.route)}
                            className={`btn-sm ${
                              module.status === 'completed' 
                                ? 'btn-ghost' 
                                : module.status === 'in_progress'
                                ? 'btn-primary'
                                : 'btn-outline'
                            }`}
                          >
                            {module.status === 'completed' ? 'Revisar' :
                             module.status === 'in_progress' ? 'Continuar' : 'Comenzar'}
                          </button>
                        )}
                      </div>
                      
                      {module.status === 'in_progress' && module.progress > 0 && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
                            <span>Progreso del módulo</span>
                            <span>{module.progress}%</span>
                          </div>
                          <div className="w-full bg-surface rounded-full h-1">
                            <div 
                              className="bg-primary h-1 rounded-full transition-all duration-500"
                              style={{ width: `${module.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default LearningProgress