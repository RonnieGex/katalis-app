import React, { useState } from 'react'
import { Info, Book, Lightbulb, X } from 'lucide-react'

interface TooltipProps {
  type: 'concept' | 'formula' | 'tip' | 'chapter'
  title: string
  content: string
  chapter?: string
  formula?: string
  example?: string
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
}

interface WisdomPillProps {
  title: string
  content: string
  chapter: string
  icon?: React.ReactNode
  variant?: 'primary' | 'success' | 'warning' | 'info'
}

// Tooltips educativos basados en el libro
export const EducationalTooltip: React.FC<TooltipProps> = ({ 
  type, 
  title, 
  content, 
  chapter, 
  formula, 
  example, 
  children, 
  position = 'top' 
}) => {
  const [isVisible, setIsVisible] = useState(false)

  const getIcon = () => {
    switch (type) {
      case 'concept': return <Info className="w-4 h-4" />
      case 'formula': return <span className="text-xs font-bold">fx</span>
      case 'tip': return <Lightbulb className="w-4 h-4" />
      case 'chapter': return <Book className="w-4 h-4" />
      default: return <Info className="w-4 h-4" />
    }
  }

  const getTooltipColor = () => {
    switch (type) {
      case 'concept': return 'bg-primary text-background'
      case 'formula': return 'bg-warning text-background'
      case 'tip': return 'bg-success text-background'
      case 'chapter': return 'bg-purple-500 text-background'
      default: return 'bg-primary text-background'
    }
  }

  const getPositionClasses = () => {
    switch (position) {
      case 'top': return 'bottom-full mb-2 left-1/2 transform -translate-x-1/2'
      case 'bottom': return 'top-full mt-2 left-1/2 transform -translate-x-1/2'
      case 'left': return 'right-full mr-2 top-1/2 transform -translate-y-1/2'
      case 'right': return 'left-full ml-2 top-1/2 transform -translate-y-1/2'
      default: return 'bottom-full mb-2 left-1/2 transform -translate-x-1/2'
    }
  }

  return (
    <div className="relative inline-block">
      <div
        className="cursor-help inline-flex items-center"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
        <div className={`ml-1 ${getTooltipColor()} rounded-full p-1 text-xs`}>
          {getIcon()}
        </div>
      </div>

      {isVisible && (
        <div 
          className={`absolute z-50 ${getPositionClasses()} w-80 max-w-sm`}
          style={{ zIndex: 9999 }}
        >
          <div className="bg-surface border border-border rounded-lg shadow-xl p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-text-primary text-sm">{title}</h4>
              {chapter && (
                <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                  {chapter}
                </span>
              )}
            </div>

            {/* Content */}
            <p className="text-text-secondary text-sm mb-3">{content}</p>

            {/* Formula */}
            {formula && (
              <div className="bg-surface-light rounded-lg p-3 mb-3">
                <div className="text-xs text-text-secondary mb-1">Fórmula:</div>
                <code className="text-sm font-mono text-warning">{formula}</code>
              </div>
            )}

            {/* Example */}
            {example && (
              <div className="bg-success/10 rounded-lg p-3">
                <div className="text-xs text-success mb-1">Ejemplo:</div>
                <div className="text-sm text-text-secondary">{example}</div>
              </div>
            )}

            {/* Pointer */}
            <div 
              className={`absolute w-2 h-2 bg-surface border-l border-b border-border transform rotate-45 ${
                position === 'top' ? 'top-full -mt-1 left-1/2 -translate-x-1/2' :
                position === 'bottom' ? 'bottom-full -mb-1 left-1/2 -translate-x-1/2' :
                position === 'left' ? 'left-full -ml-1 top-1/2 -translate-y-1/2' :
                'right-full -mr-1 top-1/2 -translate-y-1/2'
              }`}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Píldoras de Sabiduría contextual
export const WisdomPill: React.FC<WisdomPillProps> = ({ 
  title, 
  content, 
  chapter, 
  icon, 
  variant = 'primary' 
}) => {
  const [isVisible, setIsVisible] = useState(true)

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary': return 'bg-primary/10 border-primary/20 text-primary'
      case 'success': return 'bg-success/10 border-success/20 text-success'
      case 'warning': return 'bg-warning/10 border-warning/20 text-warning'
      case 'info': return 'bg-blue-500/10 border-blue-500/20 text-blue-500'
      default: return 'bg-primary/10 border-primary/20 text-primary'
    }
  }

  if (!isVisible) return null

  return (
    <div className={`rounded-lg border p-4 mb-4 ${getVariantClasses()}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {icon || <Lightbulb className="w-5 h-5" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-sm">{title}</h4>
            <div className="flex items-center gap-2">
              <span className="text-xs opacity-75">{chapter}</span>
              <button
                onClick={() => setIsVisible(false)}
                className="opacity-50 hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-sm opacity-90">{content}</p>
        </div>
      </div>
    </div>
  )
}

// Constantes de contenido educativo del libro
export const EDUCATIONAL_CONTENT = {
  // Fundamentos Financieros (Capítulo 1)
  REVENUE_VS_PROFIT: {
    title: "Ingresos vs Ganancias",
    content: "Los ingresos son todo el dinero que entra, las ganancias son lo que queda después de pagar todos los costos. Muchos emprendedores confunden alta facturación con rentabilidad.",
    chapter: "Capítulo 1",
    example: "Si vendes $100,000 pero gastas $95,000, tu ganancia es solo $5,000."
  },
  
  CASH_FLOW_IMPORTANCE: {
    title: "Importancia del Flujo de Efectivo",
    content: "Puedes ser rentable en papel pero quebrar por falta de efectivo. El flujo de efectivo es el oxígeno de tu negocio.",
    chapter: "Capítulo 3",
    formula: "Flujo de Efectivo = Ingresos en Efectivo - Egresos en Efectivo"
  },

  // Unit Economics (Capítulo 5)
  UNIT_ECONOMICS: {
    title: "Unit Economics",
    content: "Es analizar si cada venta individual te deja ganancia después de considerar los costos de producción y adquisición de clientes.",
    chapter: "Capítulo 5",
    formula: "Ganancia por Unidad = Precio de Venta - Costos Variables - Costo de Adquisición de Cliente"
  },

  LTV_DEFINITION: {
    title: "Valor de Vida del Cliente (LTV)",
    content: "Es el total de ingresos que esperas recibir de un cliente durante toda su relación contigo. Clave para evaluar cuánto puedes gastar en adquirirlo.",
    chapter: "Capítulo 5",
    formula: "LTV = Margen de Contribución × Frecuencia de Compra × Tiempo de Retención"
  },

  COCA_DEFINITION: {
    title: "Costo de Adquisición de Cliente (COCA)",
    content: "Es el costo total de conseguir un nuevo cliente. Incluye marketing, ventas, tiempo y recursos invertidos.",
    chapter: "Capítulo 5",
    formula: "COCA = Gasto Total en Marketing / Número de Clientes Nuevos"
  },

  // Costos y Precios (Capítulos 6-9)
  FIXED_VS_VARIABLE: {
    title: "Costos Fijos vs Variables",
    content: "Costos fijos no cambian con el volumen (renta, salarios). Variables cambian con cada unidad producida (materiales, comisiones).",
    chapter: "Capítulo 6",
    example: "Renta de $10,000 es fija. Materiales de $50 por producto son variables."
  },

  BREAK_EVEN: {
    title: "Punto de Equilibrio",
    content: "El nivel de ventas donde no ganas ni pierdes dinero. Es tu objetivo mínimo mensual para no quebrar.",
    chapter: "Capítulo 7",
    formula: "Punto de Equilibrio = Costos Fijos / Margen de Contribución por Unidad"
  },

  CONTRIBUTION_MARGIN: {
    title: "Margen de Contribución",
    content: "Lo que sobra de cada venta para cubrir costos fijos y generar ganancia. Base para todas las decisiones de precios.",
    chapter: "Capítulo 7",
    formula: "Margen de Contribución = Precio de Venta - Costos Variables"
  },

  // Rentabilidad (Capítulos 10-12)
  ROI_ANALYSIS: {
    title: "Retorno sobre Inversión (ROI)",
    content: "Mide qué tanto dinero generas por cada peso invertido. Esencial para evaluar proyectos y decisiones de inversión.",
    chapter: "Capítulo 10",
    formula: "ROI = (Ganancia - Inversión) / Inversión × 100"
  },

  GROSS_MARGIN: {
    title: "Margen Bruto",
    content: "Porcentaje de ingresos que queda después de pagar el costo directo de producir tus productos o servicios.",
    chapter: "Capítulo 11",
    formula: "Margen Bruto = (Ingresos - Costo de Ventas) / Ingresos × 100"
  },

  EBITDA: {
    title: "EBITDA",
    content: "Ganancias antes de intereses, impuestos, depreciación y amortización. Muestra la rentabilidad operativa pura de tu negocio.",
    chapter: "Capítulo 12",
    formula: "EBITDA = Utilidad Operativa + Depreciación + Amortización"
  },

  // Planeación Financiera (Capítulos 13-15)
  FINANCIAL_PROJECTIONS: {
    title: "Proyecciones Financieras",
    content: "Estimaciones de ingresos, gastos y flujo de efectivo futuro. Te ayudan a planificar y tomar decisiones informadas.",
    chapter: "Capítulo 13",
    example: "Proyectar ventas de los próximos 12 meses basado en tendencias históricas."
  },

  SCENARIO_PLANNING: {
    title: "Planificación de Escenarios",
    content: "Preparar múltiples planes basados en diferentes situaciones (optimista, pesimista, realista). Reduce riesgos e incertidumbre.",
    chapter: "Capítulo 14",
    example: "Plan A: crecimiento 30%, Plan B: crecimiento 10%, Plan C: decrecimiento 10%"
  }
}

// Píldoras de sabiduría predefinidas
export const WISDOM_PILLS = {
  CASH_IS_KING: {
    title: "El Efectivo es Rey",
    content: "Un negocio rentable puede quebrar por falta de efectivo. Siempre mantén un colchón de 3-6 meses de gastos operativos.",
    chapter: "Capítulo 3",
    variant: 'warning' as const
  },

  PROFITABLE_GROWTH: {
    title: "Crecimiento Rentable",
    content: "Crecer sin rentabilidad es como llenar una cubeta con agujeros. Asegúrate de que cada cliente nuevo te genere más dinero del que cuesta conseguirlo.",
    chapter: "Capítulo 5",
    variant: 'success' as const
  },

  KNOW_YOUR_NUMBERS: {
    title: "Conoce Tus Números",
    content: "No puedes mejorar lo que no mides. Los emprendedores exitosos revisan sus métricas financieras semanalmente.",
    chapter: "Capítulo 1",
    variant: 'primary' as const
  },

  AUTOMATION_POWER: {
    title: "El Poder de la Automatización",
    content: "Automatizar reportes y análisis te ahorra 80% del tiempo en tareas administrativas y reduce errores humanos.",
    chapter: "Capítulo 8",
    variant: 'info' as const
  }
}