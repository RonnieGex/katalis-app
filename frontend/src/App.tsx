import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Auth provider
import { AuthProvider } from './components/auth/AuthProvider'

// Financial data provider
import { FinancialProvider } from './contexts/FinancialContext'

// Layout components
import MainLayout from './components/layout/MainLayout'

// Development tools
import DevTools from './components/development/DevTools'

// Page components
import LandingPage from './pages/LandingPage'
import DemoPage from './pages/DemoPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import NotFoundPage from './pages/NotFoundPage'
import ContactoPage from './pages/ContactoPage'
import CasosDeExitoPage from './pages/CasosDeExitoPage'
import GuiasDelLibroPage from './pages/GuiasDelLibroPage'
import CentroDeAyudaPage from './pages/CentroDeAyudaPage'

// Test components (temporary)
import TestInteractiveDemo from './TestInteractiveDemo'
import DirectTestDemo from './DirectTestDemo'

// GSAP registration
gsap.registerPlugin(ScrollTrigger)

function App() {
  useEffect(() => {
    // GSAP global configurations
    gsap.defaults({
      ease: 'power3.out',
      duration: 0.8,
    })

    // ScrollTrigger global configurations
    ScrollTrigger.defaults({
      toggleActions: 'play none none reverse',
      markers: false,
    })

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  return (
    <AuthProvider>
      <FinancialProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/demo" element={<DemoPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/contacto" element={<ContactoPage />} />
              <Route path="/casos-de-exito" element={<CasosDeExitoPage />} />
              <Route path="/guias-del-libro" element={<GuiasDelLibroPage />} />
              <Route path="/centro-de-ayuda" element={<CentroDeAyudaPage />} />
              <Route path="/support" element={<CentroDeAyudaPage />} />
              
              {/* Test routes (temporary) */}
              <Route path="/test-demo" element={<TestInteractiveDemo />} />
              <Route path="/direct-demo" element={<DirectTestDemo />} />
            </Route>

            {/* Protected routes */}
            <Route path="/app/*" element={<DashboardPage />} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          
          {/* Development tools - only in dev mode */}
          <DevTools />
        </Router>
      </FinancialProvider>
    </AuthProvider>
  )
}

export default App
