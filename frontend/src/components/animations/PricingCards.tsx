import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Check, 
  Zap, 
  Crown, 
  Building2,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Shield,
  Brain
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  currency: string;
  period: string;
  description: string;
  features: string[];
  limitations: string[];
  icon: React.ReactNode;
  color: string;
  gradient: string;
  bgGradient: string;
  popular?: boolean;
  recommended?: boolean;
  apiCalls: number;
  aiAnalysis: string;
  support: string;
  customFeatures?: string[];
}

const PricingCards: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const [, setHoveredCard] = useState<string | null>(null);

  const plans: PricingPlan[] = [
    {
      id: 'basic',
      name: 'Emprendedor',
      price: 299,
      currency: 'MXN',
      period: 'mes',
      description: 'Para iniciar el control financiero de tu negocio',
      icon: <Zap className="w-6 h-6" />,
      color: '#3ECF8E',
      gradient: 'from-primary to-primary-dark',
      bgGradient: 'from-surface to-surface-light',
      apiCalls: 500,
      aiAnalysis: 'Análisis básico',
      support: 'Soporte por email',
      features: [
        'Control de flujo de efectivo',
        'Cálculo de punto de equilibrio',
        'Análisis de costos y precios',
        'Dashboard financiero básico',
        'Exportación de reportes PDF'
      ],
      limitations: [
        '1 empresa',
        'Historial de 3 meses'
      ]
    },
    {
      id: 'pro',
      name: 'Crecimiento',
      price: 699,
      currency: 'MXN',
      period: 'mes',
      description: 'Herramientas avanzadas para escalar tu negocio',
      icon: <Crown className="w-6 h-6" />,
      color: '#2BA672',
      gradient: 'from-primary-dark to-green-800',
      bgGradient: 'from-surface to-surface-light',
      popular: true,
      recommended: true,
      apiCalls: 2000,
      aiAnalysis: 'Análisis con IA',
      support: 'Soporte prioritario',
      features: [
        'Todo lo del plan Emprendedor',
        'Análisis predictivo con IA',
        'Proyecciones financieras automáticas',
        'Alertas inteligentes de liquidez',
        'Comparación con industria',
        'Múltiples usuarios (hasta 3)',
        'Historial completo'
      ],
      limitations: [
        'Hasta 3 empresas'
      ],
      customFeatures: [
        'Sesión de configuración personalizada',
        'Plantillas del libro incluidas'
      ]
    },
    {
      id: 'enterprise',
      name: 'Corporativo',
      price: 1299,
      currency: 'MXN',
      period: 'mes',
      description: 'Solución completa para empresas consolidadas',
      icon: <Building2 className="w-6 h-6" />,
      color: '#10B981',
      gradient: 'from-success to-green-700',
      bgGradient: 'from-surface to-surface-light',
      apiCalls: 10000,
      aiAnalysis: 'IA ilimitada',
      support: 'Soporte dedicado',
      features: [
        'Todo lo del plan Crecimiento',
        'Empresas ilimitadas',
        'Consultor IA personalizado',
        'API para integraciones',
        'Usuarios ilimitados',
        'Capacitación incluida'
      ],
      limitations: [],
      customFeatures: [
        'Implementación a medida',
        'Soporte telefónico directo'
      ]
    }
  ];

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

      // Animación de las cards
      cardsRef.current.forEach((card, index) => {
        if (!card) return;

        gsap.set(card, { 
          rotationY: 10,
          rotationX: 5,
          transformPerspective: 1000,
          transformOrigin: "center center"
        });

        gsap.fromTo(card,
          { 
            scale: 0.8, 
            opacity: 0,
            y: 50,
            rotationY: -15
          },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            rotationY: 0,
            duration: 0.8,
            delay: index * 0.2,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
            }
          }
        );

        // Hover effects
        const onMouseEnter = () => {
          gsap.to(card, {
            scale: 1.05,
            rotationY: 5,
            rotationX: 5,
            z: 50,
            duration: 0.4,
            ease: "power2.out"
          });

          // Animate inner elements
          const features = card.querySelectorAll('.feature-item');
          const icon = card.querySelector('.plan-icon');
          
          gsap.to(features, {
            x: 5,
            duration: 0.3,
            stagger: 0.05,
            ease: "power2.out"
          });

          gsap.to(icon, {
            rotation: 360,
            scale: 1.1,
            duration: 0.6,
            ease: "back.out(1.7)"
          });
        };

        const onMouseLeave = () => {
          gsap.to(card, {
            scale: 1,
            rotationY: 0,
            rotationX: 0,
            z: 0,
            duration: 0.4,
            ease: "power2.out"
          });

          const features = card.querySelectorAll('.feature-item');
          const icon = card.querySelector('.plan-icon');
          
          gsap.to(features, {
            x: 0,
            duration: 0.3,
            stagger: 0.02,
            ease: "power2.out"
          });

          gsap.to(icon, {
            rotation: 0,
            scale: 1,
            duration: 0.6,
            ease: "back.out(1.7)"
          });
        };

        card.addEventListener('mouseenter', onMouseEnter);
        card.addEventListener('mouseleave', onMouseLeave);

        return () => {
          card.removeEventListener('mouseenter', onMouseEnter);
          card.removeEventListener('mouseleave', onMouseLeave);
        };
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency === 'MXN' ? 'MXN' : 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <section ref={containerRef} className="relative py-20 bg-background overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/3 to-primary-dark/3 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
            Planes Diseñados para <span className="text-primary">Cada Etapa</span> de tu Negocio
          </h2>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto mb-8">
            Desde emprendedores que inician hasta empresas consolidadas. Encuentra el plan perfecto para tus necesidades financieras.
          </p>
          
          {/* Price Toggle Mexico Focus */}
          <div className="inline-flex items-center bg-surface backdrop-blur-sm rounded-full p-1 shadow-lg border border-border">
            <div className="bg-success text-text-primary px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2">
              <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span>Precios en Pesos Mexicanos</span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.id}
              ref={el => { if (el) cardsRef.current[index] = el; }}
              className={`relative group transition-all duration-500 h-full flex flex-col ${
                plan.popular ? 'md:-mt-8 md:mb-8 md:scale-105' : ''
              }`}
              onMouseEnter={() => setHoveredCard(plan.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                  <div className="bg-gradient-to-r from-primary to-primary-dark text-background px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center space-x-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Más Popular</span>
                  </div>
                </div>
              )}

              {/* Card */}
              <div className={`relative bg-surface/90 backdrop-blur-sm rounded-3xl p-6 lg:p-8 shadow-xl border h-full overflow-hidden flex flex-col transition-all duration-300 ${
                plan.popular 
                  ? 'border-primary/60 ring-2 ring-primary/30 shadow-2xl shadow-primary/20 bg-gradient-to-br from-surface/95 to-primary/5' 
                  : 'border-border hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10'
              }`}>
                
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {/* Content */}
                <div className="relative z-10 flex flex-col h-full">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className={`plan-icon inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.gradient} text-white shadow-lg mb-4`}>
                      {plan.icon}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-text-primary mb-2">{plan.name}</h3>
                    <p className="text-text-secondary mb-6">{plan.description}</p>
                    
                    {/* Price */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-center space-x-2">
                        {plan.originalPrice && (
                          <span className="text-lg text-text-muted line-through">
                            {formatPrice(plan.originalPrice, plan.currency)}
                          </span>
                        )}
                        <span className="text-4xl font-bold text-text-primary">
                          {formatPrice(plan.price, plan.currency)}
                        </span>
                      </div>
                      <p className="text-text-secondary">por {plan.period}</p>
                      {plan.originalPrice && (
                        <div className="inline-flex items-center bg-success/20 text-success px-3 py-1 rounded-full text-sm font-medium">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Ahorra {Math.round((1 - plan.price / plan.originalPrice) * 100)}%
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-6 text-center">
                    <div className="bg-surface-light rounded-lg p-3">
                      <div className="text-lg font-bold" style={{ color: plan.color }}>
                        {plan.apiCalls === 10000 ? '∞' : plan.apiCalls.toLocaleString()}
                      </div>
                      <div className="text-xs text-text-secondary">API calls</div>
                    </div>
                    <div className="bg-surface-light rounded-lg p-3">
                      <div className="text-lg font-bold" style={{ color: plan.color }}>
                        <Brain className="w-5 h-5 mx-auto" />
                      </div>
                      <div className="text-xs text-text-secondary">IA Analysis</div>
                    </div>
                    <div className="bg-surface-light rounded-lg p-3">
                      <div className="text-lg font-bold" style={{ color: plan.color }}>
                        <Shield className="w-5 h-5 mx-auto" />
                      </div>
                      <div className="text-xs text-text-secondary">Support</div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-8 flex-grow">
                    <h4 className="font-semibold text-text-primary border-b border-primary/20 pb-3 text-sm uppercase tracking-wide">Características incluidas:</h4>
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="feature-item flex items-start space-x-3 group">
                        <div className="w-5 h-5 bg-success/20 rounded-full flex items-center justify-center mt-0.5 group-hover:bg-success/30 transition-colors">
                          <Check className="w-3 h-3 text-success" />
                        </div>
                        <span className="text-text-secondary text-sm leading-relaxed group-hover:text-text-primary transition-colors">{feature}</span>
                      </div>
                    ))}
                    
                    {plan.customFeatures && (
                      <>
                        <h5 className="font-medium text-text-primary mt-6 mb-4 flex items-center border-t border-primary/10 pt-4">
                          <div className="w-5 h-5 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center mr-2">
                            <Sparkles className="w-3 h-3 text-background" />
                          </div>
                          <span className="text-sm uppercase tracking-wide">Beneficios exclusivos:</span>
                        </h5>
                        {plan.customFeatures.map((feature, featureIndex) => (
                          <div key={featureIndex} className="feature-item flex items-start space-x-3 group">
                            <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center mt-0.5 group-hover:bg-primary/30 transition-colors">
                              <Sparkles className="w-3 h-3 text-primary" />
                            </div>
                            <span className="text-text-secondary text-sm font-medium leading-relaxed group-hover:text-text-primary transition-colors">{feature}</span>
                          </div>
                        ))}
                      </>
                    )}

                    {plan.limitations.length > 0 && (
                      <div className="mt-6 pt-4 border-t border-border">
                        <h5 className="text-xs text-text-secondary mb-2">Limitaciones:</h5>
                        {plan.limitations.map((limitation, limitIndex) => (
                          <div key={limitIndex} className="text-xs text-text-secondary opacity-60 mb-1">
                            • {limitation}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* CTA Button */}
                  <div className="mt-auto space-y-4">
                    <Link
                      to="/register"
                      className={`group w-full inline-flex items-center justify-center px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:-translate-y-1 ${
                        plan.popular
                          ? `bg-gradient-to-r ${plan.gradient} text-background shadow-lg hover:shadow-[0_8px_25px_-8px_rgba(62,207,142,0.6)] ring-2 ring-primary/20`
                          : 'bg-surface-light text-text-primary hover:bg-surface border border-border shadow-lg hover:shadow-[0_8px_25px_-8px_rgba(62,207,142,0.3)] hover:border-primary/50'
                      }`}
                    >
                      <span className="mr-2">Comenzar {plan.name}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <div className="text-center space-y-1">
                      <p className="text-xs text-text-secondary">
                        Sin permanencia • Cancela cuando quieras
                      </p>
                      <p className="text-xs text-primary font-medium">
                        ✨ Garantia de satisfacción de 30 días
                      </p>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-24 space-y-6">
          <div className="bg-surface backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto border border-border shadow-xl">
            <h3 className="text-2xl font-bold text-text-primary mb-4">
              ¿Necesitas algo diferente?
            </h3>
            <p className="text-text-secondary mb-6">
              Contactanos para crear un plan personalizado que se adapte a las necesidades específicas de tu empresa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-surface-light text-text-primary rounded-xl font-semibold border-2 border-border hover:border-primary/30 transition-all duration-300"
              >
                Solicitar Demo Personalizada
              </Link>
              <Link
                to="/help"
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-background rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              >
                Hablar con Ventas
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-8 text-sm text-text-secondary">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Garantía 30 días</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Migración gratuita</span>
            </div>
            <div className="flex items-center space-x-2">
              <Brain className="w-4 h-4" />
              <span>Onboarding incluido</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingCards;