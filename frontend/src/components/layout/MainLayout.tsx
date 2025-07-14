import { Outlet, Link, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Menu, X, User, LogOut, Settings } from 'lucide-react'
import { useAuth } from '../auth/AuthProvider'
import { LoginModal } from '../auth/LoginModal'
import { RegisterModal } from '../auth/RegisterModal'

const MainLayout = () => {
  const location = useLocation()
  const navRef = useRef<HTMLElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const isMenuOpen = useRef(false)
  const { user, isAuthenticated, logout } = useAuth()
  
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    // Animate navigation on mount
    if (navRef.current) {
      gsap.fromTo(
        navRef.current,
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
      )
    }
  }, [])

  const toggleMobileMenu = () => {
    if (!mobileMenuRef.current) return

    if (isMenuOpen.current) {
      gsap.to(mobileMenuRef.current, {
        x: '100%',
        duration: 0.3,
        ease: 'power3.inOut',
      })
    } else {
      gsap.to(mobileMenuRef.current, {
        x: '0%',
        duration: 0.3,
        ease: 'power3.inOut',
      })
    }
    isMenuOpen.current = !isMenuOpen.current
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav ref={navRef} className="header-enhanced">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link 
              to="/" 
              className="nav-logo-enhanced"
            >
              <span>KatalisApp</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="nav-links-enhanced">
              <Link 
                to="/#features" 
                className="nav-link-enhanced"
              >
                Características
              </Link>
              <Link 
                to="/#pricing" 
                className="nav-link-enhanced"
              >
                Precios
              </Link>
              <Link 
                to="/#about" 
                className="nav-link-enhanced"
              >
                Nosotros
              </Link>
            </div>

            {/* CTA Buttons / User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 text-text-primary hover:text-primary transition-colors p-2 rounded-lg hover:bg-surface"
                  >
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {user?.full_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium">{user?.full_name}</span>
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-surface rounded-lg shadow-xl border border-border z-50">
                      <div className="p-2">
                        <div className="px-3 py-2 border-b border-border">
                          <p className="text-sm font-medium text-text-primary">{user?.full_name}</p>
                          <p className="text-xs text-text-secondary">{user?.email}</p>
                        </div>
                        <Link
                          to="/app"
                          className="flex items-center px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-light rounded-md transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                        <Link
                          to="/app/profile"
                          className="flex items-center px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-light rounded-md transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Configuración
                        </Link>
                        <button
                          onClick={() => {
                            logout()
                            setShowUserMenu(false)
                          }}
                          className="flex items-center w-full px-3 py-2 text-sm text-error hover:bg-error/10 rounded-md transition-colors"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button 
                    onClick={() => setShowLoginModal(true)}
                    className="cta-button-secondary-enhanced"
                  >
                    Iniciar Sesión
                  </button>
                  <button 
                    onClick={() => setShowRegisterModal(true)}
                    className="cta-button-primary-enhanced"
                  >
                    Crear Cuenta Gratis
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden text-text-primary p-2"
              aria-label="Toggle mobile menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        ref={mobileMenuRef}
        className="mobile-menu"
      >
        <div className="p-6">
          <button
            onClick={toggleMobileMenu}
            className="absolute top-4 right-4 text-text-primary p-2"
            aria-label="Close mobile menu"
          >
            <X size={24} />
          </button>

          <div className="mt-12 space-y-4">
            <Link 
              to="/#features" 
              onClick={toggleMobileMenu}
              className="nav-link-enhanced"
            >
              Características
            </Link>
            <Link 
              to="/#pricing" 
              onClick={toggleMobileMenu}
              className="nav-link-enhanced"
            >
              Precios
            </Link>
            <Link 
              to="/#about" 
              onClick={toggleMobileMenu}
              className="nav-link-enhanced"
            >
              Nosotros
            </Link>
            
            <div className="pt-6 space-y-3">
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/app" 
                    onClick={toggleMobileMenu}
                    className="cta-button-primary-enhanced text-center w-full"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout()
                      toggleMobileMenu()
                    }}
                    className="cta-button-secondary-enhanced w-full"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => {
                      setShowLoginModal(true)
                      toggleMobileMenu()
                    }}
                    className="cta-button-secondary-enhanced w-full"
                  >
                    Iniciar Sesión
                  </button>
                  <button 
                    onClick={() => {
                      setShowRegisterModal(true)
                      toggleMobileMenu()
                    }}
                    className="cta-button-primary-enhanced w-full"
                  >
                    Crear Cuenta Gratis
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-16">
        <Outlet />
      </main>

      {/* Clean Footer */}
      {location.pathname === '/' && (
        <footer className="bg-surface border-t border-border mt-32">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {/* Brand Section */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-background text-lg font-bold">K</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold gradient-text">KatalisApp</h4>
                    <p className="text-sm text-text-secondary">Finanzas Inteligentes</p>
                  </div>
                </div>
                <p className="text-text-secondary text-sm max-w-md leading-relaxed">
                  Plataforma que convierte el conocimiento del libro "Finanzas para Emprendedores" en herramientas prácticas.
                </p>
              </div>

              {/* Navigation Links */}
              <div>
                <h3 className="text-text-primary font-semibold mb-4">Recursos</h3>
                <ul className="space-y-2">
                  <li><Link to="/casos-de-exito" className="text-text-secondary hover:text-primary transition-colors text-sm">
                    Casos de Éxito
                  </Link></li>
                  <li><Link to="/guias-del-libro" className="text-text-secondary hover:text-primary transition-colors text-sm">
                    Guías del Libro
                  </Link></li>
                  <li><Link to="/centro-de-ayuda" className="text-text-secondary hover:text-primary transition-colors text-sm">
                    Centro de Ayuda
                  </Link></li>
                  <li><Link to="/contacto" className="text-text-secondary hover:text-primary transition-colors text-sm">
                    Contacto
                  </Link></li>
                </ul>
              </div>

              {/* Demo Account */}
              <div>
                <h3 className="text-text-primary font-semibold mb-4">Demo</h3>
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                  <p className="text-sm font-medium text-primary mb-2">Cuenta Demo Gratuita</p>
                  <p className="text-xs text-text-secondary mb-2">
                    Email: demo@katalisapp.com<br />
                    Contraseña: demo123456
                  </p>
                  <Link 
                    to="/demo" 
                    className="text-xs text-primary hover:text-primary-dark font-medium"
                  >
                    Probar Demo →
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom section */}
            <div className="border-t border-border pt-6">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
                <div className="flex items-center space-x-4 text-sm text-text-secondary">
                  <span>&copy; 2025 KatalisApp. Todos los derechos reservados.</span>
                  <Link to="/privacy" className="hover:text-primary transition-colors">Privacidad</Link>
                  <Link to="/terms" className="hover:text-primary transition-colors">Términos</Link>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-text-secondary">Basado en:</span>
                  <div className="bg-primary/10 border border-primary/30 rounded px-2 py-1">
                    <span className="text-xs text-primary font-medium">"Finanzas para Emprendedores"</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* Auth Modals */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => {
          setShowLoginModal(false)
          setShowRegisterModal(true)
        }}
      />
      
      <RegisterModal 
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => {
          setShowRegisterModal(false)
          setShowLoginModal(true)
        }}
      />
    </div>
  )
}

export default MainLayout