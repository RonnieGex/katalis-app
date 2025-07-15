import React from 'react'
import { Info, BarChart3, BookOpen, Brain } from 'lucide-react'
import ContentTypeBadge, { CONTENT_TYPE_CONFIG } from './ContentTypeBadge'

interface ContentTypeGuideProps {
  className?: string
}

const ContentTypeGuide: React.FC<ContentTypeGuideProps> = ({
  className = ''
}) => {
  return (
    <div className={`bg-surface border border-border rounded-xl p-6 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <Info className="w-5 h-5 text-text-secondary" />
        <h3 className="text-lg font-semibold text-text-primary">Tipos de Contenido</h3>
      </div>
      
      <p className="text-text-secondary text-sm mb-6">
        KatalisApp organiza el contenido en tres categorías principales para ayudarte a navegar eficientemente:
      </p>

      <div className="space-y-4">
        {Object.entries(CONTENT_TYPE_CONFIG).map(([key, config]) => (
          <div key={key} className="flex items-start space-x-4 p-4 bg-surface-light rounded-lg border border-border">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              key === 'company' ? 'bg-cyan-500/10 text-cyan-400' :
              key === 'educational' ? 'bg-emerald-500/10 text-emerald-400' :
              'bg-violet-500/10 text-violet-400'
            }`}>
              <config.icon className="w-6 h-6" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold text-text-primary">{config.name}</h4>
                <ContentTypeBadge type={key as any} size="sm" />
              </div>
              <p className="text-text-secondary text-sm">{config.description}</p>
              
              {/* Example features */}
              <div className="mt-3">
                <span className="text-xs font-medium text-text-secondary mb-2 block">Incluye:</span>
                <div className="flex flex-wrap gap-2">
                  {key === 'company' && (
                    <>
                      <span className="text-xs bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded">Dashboard</span>
                      <span className="text-xs bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded">Flujo de Caja</span>
                      <span className="text-xs bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded">Reportes</span>
                    </>
                  )}
                  {key === 'educational' && (
                    <>
                      <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded">Guías del Libro</span>
                      <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded">Conceptos</span>
                      <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded">Tutoriales</span>
                    </>
                  )}
                  {key === 'ai' && (
                    <>
                      <span className="text-xs bg-violet-500/10 text-violet-400 px-2 py-1 rounded">Agentes IA</span>
                      <span className="text-xs bg-violet-500/10 text-violet-400 px-2 py-1 rounded">Automatización</span>
                      <span className="text-xs bg-violet-500/10 text-violet-400 px-2 py-1 rounded">Análisis</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <p className="text-text-secondary text-sm">
          <strong className="text-primary">💡 Tip:</strong> Busca estos indicadores visuales en toda la aplicación 
          para identificar rápidamente el tipo de contenido que estás viendo.
        </p>
      </div>
    </div>
  )
}

export default ContentTypeGuide