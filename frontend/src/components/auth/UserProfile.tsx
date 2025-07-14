import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';

interface UserPreferences {
  theme: string;
  currency: string;
  date_format: string;
  number_format: string;
  notifications_email: boolean;
  notifications_push: boolean;
  auto_save: boolean;
  ai_analysis_frequency: string;
  default_analysis_depth: string;
  favorite_modules: string;
}

export const UserProfile: React.FC = () => {
  const { user, updateProfile, token } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || '',
    company_name: user?.company_name || '',
    industry: user?.industry || '',
    business_stage: user?.business_stage || '',
    employee_count: user?.employee_count || '',
    monthly_revenue: user?.monthly_revenue || '',
    phone: '',
    country: '',
  });

  // Cargar preferencias del usuario
  useEffect(() => {
    if (token) {
      fetchUserPreferences();
    }
  }, [token]);

  const fetchUserPreferences = async () => {
    try {
      const response = await fetch('/api/auth/preferences', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const prefs = await response.json();
        setPreferences(prefs);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const handleProfileSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        full_name: profileData.full_name,
        company_name: profileData.company_name,
        industry: profileData.industry,
        business_stage: profileData.business_stage,
        employee_count: profileData.employee_count ? parseInt(profileData.employee_count as string) : undefined,
        monthly_revenue: profileData.monthly_revenue ? parseFloat(profileData.monthly_revenue as string) : undefined,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreferencesUpdate = async (section: string, settings: any) => {
    try {
      const response = await fetch('/api/config/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          section,
          settings,
        }),
      });

      if (response.ok) {
        // Actualizar estado local
        setPreferences(prev => prev ? {
          ...prev,
          ...settings
        } : null);
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  const industries = [
    'technology', 'retail', 'healthcare', 'finance', 'manufacturing',
    'education', 'real_estate', 'consulting', 'food_beverage', 'other'
  ];

  const businessStages = [
    { value: 'startup', label: 'Startup (0-2 años)' },
    { value: 'growth', label: 'Crecimiento (3-5 años)' },
    { value: 'mature', label: 'Maduro (5+ años)' }
  ];

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return 'No especificado';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: preferences?.currency || 'USD'
    }).format(amount);
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-surface rounded-lg shadow-lg border border-border">
        {/* Header del perfil */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-background text-xl font-bold">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">{user.full_name}</h1>
              <p className="text-text-secondary">@{user.username}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  user.subscription_plan === 'premium' ? 'bg-warning/20 text-warning' :
                  user.subscription_plan === 'basic' ? 'bg-primary/20 text-primary' :
                  'bg-surface-light text-text-secondary'
                }`}>
                  {user.subscription_plan === 'premium' ? 'Premium' : 
                   user.subscription_plan === 'basic' ? 'Básico' : 'Gratuito'}
                </span>
                <span className="text-sm text-text-muted">
                  Miembro desde {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navegación de tabs */}
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'profile', label: 'Perfil' },
              { id: 'company', label: 'Empresa' },
              { id: 'preferences', label: 'Preferencias' },
              { id: 'security', label: 'Seguridad' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-primary/30'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Contenido de tabs */}
        <div className="p-6">
          {/* Tab: Perfil */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-text-primary">Información Personal</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-primary text-background px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
                >
                  {isEditing ? 'Cancelar' : 'Editar'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary">Nombre Completo</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.full_name}
                      onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 bg-surface-light border border-border rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-text-primary">{user.full_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary">Email</label>
                  <p className="mt-1 text-sm text-text-primary">{user.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary">Nombre de Usuario</label>
                  <p className="mt-1 text-sm text-text-primary">@{user.username}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary">Plan de Suscripción</label>
                  <p className="mt-1 text-sm text-text-primary">{user.subscription_plan}</p>
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-surface-light text-text-secondary px-4 py-2 rounded-md hover:bg-border hover:text-text-primary transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleProfileSave}
                    disabled={isSaving}
                    className="bg-primary text-background px-4 py-2 rounded-md hover:bg-primary-dark disabled:opacity-50 transition-colors"
                  >
                    {isSaving ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab: Empresa */}
          {activeTab === 'company' && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-text-primary">Información de la Empresa</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary">Nombre de la Empresa</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.company_name}
                      onChange={(e) => setProfileData({...profileData, company_name: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 bg-surface-light border border-border rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-text-primary">{user.company_name || 'No especificado'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary">Industria</label>
                  {isEditing ? (
                    <select
                      value={profileData.industry}
                      onChange={(e) => setProfileData({...profileData, industry: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 bg-surface-light border border-border rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    >
                      <option value="">Seleccionar industria</option>
                      {industries.map(industry => (
                        <option key={industry} value={industry}>
                          {industry.charAt(0).toUpperCase() + industry.slice(1).replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="mt-1 text-sm text-text-primary">
                      {user.industry ? user.industry.charAt(0).toUpperCase() + user.industry.slice(1).replace('_', ' ') : 'No especificado'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary">Etapa del Negocio</label>
                  {isEditing ? (
                    <select
                      value={profileData.business_stage}
                      onChange={(e) => setProfileData({...profileData, business_stage: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 bg-surface-light border border-border rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    >
                      <option value="">Seleccionar etapa</option>
                      {businessStages.map(stage => (
                        <option key={stage.value} value={stage.value}>
                          {stage.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="mt-1 text-sm text-text-primary">
                      {user.business_stage ? businessStages.find(s => s.value === user.business_stage)?.label : 'No especificado'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary">Número de Empleados</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={profileData.employee_count}
                      onChange={(e) => setProfileData({...profileData, employee_count: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 bg-surface-light border border-border rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-text-primary">{user.employee_count || 'No especificado'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary">Ingresos Mensuales</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={profileData.monthly_revenue}
                      onChange={(e) => setProfileData({...profileData, monthly_revenue: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 bg-surface-light border border-border rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-text-primary">{formatCurrency(user.monthly_revenue)}</p>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-surface-light text-text-secondary px-4 py-2 rounded-md hover:bg-border hover:text-text-primary transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleProfileSave}
                    disabled={isSaving}
                    className="bg-primary text-background px-4 py-2 rounded-md hover:bg-primary-dark disabled:opacity-50 transition-colors"
                  >
                    {isSaving ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab: Preferencias */}
          {activeTab === 'preferences' && preferences && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-text-primary">Preferencias del Sistema</h2>
              
              {/* Configuración de Notificaciones */}
              <div className="border rounded-lg p-4">
                <h3 className="text-md font-medium text-text-primary mb-4">Notificaciones</h3>
                <div className="space-y-3">
                  {[
                    { key: 'notifications_email', label: 'Notificaciones por Email' },
                    { key: 'notifications_push', label: 'Notificaciones Push' },
                    { key: 'auto_save', label: 'Guardado Automático' }
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{item.label}</span>
                      <button
                        onClick={() => handlePreferencesUpdate('notifications', {
                          [item.key]: !preferences[item.key as keyof UserPreferences]
                        })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          preferences[item.key as keyof UserPreferences] ? 'bg-primary' : 'bg-surface-light'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-surface-light transition-transform ${
                            preferences[item.key as keyof UserPreferences] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Configuración de IA */}
              <div className="border rounded-lg p-4">
                <h3 className="text-md font-medium text-text-primary mb-4">Análisis de IA</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary">Frecuencia de Análisis</label>
                    <select
                      value={preferences.ai_analysis_frequency}
                      onChange={(e) => handlePreferencesUpdate('analysis', {
                        ai_analysis_frequency: e.target.value
                      })}
                      className="mt-1 block w-full px-3 py-2 bg-surface-light border border-border rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    >
                      <option value="daily">Diario</option>
                      <option value="weekly">Semanal</option>
                      <option value="monthly">Mensual</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary">Profundidad de Análisis</label>
                    <select
                      value={preferences.default_analysis_depth}
                      onChange={(e) => handlePreferencesUpdate('analysis', {
                        default_analysis_depth: e.target.value
                      })}
                      className="mt-1 block w-full px-3 py-2 bg-surface-light border border-border rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    >
                      <option value="quick">Rápido</option>
                      <option value="standard">Estándar</option>
                      <option value="deep">Profundo</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Seguridad */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-text-primary">Configuración de Seguridad</h2>
              
              <div className="border rounded-lg p-4">
                <h3 className="text-md font-medium text-text-primary mb-4">Cambiar Contraseña</h3>
                <p className="text-sm text-text-secondary mb-4">
                  Para cambiar tu contraseña, necesitarás confirmar tu contraseña actual.
                </p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  Cambiar Contraseña
                </button>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="text-md font-medium text-text-primary mb-4">Uso de API</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-text-secondary">Llamadas utilizadas este mes</p>
                    <p className="text-2xl font-bold text-primary">{user.api_usage_count || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">Límite mensual</p>
                    <p className="text-2xl font-bold text-gray-900">{user.api_usage_limit || 1000}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{width: `${((user.api_usage_count || 0) / (user.api_usage_limit || 1)) * 100}%`}}
                    />
                  </div>
                  <p className="text-sm text-text-muted mt-1">
                    {(((user.api_usage_count || 0) / (user.api_usage_limit || 1)) * 100).toFixed(1)}% utilizado
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};