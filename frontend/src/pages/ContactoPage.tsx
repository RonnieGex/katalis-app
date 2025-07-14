import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Send, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ContactoPage: React.FC = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    empresa: '',
    telefono: '',
    mensaje: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar el formulario
    console.log('Datos del formulario:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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
            Contacta con <span className="text-primary">KatalisApp</span>
          </h1>
          <p className="text-xl text-text-secondary max-w-3xl">
            ¿Tienes preguntas sobre cómo KatalisApp puede transformar las finanzas de tu negocio? 
            Estamos aquí para ayudarte a dar el siguiente paso.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Información de contacto */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-6">Información de Contacto</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">Email</h3>
                    <p className="text-text-secondary">contacto@katalisapp.com</p>
                    <p className="text-text-secondary">soporte@katalisapp.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">Teléfono</h3>
                    <p className="text-text-secondary">+52 55 1234 5678</p>
                    <p className="text-text-secondary text-sm">Lun - Vie, 9:00 AM - 6:00 PM (GMT-6)</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">Oficina</h3>
                    <p className="text-text-secondary">Ciudad de México, México</p>
                    <p className="text-text-secondary text-sm">Atención presencial con cita previa</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">Chat en Vivo</h3>
                    <p className="text-text-secondary">Disponible en nuestra plataforma</p>
                    <p className="text-text-secondary text-sm">Respuesta inmediata</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Demo Info */}
            <div className="bg-surface rounded-2xl p-6 border border-border">
              <h3 className="text-lg font-bold text-text-primary mb-4">Prueba Sin Compromiso</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Demo account</span>
                  <span className="text-primary font-semibold">Disponible</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Acceso completo</span>
                  <span className="text-success font-semibold">Gratis</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Basado en</span>
                  <span className="text-text-primary font-semibold">Libro validado</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-primary/10 border border-primary/30 rounded-lg">
                <p className="text-xs text-text-secondary">
                  Email: demo@katalisapp.com<br />
                  Contraseña: demo123456
                </p>
              </div>
            </div>
          </div>

          {/* Formulario de contacto */}
          <div className="lg:col-span-2">
            <div className="bg-surface rounded-2xl p-8 border border-border shadow-xl">
              <h2 className="text-2xl font-bold text-text-primary mb-6">Envíanos un Mensaje</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-text-primary mb-2">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      required
                      value={formData.nombre}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-surface-light border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-text-primary"
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-surface-light border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-text-primary"
                      placeholder="tu@empresa.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="empresa" className="block text-sm font-medium text-text-primary mb-2">
                      Empresa
                    </label>
                    <input
                      type="text"
                      id="empresa"
                      name="empresa"
                      value={formData.empresa}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-surface-light border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-text-primary"
                      placeholder="Nombre de tu empresa"
                    />
                  </div>

                  <div>
                    <label htmlFor="telefono" className="block text-sm font-medium text-text-primary mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-surface-light border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-text-primary"
                      placeholder="+52 55 1234 5678"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="mensaje" className="block text-sm font-medium text-text-primary mb-2">
                    Mensaje *
                  </label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    required
                    rows={6}
                    value={formData.mensaje}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-surface-light border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-text-primary resize-none"
                    placeholder="Cuéntanos cómo podemos ayudarte con las finanzas de tu negocio..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-primary-dark text-background px-6 py-4 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Send className="w-5 h-5" />
                  <span>Enviar Mensaje</span>
                </button>
              </form>

              <div className="mt-6 p-4 bg-primary/10 border border-primary/30 rounded-lg">
                <p className="text-sm text-text-secondary">
                  <strong className="text-primary">¿Necesitas ayuda inmediata?</strong> 
                  También puedes programar una demo personalizada o hablar directamente con nuestro equipo de ventas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactoPage;