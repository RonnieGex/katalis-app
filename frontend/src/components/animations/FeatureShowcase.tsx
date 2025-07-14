import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  DollarSign, 
  PieChart, 
  TrendingUp,
  Calculator,
  Play
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface Feature {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  mockData: {
    values: number[];
    labels: string[];
    trend: string;
  };
}

const FeatureShowcase: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLDivElement[]>([]);
  const [activeSection, setActiveSection] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const features: Feature[] = [
    {
      id: 'cash-flow',
      title: 'Control de Flujo de Efectivo',
      subtitle: 'Visualización en Tiempo Real',
      description: 'Monitorea tus ingresos y gastos con proyecciones automáticas que te alertan sobre problemas de liquidez antes de que ocurran.',
      icon: <DollarSign className="w-8 h-8" />,
      color: '#3ECF8E',
      gradient: 'from-primary to-primary-dark',
      mockData: {
        values: [45000, 52000, 48000, 65000, 58000, 72000],
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        trend: '+18% este trimestre'
      }
    },
    {
      id: 'profitability',
      title: 'Análisis de Rentabilidad',
      subtitle: 'IA Diagnósticos Automáticos',
      description: 'Identifica automáticamente tus productos más rentables y recibe recomendaciones de optimización basadas en datos reales.',
      icon: <PieChart className="w-8 h-8" />,
      color: '#3ECF8E',
      gradient: 'from-primary to-primary-dark',
      mockData: {
        values: [35, 28, 22, 15],
        labels: ['Producto A', 'Producto B', 'Producto C', 'Otros'],
        trend: 'Margen promedio: 42%'
      }
    },
    {
      id: 'cost-management',
      title: 'Gestión de Costos',
      subtitle: 'Punto de Equilibrio Dinámico',
      description: 'Calcula tu punto de equilibrio en tiempo real y simula diferentes escenarios de precios para maximizar tus ganancias.',
      icon: <Calculator className="w-8 h-8" />,
      color: '#10B981',
      gradient: 'from-success to-green-700',
      mockData: {
        values: [25, 35, 45, 55, 65],
        labels: ['Costos Fijos', 'Variables', 'Margen', 'Ganancia', 'ROI'],
        trend: 'Punto de equilibrio: 1,250 unidades'
      }
    },
    {
      id: 'forecasting',
      title: 'Planificación Financiera',
      subtitle: 'Predicciones con IA',
      description: 'Proyecciones inteligentes basadas en tus patrones históricos y tendencias del mercado para planificar tu crecimiento.',
      icon: <TrendingUp className="w-8 h-8" />,
      color: '#2BA672',
      gradient: 'from-primary-dark to-green-800',
      mockData: {
        values: [100, 125, 150, 180, 220, 270],
        labels: ['Q1', 'Q2', 'Q3', 'Q4', '2025 Q1', '2025 Q2'],
        trend: 'Proyección: +170% anual'
      }
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animación de entrada del contenedor
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

      // Configurar scroll horizontal
      const sections = sectionsRef.current;
      if (sections.length > 0) {
        const totalWidth = sections.length * 100;
        
        gsap.to(sections, {
          xPercent: -totalWidth + 100,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            pin: true,
            scrub: 1,
            snap: 1 / (sections.length - 1),
            start: "top top",
            end: () => `+=${sections[0].offsetWidth * (sections.length - 1)}`,
            onUpdate: (self) => {
              const progress = self.progress;
              const sectionIndex = Math.round(progress * (sections.length - 1));
              setActiveSection(sectionIndex);
            }
          }
        });

        // Animaciones individuales de cada sección
        sections.forEach((section) => {
          const charts = section.querySelectorAll('.animated-chart');
          const counters = section.querySelectorAll('.animated-counter');
          
          gsap.set([charts, counters], { opacity: 0, scale: 0.8 });
          
          ScrollTrigger.create({
            trigger: section,
            start: "left 60%",
            end: "left 40%",
            onEnter: () => {
              gsap.to([charts, counters], {
                opacity: 1,
                scale: 1,
                duration: 0.8,
                stagger: 0.1,
                ease: "back.out(1.7)"
              });
              
              // Animar contadores
              counters.forEach((counter) => {
                const target = parseInt(counter.getAttribute('data-target') || '0');
                const obj = { value: 0 };
                gsap.to(obj, {
                  value: target,
                  duration: 2,
                  ease: "power2.out",
                  onUpdate: () => {
                    counter.textContent = Math.round(obj.value).toLocaleString();
                  }
                });
              });
            }
          });
        });
      }

      // Activar demo automático
      if (isPlaying) {
        startDemoAnimation();
      }

    }, containerRef);

    return () => ctx.revert();
  }, [isPlaying]);

  const startDemoAnimation = () => {
    const charts = containerRef.current?.querySelectorAll('.live-chart');
    charts?.forEach((chart) => {
      // Simular datos cambiando en tiempo real
      gsap.to(chart.children, {
        scaleY: () => Math.random() * 0.8 + 0.2,
        duration: 2,
        repeat: -1,
        yoyo: true,
        stagger: 0.2,
        ease: "sine.inOut"
      });
    });
  };

  const renderMockChart = (feature: Feature) => {
    // Componente de gr\u00e1fico reutilizable con datos reales

    switch (feature.id) {
      case 'cash-flow':
        return (
          <div className="animated-chart bg-gradient-to-br from-surface to-surface-light rounded-xl p-4 h-56 border border-primary/20 shadow-xl">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-text-primary font-medium text-sm flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span>Flujo de Caja</span>
              </h4>
              <span className="text-primary text-xs font-medium bg-primary/10 px-2 py-1 rounded-full">{feature.mockData.trend}</span>
            </div>
            <div className="live-chart flex items-end justify-between h-32 space-x-1">
              {feature.mockData.values.map((value, i) => (
                <div key={i} className="flex flex-col items-center relative group flex-1">
                  <div className="relative w-full">
                    <div 
                      className="live-bar rounded-t w-full transition-all duration-1000 shadow-sm hover:shadow-md cursor-pointer"
                      style={{ 
                        height: `${(value / Math.max(...feature.mockData.values)) * 80}px`,
                        minHeight: '8px',
                        background: `linear-gradient(to top, #3ECF8ECC, #3ECF8E)`
                      }}
                    />
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-surface text-text-primary text-xs px-1 py-0.5 rounded shadow-lg whitespace-nowrap">
                      ${value.toLocaleString()}
                    </div>
                  </div>
                  <span className="text-text-secondary text-xs mt-1 text-center">{feature.mockData.labels[i]}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'profitability':
        const total = feature.mockData.values.reduce((sum, v) => sum + v, 0);
        return (
          <div className="animated-chart bg-gradient-to-br from-surface to-surface-light rounded-xl p-4 h-56 border border-primary/20 shadow-xl">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-text-primary font-medium text-sm flex items-center space-x-2">
                <PieChart className="w-3 h-3 text-primary" />
                <span>Rentabilidad</span>
              </h4>
              <span className="text-primary text-xs font-medium bg-primary/10 px-2 py-1 rounded-full">{feature.mockData.trend}</span>
            </div>
            <div className="space-y-3 overflow-hidden">
              {feature.mockData.labels.map((label, i) => {
                const colors = ['#3ECF8E', '#10B981', '#2BA672', '#059669'];
                const percentage = (feature.mockData.values[i] / total) * 100;
                return (
                  <div key={i} className="group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-text-secondary text-xs flex items-center space-x-2 truncate">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: colors[i] }} />
                        <span className="truncate">{label}</span>
                      </span>
                      <span className="text-text-primary text-xs font-medium flex-shrink-0 ml-2">
                        {feature.mockData.values[i]}%
                      </span>
                    </div>
                    <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="h-1.5 rounded-full transition-all duration-1000 group-hover:scale-105 origin-left"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: colors[i],
                          boxShadow: `0 0 8px ${colors[i]}40`
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'cost-management':
        return (
          <div className="animated-chart bg-gradient-to-br from-surface to-surface-light rounded-xl p-4 h-56 border border-success/20 shadow-xl">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-text-primary font-medium text-sm flex items-center space-x-2">
                <Calculator className="w-3 h-3 text-success" />
                <span>Costos</span>
              </h4>
              <span className="text-success text-xs font-medium bg-success/10 px-2 py-1 rounded-full">{feature.mockData.trend}</span>
            </div>
            <div className="space-y-3 overflow-hidden">
              {feature.mockData.labels.map((label, i) => {
                const colors = ['#EF4444', '#F97316', '#EAB308', '#10B981', '#3ECF8E'];
                return (
                  <div key={i} className="group">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-text-secondary text-xs flex items-center space-x-2 truncate">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: colors[i] }} />
                        <span className="truncate">{label}</span>
                      </span>
                      <span className="text-text-primary text-xs font-medium flex-shrink-0 ml-3">{feature.mockData.values[i]}%</span>
                    </div>
                    <div className="relative">
                      <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-2 rounded-full transition-all duration-1000 group-hover:scale-105 origin-left"
                          style={{ 
                            width: `${feature.mockData.values[i]}%`,
                            background: `linear-gradient(90deg, ${colors[i]}CC, ${colors[i]})`
                          }}
                        />
                      </div>
                      {i === 3 && (
                        <div className="absolute right-0 top-0 transform translate-x-2 -translate-y-1">
                          <div className="w-1.5 h-1.5 bg-success rounded-full animate-ping" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'forecasting':
        return (
          <div className="animated-chart bg-gradient-to-br from-surface-light to-surface rounded-xl p-4 h-56 border border-border/50 shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-text-primary font-medium text-sm">Proyecciones IA</h4>
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-primary-dark rounded-full animate-pulse" />
                <span className="text-primary-dark text-xs font-medium">{feature.mockData.trend}</span>
              </div>
            </div>
            <div className="live-chart flex items-end justify-between h-32 space-x-0.5 relative">
              {/* Trend line */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <path 
                  d="M 5 100 Q 50 80 100 45 T 200 15" 
                  stroke="#3ECF8E" 
                  strokeWidth="1.5" 
                  fill="none" 
                  strokeDasharray="3,3"
                  className="animate-pulse"
                />
              </svg>
              
              {feature.mockData.values.map((value, i) => (
                <div key={i} className="flex flex-col items-center flex-1 relative z-10">
                  <div className="relative w-full">
                    <div 
                      className={`rounded-t w-full transition-all duration-1000 shadow-sm ${
                        i < 4 ? 'bg-gradient-to-t from-primary-dark to-primary' : 'bg-gradient-to-t from-primary/50 to-primary/70 border border-primary border-dashed'
                      }`}
                      style={{ height: `${(value / Math.max(...feature.mockData.values)) * 80}px`, minHeight: '12px' }}
                    />
                    {i >= 4 && (
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                        <div className="w-1 h-1 bg-primary rounded-full animate-ping" />
                      </div>
                    )}
                  </div>
                  <span className="text-text-secondary text-xs mt-0.5 text-center">{feature.mockData.labels[i]}</span>
                  <div className="text-xs text-primary font-medium">
                    {i < 4 ? 'Real' : 'IA'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-surface/20 to-background py-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-success/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>
      
      {/* Header Section */}
      <div className="container mx-auto px-4 mb-8 text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
          Herramientas que <span className="text-primary">Transforman</span> tu Negocio
        </h2>
        <p className="text-xl text-text-secondary max-w-3xl mx-auto mb-6">
          Análisis financiero inteligente basado en "Finanzas para Emprendedores"
        </p>
        
        {/* Demo Controls */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`group flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              isPlaying 
                ? 'bg-primary text-background shadow-lg shadow-primary/25 hover:bg-primary-dark' 
                : 'bg-surface-light text-text-primary hover:bg-surface border border-border'
            }`}
          >
            <Play className={`w-4 h-4 ${isPlaying ? 'animate-pulse' : ''}`} />
            <span>{isPlaying ? 'Demo Activo' : 'Activar Demo'}</span>
          </button>
          <div className="text-sm text-text-secondary">
            Desliza horizontalmente para explorar
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Container */}
      <div ref={containerRef} className="relative h-screen">
        <div className="flex h-full">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              ref={el => { if (el) sectionsRef.current[index] = el; }}
              className="flex-shrink-0 w-full h-full flex items-center justify-center px-8"
            >
              <div className="container mx-auto">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  {/* Content Side */}
                  <div className="text-text-primary space-y-4">
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg`}>
                      {feature.icon}
                    </div>
                    
                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold mb-2 leading-tight">
                        {feature.title}
                      </h3>
                      <p className="text-lg text-primary mb-3">
                        {feature.subtitle}
                      </p>
                      <p className="text-text-secondary text-base leading-relaxed">
                        {feature.description}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center bg-surface-light rounded-lg p-3 border border-border">
                        <div className="animated-counter text-xl font-bold" style={{ color: feature.color }} data-target="1200">
                          0
                        </div>
                        <div className="text-xs text-text-secondary">Empresas</div>
                      </div>
                      <div className="text-center bg-surface-light rounded-lg p-3 border border-border">
                        <div className="animated-counter text-xl font-bold" style={{ color: feature.color }} data-target="95">
                          0
                        </div>
                        <div className="text-xs text-text-secondary">% IA</div>
                      </div>
                      <div className="text-center bg-surface-light rounded-lg p-3 border border-border">
                        <div className="animated-counter text-xl font-bold" style={{ color: feature.color }} data-target="24">
                          0
                        </div>
                        <div className="text-xs text-text-secondary">24/7</div>
                      </div>
                    </div>

                  </div>

                  {/* Chart Side */}
                  <div className="relative">
                    <div className="overflow-hidden rounded-xl">
                      {renderMockChart(feature)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Dots */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {features.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                activeSection === index ? 'bg-primary w-8' : 'bg-primary/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </section>
  );
};

export default FeatureShowcase;