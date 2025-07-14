import React from 'react';
import { ArrowLeft, BookOpen, Clock, Users, CheckCircle, ArrowRight, Star, Download } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthProvider';

const GuiasDelLibroPage: React.FC = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleGuideNavigation = (guideId: number) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { returnTo: getGuideRoute(guideId) } })
      return
    }
    navigate(getGuideRoute(guideId))
  }

  const getGuideRoute = (guideId: number) => {
    switch (guideId) {
      case 1: return "/app/dashboard"
      case 2: return "/app/reports"
      case 3: return "/app/cash-flow"
      case 4: return "/app/automation"
      case 5: return "/app/growth"
      default: return "/app/dashboard"
    }
  }

  const guias = [
    {
      id: 1,
      capitulo: "Capítulo 1",
      titulo: "Fundamentos Financieros",
      descripcion: "Conceptos básicos que todo emprendedor debe dominar antes de lanzar su negocio.",
      duracion: "15 min",
      dificultad: "Principiante",
      topicos: [
        "Estados financieros básicos",
        "Diferencia entre ingresos y ganancias",
        "Importancia del flujo de efectivo",
        "Conceptos de activos y pasivos"
      ],
      herramientasKatalis: [
        "Dashboard financiero básico",
        "Calculadora de punto de equilibrio",
        "Plantillas de estados financieros"
      ],
      recursos: {
        pdf: "capitulo-1-fundamentos.pdf",
        video: "Explicación interactiva (8 min)",
        ejercicios: "3 ejercicios prácticos"
      },
      implementacion: "Configura tu primer dashboard en KatalisApp y conecta tus cuentas bancarias para comenzar el seguimiento automático.",
      resultadoEsperado: "Comprenderás los fundamentos y tendrás visibilidad completa de tu situación financiera actual."
    },
    {
      id: 2,
      titulo: "Análisis de Rentabilidad",
      capitulo: "Capítulo 5",
      descripcion: "Aprende a identificar qué productos o servicios realmente generan valor en tu negocio.",
      duracion: "20 min",
      dificultad: "Intermedio",
      topicos: [
        "Cálculo de márgenes por producto",
        "Análisis ABC de productos",
        "Costos directos e indirectos",
        "Estrategias de precios"
      ],
      herramientasKatalis: [
        "Análisis de rentabilidad por producto",
        "Simulador de precios con IA",
        "Reportes de márgenes automatizados"
      ],
      recursos: {
        pdf: "capitulo-5-rentabilidad.pdf",
        video: "Caso práctico real (12 min)",
        ejercicios: "5 ejercicios con datos reales"
      },
      implementacion: "Utiliza el módulo de análisis de rentabilidad para identificar tus productos estrella y optimizar precios.",
      resultadoEsperado: "Identificarás qué productos eliminar, cuáles potenciar y cómo optimizar tus precios para maximizar ganancias."
    },
    {
      id: 3,
      titulo: "Gestión de Flujo de Efectivo",
      capitulo: "Capítulo 3",
      descripcion: "Domina el arte de mantener liquidez y proyectar necesidades financieras futuras.",
      duracion: "25 min",
      dificultad: "Intermedio",
      topicos: [
        "Proyecciones de flujo de efectivo",
        "Gestión de cuentas por cobrar",
        "Optimización de pagos",
        "Reservas de emergencia"
      ],
      herramientasKatalis: [
        "Proyector de flujo con IA",
        "Alertas automáticas de liquidez",
        "Dashboard de cuentas por cobrar"
      ],
      recursos: {
        pdf: "capitulo-3-flujo-efectivo.pdf",
        video: "Masterclass completa (18 min)",
        ejercicios: "Simulador de escenarios"
      },
      implementacion: "Configura alertas de flujo de efectivo y establece proyecciones automáticas basadas en tu historial.",
      resultadoEsperado: "Nunca más te quedarás sin efectivo. Tendrás proyecciones precisas y alertas tempranas."
    },
    {
      id: 4,
      titulo: "Automatización Financiera",
      capitulo: "Capítulo 8",
      descripcion: "Implementa sistemas que trabajen por ti las 24 horas del día.",
      duracion: "30 min",
      dificultad: "Avanzado",
      topicos: [
        "Automatización de reportes",
        "Integración de sistemas",
        "IA para predicciones",
        "Dashboards en tiempo real"
      ],
      herramientasKatalis: [
        "Automatización completa de reportes",
        "Integración con bancos y sistemas",
        "IA predictiva avanzada"
      ],
      recursos: {
        pdf: "capitulo-8-automatizacion.pdf",
        video: "Configuración paso a paso (25 min)",
        ejercicios: "Implementación guiada"
      },
      implementacion: "Configura la automatización completa de KatalisApp para eliminar tareas manuales repetitivas.",
      resultadoEsperado: "Reducirás 80% del tiempo en tareas administrativas y tendrás información actualizada automáticamente."
    },
    {
      id: 5,
      titulo: "Estrategias de Crecimiento",
      capitulo: "Capítulo 10",
      descripcion: "Planifica y ejecuta el crecimiento sostenible de tu empresa.",
      duracion: "35 min",
      dificultad: "Avanzado",
      topicos: [
        "Modelos de escalamiento",
        "Financiamiento del crecimiento",
        "Métricas de crecimiento sostenible",
        "Planificación estratégica"
      ],
      herramientasKatalis: [
        "Simulador de crecimiento",
        "Análisis de capacidad financiera",
        "Planificador estratégico con IA"
      ],
      recursos: {
        pdf: "capitulo-10-crecimiento.pdf",
        video: "Estrategias probadas (30 min)",
        ejercicios: "Plan de crecimiento personalizado"
      },
      implementacion: "Desarrolla tu plan de crecimiento usando las herramientas de simulación y análisis de KatalisApp.",
      resultadoEsperado: "Tendrás un plan de crecimiento sólido, financieramente viable y con métricas claras de seguimiento."
    }
  ];

  const estadisticas = [
    {
      valor: "12",
      descripcion: "Capítulos del libro",
      icono: <BookOpen className="w-6 h-6" />
    },
    {
      valor: "45+",
      descripcion: "Herramientas prácticas",
      icono: <CheckCircle className="w-6 h-6" />
    },
    {
      valor: "1,200+",
      descripcion: "Empresarios implementando",
      icono: <Users className="w-6 h-6" />
    },
    {
      valor: "95%",
      descripcion: "Tasa de éxito",
      icono: <Star className="w-6 h-6" />
    }
  ];

  const getDifficultyColor = (dificultad: string) => {
    switch (dificultad) {
      case 'Principiante':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Intermedio':
        return 'bg-warning/20 text-warning border-warning/30';
      case 'Avanzado':
        return 'bg-error/20 text-error border-error/30';
      default:
        return 'bg-primary/20 text-primary border-primary/30';
    }
  };

  return (
    <div className="min-h-screen bg-background py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-16">
          <Link 
            to="/" 
            className="inline-flex items-center space-x-2 text-text-secondary hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al inicio</span>
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            Guías del <span className="text-primary">Libro</span>
          </h1>
          <p className="text-xl text-text-secondary max-w-3xl">
            Implementa paso a paso los conceptos de "Finanzas para Emprendedores" 
            con herramientas prácticas de KatalisApp.
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {estadisticas.map((stat, index) => (
            <div key={index} className="bg-surface rounded-2xl p-6 border border-border text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="text-primary">
                  {stat.icono}
                </div>
              </div>
              <div className="text-2xl font-bold text-text-primary mb-2">{stat.valor}</div>
              <div className="text-sm text-text-secondary">{stat.descripcion}</div>
            </div>
          ))}
        </div>

        {/* Hero del libro */}
        <div className="bg-gradient-to-r from-primary/10 to-primary-dark/10 rounded-3xl p-8 mb-16 border border-primary/30">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-text-primary mb-4">
                "Finanzas para Emprendedores"
              </h2>
              <p className="text-text-secondary mb-6">
                El libro que ha transformado miles de negocios ahora cobra vida con 
                KatalisApp. Cada concepto se convierte en una herramienta práctica que 
                puedes usar inmediatamente en tu empresa.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/demo"
                  className="bg-primary hover:bg-primary-dark text-background px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg shadow-primary/25 flex items-center justify-center space-x-2"
                >
                  <BookOpen className="w-5 h-5" />
                  <span>Ver Demo Interactivo</span>
                </Link>
                <a 
                  href="/resources/finanzas-emprendedores-resumen.pdf" 
                  download
                  className="border border-primary text-primary hover:bg-primary hover:text-background px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Descargar Resumen</span>
                </a>
              </div>
            </div>
            <div className="bg-surface rounded-2xl p-6 border border-border">
              <h3 className="text-lg font-bold text-text-primary mb-4">Progreso del Curso</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary text-sm">Guías completadas</span>
                  <span className="text-primary font-bold">0/5</span>
                </div>
                <div className="w-full bg-surface-light rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '0%' }} />
                </div>
                <div className="text-xs text-text-secondary">
                  Comienza con "Fundamentos Financieros" para desbloquear las siguientes guías
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Guías del libro */}
        <div className="space-y-8">
          {guias.map((guia, index) => (
            <div key={guia.id} className="bg-surface rounded-3xl overflow-hidden border border-border shadow-xl">
              {/* Header de la guía */}
              <div className="bg-gradient-to-r from-primary/10 to-primary-dark/10 p-6 border-b border-border">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-2xl font-bold text-background">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm text-primary font-medium mb-1">{guia.capitulo}</div>
                      <h2 className="text-2xl font-bold text-text-primary">{guia.titulo}</h2>
                      <p className="text-text-secondary mt-2">{guia.descripcion}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(guia.dificultad)}`}>
                      {guia.dificultad}
                    </div>
                    <div className="flex items-center space-x-2 mt-2 text-text-secondary text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{guia.duracion}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Contenido del capítulo */}
                  <div>
                    <h3 className="text-lg font-bold text-text-primary mb-4">Temas Principales</h3>
                    <ul className="space-y-2">
                      {guia.topicos.map((topico, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-text-secondary text-sm">{topico}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Herramientas de KatalisApp */}
                  <div>
                    <h3 className="text-lg font-bold text-text-primary mb-4">Herramientas KatalisApp</h3>
                    <ul className="space-y-2">
                      {guia.herramientasKatalis.map((herramienta, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <div className="w-4 h-4 bg-primary/20 rounded flex items-center justify-center mt-0.5 flex-shrink-0">
                            <div className="w-2 h-2 bg-primary rounded" />
                          </div>
                          <span className="text-text-secondary text-sm">{herramienta}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recursos disponibles */}
                  <div>
                    <h3 className="text-lg font-bold text-text-primary mb-4">Recursos</h3>
                    <div className="space-y-3">
                      <a 
                        href={`/resources/${guia.recursos.pdf}`}
                        download
                        className="bg-surface-light rounded-lg p-3 border border-border hover:bg-primary/10 hover:border-primary/30 transition-all cursor-pointer block"
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <Download className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium text-text-primary">PDF Descargable</span>
                        </div>
                        <span className="text-xs text-text-secondary">{guia.recursos.pdf}</span>
                      </a>
                      <button 
                        onClick={() => window.open(`/videos/capitulo-${guia.id}-video`, '_blank')}
                        className="bg-surface-light rounded-lg p-3 border border-border hover:bg-primary/10 hover:border-primary/30 transition-all cursor-pointer block w-full text-left"
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <BookOpen className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium text-text-primary">Video Explicativo</span>
                        </div>
                        <span className="text-xs text-text-secondary">{guia.recursos.video}</span>
                      </button>
                      <button
                        onClick={() => handleGuideNavigation(guia.id)}
                        className="bg-surface-light rounded-lg p-3 border border-border hover:bg-primary/10 hover:border-primary/30 transition-all cursor-pointer block w-full text-left"
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <CheckCircle className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium text-text-primary">Ejercicios Prácticos</span>
                        </div>
                        <span className="text-xs text-text-secondary">{guia.recursos.ejercicios}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Implementación y resultados */}
                <div className="mt-8 grid md:grid-cols-2 gap-6">
                  <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
                    <h4 className="font-semibold text-text-primary mb-2">Cómo Implementar</h4>
                    <p className="text-text-secondary text-sm">{guia.implementacion}</p>
                  </div>
                  <div className="bg-success/10 border border-success/30 rounded-xl p-4">
                    <h4 className="font-semibold text-text-primary mb-2">Resultado Esperado</h4>
                    <p className="text-text-secondary text-sm">{guia.resultadoEsperado}</p>
                  </div>
                </div>

                {/* Botón de acción */}
                <div className="mt-6 text-center">
                  <button 
                    onClick={() => handleGuideNavigation(guia.id)}
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary to-primary-dark text-background px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
                  >
                    <span>Comenzar Guía</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA final */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-primary/10 to-primary-dark/10 rounded-3xl p-12 border border-primary/30">
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              ¿Listo para dominar las finanzas de tu negocio?
            </h2>
            <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
              Comienza tu transformación financiera hoy mismo con las guías del libro 
              y las herramientas de KatalisApp.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-primary hover:bg-primary-dark text-background px-8 py-4 rounded-lg font-semibold transition-all duration-300 shadow-lg shadow-primary/25"
              >
                Comenzar Ahora Gratis
              </Link>
              <Link
                to="/contacto"
                className="border border-primary text-primary hover:bg-primary hover:text-background px-8 py-4 rounded-lg font-semibold transition-all duration-300"
              >
                Hablar con un Experto
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuiasDelLibroPage;