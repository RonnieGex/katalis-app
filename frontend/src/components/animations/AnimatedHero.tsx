import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Sparkles, 
  ArrowRight,
  Zap,
  Brain,
  TrendingUp,
  Shield
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const AnimatedHero: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [currentData, setCurrentData] = useState({
    revenue: 125430,
    margin: 32.1,
    expenses: 89200,
    profit: 36230,
    trend: '+18%',
    chapter: 'Capítulo 3: Flujo de Efectivo',
    insight: 'El 73% de los fracasos empresariales se deben a problemas de flujo de efectivo'
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Timeline principal
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Animación del logo
      gsap.set(logoRef.current, { 
        scale: 0, 
        rotation: -180,
        opacity: 0 
      });

      tl.to(logoRef.current, {
        scale: 1,
        rotation: 0,
        opacity: 1,
        duration: 1.2,
        ease: "back.out(1.7)"
      });

      // Animación del título
      gsap.set(titleRef.current, { opacity: 0, y: 50 });
      
      tl.to(titleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8
      }, "-=0.5");

      // Animación del subtítulo
      gsap.set(subtitleRef.current, { opacity: 0, y: 30 });
      
      tl.to(subtitleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8
      }, "-=0.3");

      // Animación de los CTAs
      if (ctaRef.current?.children) {
        gsap.set(ctaRef.current.children, { 
          opacity: 0, 
          y: 30,
          scale: 0.8 
        });

        tl.to(ctaRef.current.children, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.2,
          ease: "back.out(1.4)"
        }, "-=0.2");
      }

      // Configurar dashboard con perspectiva 3D
      gsap.set(dashboardRef.current, { 
        opacity: 0, 
        x: 100, 
        scale: 0.9,
        rotationY: 15,
        rotationX: 5,
        transformPerspective: 1000,
        transformOrigin: "center center"
      });
      
      tl.to(dashboardRef.current, {
        opacity: 1,
        x: 0,
        scale: 1,
        rotationY: 0,
        rotationX: 0,
        duration: 1.2,
        ease: "back.out(1.4)"
      }, "-=0.8");

      // Crear partículas flotantes
      createFloatingParticles();

      // Animación de barras del dashboard
      const bars = dashboardRef.current?.querySelectorAll('.chart-bar');
      if (bars) {
        gsap.fromTo(bars, 
          { scaleY: 0 },
          { 
            scaleY: 1, 
            duration: 1.5, 
            stagger: 0.1, 
            ease: "power2.out",
            delay: 1
          }
        );
      }

      // Scroll trigger para perspectiva y datos cambiantes
      ScrollTrigger.create({
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          
          // Perspectiva 3D basada en scroll
          gsap.to(dashboardRef.current, {
            rotationY: progress * 8 - 4,
            rotationX: progress * 4 - 2,
            scale: 1 + progress * 0.05,
            duration: 0.1
          });

          // Cambiar datos basado en el progreso del scroll
          updateDataBasedOnScroll(progress);
        }
      });

    }, heroRef);

    return () => ctx.revert();
  }, []);

  const updateDataBasedOnScroll = (progress: number) => {
    const scenarios = [
      {
        revenue: 125430,
        margin: 32.1,
        expenses: 89200,
        profit: 36230,
        trend: '+18%',
        chapter: 'Capítulo 3: Flujo de Efectivo',
        insight: 'El 73% de los fracasos empresariales se deben a problemas de flujo de efectivo'
      },
      {
        revenue: 148250,
        margin: 38.7,
        expenses: 91800,
        profit: 56450,
        trend: '+24%',
        chapter: 'Capítulo 5: Rentabilidad',
        insight: 'Aumentar precios 10% puede incrementar ganancias hasta 40%'
      },
      {
        revenue: 167890,
        margin: 42.3,
        expenses: 97200,
        profit: 70690,
        trend: '+31%',
        chapter: 'Capítulo 8: Escalamiento',
        insight: 'La automatización financiera reduce errores en 87%'
      }
    ];

    const index = Math.floor(progress * scenarios.length);
    const targetScenario = scenarios[Math.min(index, scenarios.length - 1)];
    
    if (JSON.stringify(currentData) !== JSON.stringify(targetScenario)) {
      setCurrentData(targetScenario);
      
      // Animar actualización de números
      const elements = dashboardRef.current?.querySelectorAll('.animated-number');
      elements?.forEach((el) => {
        gsap.fromTo(el, 
          { scale: 1.1, color: '#3ECF8E' },
          { scale: 1, color: '#FAFAFA', duration: 0.5 }
        );
      });
    }
  };

  const createFloatingParticles = () => {
    const particles = particlesRef.current;
    if (!particles) return;

    particles.innerHTML = '';

    // Crear 30 partículas más sutiles
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.className = 'absolute rounded-full pointer-events-none';
      
      const size = Math.random() * 3 + 1;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.background = '#3ECF8E';
      particle.style.opacity = (Math.random() * 0.3 + 0.1).toString();
      
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      
      particles.appendChild(particle);

      // Animación suave
      gsap.to(particle, {
        y: `+=${Math.random() * 100 - 50}`,
        x: `+=${Math.random() * 100 - 50}`,
        duration: Math.random() * 20 + 10,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: Math.random() * 5
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const particles = particlesRef.current?.children;
    if (!particles) return;

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    Array.from(particles).forEach((particle) => {
      const rect = particle.getBoundingClientRect();
      const particleX = rect.left + rect.width / 2;
      const particleY = rect.top + rect.height / 2;

      const distance = Math.sqrt(
        Math.pow(mouseX - particleX, 2) + Math.pow(mouseY - particleY, 2)
      );

      if (distance < 100) {
        const force = (100 - distance) / 100;
        gsap.to(particle, {
          x: `+=${(mouseX - particleX) * force * 0.1}`,
          y: `+=${(mouseY - particleY) * force * 0.1}`,
          duration: 0.3,
          ease: "power2.out"
        });
      }
    });
  };

  return (
    <div 
      ref={heroRef}
      className="hero-section-enhanced"
      onMouseMove={handleMouseMove}
    >
      {/* Background */}
      <div 
        ref={backgroundRef}
        className="absolute inset-0 bg-gradient-to-br from-background via-surface to-background"
      />

      {/* Partículas flotantes */}
      <div 
        ref={particlesRef}
        className="hero-particles"
      />

      {/* Contenido principal */}
      <div className="hero-content-enhanced">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen py-20">
          {/* Contenido izquierdo */}
          <div className="space-y-8">
            {/* Logo y marca */}
            <div ref={logoRef} className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
                <Brain className="w-8 h-8 text-background" />
              </div>
              <div>
                <h1 
                  ref={titleRef}
                  className="hero-title-enhanced"
                >
                  KatalisApp
                </h1>
                <p className="text-primary font-medium">Finanzas Inteligentes</p>
              </div>
            </div>

            {/* Headline principal */}
            <div ref={subtitleRef} className="space-y-4">
              <h2 className="hero-subtitle-enhanced">
                Convierte <span className="hero-highlight">"Finanzas para Emprendedores"</span> en tu ventaja competitiva
              </h2>
              <p className="text-xl text-text-secondary leading-relaxed">
                IA financiera que transforma conceptos del libro en herramientas de éxito empresarial con datos reales de tu negocio.
              </p>
            </div>

            {/* Beneficios clave */}
            <div className="hero-features-enhanced">
              <div className="feature-item-enhanced">
                <div className="feature-icon-enhanced">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <p className="feature-title-enhanced">Análisis IA</p>
                  <p className="feature-description-enhanced">Tiempo real</p>
                </div>
              </div>
              <div className="feature-item-enhanced">
                <div className="feature-icon-enhanced">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="feature-title-enhanced">Crecimiento</p>
                  <p className="feature-description-enhanced">Comprobado</p>
                </div>
              </div>
              <div className="feature-item-enhanced">
                <div className="feature-icon-enhanced">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="feature-title-enhanced">Seguridad</p>
                  <p className="feature-description-enhanced">Bancaria</p>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/register"
                className="cta-button-primary-enhanced"
              >
                <Sparkles className="w-5 h-5" />
                <span>Comenzar Gratis</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/demo"
                className="cta-button-secondary-enhanced"
              >
                <Zap className="w-5 h-5" />
                <span>Ver Demo</span>
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-text-secondary">1,200+ empresas activas</span>
              </div>
              <div className="text-text-secondary">•</div>
              <div className="text-text-secondary">Basado en el libro best-seller</div>
            </div>
          </div>

          {/* Interactive App Preview */}
          <div ref={dashboardRef} className="relative transform-gpu">
            <div className="bg-gradient-to-br from-surface to-surface-light border border-primary/20 rounded-2xl p-6 shadow-2xl backdrop-blur-sm overflow-hidden">
              {/* App Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Brain className="w-4 h-4 text-background" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">KatalisApp Live</h3>
                    <p className="text-xs text-text-secondary transition-all duration-500">{currentData.chapter}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="text-xs text-text-secondary">Sincronizado</span>
                </div>
              </div>
              
              {/* Financial Insights from Book */}
              <div className="space-y-4 mb-6">
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">Insight del Libro</span>
                  </div>
                  <p className="text-sm text-text-secondary transition-all duration-500">"{currentData.insight}"</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface-light rounded-lg p-3 border border-border">
                    <p className="text-xs text-text-secondary mb-1">Ingresos Mensuales</p>
                    <p className="animated-number text-lg font-bold text-primary transition-all duration-500">
                      ${currentData.revenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-success flex items-center space-x-1">
                      <TrendingUp className="w-3 h-3" />
                      <span className="transition-all duration-500">{currentData.trend}</span>
                    </p>
                  </div>
                  <div className="bg-surface-light rounded-lg p-3 border border-border">
                    <p className="text-xs text-text-secondary mb-1">Margen de Ganancia</p>
                    <p className="animated-number text-lg font-bold text-text-primary transition-all duration-500">
                      {currentData.margin}%
                    </p>
                    <p className="text-xs text-primary">
                      Ganancia: ${currentData.profit.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Interactive Chart showing book concepts in action */}
              <div className="bg-surface-light rounded-lg p-4 h-28 border border-border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-text-secondary">Aplicando conceptos del libro</span>
                  <span className="text-xs text-primary">Tiempo real</span>
                </div>
                <div className="flex items-end justify-between h-16 space-x-1">
                  {[
                    { height: 85, label: 'Operativo', color: '#3ECF8E' },
                    { height: 60, label: 'Crecimiento', color: '#10B981' },
                    { height: 40, label: 'Reserva', color: '#2BA672' },
                    { height: 75, label: 'ROI', color: '#059669' }
                  ].map((item, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center group">
                      <div 
                        className="chart-bar w-full rounded-t transition-all duration-1000 cursor-pointer hover:brightness-110"
                        style={{ 
                          height: `${item.height + Math.sin(Date.now() / 1000 + i) * 5}%`,
                          backgroundColor: item.color
                        }}
                      />
                      <span className="text-xs text-text-secondary mt-1 group-hover:text-primary transition-colors">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Status indicator */}
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-text-muted">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span>Dashboard en tiempo real</span>
              </div>
            </div>
            
            {/* Floating indicators */}
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center animate-pulse">
              <span className="text-xs font-bold text-background">IA</span>
            </div>
            <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-success rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-background">LIVE</span>
            </div>
            
            {/* Enhanced glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-success/10 rounded-2xl blur-2xl -z-10 scale-110 transition-all duration-1000" />
          </div>
        </div>
      </div>

      {/* Indicador de scroll */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default AnimatedHero;