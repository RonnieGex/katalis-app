import { useState, useRef, useEffect } from 'react'
import gsap from 'gsap'
import { 
  MessageCircle,
  Book,
  Video,
  Mail,
  Search,
  ChevronRight,
  ExternalLink,
  Clock,
  CheckCircle,
  Info,
  Lightbulb,
  BookOpen,
  Users,
  FileText,
  Star
} from 'lucide-react'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
}

interface SupportResource {
  id: string
  title: string
  description: string
  type: 'video' | 'article' | 'guide' | 'webinar'
  duration?: string
  chapter?: string
  icon: React.ReactNode
}

const Support = () => {
  const pageRef = useRef<HTMLDivElement>(null)
  const [activeCategory, setActiveCategory] = useState('general')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)

  // FAQ Data
  const faqData: FAQItem[] = [
    {
      id: '1',
      category: 'general',
      question: '¿Qué es KatalisApp y cómo puede ayudar a mi negocio?',
      answer: 'KatalisApp es una plataforma educativa de finanzas para emprendedores basada en el libro "Finanzas para Emprendedores". Te ayuda a entender conceptos clave como Unit Economics, LTV/COCA, flujo de caja y rentabilidad a través de calculadoras interactivas y análisis con IA.'
    },
    {
      id: '2',
      category: 'general',
      question: '¿Necesito conocimientos previos de finanzas para usar KatalisApp?',
      answer: 'No, KatalisApp está diseñado específicamente para emprendedores sin formación financiera formal. Cada concepto incluye explicaciones educativas, ejemplos prácticos del libro y tooltips interactivos que te guían paso a paso.'
    },
    {
      id: '3',
      category: 'calculators',
      question: '¿Cómo funcionan las calculadoras de Unit Economics?',
      answer: 'Las calculadoras toman los datos de tu negocio (costos de adquisición, ingresos por cliente, tiempo de vida) y calculan automáticamente métricas clave como LTV, COCA, y la ratio LTV/COCA. Incluyen validaciones y recomendaciones basadas en las mejores prácticas del libro.'
    },
    {
      id: '4',
      category: 'calculators',
      question: '¿Puedo exportar los resultados de mis análisis?',
      answer: 'Sí, puedes exportar todos los análisis en formato PDF, Excel o CSV. Los reportes incluyen gráficos, explicaciones educativas y recomendaciones personalizadas para tu negocio.'
    },
    {
      id: '5',
      category: 'ai',
      question: '¿Cómo funciona el análisis con IA?',
      answer: 'La IA analiza tus datos financieros y proporciona insights personalizados basados en los principios del libro. Identifica patrones, sugiere optimizaciones y te alerta sobre posibles riesgos financieros.'
    },
    {
      id: '6',
      category: 'ai',
      question: '¿Mis datos están seguros con el análisis de IA?',
      answer: 'Sí, todos los datos se procesan de forma segura y privada. No compartimos información financiera con terceros y usamos encriptación de nivel empresarial para proteger tu información.'
    },
    {
      id: '7',
      category: 'account',
      question: '¿Cómo cambio mi plan de suscripción?',
      answer: 'Ve a Configuración > Cuenta > Plan de Suscripción. Ahí puedes actualizar tu plan, ver el uso actual y gestionar métodos de pago.'
    },
    {
      id: '8',
      category: 'account',
      question: '¿Puedo cancelar mi suscripción en cualquier momento?',
      answer: 'Sí, puedes cancelar tu suscripción en cualquier momento desde la configuración de tu cuenta. Mantendrás acceso hasta el final del período facturado.'
    }
  ]

  // Support Resources
  const supportResources: SupportResource[] = [
    {
      id: '1',
      title: 'Fundamentos de Unit Economics',
      description: 'Aprende los conceptos básicos de Unit Economics y cómo aplicarlos a tu negocio',
      type: 'video',
      duration: '15 min',
      chapter: 'Capítulo 5',
      icon: <Video className="w-5 h-5" />
    },
    {
      id: '2',
      title: 'Guía completa de LTV/COCA',
      description: 'Tutorial paso a paso para calcular y optimizar tu ratio LTV/COCA',
      type: 'guide',
      duration: '20 min',
      chapter: 'Capítulo 6',
      icon: <BookOpen className="w-5 h-5" />
    },
    {
      id: '3',
      title: 'Análisis de Flujo de Caja',
      description: 'Cómo proyectar y gestionar el flujo de caja de tu startup',
      type: 'article',
      duration: '10 min',
      chapter: 'Capítulo 3',
      icon: <FileText className="w-5 h-5" />
    },
    {
      id: '4',
      title: 'Webinar: Errores comunes en finanzas para startups',
      description: 'Sesión en vivo sobre los errores más frecuentes y cómo evitarlos',
      type: 'webinar',
      duration: '45 min',
      icon: <Users className="w-5 h-5" />
    }
  ]

  const categories = [
    { id: 'general', label: 'General', count: faqData.filter(f => f.category === 'general').length },
    { id: 'calculators', label: 'Calculadoras', count: faqData.filter(f => f.category === 'calculators').length },
    { id: 'ai', label: 'Análisis IA', count: faqData.filter(f => f.category === 'ai').length },
    { id: 'account', label: 'Cuenta', count: faqData.filter(f => f.category === 'account').length }
  ]

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.support-header',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 }
      )
      gsap.fromTo('.support-card',
        { scale: 0.95, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, stagger: 0.1, delay: 0.2 }
      )
    })

    return () => ctx.revert()
  }, [])

  const filteredFAQs = faqData.filter(faq => 
    (activeCategory === 'general' || faq.category === activeCategory) &&
    (searchQuery === '' || 
     faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
     faq.answer.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'text-error bg-error/10'
      case 'guide': return 'text-primary bg-primary/10'
      case 'article': return 'text-success bg-success/10'
      case 'webinar': return 'text-warning bg-warning/10'
      default: return 'text-text-secondary bg-surface-light'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'video': return 'Video'
      case 'guide': return 'Guía'
      case 'article': return 'Artículo'
      case 'webinar': return 'Webinar'
      default: return type
    }
  }

  return (
    <div className="min-h-screen bg-background py-20">
      <div className="container mx-auto px-4">
        <div ref={pageRef} className="space-y-8">
      {/* Header */}
      <div className="support-header">
        <h1 className="text-3xl font-bold mb-2">Centro de Ayuda y Soporte</h1>
        <p className="text-text-secondary mb-6">
          Encuentra respuestas, tutoriales y recursos para aprovechar al máximo KatalisApp.
          Basado en "Finanzas para Emprendedores".
        </p>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="support-card card hover:shadow-lg transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Chat en Vivo</h3>
                <p className="text-sm text-text-secondary">Habla con nuestro equipo</p>
                <span className="text-xs text-success">● Disponible ahora</span>
              </div>
            </div>
          </div>

          <div className="support-card card hover:shadow-lg transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success/10 rounded-lg">
                <Mail className="w-6 h-6 text-success" />
              </div>
              <div>
                <h3 className="font-semibold">Email</h3>
                <p className="text-sm text-text-secondary">soporte@katalisapp.com</p>
                <span className="text-xs text-text-secondary">Respuesta en 24h</span>
              </div>
            </div>
          </div>

          <div className="support-card card hover:shadow-lg transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-warning/10 rounded-lg">
                <Book className="w-6 h-6 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold">Documentación</h3>
                <p className="text-sm text-text-secondary">Guías completas</p>
                <span className="text-xs text-text-secondary">Siempre actualizada</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="support-card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar en preguntas frecuentes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-12">
        {/* FAQ Categories */}
        <div className="lg:col-span-1">
          <div className="support-card">
            <h3 className="font-semibold mb-4">Categorías</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                    activeCategory === category.id 
                      ? 'bg-primary/10 text-primary' 
                      : 'hover:bg-surface-light text-text-secondary'
                  }`}
                >
                  <span>{category.label}</span>
                  <span className="text-xs bg-surface-light px-2 py-1 rounded-full">
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ List */}
        <div className="lg:col-span-3 space-y-4">
          <h3 className="font-semibold">Preguntas Frecuentes</h3>
          
          {filteredFAQs.length === 0 ? (
            <div className="support-card card text-center py-8">
              <Info className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <p className="text-text-secondary">No se encontraron preguntas que coincidan con tu búsqueda.</p>
            </div>
          ) : (
            filteredFAQs.map((faq) => (
              <div key={faq.id} className="support-card card">
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <h4 className="font-medium pr-4">{faq.question}</h4>
                  <ChevronRight 
                    className={`w-5 h-5 text-text-muted transition-transform ${
                      expandedFAQ === faq.id ? 'rotate-90' : ''
                    }`} 
                  />
                </button>
                
                {expandedFAQ === faq.id && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-text-secondary leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Educational Resources */}
      <div className="support-card card">
        <div className="flex items-center gap-3 mb-6">
          <Lightbulb className="w-6 h-6 text-warning" />
          <h3 className="text-lg font-semibold">Recursos Educativos</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {supportResources.map((resource) => (
            <div key={resource.id} className="tool-card-enhanced cursor-pointer">
              <span className="tool-badge-enhanced">
                {getTypeLabel(resource.type)}
              </span>
              
              <div className="tool-icon-enhanced">
                {resource.icon}
              </div>
              
              <h4 className="tool-title-enhanced">{resource.title}</h4>
              <p className="tool-description-enhanced">{resource.description}</p>
              
              <div className="flex items-center gap-4 text-xs text-text-secondary mb-4">
                {resource.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {resource.duration}
                  </span>
                )}
                {resource.chapter && (
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    {resource.chapter}
                  </span>
                )}
              </div>
              
              <div className="tool-cta-enhanced">
                Ver recurso
                <span className="tool-cta-arrow">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="support-card card bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">¿No encontraste lo que buscabas?</h3>
          <p className="text-text-secondary mb-6">
            Nuestro equipo de soporte está aquí para ayudarte con cualquier pregunta específica sobre tu negocio.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Iniciar Chat
            </button>
            <button className="btn-secondary flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Enviar Email
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-border/50">
            <div className="flex items-center justify-center gap-6 text-sm text-text-secondary">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>Respuesta promedio: 2h</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-warning" />
                <span>Satisfacción: 98%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
        </div>
      </div>
    </div>
  )
}

export default Support