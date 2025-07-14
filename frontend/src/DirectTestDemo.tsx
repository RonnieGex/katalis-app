import React from 'react';
import InteractiveDemo from './components/animations/InteractiveDemo';

const DirectTestDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-text-primary text-center mb-8">
          🧪 Test Directo: InteractiveDemo (Sin Lazy Loading)
        </h1>
        
        <div className="bg-surface/50 rounded-xl p-4 mb-8 border border-border">
          <h2 className="text-lg font-medium text-text-primary mb-2">ℹ️ Información de Prueba</h2>
          <p className="text-text-secondary text-sm">
            Esta página carga el componente InteractiveDemo directamente sin lazy loading para diagnosticar problemas.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
            <div>
              <strong className="text-primary">✅ Debe Mostrar:</strong>
              <ul className="text-text-secondary mt-1 space-y-1">
                <li>• Botones Play/Pause/Reset</li>
                <li>• Dashboard con métricas</li>
                <li>• Gráfico de barras animado</li>
                <li>• Panel de IA Insights</li>
              </ul>
            </div>
            <div>
              <strong className="text-primary">🔍 Si no funciona:</strong>
              <ul className="text-text-secondary mt-1 space-y-1">
                <li>• Error en consola del navegador</li>
                <li>• Problema con GSAP</li>
                <li>• Conflicto de CSS/Tailwind</li>
                <li>• Error en el componente</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Componente directo */}
        <div className="border-2 border-dashed border-primary/30 rounded-xl p-4">
          <div className="text-center mb-4">
            <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-medium">
              ⬇️ Componente InteractiveDemo cargando aquí ⬇️
            </span>
          </div>
          
          <InteractiveDemo />
        </div>

        <div className="mt-8 text-center">
          <p className="text-text-secondary text-sm">
            Si ves el demo funcionando aquí, el problema está en el lazy loading de la landing page.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DirectTestDemo;