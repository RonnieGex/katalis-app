import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  company_name?: string;
  industry?: string;
  business_stage?: string;
  employee_count?: number;
  monthly_revenue?: number;
  subscription_plan: string;
  created_at: string;
  api_usage_count?: number;
  api_usage_limit?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  username: string;
  full_name: string;
  password: string;
  company_name?: string;
  industry?: string;
  business_stage?: string;
  employee_count?: number;
  monthly_revenue?: number;
  phone?: string;
  country?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Inicializar desde localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Check for demo credentials first
    if (email === 'demo@katalisapp.com' && password === 'demo123456') {
      const demoUser = {
        id: 1,
        email: 'demo@katalisapp.com',
        username: 'demo',
        full_name: 'Usuario Demo',
        company_name: 'Empresa Demo',
        industry: 'technology',
        business_stage: 'growth',
        employee_count: 5,
        monthly_revenue: 50000,
        subscription_plan: 'demo',
        created_at: new Date().toISOString(),
        api_usage_count: 0,
        api_usage_limit: 1000
      }
      
      setToken('demo_token_12345');
      setUser(demoUser);
      
      // Guardar en localStorage
      localStorage.setItem('auth_token', 'demo_token_12345');
      localStorage.setItem('auth_user', JSON.stringify(demoUser));
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al iniciar sesión');
      }

      const data = await response.json();
      
      setToken(data.access_token);
      setUser(data.user);
      
      // Guardar en localStorage
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al registrar usuario');
      }

      await response.json();
      
      // Auto-login después del registro
      await login(userData.email, userData.password);
      
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!token) throw new Error('No authenticated');

    try {
      const response = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al actualizar perfil');
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    if (!token) return;

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('auth_user', JSON.stringify(userData));
      } else {
        // Token inválido, hacer logout
        logout();
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      logout();
    }
  };

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};