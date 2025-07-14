import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { Eye, EyeOff, Mail, Lock, User, Building, ArrowLeft, Check } from 'lucide-react'

const RegisterPage = () => {
  const navigate = useNavigate()
  const formRef = useRef<HTMLFormElement>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)

  useEffect(() => {
    // Animate form on mount
    if (formRef.current) {
      gsap.fromTo(
        formRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      )
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!acceptTerms) {
      alert('Por favor acepta los términos y condiciones')
      return
    }
    
    setLoading(true)
    
    // TODO: Implement Supabase auth
    setTimeout(() => {
      setLoading(false)
      navigate('/app/onboarding')
    }, 1500)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const passwordRequirements = [
    { text: 'Al menos 8 caracteres', met: formData.password.length >= 8 },
    { text: 'Una letra mayúscula', met: /[A-Z]/.test(formData.password) },
    { text: 'Una letra minúscula', met: /[a-z]/.test(formData.password) },
    { text: 'Un número', met: /[0-9]/.test(formData.password) },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Back to home */}
        <Link 
          to="/" 
          className="inline-flex items-center text-text-secondary hover:text-text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al inicio
        </Link>

        {/* Form */}
        <form ref={formRef} onSubmit={handleSubmit} className="glass rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
              <span className="text-3xl font-bold text-primary">K</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">Crea tu cuenta gratis</h1>
            <p className="text-text-secondary">
              14 días de prueba, sin tarjeta de crédito
            </p>
          </div>

          {/* Form fields */}
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Nombre completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="Juan Pérez"
                  required
                />
              </div>
            </div>

            {/* Company */}
            <div>
              <label htmlFor="company" className="block text-sm font-medium mb-2">
                Nombre de tu empresa
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="Mi Empresa S.A."
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="tu@empresa.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input pl-10 pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password requirements */}
              {formData.password && (
                <div className="mt-2 space-y-1">
                  {passwordRequirements.map((req, index) => (
                    <div
                      key={index}
                      className={`flex items-center text-xs ${req.met ? 'text-success' : 'text-text-muted'}`}
                    >
                      <Check className={`w-3 h-3 mr-1 ${req.met ? '' : 'invisible'}`} />
                      {req.text}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Terms */}
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="w-4 h-4 bg-surface-light border-border rounded focus:ring-2 focus:ring-primary text-primary mt-0.5"
              />
              <span className="ml-2 text-sm text-text-secondary">
                Acepto los{' '}
                <Link to="/terms" className="text-primary hover:text-primary-dark">
                  términos de servicio
                </Link>{' '}
                y la{' '}
                <Link to="/privacy" className="text-primary hover:text-primary-dark">
                  política de privacidad
                </Link>
              </span>
            </label>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || !acceptTerms}
            className="w-full btn-primary mt-6"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creando cuenta...
              </span>
            ) : (
              'Crear Cuenta Gratis'
            )}
          </button>

          {/* Sign in link */}
          <p className="text-center mt-6 text-sm text-text-secondary">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="text-primary hover:text-primary-dark font-medium transition-colors">
              Iniciar sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default RegisterPage