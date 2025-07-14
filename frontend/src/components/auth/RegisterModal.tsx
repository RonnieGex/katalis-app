import React, { useState } from 'react';
import { useAuth } from './AuthProvider';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin?: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({ 
  isOpen, 
  onClose, 
  onSwitchToLogin 
}) => {
  const { register } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    full_name: '',
    password: '',
    confirmPassword: '',
    company_name: '',
    industry: '',
    business_stage: '',
    employee_count: '',
    monthly_revenue: '',
    phone: '',
    country: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const industries = [
    'technology', 'retail', 'healthcare', 'finance', 'manufacturing',
    'education', 'real_estate', 'consulting', 'food_beverage', 'other'
  ];

  const businessStages = [
    { value: 'startup', label: 'Startup (0-2 años)' },
    { value: 'growth', label: 'Crecimiento (3-5 años)' },
    { value: 'mature', label: 'Maduro (5+ años)' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep < 2) {
      // Validar primer paso
      if (formData.password !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }
      if (formData.password.length < 8) {
        setError('La contraseña debe tener al menos 8 caracteres');
        return;
      }
      setError('');
      setCurrentStep(2);
      return;
    }

    // Enviar registro
    setError('');
    setIsLoading(true);

    try {
      const registrationData = {
        email: formData.email,
        username: formData.username,
        full_name: formData.full_name,
        password: formData.password,
        company_name: formData.company_name || undefined,
        industry: formData.industry || undefined,
        business_stage: formData.business_stage || undefined,
        employee_count: formData.employee_count ? parseInt(formData.employee_count) : undefined,
        monthly_revenue: formData.monthly_revenue ? parseFloat(formData.monthly_revenue) : undefined,
        phone: formData.phone || undefined,
        country: formData.country || undefined,
      };

      await register(registrationData);
      onClose();
      setFormData({
        email: '', username: '', full_name: '', password: '', confirmPassword: '',
        company_name: '', industry: '', business_stage: '', employee_count: '',
        monthly_revenue: '', phone: '', country: ''
      });
      setCurrentStep(1);
    } catch (err: any) {
      setError(err.message || 'Error al registrar usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleBack = () => {
    setError('');
    setCurrentStep(1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="glass border border-border/20 rounded-lg p-8 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-text-primary">
            {currentStep === 1 ? 'Crear Cuenta' : 'Información de Empresa'}
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-secondary"
          >
            ✕
          </button>
        </div>

        {/* Indicador de progreso */}
        <div className="flex items-center mb-6">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            currentStep >= 1 ? 'bg-primary text-background' : 'bg-surface-light text-text-muted'
          }`}>
            1
          </div>
          <div className={`flex-1 h-1 mx-2 ${
            currentStep >= 2 ? 'bg-primary' : 'bg-surface-light'
          }`} />
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            currentStep >= 2 ? 'bg-primary text-background' : 'bg-surface-light text-text-muted'
          }`}>
            2
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {currentStep === 1 && (
            <>
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-text-secondary">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  className="input"
                  placeholder="Juan Pérez"
                />
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-text-secondary">
                  Nombre de Usuario *
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  minLength={3}
                  maxLength={20}
                  className="input"
                  placeholder="juanperez"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-secondary">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-secondary">
                  Contraseña *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="input"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-secondary">
                  Confirmar Contraseña *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="input"
                  placeholder="••••••••"
                />
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <div>
                <label htmlFor="company_name" className="block text-sm font-medium text-text-secondary">
                  Nombre de la Empresa
                </label>
                <input
                  type="text"
                  id="company_name"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  className="input"
                  placeholder="Mi Empresa S.A."
                />
              </div>

              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-text-secondary">
                  Industria
                </label>
                <select
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">Selecciona una industria</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry}>
                      {industry.charAt(0).toUpperCase() + industry.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="business_stage" className="block text-sm font-medium text-text-secondary">
                  Etapa del Negocio
                </label>
                <select
                  id="business_stage"
                  name="business_stage"
                  value={formData.business_stage}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">Selecciona la etapa</option>
                  {businessStages.map(stage => (
                    <option key={stage.value} value={stage.value}>
                      {stage.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="employee_count" className="block text-sm font-medium text-text-secondary">
                    Empleados
                  </label>
                  <input
                    type="number"
                    id="employee_count"
                    name="employee_count"
                    value={formData.employee_count}
                    onChange={handleChange}
                    min="1"
                    className="input"
                    placeholder="10"
                  />
                </div>

                <div>
                  <label htmlFor="monthly_revenue" className="block text-sm font-medium text-text-secondary">
                    Ingresos Mensuales ($)
                  </label>
                  <input
                    type="number"
                    id="monthly_revenue"
                    name="monthly_revenue"
                    value={formData.monthly_revenue}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="input"
                    placeholder="25000"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-text-secondary">
                  País
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="input"
                  placeholder="Colombia"
                />
              </div>
            </>
          )}

          {error && (
            <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex space-x-4">
            {currentStep === 2 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 btn-secondary"
              >
                Atrás
              </button>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creando cuenta...' : 
               currentStep === 1 ? 'Continuar' : 'Crear Cuenta'}
            </button>
          </div>
        </form>

        {currentStep === 1 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-text-secondary">
              ¿Ya tienes cuenta?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-primary hover:text-primary/80 font-medium"
              >
                Inicia sesión aquí
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};