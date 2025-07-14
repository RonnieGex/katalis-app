import React, { useState } from 'react'
import { Play, RotateCcw, BookOpen, Target, TrendingUp } from 'lucide-react'

interface ExampleScenario {
  id: string
  title: string
  description: string
  chapter: string
  category: 'unit-economics' | 'costs-pricing' | 'profitability' | 'planning' | 'cash-flow'
  difficulty: 'basic' | 'intermediate' | 'advanced'
  data: any
  expectedResults: {
    key: string
    value: string
    explanation: string
  }[]
  learningObjectives: string[]
}

interface ExampleScenariosProps {
  category: 'unit-economics' | 'costs-pricing' | 'profitability' | 'planning' | 'cash-flow'
  onApplyScenario: (data: any) => void
}

// Ejemplos prácticos del libro por categoría
const EXAMPLE_SCENARIOS: ExampleScenario[] = [
  // Unit Economics Examples
  {
    id: 'restaurante-familiar',
    title: 'Restaurante Familiar "La Abuela"',
    description: 'Un restaurante familiar que quiere entender si puede crecer sin quebrar. Caso real del Capítulo 5.',
    chapter: 'Capítulo 5',
    category: 'unit-economics',
    difficulty: 'basic',
    data: {
      pricePerUnit: 150, // Precio promedio por comensal
      variableCosts: 45, // Costo de alimentos por plato
      marketingSpend: 8000, // Gasto mensual en marketing local
      newCustomers: 80, // Nuevos clientes por mes
      avgPurchaseFreq: 1.5, // Visitas por mes por cliente
      retentionMonths: 18 // Tiempo promedio de relación
    },
    expectedResults: [
      {
        key: 'LTV/COCA Ratio',
        value: '3.8x',
        explanation: 'Ratio saludable. Por cada peso invertido en conseguir un cliente, recuperas $3.80'
      },
      {
        key: 'Margen de Contribución',
        value: '$105',
        explanation: 'Cada comensal deja $105 para cubrir costos fijos (renta, salarios, etc.)'
      },
      {
        key: 'Payback Period',
        value: '0.6 meses',
        explanation: 'Recuperas la inversión en conseguir el cliente en menos de 1 mes'
      }
    ],
    learningObjectives: [
      'Entender cómo calcular Unit Economics en servicios',
      'Aprender la importancia de la frecuencia de compra',
      'Ver cómo un margen alto compensa marketing costoso'
    ]
  },
  {
    id: 'tienda-online',
    title: 'Tienda Online "TechGadgets"',
    description: 'E-commerce de gadgets tecnológicos con alta competencia. Ejemplo avanzado del libro.',
    chapter: 'Capítulo 5',
    category: 'unit-economics',
    difficulty: 'intermediate',
    data: {
      pricePerUnit: 85,
      variableCosts: 35,
      marketingSpend: 25000,
      newCustomers: 200,
      avgPurchaseFreq: 0.8, // Compra menos frecuente
      retentionMonths: 8 // Menos lealtad en tech
    },
    expectedResults: [
      {
        key: 'LTV/COCA Ratio',
        value: '2.6x',
        explanation: 'Ratio marginal. Necesita optimización en retención o reducir costos de adquisición'
      },
      {
        key: 'COCA Alto',
        value: '$125',
        explanation: 'Costo de adquisición alto por competencia en digital'
      },
      {
        key: 'Riesgo',
        value: 'Medio',
        explanation: 'Rentable pero vulnerable a cambios en costos de marketing'
      }
    ],
    learningObjectives: [
      'Analizar impacto de competencia en COCA',
      'Entender cómo la baja frecuencia afecta LTV',
      'Estrategias para mejorar ratios marginales'
    ]
  },

  // Costs & Pricing Examples
  {
    id: 'panaderia-artesanal',
    title: 'Panadería Artesanal "Pan del Campo"',
    description: 'Panadería que necesita definir precios para productos premium vs económicos.',
    chapter: 'Capítulo 7',
    category: 'costs-pricing',
    difficulty: 'basic',
    data: {
      products: [
        { name: 'Pan Artesanal', variableCost: 12, targetMargin: 65, volume: 200 },
        { name: 'Pan Económico', variableCost: 6, targetMargin: 40, volume: 500 },
        { name: 'Pasteles Premium', variableCost: 25, targetMargin: 80, volume: 80 }
      ],
      fixedCosts: 15000, // Renta, salarios, etc.
      totalVolume: 780
    },
    expectedResults: [
      {
        key: 'Precio Pan Artesanal',
        value: '$34.30',
        explanation: 'Precio necesario para mantener 65% de margen y cubrir costos fijos'
      },
      {
        key: 'Punto de Equilibrio',
        value: '720 unidades',
        explanation: 'Necesita vender 720 productos mixtos para no perder dinero'
      },
      {
        key: 'Mix de Productos',
        value: 'Optimizado',
        explanation: 'Productos premium compensan márgenes bajos de productos económicos'
      }
    ],
    learningObjectives: [
      'Calcular precios basados en costos y márgenes objetivo',
      'Entender el concepto de mix de productos',
      'Analizar punto de equilibrio con múltiples productos'
    ]
  },

  // Profitability Examples
  {
    id: 'consultora-marketing',
    title: 'Consultora "Digital Success"',
    description: 'Consultora que evalúa la rentabilidad de diferentes servicios y clientes.',
    chapter: 'Capítulo 11',
    category: 'profitability',
    difficulty: 'intermediate',
    data: {
      services: [
        { name: 'Consultoría Premium', revenue: 180000, costs: 65000, time: 40 },
        { name: 'Implementación Digital', revenue: 120000, costs: 85000, time: 60 },
        { name: 'Capacitación Teams', revenue: 45000, costs: 15000, time: 20 }
      ],
      operatingExpenses: 25000,
      investments: [
        { name: 'Certificaciones', cost: 15000, monthlyReturn: 4500, duration: 12 },
        { name: 'Software Especializado', cost: 8000, monthlyReturn: 2200, duration: 24 }
      ]
    },
    expectedResults: [
      {
        key: 'Servicio Más Rentable',
        value: 'Consultoría Premium',
        explanation: 'Mayor margen (64%) y mejor ratio tiempo/ganancia'
      },
      {
        key: 'ROI Certificaciones',
        value: '260%',
        explanation: 'Inversión en certificaciones genera retorno excelente'
      },
      {
        key: 'Margen EBITDA',
        value: '28%',
        explanation: 'Margen operativo saludable para consultora'
      }
    ],
    learningObjectives: [
      'Comparar rentabilidad entre servicios diferentes',
      'Calcular ROI de inversiones en capacitación',
      'Entender EBITDA en servicios profesionales'
    ]
  },

  // Financial Planning Examples
  {
    id: 'expansion-gym',
    title: 'Expansión Gimnasio "FitLife"',
    description: 'Gimnasio planificando apertura de segunda sucursal con diferentes escenarios.',
    chapter: 'Capítulo 14',
    category: 'planning',
    difficulty: 'advanced',
    data: {
      currentRevenue: 180000,
      expansionCost: 350000,
      scenarios: [
        { name: 'Optimista', probability: 30, revenueGrowth: 85, costIncrease: 60 },
        { name: 'Base', probability: 50, revenueGrowth: 50, costIncrease: 45 },
        { name: 'Pesimista', probability: 20, revenueGrowth: 20, costIncrease: 35 }
      ],
      timeframe: 24 // meses para evaluación
    },
    expectedResults: [
      {
        key: 'ROI Esperado',
        value: '34%',
        explanation: 'ROI promedio ponderado considerando probabilidades'
      },
      {
        key: 'Payback Period',
        value: '18 meses',
        explanation: 'Tiempo promedio para recuperar inversión inicial'
      },
      {
        key: 'Riesgo',
        value: 'Moderado',
        explanation: 'Proyecto viable pero requiere monitoreo cercano en primeros 12 meses'
      }
    ],
    learningObjectives: [
      'Aplicar análisis de escenarios en decisiones de inversión',
      'Calcular ROI ponderado por probabilidades',
      'Evaluar riesgos en proyectos de expansión'
    ]
  },

  // Cash Flow Example
  {
    id: 'cafeteria-liquidez',
    title: 'Cafetería "Espresso Express"',
    description: 'Una cafetería que debe gestionar su flujo de caja estacional con temporadas altas y bajas.',
    chapter: 'Capítulo 3',
    category: 'cash-flow',
    difficulty: 'basic',
    data: {
      currentRevenue: 85000,
      seasonalVariation: 30, // 30% de variación estacional
      fixedCosts: 35000,
      variableCosts: 25000
    },
    expectedResults: [
      {
        key: 'Flujo Promedio',
        value: '$25,000',
        explanation: 'Flujo positivo promedio mensual después de gastos operativos'
      },
      {
        key: 'Reserva Mínima',
        value: '$45,000',
        explanation: 'Efectivo mínimo necesario para cubrir 3 meses de temporada baja'
      },
      {
        key: 'Alerta Temprana',
        value: '15 días',
        explanation: 'Días de anticipación para detectar problemas de liquidez'
      }
    ],
    learningObjectives: [
      'Entender la importancia del efectivo en negocios estacionales',
      'Calcular reservas de efectivo necesarias',
      'Implementar alertas tempranas de liquidez'
    ]
  }
]

export const ExampleScenarios: React.FC<ExampleScenariosProps> = ({ 
  category, 
  onApplyScenario 
}) => {
  const [selectedExample, setSelectedExample] = useState<ExampleScenario | null>(null)
  const [showResults, setShowResults] = useState(false)

  const scenarios = EXAMPLE_SCENARIOS.filter(s => s.category === category)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'basic': return 'bg-success/20 text-success border-success/30'
      case 'intermediate': return 'bg-warning/20 text-warning border-warning/30'
      case 'advanced': return 'bg-error/20 text-error border-error/30'
      default: return 'bg-primary/20 text-primary border-primary/30'
    }
  }

  const applyExample = (scenario: ExampleScenario) => {
    onApplyScenario(scenario.data)
    setSelectedExample(scenario)
    setShowResults(true)
  }

  const resetExample = () => {
    setSelectedExample(null)
    setShowResults(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Ejemplos Prácticos del Libro
        </h3>
        {selectedExample && (
          <button
            onClick={resetExample}
            className="btn-ghost flex items-center gap-2 text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Limpiar Ejemplo
          </button>
        )}
      </div>

      {/* Lista de ejemplos disponibles */}
      <div className="grid gap-4">
        {scenarios.map((scenario) => (
          <div 
            key={scenario.id} 
            className={`card transition-all duration-200 ${
              selectedExample?.id === scenario.id ? 'ring-2 ring-primary' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-semibold">{scenario.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full border ${getDifficultyColor(scenario.difficulty)}`}>
                    {scenario.difficulty === 'basic' ? 'Básico' : 
                     scenario.difficulty === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                  </span>
                </div>
                <p className="text-text-secondary text-sm mb-2">{scenario.description}</p>
                <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                  {scenario.chapter}
                </span>
              </div>
              <button
                onClick={() => applyExample(scenario)}
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <Play className="w-4 h-4" />
                Aplicar
              </button>
            </div>

            {/* Objetivos de aprendizaje */}
            <div className="bg-surface-light rounded-lg p-3">
              <h5 className="text-xs font-medium text-text-secondary mb-2">Aprenderás:</h5>
              <ul className="text-xs text-text-secondary space-y-1">
                {scenario.learningObjectives.map((objective, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Target className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                    {objective}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Resultados esperados del ejemplo seleccionado */}
      {selectedExample && showResults && (
        <div className="card bg-primary/5 border-primary/20">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Resultados del Ejemplo: {selectedExample.title}
          </h4>
          
          <div className="grid gap-4">
            {selectedExample.expectedResults.map((result, index) => (
              <div key={index} className="bg-surface rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{result.key}</span>
                  <span className="text-primary font-bold">{result.value}</span>
                </div>
                <p className="text-text-secondary text-sm">{result.explanation}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-success/10 border border-success/20 rounded-lg">
            <p className="text-sm text-success">
              💡 <strong>Consejo del libro:</strong> Estos números son realistas basados en casos reales. 
              Úsalos como referencia para evaluar tu propio negocio.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExampleScenarios