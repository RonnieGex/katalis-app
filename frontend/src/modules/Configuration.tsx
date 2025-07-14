import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import { UserProfile } from '../components/auth/UserProfile';
import { Settings, Bell, Palette, Shield, Database, HelpCircle } from 'lucide-react';

interface ConfigurationSection {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

interface UserConfig {
  notifications: {
    email_weekly_reports: boolean;
    email_alerts: boolean;
    push_notifications: boolean;
    sms_alerts: boolean;
  };
  dashboard: {
    default_view: string;
    widgets_order: string[];
    auto_refresh_minutes: number;
    show_animations: boolean;
  };
  analysis: {
    auto_analysis_frequency: string;
    default_period: string;
    include_projections: boolean;
    alert_thresholds: {
      cash_flow_critical: number;
      health_score_warning: number;
      ltv_coca_ratio_min: number;
    };
  };
  appearance: {
    theme: string;
    color_scheme: string;
    font_size: string;
    compact_mode: boolean;
  };
}

export const Configuration: React.FC = () => {
  const { token } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [userConfig, setUserConfig] = useState<UserConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const sections: ConfigurationSection[] = [
    {
      id: 'profile',
      name: 'Perfil de Usuario',
      icon: <Settings className="w-5 h-5" />,
      description: 'Información personal y de empresa'
    },
    {
      id: 'notifications',
      name: 'Notificaciones',
      icon: <Bell className="w-5 h-5" />,
      description: 'Configurar alertas y notificaciones'
    },
    {
      id: 'appearance',
      name: 'Apariencia',
      icon: <Palette className="w-5 h-5" />,
      description: 'Tema, colores y personalización'
    },
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: <Database className="w-5 h-5" />,
      description: 'Layout y widgets del dashboard'
    },
    {
      id: 'analysis',
      name: 'Análisis IA',
      icon: <HelpCircle className="w-5 h-5" />,
      description: 'Configuración de análisis inteligente'
    },
    {
      id: 'security',
      name: 'Seguridad',
      icon: <Shield className="w-5 h-5" />,
      description: 'Contraseña y configuraciones de seguridad'
    }
  ];

  useEffect(() => {
    if (token) {
      fetchUserConfig();
    }
  }, [token]);

  const fetchUserConfig = async () => {
    try {
      const response = await fetch('/api/config/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const config = await response.json();
        setUserConfig(config);
      }
    } catch (error) {
      console.error('Error fetching user config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = async (section: string, settings: any) => {
    setIsSaving(true);
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
        // Actualizar configuración local
        setUserConfig(prev => prev ? {
          ...prev,
          [section]: { ...prev[section as keyof UserConfig], ...settings }
        } : null);
      }
    } catch (error) {
      console.error('Error updating config:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-secondary">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  if (activeSection === 'profile') {
    return <UserProfile />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Configuración</h1>
        <p className="text-text-secondary mt-2">
          Personaliza tu experiencia en KatalisApp
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar de navegación */}
        <div className="lg:w-1/4">
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  activeSection === section.id
                    ? 'bg-primary/10 text-primary border-l-4 border-primary'
                    : 'text-text-secondary hover:bg-surface-light'
                }`}
              >
                <span className="mr-3">{section.icon}</span>
                <div>
                  <div className="font-medium">{section.name}</div>
                  <div className="text-sm text-text-muted">{section.description}</div>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Contenido principal */}
        <div className="lg:w-3/4">
          <div className="bg-surface rounded-lg shadow-sm border border-border">
            <div className="p-6">
              {/* Notificaciones */}
              {activeSection === 'notifications' && userConfig && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-text-primary">Configuración de Notificaciones</h2>
                    <p className="text-text-secondary mt-1">Controla cómo y cuándo recibes notificaciones</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { 
                        key: 'email_weekly_reports', 
                        label: 'Reportes Semanales por Email',
                        description: 'Recibe un resumen semanal de tu desempeño financiero'
                      },
                      { 
                        key: 'email_alerts', 
                        label: 'Alertas por Email',
                        description: 'Notificaciones importantes sobre tu negocio'
                      },
                      { 
                        key: 'push_notifications', 
                        label: 'Notificaciones Push',
                        description: 'Notificaciones en tiempo real en tu navegador'
                      },
                      { 
                        key: 'sms_alerts', 
                        label: 'Alertas por SMS',
                        description: 'Alertas críticas enviadas a tu teléfono'
                      }
                    ].map(item => (
                      <div key={item.key} className="flex items-center justify-between p-4 border-border rounded-lg bg-surface">
                        <div>
                          <div className="font-medium text-text-primary">{item.label}</div>
                          <div className="text-sm text-text-secondary">{item.description}</div>
                        </div>
                        <button
                          onClick={() => updateConfig('notifications', {
                            [item.key]: !userConfig.notifications[item.key as keyof typeof userConfig.notifications]
                          })}
                          disabled={isSaving}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                            userConfig.notifications[item.key as keyof typeof userConfig.notifications] 
                              ? 'bg-primary' : 'bg-border'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-surface-light transition-transform ${
                              userConfig.notifications[item.key as keyof typeof userConfig.notifications] 
                                ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Apariencia */}
              {activeSection === 'appearance' && userConfig && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-text-primary">Configuración de Apariencia</h2>
                    <p className="text-text-secondary mt-1">Personaliza la interfaz de usuario</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Tema
                      </label>
                      <select
                        value={userConfig.appearance.theme}
                        onChange={(e) => updateConfig('appearance', { theme: e.target.value })}
                        disabled={isSaving}
                        className="block w-full px-3 py-2 border border-border rounded-md shadow-sm bg-surface text-text-primary focus:outline-none focus:ring-primary focus:border-primary"
                      >
                        <option value="light">Claro</option>
                        <option value="dark">Oscuro</option>
                        <option value="auto">Automático</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Esquema de Colores
                      </label>
                      <select
                        value={userConfig.appearance.color_scheme}
                        onChange={(e) => updateConfig('appearance', { color_scheme: e.target.value })}
                        disabled={isSaving}
                        className="block w-full px-3 py-2 border border-border rounded-md shadow-sm bg-surface text-text-primary focus:outline-none focus:ring-primary focus:border-primary"
                      >
                        <option value="blue">Azul</option>
                        <option value="green">Verde</option>
                        <option value="purple">Púrpura</option>
                        <option value="orange">Naranja</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Tamaño de Fuente
                      </label>
                      <select
                        value={userConfig.appearance.font_size}
                        onChange={(e) => updateConfig('appearance', { font_size: e.target.value })}
                        disabled={isSaving}
                        className="block w-full px-3 py-2 border border-border rounded-md shadow-sm bg-surface text-text-primary focus:outline-none focus:ring-primary focus:border-primary"
                      >
                        <option value="small">Pequeño</option>
                        <option value="medium">Mediano</option>
                        <option value="large">Grande</option>
                      </select>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="compact_mode"
                        checked={userConfig.appearance.compact_mode}
                        onChange={(e) => updateConfig('appearance', { compact_mode: e.target.checked })}
                        disabled={isSaving}
                        className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                      />
                      <label htmlFor="compact_mode" className="ml-2 block text-sm text-text-primary">
                        Modo Compacto
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Dashboard */}
              {activeSection === 'dashboard' && userConfig && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-text-primary">Configuración del Dashboard</h2>
                    <p className="text-text-secondary mt-1">Personaliza tu dashboard principal</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Vista por Defecto
                      </label>
                      <select
                        value={userConfig.dashboard.default_view}
                        onChange={(e) => updateConfig('dashboard', { default_view: e.target.value })}
                        disabled={isSaving}
                        className="block w-full px-3 py-2 border border-border rounded-md shadow-sm bg-surface text-text-primary focus:outline-none focus:ring-primary focus:border-primary"
                      >
                        <option value="overview">Resumen General</option>
                        <option value="financial">Métricas Financieras</option>
                        <option value="ai_insights">Insights de IA</option>
                        <option value="reports">Reportes</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Auto-actualización (minutos)
                      </label>
                      <select
                        value={userConfig.dashboard.auto_refresh_minutes}
                        onChange={(e) => updateConfig('dashboard', { auto_refresh_minutes: parseInt(e.target.value) })}
                        disabled={isSaving}
                        className="block w-full px-3 py-2 border border-border rounded-md shadow-sm bg-surface text-text-primary focus:outline-none focus:ring-primary focus:border-primary"
                      >
                        <option value={5}>5 minutos</option>
                        <option value={15}>15 minutos</option>
                        <option value={30}>30 minutos</option>
                        <option value={60}>1 hora</option>
                        <option value={0}>Manual</option>
                      </select>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="show_animations"
                        checked={userConfig.dashboard.show_animations}
                        onChange={(e) => updateConfig('dashboard', { show_animations: e.target.checked })}
                        disabled={isSaving}
                        className="h-4 w-4 text-primary focus:ring-primary border-border rounded bg-surface-light"
                      />
                      <label htmlFor="show_animations" className="ml-2 block text-sm text-text-primary">
                        Mostrar Animaciones
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Análisis IA */}
              {activeSection === 'analysis' && userConfig && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-text-primary">Configuración de Análisis IA</h2>
                    <p className="text-text-secondary mt-1">Personaliza el comportamiento de la inteligencia artificial</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Frecuencia de Análisis Automático
                      </label>
                      <select
                        value={userConfig.analysis.auto_analysis_frequency}
                        onChange={(e) => updateConfig('analysis', { auto_analysis_frequency: e.target.value })}
                        disabled={isSaving}
                        className="block w-full px-3 py-2 border border-border rounded-md shadow-sm bg-surface text-text-primary focus:outline-none focus:ring-primary focus:border-primary"
                      >
                        <option value="daily">Diario</option>
                        <option value="weekly">Semanal</option>
                        <option value="monthly">Mensual</option>
                        <option value="manual">Manual</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Período por Defecto
                      </label>
                      <select
                        value={userConfig.analysis.default_period}
                        onChange={(e) => updateConfig('analysis', { default_period: e.target.value })}
                        disabled={isSaving}
                        className="block w-full px-3 py-2 border border-border rounded-md shadow-sm bg-surface text-text-primary focus:outline-none focus:ring-primary focus:border-primary"
                      >
                        <option value="last_3_months">Últimos 3 meses</option>
                        <option value="last_6_months">Últimos 6 meses</option>
                        <option value="last_year">Último año</option>
                        <option value="ytd">Año actual</option>
                      </select>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="include_projections"
                        checked={userConfig.analysis.include_projections}
                        onChange={(e) => updateConfig('analysis', { include_projections: e.target.checked })}
                        disabled={isSaving}
                        className="h-4 w-4 text-primary focus:ring-primary border-border rounded bg-surface-light"
                      />
                      <label htmlFor="include_projections" className="ml-2 block text-sm text-text-primary">
                        Incluir Proyecciones en Análisis
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-text-primary mb-4">Umbrales de Alerta</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Flujo de Caja Crítico ($)
                        </label>
                        <input
                          type="number"
                          value={userConfig.analysis.alert_thresholds.cash_flow_critical}
                          onChange={(e) => updateConfig('analysis', { 
                            alert_thresholds: { 
                              ...userConfig.analysis.alert_thresholds,
                              cash_flow_critical: parseFloat(e.target.value) 
                            }
                          })}
                          disabled={isSaving}
                          className="block w-full px-3 py-2 border border-border rounded-md shadow-sm bg-surface text-text-primary focus:outline-none focus:ring-primary focus:border-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Score de Salud Mínimo
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={userConfig.analysis.alert_thresholds.health_score_warning}
                          onChange={(e) => updateConfig('analysis', { 
                            alert_thresholds: { 
                              ...userConfig.analysis.alert_thresholds,
                              health_score_warning: parseFloat(e.target.value) 
                            }
                          })}
                          disabled={isSaving}
                          className="block w-full px-3 py-2 border border-border rounded-md shadow-sm bg-surface text-text-primary focus:outline-none focus:ring-primary focus:border-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Ratio LTV/COCA Mínimo
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={userConfig.analysis.alert_thresholds.ltv_coca_ratio_min}
                          onChange={(e) => updateConfig('analysis', { 
                            alert_thresholds: { 
                              ...userConfig.analysis.alert_thresholds,
                              ltv_coca_ratio_min: parseFloat(e.target.value) 
                            }
                          })}
                          disabled={isSaving}
                          className="block w-full px-3 py-2 border border-border rounded-md shadow-sm bg-surface text-text-primary focus:outline-none focus:ring-primary focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Seguridad */}
              {activeSection === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-text-primary">Configuración de Seguridad</h2>
                    <p className="text-text-secondary mt-1">Gestiona la seguridad de tu cuenta</p>
                  </div>

                  <div className="bg-warning/10 border border-warning/20 rounded-md p-4">
                    <div className="text-sm text-warning">
                      <strong>Próximamente:</strong> Funcionalidades avanzadas de seguridad como autenticación de dos factores, 
                      gestión de sesiones activas, y logs de acceso estarán disponibles en futuras versiones.
                    </div>
                  </div>

                  <div className="space-y-4">
                    <button className="btn-primary">
                      Cambiar Contraseña
                    </button>
                    
                    <div className="pt-4 border-t">
                      <h3 className="text-lg font-medium text-text-primary mb-2">Descargar Datos</h3>
                      <p className="text-sm text-text-secondary mb-4">
                        Descarga una copia de todos tus datos almacenados en KatalisApp.
                      </p>
                      <button className="bg-surface-light text-text-primary px-4 py-2 rounded-md hover:bg-surface border border-border">
                        Solicitar Descarga
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {isSaving && (
                <div className="fixed bottom-4 right-4 bg-primary text-background px-4 py-2 rounded-md shadow-lg">
                  Guardando configuración...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};