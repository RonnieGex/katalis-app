import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  DollarSign,
  TrendingUp,
  PieChart,
  Calculator,
  Brain,
  Sparkles
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const DemoPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeModule, setActiveModule] = useState('dashboard');
  const [isSimulating, setIsSimulating] = useState(false);

  const modules = [
    {
      id: 'dashboard',
      name: 'Dashboard Principal',
      icon: <DollarSign className="w-6 h-6" />,
      color: '#3ECF8E',
      description: 'Vista general de tus finanzas en tiempo real'
    },
    {
      id: 'cashflow',
      name: 'Flujo de Efectivo',
      icon: <TrendingUp className="w-6 h-6" />,
      color: '#10B981',
      description: 'Controla entradas y salidas de dinero'
    },
    {
      id: 'profitability',
      name: 'Análisis de Rentabilidad',
      icon: <PieChart className="w-6 h-6" />,
      color: '#2BA672',
      description: 'Identifica tus productos más rentables'
    },
    {
      id: 'costs',
      name: 'Gestión de Costos',
      icon: <Calculator className="w-6 h-6" />,
      color: '#059669',
      description: 'Calcula punto de equilibrio y optimiza precios'
    },
    {
      id: 'ai',
      name: 'IA Financiero',
      icon: <Brain className="w-6 h-6" />,
      color: '#065F46',
      description: 'Predicciones y recomendaciones inteligentes'
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.demo-module',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "back.out(1.7)"
        }
      );

      gsap.fromTo('.demo-content',
        { opacity: 0, x: 50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          delay: 0.3
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [activeModule]);

  const renderModuleContent = () => {
    switch (activeModule) {
      case 'dashboard':
        return (
          <div className="demo-content bg-surface rounded-2xl p-6 border border-border">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-surface-light rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary">$125,430</div>
                <div className="text-sm text-text-secondary">Ingresos Mes</div>
              </div>
              <div className="bg-surface-light rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-success">32.1%</div>
                <div className="text-sm text-text-secondary">Margen</div>
              </div>
              <div className="bg-surface-light rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-warning">$89,200</div>
                <div className="text-sm text-text-secondary">Gastos Mes</div>
              </div>
              <div className="bg-surface-light rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary">$36,230</div>
                <div className="text-sm text-text-secondary">Ganancia</div>
              </div>
            </div>
            
            <div className="bg-surface-light rounded-lg p-4 h-48">
              <h4 className="text-text-primary font-semibold mb-4">Tendencia Mensual</h4>
              <div className="flex items-end justify-between h-32 space-x-2">
                {[40, 65, 45, 80, 60, 90, 75].map((height, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-primary rounded-t transition-all duration-1000"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-text-secondary mt-1">
                      {['E', 'F', 'M', 'A', 'M', 'J', 'J'][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'cashflow':
        return (
          <div className="demo-content bg-surface rounded-2xl p-6 border border-border">
            <h3 className="text-xl font-bold text-text-primary mb-4">Proyección de Flujo de Efectivo</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-surface-light rounded-lg">
                <span className="text-text-secondary">Ingresos Proyectados</span>
                <span className="text-success font-semibold">+$45,000</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-surface-light rounded-lg">
                <span className="text-text-secondary">Gastos Fijos</span>
                <span className="text-error font-semibold">-$28,000</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-surface-light rounded-lg">
                <span className="text-text-secondary">Gastos Variables</span>
                <span className="text-error font-semibold">-$12,500</span>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                  <span className="text-text-primary font-semibold">Flujo Neto</span>
                  <span className="text-primary font-bold text-lg">+$4,500</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-success/10 border border-success/30 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-4 h-4 text-success" />
                <span className="text-success font-medium">Estado: Saludable</span>
              </div>
              <p className="text-text-secondary text-sm">
                Tu flujo de efectivo está proyectado a crecer 18% este trimestre.
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="demo-content bg-surface rounded-2xl p-6 border border-border">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">Módulo en Desarrollo</h3>
              <p className="text-text-secondary">
                Este módulo estará disponible en la versión completa de KatalisApp
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                to="/"
                className="flex items-center space-x-2 text-text-secondary hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Volver al Inicio</span>
              </Link>
              <div className="w-px h-6 bg-border" />
              <h1 className="text-xl font-bold text-text-primary">Demo Interactivo</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSimulating(!isSimulating)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  isSimulating 
                    ? 'bg-error text-text-primary' 
                    : 'bg-primary text-background'
                }`}
              >
                {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isSimulating ? 'Pausar' : 'Simular'}</span>
              </button>
              
              <Link
                to="/register"
                className="bg-gradient-to-r from-primary to-primary-dark text-background px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Comenzar Gratis
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Module Selector */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-bold text-text-primary mb-4">Módulos Disponibles</h2>
            <div className="space-y-2">
              {modules.map((module) => (
                <button
                  key={module.id}
                  onClick={() => setActiveModule(module.id)}
                  className={`demo-module w-full text-left p-4 rounded-lg transition-all duration-300 ${
                    activeModule === module.id
                      ? 'bg-primary text-background shadow-lg'
                      : 'bg-surface hover:bg-surface-light text-text-primary'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      activeModule === module.id ? 'bg-background/20' : 'bg-primary/20'
                    }`}>
                      {module.icon}
                    </div>
                    <div>
                      <div className="font-medium">{module.name}</div>
                      <div className={`text-sm ${
                        activeModule === module.id ? 'text-background/70' : 'text-text-secondary'
                      }`}>
                        {module.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Module Content */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                {modules.find(m => m.id === activeModule)?.name}
              </h2>
              <p className="text-text-secondary">
                {modules.find(m => m.id === activeModule)?.description}
              </p>
            </div>
            
            {renderModuleContent()}
            
            {/* Demo Info */}
            <div className="mt-6 p-4 bg-primary/10 border border-primary/30 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-primary font-medium">Demo Interactivo</span>
              </div>
              <p className="text-text-secondary text-sm">
                Esta es una demostración de las funcionalidades de KatalisApp. 
                Los datos mostrados son simulados para fines demostrativos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoPage;