import React, { useState } from 'react';
import { ArrowLeft, Search, MessageCircle, BookOpen, Video, Download, Phone, Mail, Clock, ChevronDown, ChevronRight, ExternalLink, HelpCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const CentroDeAyudaPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const categorias = [
    { id: 'todos', nombre: 'Todas las categorías', icono: <HelpCircle className="w-5 h-5" /> },
    { id: 'primeros-pasos', nombre: 'Primeros pasos', icono: <BookOpen className="w-5 h-5" /> },
    { id: 'configuracion', nombre: 'Configuración', icono: <CheckCircle className="w-5 h-5" /> },
    { id: 'integraciones', nombre: 'Integraciones', icono: <ExternalLink className="w-5 h-5" /> },
    { id: 'reportes', nombre: 'Reportes y análisis', icono: <Video className="w-5 h-5" /> },
    { id: 'facturacion', nombre: 'Facturación', icono: <Download className="w-5 h-5" /> },
    { id: 'tecnico', nombre: 'Soporte técnico', icono: <AlertCircle className="w-5 h-5" /> }
  ];

  const preguntasFrecuentes = [
    {
      id: 1,
      categoria: 'primeros-pasos',
      pregunta: '¿Cómo empiezo a usar KatalisApp?',
      respuesta: 'Para comenzar: 1) Crea tu cuenta gratuita, 2) Conecta tus cuentas bancarias, 3) Configura tus categorías de ingresos y gastos, 4) ¡Comienza a analizar tus finanzas! Te recomendamos comenzar con la guía "Fundamentos Financieros" del libro.',
      popularidad: 95
    },
    {
      id: 2,
      categoria: 'configuracion',
      pregunta: '¿Cómo conecto mi banco a KatalisApp?',
      respuesta: 'Ve a Configuración > Integraciones > Bancos. Selecciona tu banco de la lista, ingresa tus credenciales de banca en línea. Utilizamos conexión bancaria segura nivel 256-bit SSL. Nunca almacenamos tus credenciales bancarias.',
      popularidad: 88
    },
    {
      id: 3,
      categoria: 'reportes',
      pregunta: '¿Cómo interpretar el análisis de rentabilidad por producto?',
      respuesta: 'El análisis muestra: Margen bruto (ingresos - costos directos), Margen neto (después de gastos operativos), ROI por producto. Los productos en verde son altamente rentables, amarillo necesitan optimización, rojo requieren revisión urgente.',
      popularidad: 82
    },
    {
      id: 4,
      categoria: 'integraciones',
      pregunta: '¿Qué sistemas puedo integrar con KatalisApp?',
      respuesta: 'Integramos con: Bancos mexicanos (BBVA, Santander, Banamex, etc.), Sistemas de punto de venta (Square, Clip), Contabilidad (ContPAQi, CONTPAQi), E-commerce (Shopify, WooCommerce), y más de 500+ aplicaciones vía API.',
      popularidad: 75
    },
    {
      id: 5,
      categoria: 'facturacion',
      pregunta: '¿Cuándo se cobra mi suscripción?',
      respuesta: 'Las suscripciones se cobran mensualmente el día que te suscribiste. Recibes un email 3 días antes del cobro. Puedes cancelar en cualquier momento sin penalizaciones. Los datos se mantienen 30 días después de cancelar.',
      popularidad: 70
    },
    {
      id: 6,
      categoria: 'tecnico',
      pregunta: '¿Mis datos están seguros en KatalisApp?',
      respuesta: 'Absolutamente. Usamos encriptación AES-256, servidores en México, certificación SOC 2 Type II, autenticación de dos factores. Nunca vendemos datos. Cumplimos con LFPDPPP mexicana y GDPR europea.',
      popularidad: 92
    },
    {
      id: 7,
      categoria: 'reportes',
      pregunta: '¿Cómo configuro alertas de flujo de efectivo?',
      respuesta: 'Ve a Dashboard > Flujo de Efectivo > Configurar Alertas. Puedes establecer: Alertas de saldo mínimo, Proyecciones de déficit, Recordatorios de cuentas por cobrar. Las alertas llegan por email, SMS o push notification.',
      popularidad: 68
    },
    {
      id: 8,
      categoria: 'primeros-pasos',
      pregunta: '¿Necesito conocimientos contables para usar KatalisApp?',
      respuesta: 'No necesitas ser contador. KatalisApp traduce conceptos complejos a lenguaje simple. Incluye explicaciones de cada métrica, glossario integrado, y las guías del libro "Finanzas para Emprendedores" te van explicando paso a paso.',
      popularidad: 85
    }
  ];

  const recursosRapidos = [
    {
      titulo: 'Guía de inicio rápido',
      descripcion: 'Configura tu cuenta en 10 minutos',
      icono: <BookOpen className="w-6 h-6" />,
      link: '/guias-del-libro',
      tiempo: '10 min',
      tipo: 'Guía'
    },
    {
      titulo: 'Video: Conectar tu banco',
      descripcion: 'Tutorial paso a paso',
      icono: <Video className="w-6 h-6" />,
      link: '#',
      tiempo: '5 min',
      tipo: 'Video'
    },
    {
      titulo: 'Plantillas financieras',
      descripcion: 'Descarga plantillas útiles',
      icono: <Download className="w-6 h-6" />,
      link: '#',
      tiempo: 'Descarga',
      tipo: 'Recurso'
    },
    {
      titulo: 'Chat en vivo',
      descripcion: 'Habla con un experto ahora',
      icono: <MessageCircle className="w-6 h-6" />,
      link: '#',
      tiempo: 'Inmediato',
      tipo: 'Soporte'
    }
  ];

  const contactoSoporte = [
    {
      metodo: 'Chat en Vivo',
      descripcion: 'Respuesta inmediata de lunes a viernes 9AM-6PM',
      icono: <MessageCircle className="w-6 h-6" />,
      disponibilidad: 'En línea',
      estado: 'available'
    },
    {
      metodo: 'Email',
      descripcion: 'soporte@katalisapp.com - Respuesta en < 2 horas',
      icono: <Mail className="w-6 h-6" />,
      disponibilidad: '24/7',
      estado: 'available'
    },
    {
      metodo: 'Teléfono',
      descripcion: '+52 55 1234 5678 - Soporte técnico especializado',
      icono: <Phone className="w-6 h-6" />,
      disponibilidad: 'Lun-Vie 9AM-6PM',
      estado: 'available'
    },
    {
      metodo: 'Cita con Experto',
      descripcion: 'Sesión personalizada de 30 minutos',
      icono: <Clock className="w-6 h-6" />,
      disponibilidad: 'Agenda cita',
      estado: 'schedule'
    }
  ];

  const filteredFAQs = preguntasFrecuentes.filter(faq => {
    const matchesCategory = selectedCategory === 'todos' || faq.categoria === selectedCategory;
    const matchesSearch = faq.pregunta.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.respuesta.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <Link 
            to="/" 
            className="inline-flex items-center space-x-2 text-text-secondary hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al inicio</span>
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            Centro de <span className="text-primary">Ayuda</span>
          </h1>
          <p className="text-xl text-text-secondary max-w-3xl">
            Encuentra respuestas rápidas, guías detalladas y contacta con nuestro equipo de soporte.
          </p>
        </div>

        {/* Buscador */}
        <div className="mb-12">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-secondary w-5 h-5" />
              <input
                type="text"
                placeholder="Busca tu pregunta aquí..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-surface border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-text-primary text-lg"
              />
            </div>
          </div>
        </div>

        {/* Recursos rápidos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {recursosRapidos.map((recurso, index) => (
            <Link
              key={index}
              to={recurso.link}
              className="bg-surface hover:bg-surface-light border border-border rounded-2xl p-6 transition-all duration-300 hover:border-primary/30 group"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-background transition-colors">
                  {recurso.icono}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full inline-block">
                    {recurso.tipo}
                  </div>
                </div>
              </div>
              <h3 className="font-semibold text-text-primary mb-2">{recurso.titulo}</h3>
              <p className="text-text-secondary text-sm mb-3">{recurso.descripcion}</p>
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>{recurso.tiempo}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-4 gap-12">
          {/* Sidebar de categorías */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold text-text-primary mb-6">Categorías</h2>
            <div className="space-y-2">
              {categorias.map((categoria) => (
                <button
                  key={categoria.id}
                  onClick={() => setSelectedCategory(categoria.id)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                    selectedCategory === categoria.id
                      ? 'bg-primary text-background'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                  }`}
                >
                  {categoria.icono}
                  <span className="font-medium">{categoria.nombre}</span>
                </button>
              ))}
            </div>

            {/* Contacto rápido */}
            <div className="mt-8 bg-surface rounded-2xl p-6 border border-border">
              <h3 className="text-lg font-bold text-text-primary mb-4">¿Necesitas más ayuda?</h3>
              <div className="space-y-3">
                {contactoSoporte.map((contacto, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      contacto.estado === 'available' ? 'bg-primary/20 text-primary' : 'bg-warning/20 text-warning'
                    }`}>
                      {contacto.icono}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-text-primary text-sm">{contacto.metodo}</div>
                      <div className="text-text-secondary text-xs">{contacto.disponibilidad}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                to="/contacto"
                className="mt-4 w-full bg-primary hover:bg-primary-dark text-background py-2 px-4 rounded-lg font-semibold transition-colors text-center block"
              >
                Contactar Soporte
              </Link>
            </div>
          </div>

          {/* Preguntas frecuentes */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text-primary">
                Preguntas Frecuentes
                {filteredFAQs.length > 0 && (
                  <span className="text-text-secondary text-base font-normal ml-2">
                    ({filteredFAQs.length} resultados)
                  </span>
                )}
              </h2>
            </div>

            {filteredFAQs.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">No encontramos resultados</h3>
                <p className="text-text-secondary mb-4">
                  Intenta con otros términos o explora nuestras categorías.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('todos');
                  }}
                  className="text-primary hover:text-primary-dark font-medium"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFAQs.map((faq) => (
                  <div key={faq.id} className="bg-surface rounded-2xl border border-border overflow-hidden">
                    <button
                      onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                      className="w-full flex items-center justify-between p-6 text-left hover:bg-surface-light transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-text-primary mb-1">{faq.pregunta}</h3>
                        <div className="flex items-center space-x-3">
                          <span className="text-xs text-text-secondary">
                            {categorias.find(c => c.id === faq.categoria)?.nombre}
                          </span>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-primary rounded-full" />
                            <span className="text-xs text-text-secondary">{faq.popularidad}% útil</span>
                          </div>
                        </div>
                      </div>
                      <ChevronDown 
                        className={`w-5 h-5 text-text-secondary transition-transform ${
                          expandedFAQ === faq.id ? 'transform rotate-180' : ''
                        }`} 
                      />
                    </button>
                    
                    {expandedFAQ === faq.id && (
                      <div className="px-6 pb-6">
                        <div className="bg-surface-light rounded-lg p-4 border border-border">
                          <p className="text-text-secondary leading-relaxed">{faq.respuesta}</p>
                          <div className="mt-4 flex items-center space-x-4 text-xs">
                            <button className="text-primary hover:text-primary-dark">
                              ¿Fue útil esta respuesta?
                            </button>
                            <button className="text-text-secondary hover:text-text-primary">
                              Reportar problema
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CTA de contacto */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-primary/10 to-primary-dark/10 rounded-3xl p-12 border border-primary/30">
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              ¿No encontraste lo que buscabas?
            </h2>
            <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
              Nuestro equipo de soporte está disponible para ayudarte con cualquier duda 
              específica sobre KatalisApp o sobre finanzas empresariales.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {contactoSoporte.slice(0, 3).map((contacto, index) => (
                <div key={index} className="bg-surface rounded-2xl p-6 border border-border">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <div className="text-primary">
                      {contacto.icono}
                    </div>
                  </div>
                  <h3 className="font-semibold text-text-primary mb-2">{contacto.metodo}</h3>
                  <p className="text-text-secondary text-sm mb-3">{contacto.descripcion}</p>
                  <div className={`text-xs font-medium px-3 py-1 rounded-full ${
                    contacto.estado === 'available' 
                      ? 'bg-success/20 text-success' 
                      : 'bg-warning/20 text-warning'
                  }`}>
                    {contacto.disponibilidad}
                  </div>
                </div>
              ))}
            </div>
            <Link
              to="/contacto"
              className="mt-8 inline-block bg-primary hover:bg-primary-dark text-background px-8 py-4 rounded-lg font-semibold transition-all duration-300 shadow-lg shadow-primary/25"
            >
              Contactar Soporte Ahora
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CentroDeAyudaPage;