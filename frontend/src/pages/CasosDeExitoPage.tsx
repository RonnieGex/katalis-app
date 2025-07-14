import React from 'react';
import { ArrowLeft, TrendingUp, DollarSign, Users, Award, Quote, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const CasosDeExitoPage: React.FC = () => {
  const casos = [
    {
      id: 1,
      empresa: "Café Central",
      sector: "Restaurantes",
      tamano: "PyME",
      logo: "☕",
      resultados: {
        crecimiento: "+145%",
        ahorro: "$180,000 MXN",
        tiempo: "15 horas/mes",
        roi: "320%"
      },
      testimonio: "KatalisApp nos ayudó a identificar que nuestros márgenes en bebidas especializadas eran 40% más altos que en alimentos. Reestructuramos nuestro menú y aumentamos las ventas significativamente.",
      autor: "María González",
      cargo: "Propietaria",
      desafio: "Márgenes de ganancia inconsistentes y falta de visibilidad en costos reales por producto.",
      solucion: "Implementación del módulo de análisis de rentabilidad por producto y optimización de precios con IA.",
      tiempo: "3 meses",
      capitulo: "Capítulo 5: Análisis de Rentabilidad"
    },
    {
      id: 2,
      empresa: "TechSolutions MX",
      sector: "Servicios de TI",
      tamano: "Mediana empresa",
      logo: "💻",
      resultados: {
        crecimiento: "+89%",
        ahorro: "$450,000 MXN",
        tiempo: "25 horas/mes",
        roi: "180%"
      },
      testimonio: "Antes de KatalisApp, tardábamos días en generar reportes financieros. Ahora tenemos insights en tiempo real que nos permiten tomar decisiones más rápidas y acertadas.",
      autor: "Carlos Mendoza",
      cargo: "CEO",
      desafio: "Procesos financieros manuales lentos y falta de proyecciones confiables para crecimiento.",
      solucion: "Dashboard automatizado con proyecciones IA y alertas inteligentes de flujo de efectivo.",
      tiempo: "4 meses",
      capitulo: "Capítulo 8: Automatización Financiera"
    },
    {
      id: 3,
      empresa: "Boutique Eleganza",
      sector: "Retail de moda",
      tamano: "Pequeña empresa",
      logo: "👗",
      resultados: {
        crecimiento: "+67%",
        ahorro: "$95,000 MXN",
        tiempo: "8 horas/mes",
        roi: "245%"
      },
      testimonio: "La IA de KatalisApp predijo que nuestro inventario de invierno tendría baja rotación. Ajustamos precios a tiempo y evitamos pérdidas importantes.",
      autor: "Ana Ruiz",
      cargo: "Gerente General",
      desafio: "Gestión de inventario ineficiente y dificultades para predecir tendencias de ventas.",
      solucion: "Módulo de predicción IA para inventario y análisis de punto de equilibrio dinámico.",
      tiempo: "2 meses",
      capitulo: "Capítulo 6: Gestión de Inventario"
    }
  ];

  const metricas = [
    {
      valor: "Demo",
      descripcion: "Cuenta gratuita disponible",
      icono: <Users className="w-8 h-8" />
    },
    {
      valor: "5",
      descripcion: "Módulos principales",
      icono: <DollarSign className="w-8 h-8" />
    },
    {
      valor: "100%",
      descripcion: "Basado en el libro",
      icono: <TrendingUp className="w-8 h-8" />
    },
    {
      valor: "IA",
      descripcion: "Asistente financiero",
      icono: <Award className="w-8 h-8" />
    }
  ];

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
            Casos de <span className="text-primary">Éxito Real</span>
          </h1>
          <p className="text-xl text-text-secondary max-w-3xl">
            Descubre cómo empresarios mexicanos han transformado sus finanzas aplicando 
            los conceptos de "Finanzas para Emprendedores" con KatalisApp.
          </p>
        </div>

        {/* Métricas de impacto */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {metricas.map((metrica, index) => (
            <div key={index} className="bg-surface rounded-2xl p-6 border border-border text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="text-primary">
                  {metrica.icono}
                </div>
              </div>
              <div className="text-2xl font-bold text-text-primary mb-2">{metrica.valor}</div>
              <div className="text-sm text-text-secondary">{metrica.descripcion}</div>
            </div>
          ))}
        </div>

        {/* Casos de éxito */}
        <div className="space-y-16">
          {casos.map((caso) => (
            <div key={caso.id} className="bg-surface rounded-3xl overflow-hidden border border-border shadow-xl">
              {/* Header del caso */}
              <div className="bg-gradient-to-r from-primary/10 to-primary-dark/10 p-8 border-b border-border">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-3xl">
                      {caso.logo}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-text-primary">{caso.empresa}</h2>
                      <p className="text-text-secondary">{caso.sector} • {caso.tamano}</p>
                      <div className="flex items-center space-x-1 mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-primary fill-current" />
                        ))}
                        <span className="text-sm text-text-secondary ml-2">Caso verificado</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="bg-success/20 text-success px-3 py-1 rounded-full text-sm font-medium">
                      {caso.tiempo} de implementación
                    </div>
                    <div className="text-xs text-text-secondary mt-2">
                      Basado en: {caso.capitulo}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Resultados */}
                  <div>
                    <h3 className="text-lg font-bold text-text-primary mb-4">Resultados Obtenidos</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-surface-light rounded-lg">
                        <span className="text-text-secondary">Crecimiento en ventas</span>
                        <span className="text-success font-bold">{caso.resultados.crecimiento}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-surface-light rounded-lg">
                        <span className="text-text-secondary">Ahorro anual</span>
                        <span className="text-primary font-bold">{caso.resultados.ahorro}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-surface-light rounded-lg">
                        <span className="text-text-secondary">Tiempo ahorrado</span>
                        <span className="text-text-primary font-bold">{caso.resultados.tiempo}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-success/10 rounded-lg border border-success/30">
                        <span className="text-text-secondary">ROI obtenido</span>
                        <span className="text-success font-bold text-lg">{caso.resultados.roi}</span>
                      </div>
                    </div>
                  </div>

                  {/* Historia del caso */}
                  <div className="lg:col-span-2 space-y-6">
                    <div>
                      <h4 className="font-semibold text-text-primary mb-2">El Desafío</h4>
                      <p className="text-text-secondary">{caso.desafio}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-text-primary mb-2">La Solución</h4>
                      <p className="text-text-secondary">{caso.solucion}</p>
                    </div>

                    {/* Testimonio */}
                    <div className="bg-primary/10 border border-primary/30 rounded-xl p-6">
                      <div className="flex items-start space-x-4">
                        <Quote className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                        <div>
                          <p className="text-text-primary font-medium italic mb-4">
                            "{caso.testimonio}"
                          </p>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                              <span className="text-background font-bold text-sm">
                                {caso.autor.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <div className="font-semibold text-text-primary">{caso.autor}</div>
                              <div className="text-sm text-text-secondary">{caso.cargo}, {caso.empresa}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA final */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-primary/10 to-primary-dark/10 rounded-3xl p-12 border border-primary/30">
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              ¿Listo para ser el próximo caso de éxito?
            </h2>
            <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
              Prueba gratis cómo los conceptos del libro "Finanzas para Emprendedores" 
              se convierten en herramientas prácticas con KatalisApp.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/demo"
                className="bg-primary hover:bg-primary-dark text-background px-8 py-4 rounded-lg font-semibold transition-all duration-300 shadow-lg shadow-primary/25"
              >
                Ver Demo Interactivo
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

export default CasosDeExitoPage;