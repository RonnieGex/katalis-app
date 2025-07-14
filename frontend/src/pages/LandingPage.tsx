import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import 'gsap/ScrollTrigger'
import { 
  TrendingUp, 
  Shield, 
  BarChart3, 
  DollarSign, 
  PieChart,
  Brain,
  BookOpen,
  Sparkles
} from 'lucide-react'
import AnimatedHero from '../components/animations/AnimatedHero'
import LazyAnimationWrapper from '../components/common/LazyAnimationWrapper'
import InteractiveDemo from '../components/animations/InteractiveDemo'

const LandingPage = () => {
  const featuresRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animations
      gsap.timeline()
        .fromTo('.hero-title', 
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, stagger: 0.2 }
        )
        .fromTo('.hero-cta',
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
          '-=0.5'
        )
        .fromTo('.hero-stats',
          { scale: 0.9, opacity: 0 },
          { scale: 1, opacity: 1, duration: 1 },
          '-=0.5'
        )

      // Features animation
      gsap.fromTo('.feature-card',
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          scrollTrigger: {
            trigger: featuresRef.current,
            start: 'top 80%',
          }
        }
      )

      // Stats counter animation
      const stats = document.querySelectorAll('.stat-number')
      stats.forEach((stat) => {
        const target = parseInt(stat.getAttribute('data-target') || '0')
        const counter = { value: 0 }
        
        gsap.to(counter, {
          value: target,
          duration: 2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: stat,
            start: 'top 85%',
          },
          onUpdate: () => {
            stat.textContent = Math.round(counter.value).toLocaleString()
          }
        })
      })
    })

    return () => ctx.revert()
  }, [])

  const features = [
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Gestión de Costos y Precios",
      badge: "Módulo Principal",
      description: "Calcula puntos de equilibrio, márgenes y simula estrategias de precios en tiempo real.",
      color: "text-primary"
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "Control de Flujo de Efectivo",
      badge: "Esencial",
      description: "Proyecta tu flujo de caja y anticipa problemas de liquidez antes de que ocurran.",
      color: "text-success"
    },
    {
      icon: <PieChart className="w-6 h-6" />,
      title: "Análisis de Rentabilidad",
      badge: "Inteligente",
      description: "Visualiza la rentabilidad por producto, cliente o período con diagnósticos automáticos.",
      color: "text-warning"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Planificación Financiera",
      badge: "Estratégico",
      description: "Crea presupuestos, establece metas y recibe guías para tu primera inversión segura.",
      color: "text-primary"
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Basado en el Libro",
      badge: "Educativo",
      description: 'Cada herramienta incluye referencias y consejos del libro "Finanzas para Emprendedores".',
      color: "text-error"
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "IA Asistente Financiero",
      badge: "Próximamente",
      description: "Próximamente: Tu consultor financiero 24/7 que responde en lenguaje natural.",
      color: "text-primary"
    }
  ]

  return (
    <>
      {/* SEO Structured Data for Landing Page */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "KatalisApp - Finanzas Inteligentes para Emprendedores",
          "description": "Plataforma de IA financiera que transforma conceptos del libro 'Finanzas para Emprendedores' en herramientas prácticas para el éxito empresarial",
          "url": "https://katalisapp.com",
          "mainEntity": {
            "@type": "SoftwareApplication",
            "name": "KatalisApp",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "299",
              "priceCurrency": "MXN"
            }
          },
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Inicio",
                "item": "https://katalisapp.com"
              }
            ]
          }
        })
      }} />

      <div className="overflow-hidden">
        {/* Animated Hero Section */}
        <AnimatedHero />

        {/* Feature Showcase */}
        <LazyAnimationWrapper
          animationFactory={() => import('../components/animations/FeatureShowcase')}
          fallback={
            <div className="min-h-[600px] bg-surface/50 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-text-secondary">Cargando características...</p>
              </div>
            </div>
          }
        />

        {/* Interactive Demo - Direct loading (temporarily) */}
        <InteractiveDemo />

        {/* Pricing Section */}
        <LazyAnimationWrapper
          animationFactory={() => import('../components/animations/PricingCards')}
          fallback={
            <div className="min-h-[600px] bg-surface/50 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-text-secondary">Cargando precios...</p>
              </div>
            </div>
          }
        />

      {/* Features Section */}
      <section ref={featuresRef} id="features" className="py-20 bg-surface/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Herramientas Diseñadas para tu <span className="gradient-text">Éxito</span>
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Cada módulo está pensado para resolver los desafíos financieros reales que enfrentan los emprendedores día a día.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="tool-card-enhanced">
                <span className="tool-badge-enhanced">
                  {feature.badge}
                </span>
                
                <div className="tool-icon-enhanced">
                  {feature.icon}
                </div>
                
                <h3 className="tool-title-enhanced">{feature.title}</h3>
                <p className="tool-description-enhanced">{feature.description}</p>
                
                <div className="tool-cta-enhanced">
                  Explorar herramienta
                  <span className="tool-cta-arrow">→</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-text-secondary flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" />
              Tus datos están protegidos con encriptación de nivel bancario
            </p>
          </div>
        </div>
      </section>

      {/* Demo Access Section */}
      <section ref={statsRef} className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Prueba KatalisApp <span className="gradient-text">Gratis</span>
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Accede a todas las herramientas con nuestra cuenta demo sin necesidad de registro.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-surface border border-border rounded-2xl p-6">
              <h3 className="text-xl font-bold text-text-primary mb-4">Cuenta Demo Completa</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Email:</span>
                  <span className="text-primary font-medium">demo@katalisapp.com</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Contraseña:</span>
                  <span className="text-primary font-medium">demo123456</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Acceso:</span>
                  <span className="text-success font-medium">Completo</span>
                </div>
              </div>
              <Link 
                to="/demo" 
                className="w-full btn-primary text-center block"
              >
                Probar Demo Interactivo
              </Link>
            </div>
            
            <div className="bg-surface border border-border rounded-2xl p-6">
              <h3 className="text-xl font-bold text-text-primary mb-4">¿Qué Incluye?</h3>
              <ul className="space-y-3 text-text-secondary">
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  <span>Análisis de flujo de efectivo</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  <span>Cálculo de unit economics</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  <span>Gestión de costos y precios</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  <span>Análisis de rentabilidad</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  <span>IA financiero asistente</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-transparent">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Comienza tu Transformación <span className="gradient-text">Financiera</span> Hoy
          </h2>
          <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
            Únete a miles de emprendedores que ya están tomando el control de sus finanzas
          </p>
          <Link to="/register" className="btn-primary text-lg px-8 py-3 inline-flex items-center group">
            Prueba Gratis por 14 Días
            <Sparkles className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
          </Link>
          <p className="text-sm text-text-secondary mt-4">
            No se requiere tarjeta de crédito
          </p>
        </div>
      </section>
      </div>
    </>
  )
}

export default LandingPage