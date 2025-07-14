import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign,
  PieChart,
  Activity,
  Zap,
  Brain,
  ArrowRight,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface DataPoint {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  trend: number;
}

interface MetricCard {
  title: string;
  value: number;
  format: 'currency' | 'percentage' | 'number';
  trend: number;
  icon: React.ReactNode;
  color: string;
}

const InteractiveDemo: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<HTMLDivElement[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [, setCurrentMonth] = useState(0);
  const animationRef = useRef<gsap.core.Timeline | null>(null);

  // Datos simulados que cambian en tiempo real
  const [liveData, setLiveData] = useState<DataPoint[]>([
    { month: 'Ene', revenue: 45000, expenses: 32000, profit: 13000, trend: 8.5 },
    { month: 'Feb', revenue: 52000, expenses: 35000, profit: 17000, trend: 12.3 },
    { month: 'Mar', revenue: 48000, expenses: 33000, profit: 15000, trend: -2.1 },
    { month: 'Abr', revenue: 65000, expenses: 38000, profit: 27000, trend: 18.7 },
    { month: 'May', revenue: 58000, expenses: 36000, profit: 22000, trend: 5.2 },
    { month: 'Jun', revenue: 72000, expenses: 41000, profit: 31000, trend: 15.8 }
  ]);

  const [metrics, setMetrics] = useState<MetricCard[]>([
    {
      title: 'Ingresos Totales',
      value: 340000,
      format: 'currency',
      trend: 12.5,
      icon: <DollarSign className="w-6 h-6" />,
      color: '#10b981'
    },
    {
      title: 'Margen de Ganancia',
      value: 31.2,
      format: 'percentage',
      trend: 8.3,
      icon: <TrendingUp className="w-6 h-6" />,
      color: '#3b82f6'
    },
    {
      title: 'Punto de Equilibrio',
      value: 1250,
      format: 'number',
      trend: -5.7,
      icon: <Activity className="w-6 h-6" />,
      color: '#8b5cf6'
    },
    {
      title: 'ROI Proyectado',
      value: 24.8,
      format: 'percentage',
      trend: 15.2,
      icon: <PieChart className="w-6 h-6" />,
      color: '#f59e0b'
    }
  ]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animación de entrada
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 100 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 85%",
            end: "bottom 15%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // Animación de las métricas
      metricsRef.current.forEach((metric, index) => {
        if (!metric) return;

        gsap.fromTo(metric,
          { scale: 0.8, opacity: 0, y: 30 },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: index * 0.1,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: metric,
              start: "top 90%",
            }
          }
        );
      });

      // Animación del gráfico
      if (chartRef.current) {
        gsap.fromTo(chartRef.current.children,
          { scaleY: 0, opacity: 0 },
          {
            scaleY: 1,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: chartRef.current,
              start: "top 85%",
            }
          }
        );
      }

    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Simulación de datos en tiempo real - Sin temblores
  const startLiveSimulation = () => {
    if (animationRef.current) {
      animationRef.current.kill();
    }

    const tl = gsap.timeline({ repeat: -1 });
    animationRef.current = tl;

    tl.to({}, {
      duration: 3,
      repeat: -1,
      onRepeat: () => {
        // Actualizar datos con variaciones suaves y realistas
        setLiveData(prevData => 
          prevData.map((point, index) => {
            // Variaciones más suaves basadas en el índice para consistencia
            const baseVariation = Math.sin(Date.now() / 10000 + index) * 0.15;
            const randomVariation = (Math.random() - 0.5) * 0.1;
            const totalVariation = baseVariation + randomVariation;
            
            const newRevenue = Math.max(point.revenue * (1 + totalVariation), 20000);
            const newExpenses = Math.max(point.expenses * (1 + totalVariation * 0.8), 15000);
            
            return {
              ...point,
              revenue: newRevenue,
              expenses: newExpenses,
              profit: newRevenue - newExpenses,
              trend: totalVariation * 100
            };
          })
        );

        // Actualizar métricas de forma suave
        setMetrics(prevMetrics =>
          prevMetrics.map((metric, index) => {
            const variation = Math.sin(Date.now() / 8000 + index * 2) * 0.08 + (Math.random() - 0.5) * 0.05;
            return {
              ...metric,
              value: Math.max(metric.value * (1 + variation), metric.value * 0.5),
              trend: variation * 100
            };
          })
        );

        // Animar cambios suaves sin temblores
        gsap.to('.metric-value', {
          scale: 1.02,
          duration: 0.3,
          yoyo: true,
          repeat: 1,
          ease: "power1.inOut"
        });
      }
    });
  };

  const stopLiveSimulation = () => {
    if (animationRef.current) {
      animationRef.current.kill();
      animationRef.current = null;
    }
  };

  const resetDemo = () => {
    stopLiveSimulation();
    setCurrentMonth(0);
    
    // Resetear a datos originales
    setLiveData([
      { month: 'Ene', revenue: 45000, expenses: 32000, profit: 13000, trend: 8.5 },
      { month: 'Feb', revenue: 52000, expenses: 35000, profit: 17000, trend: 12.3 },
      { month: 'Mar', revenue: 48000, expenses: 33000, profit: 15000, trend: -2.1 },
      { month: 'Abr', revenue: 65000, expenses: 38000, profit: 27000, trend: 18.7 },
      { month: 'May', revenue: 58000, expenses: 36000, profit: 22000, trend: 5.2 },
      { month: 'Jun', revenue: 72000, expenses: 41000, profit: 31000, trend: 15.8 }
    ]);

    setMetrics([
      {
        title: 'Ingresos Totales',
        value: 340000,
        format: 'currency',
        trend: 12.5,
        icon: <DollarSign className="w-6 h-6" />,
        color: '#10b981'
      },
      {
        title: 'Margen de Ganancia',
        value: 31.2,
        format: 'percentage',
        trend: 8.3,
        icon: <TrendingUp className="w-6 h-6" />,
        color: '#3b82f6'
      },
      {
        title: 'Punto de Equilibrio',
        value: 1250,
        format: 'number',
        trend: -5.7,
        icon: <Activity className="w-6 h-6" />,
        color: '#8b5cf6'
      },
      {
        title: 'ROI Proyectado',
        value: 24.8,
        format: 'percentage',
        trend: 15.2,
        icon: <PieChart className="w-6 h-6" />,
        color: '#f59e0b'
      }
    ]);
  };

  const toggleSimulation = () => {
    if (isPlaying) {
      stopLiveSimulation();
    } else {
      startLiveSimulation();
    }
    setIsPlaying(!isPlaying);
  };

  const formatValue = (value: number, format: 'currency' | 'percentage' | 'number') => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('es-MX', {
          style: 'currency',
          currency: 'MXN',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'number':
        return Math.round(value).toLocaleString();
      default:
        return value.toString();
    }
  };

  const maxRevenue = Math.max(...liveData.map(d => d.revenue));

  return (
    <section ref={containerRef} className="relative py-20 bg-background overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
            Ve tus <span className="text-primary">Finanzas</span> en Acción
          </h2>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto mb-8">
            Experimenta cómo KatalisApp transforma datos complejos en insights accionables en tiempo real
          </p>

          {/* Demo Controls */}
          <div className="flex items-center justify-center space-x-4 mb-12">
            <button
              onClick={toggleSimulation}
              className={`group flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                isPlaying 
                  ? 'bg-error text-text-primary shadow-lg shadow-error/25 hover:bg-red-600' 
                  : 'bg-primary text-background shadow-lg shadow-primary/25 hover:bg-primary-dark'
              }`}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              <span>{isPlaying ? 'Pausar Demo' : 'Iniciar Demo'}</span>
            </button>
            
            <button
              onClick={resetDemo}
              className="group flex items-center space-x-2 px-6 py-3 bg-surface border border-border text-text-primary rounded-xl font-semibold hover:bg-surface-light transition-all duration-300"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Reiniciar</span>
            </button>

            {isPlaying && (
              <div className="flex items-center space-x-2 text-primary">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-sm">Datos actualizándose en vivo</span>
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Mockup */}
        <div className="bg-surface backdrop-blur-sm rounded-3xl p-8 border border-border shadow-2xl">
          {/* Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {metrics.map((metric, index) => (
              <div
                key={index}
                ref={el => { if (el) metricsRef.current[index] = el; }}
                className="bg-surface-light backdrop-blur-sm rounded-2xl p-6 border border-border hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div 
                    className="p-3 rounded-xl" 
                    style={{ backgroundColor: `${metric.color}20` }}
                  >
                    <div style={{ color: metric.color }}>
                      {metric.icon}
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${
                    metric.trend >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {metric.trend >= 0 ? '+' : ''}{metric.trend.toFixed(1)}%
                  </div>
                </div>
                
                <div className="metric-value text-2xl font-bold text-text-primary mb-1">
                  {formatValue(metric.value, metric.format)}
                </div>
                
                <div className="text-sm text-text-secondary">{metric.title}</div>
              </div>
            ))}
          </div>

          {/* Chart Section */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Bar Chart */}
            <div className="lg:col-span-2 bg-gradient-to-br from-surface-light to-surface rounded-2xl p-6 border border-border/50 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-text-primary">Flujo de Efectivo Mensual</h3>
                  <p className="text-sm text-text-secondary">Datos en tiempo real con IA predictiva</p>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2 bg-primary/10 px-3 py-1 rounded-full">
                    <div className="w-3 h-3 bg-primary rounded-full shadow-lg shadow-primary/50" />
                    <span className="text-text-secondary font-medium">Ingresos</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-error/10 px-3 py-1 rounded-full">
                    <div className="w-3 h-3 bg-error rounded-full shadow-lg shadow-red-500/50" />
                    <span className="text-text-secondary font-medium">Gastos</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-blue-500/10 px-3 py-1 rounded-full">
                    <div className="w-3 h-3 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50" />
                    <span className="text-text-secondary font-medium">Ganancia</span>
                  </div>
                </div>
              </div>

              <div ref={chartRef} className="relative h-[500px] bg-surface-light/30 rounded-xl overflow-hidden">
                {/* Grid Lines - Subtle background only */}
                <div className="absolute inset-0 flex flex-col justify-between py-8 px-8">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="border-t border-border/20" />
                  ))}
                </div>
                
                {/* Y-axis labels */}
                <div className="absolute left-2 top-8 bottom-12 flex flex-col justify-between text-xs text-text-secondary font-medium">
                  <span>${(maxRevenue / 1000).toFixed(0)}k</span>
                  <span>${(maxRevenue * 0.75 / 1000).toFixed(0)}k</span>
                  <span>${(maxRevenue * 0.5 / 1000).toFixed(0)}k</span>
                  <span>${(maxRevenue * 0.25 / 1000).toFixed(0)}k</span>
                  <span>$0</span>
                </div>
                
                {/* Chart bars container - Fixed height for proper scaling */}
                <div className="absolute bottom-16 left-8 right-4 top-8 flex items-end justify-between space-x-3">
                  {liveData.map((point, index) => {
                    const chartHeight = 350; // Fixed chart height for calculations
                    const revenueHeight = Math.max((point.revenue / maxRevenue) * chartHeight, 50);
                    const expensesHeight = Math.max((point.expenses / maxRevenue) * chartHeight, 40);
                    const profitHeight = Math.max((point.profit / maxRevenue) * chartHeight, 30);

                    return (
                      <div key={index} className="flex flex-col items-center flex-1 group relative">
                        {/* Tooltip */}
                        <div className="absolute -top-28 left-1/2 transform -translate-x-1/2 bg-surface/95 backdrop-blur-sm border border-border/80 rounded-xl p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-2xl z-20 min-w-max">
                          <div className="text-xs text-text-secondary mb-2 font-medium">{point.month} 2024</div>
                          <div className="space-y-1">
                            <div className="text-sm text-text-primary font-semibold flex items-center">
                              <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                              Ingresos: ${(point.revenue / 1000).toFixed(0)}k
                            </div>
                            <div className="text-sm text-error font-semibold flex items-center">
                              <div className="w-2 h-2 bg-error rounded-full mr-2"></div>
                              Gastos: ${(point.expenses / 1000).toFixed(0)}k
                            </div>
                            <div className="text-sm text-blue-500 font-semibold flex items-center">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                              Ganancia: ${(point.profit / 1000).toFixed(0)}k
                            </div>
                            <div className="text-xs text-primary border-t border-border/50 pt-1 mt-2">
                              Tendencia: {point.trend > 0 ? '↗ +' : '↘ '}{Math.abs(point.trend).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        
                        {/* Bar group container */}
                        <div className="relative w-full flex items-end justify-center space-x-0.5 h-full">
                          {/* Revenue Bar */}
                          <div className="relative w-4 flex items-end">
                            <div 
                              className="live-bar w-full bg-gradient-to-t from-primary to-primary/80 rounded-t-sm transition-all duration-500 ease-out shadow-lg hover:shadow-primary/60 cursor-pointer"
                              style={{ 
                                height: `${revenueHeight}px`,
                                boxShadow: '0 2px 8px rgba(62, 207, 142, 0.4)'
                              }}
                            >
                              {isPlaying && (
                                <div className="absolute inset-0 bg-primary/30 animate-pulse rounded-t-sm" />
                              )}
                            </div>
                          </div>
                          
                          {/* Expenses Bar */}
                          <div className="relative w-4 flex items-end">
                            <div 
                              className="live-bar w-full bg-gradient-to-t from-error to-red-400 rounded-t-sm transition-all duration-500 ease-out shadow-lg hover:shadow-red-500/60 cursor-pointer"
                              style={{ 
                                height: `${expensesHeight}px`,
                                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
                              }}
                            >
                              {isPlaying && (
                                <div className="absolute inset-0 bg-red-500/30 animate-pulse rounded-t-sm" />
                              )}
                            </div>
                          </div>
                          
                          {/* Profit Bar */}
                          <div className="relative w-4 flex items-end">
                            <div 
                              className="live-bar w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm transition-all duration-500 ease-out shadow-lg hover:shadow-blue-500/60 cursor-pointer"
                              style={{ 
                                height: `${profitHeight}px`,
                                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)'
                              }}
                            >
                              {isPlaying && (
                                <div className="absolute inset-0 bg-blue-500/30 animate-pulse rounded-t-sm" />
                              )}
                              {point.trend > 10 && (
                                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping shadow-lg"></div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Month label with trend indicator */}
                        <div className="text-center mt-4 space-y-1">
                          <span className="text-text-secondary text-sm font-semibold">{point.month}</span>
                          <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            point.trend >= 0 
                              ? 'text-green-400 bg-green-400/20' 
                              : 'text-red-400 bg-red-400/20'
                          }`}>
                            {point.trend >= 0 ? '↗' : '↘'} {Math.abs(point.trend).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* AI Insights Panel */}
            <div className="bg-surface-light rounded-2xl p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Brain className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-bold text-text-primary">IA Insights</h3>
                {isPlaying && (
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                )}
              </div>

              <div className="space-y-4">
                <div className="bg-success/20 border border-success/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span className="text-success font-medium">Oportunidad</span>
                  </div>
                  <p className="text-text-secondary text-sm">
                    Tus ingresos han aumentado 18% en los últimos 3 meses. 
                    Considera expandir tu inventario de productos estrella.
                  </p>
                </div>

                <div className="bg-warning/20 border border-warning/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="w-4 h-4 text-warning" />
                    <span className="text-warning font-medium">Alerta</span>
                  </div>
                  <p className="text-text-secondary text-sm">
                    Los gastos operativos han crecido más rápido que los ingresos. 
                    Revisa tus costos variables.
                  </p>
                </div>

                <div className="bg-primary/20 border border-primary/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    <span className="text-primary font-medium">Predicción</span>
                  </div>
                  <p className="text-text-secondary text-sm">
                    Con el patrón actual, proyectamos 15% de crecimiento 
                    en el próximo trimestre.
                  </p>
                </div>

                {/* Real-time metrics */}
                <div className="border-t border-border pt-4">
                  <h4 className="text-text-primary font-medium mb-3">Métricas en Vivo</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-text-secondary text-sm">Eficiencia Operativa</span>
                      <span className="text-text-primary font-medium">
                        {(Math.random() * 20 + 75).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-secondary text-sm">Score de Liquidez</span>
                      <span className="text-text-primary font-medium">
                        {(Math.random() * 30 + 70).toFixed(0)}/100
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-secondary text-sm">Riesgo Financiero</span>
                      <span className="text-success font-medium">Bajo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-8 text-center">
            <div className="bg-gradient-to-r from-primary/10 to-primary-dark/10 rounded-2xl p-6 border border-primary/30">
              <h3 className="text-xl font-bold text-text-primary mb-2">
                ¿Te gusta lo que ves?
              </h3>
              <p className="text-text-secondary mb-4">
                Este es solo el 10% de lo que KatalisApp puede hacer por tu negocio
              </p>
              <button 
                onClick={() => window.location.href = '/register'}
                className="group inline-flex items-center space-x-2 bg-gradient-to-r from-primary to-primary-dark text-background px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                <span>Crear mi Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveDemo;