import React, { useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

const TestInteractiveDemo: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [debugLog, setDebugLog] = useState<string[]>(['Componente inicializado']);

  const addLog = (message: string) => {
    setDebugLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const toggleSimulation = () => {
    setIsPlaying(!isPlaying);
    addLog(`${isPlaying ? 'Pausando' : 'Iniciando'} simulación`);
  };

  const resetDemo = () => {
    setIsPlaying(false);
    addLog('Demo reiniciado');
  };

  return (
    <div className="p-8 bg-surface min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-8">
          🧪 Test: Demo Interactivo Simplificado
        </h1>

        {/* Controls */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={toggleSimulation}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              isPlaying 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-primary text-black hover:bg-green-600'
            }`}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            <span>{isPlaying ? 'Pausar Demo' : 'Iniciar Demo'}</span>
          </button>
          
          <button
            onClick={resetDemo}
            className="flex items-center space-x-2 px-6 py-3 bg-surface-light border border-border text-text-primary rounded-lg hover:bg-surface hover:border-primary transition-all"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Reiniciar</span>
          </button>

          {isPlaying && (
            <div className="flex items-center space-x-2 text-primary">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm">Demo activo</span>
            </div>
          )}
        </div>

        {/* Simple Dashboard */}
        <div className="bg-surface-light rounded-xl p-6 border border-border mb-8">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            Dashboard Financiero Simplificado
          </h2>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            {['Ingresos', 'Gastos', 'Ganancia'].map((metric, index) => (
              <div key={metric} className="bg-surface rounded-lg p-4 border border-border">
                <h3 className="text-text-secondary text-sm mb-2">{metric}</h3>
                <div className={`text-2xl font-bold ${isPlaying ? 'animate-pulse text-primary' : 'text-text-primary'}`}>
                  ${(Math.random() * 50000 + 10000).toFixed(0)}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-surface rounded-lg p-4 border border-border">
            <h3 className="text-text-primary font-medium mb-3">Gráfico Simulado</h3>
            <div className="flex items-end space-x-2 h-32">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`bg-primary rounded-t transition-all duration-1000 flex-1 ${
                    isPlaying ? 'animate-pulse' : ''
                  }`}
                  style={{
                    height: `${Math.random() * 80 + 20}%`,
                    backgroundColor: isPlaying ? '#3ECF8E' : '#2BA672'
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Debug Log */}
        <div className="bg-black rounded-xl p-4 border border-gray-600">
          <h3 className="text-white font-mono mb-3">🔍 Debug Log:</h3>
          <div className="text-green-400 font-mono text-sm space-y-1 max-h-40 overflow-y-auto">
            {debugLog.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="mt-6 text-center">
          <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${
            isPlaying ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-sm font-medium">
              Status: {isPlaying ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestInteractiveDemo;