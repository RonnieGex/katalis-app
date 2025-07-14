import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        {/* 404 Number */}
        <h1 className="text-9xl font-bold gradient-text mb-4">404</h1>
        
        {/* Message */}
        <h2 className="text-2xl font-semibold mb-2">Página no encontrada</h2>
        <p className="text-text-secondary mb-8 max-w-md mx-auto">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="btn-primary inline-flex items-center justify-center">
            <Home className="w-4 h-4 mr-2" />
            Ir al inicio
          </Link>
          <button 
            onClick={() => window.history.back()} 
            className="btn-secondary inline-flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Regresar
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage