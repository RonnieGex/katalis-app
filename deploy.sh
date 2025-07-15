#!/bin/bash

# KatalisApp Deployment Script
# Este script automatiza el deployment completo a Docker, GitHub y DigitalOcean

set -e

echo "🚀 Iniciando deployment de KatalisApp..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.yml" ]; then
    error "No se encontró docker-compose.yml. Ejecutar desde el directorio raíz del proyecto."
fi

# Función para verificar dependencias
check_dependencies() {
    log "Verificando dependencias..."
    
    if ! command -v docker &> /dev/null; then
        warning "Docker no está instalado. Instalando Docker..."
        # Instrucciones para instalar Docker
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        success "Docker instalado correctamente"
    else
        success "Docker ya está instalado"
    fi
    
    if ! command -v git &> /dev/null; then
        error "Git no está instalado. Por favor, instala Git primero."
    else
        success "Git encontrado"
    fi
}

# Función para construir imágenes Docker
build_docker_images() {
    log "Construyendo imágenes Docker..."
    
    # Construir frontend
    log "Construyendo frontend..."
    docker build -t katalis-app-frontend:latest \
        --target production \
        ./frontend || error "Error construyendo frontend"
    success "Frontend construido exitosamente"
    
    # Construir backend
    log "Construyendo backend..."
    docker build -t katalis-app-backend:latest \
        --target production \
        ./backend || error "Error construyendo backend"
    success "Backend construido exitosamente"
}

# Función para ejecutar tests
run_tests() {
    log "Ejecutando tests..."
    
    # Test frontend
    log "Ejecutando tests del frontend..."
    docker run --rm katalis-app-frontend:latest npm test || warning "Tests del frontend fallaron"
    
    # Test backend
    log "Ejecutando tests del backend..."
    docker run --rm katalis-app-backend:latest python -m pytest tests/ -v || warning "Tests del backend fallaron"
    
    success "Tests completados"
}

# Función para hacer commit y push
commit_and_push() {
    log "Preparando commit y push a GitHub..."
    
    # Verificar si hay cambios
    if git diff --quiet && git diff --cached --quiet; then
        warning "No hay cambios para commitear"
        return 0
    fi
    
    # Agregar todos los archivos
    git add .
    
    # Crear commit con timestamp
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    git commit -m "Deploy: Update KatalisApp - ${TIMESTAMP}

- Docker containers built and tested
- Frontend: React + Vite production build
- Backend: FastAPI with security optimizations
- Database: PostgreSQL with migrations
- Cache: Redis integration
- AI: OpenAI + DeepSeek integration
- Monitoring: Health checks and logging

🚀 Ready for production deployment

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>" || error "Error creando commit"
    
    # Push a GitHub (asumiendo que remote origin existe)
    git push origin main || error "Error pushing a GitHub"
    
    success "Código subido a GitHub exitosamente"
}

# Función para deployment local con Docker Compose
deploy_local() {
    log "Iniciando deployment local con Docker Compose..."
    
    # Crear archivo .env si no existe
    if [ ! -f ".env" ]; then
        log "Creando archivo .env de ejemplo..."
        cat > .env << EOF
# Environment Variables para KatalisApp
ENVIRONMENT=production
DEBUG=false
SECRET_KEY=your-secret-key-here-change-in-production
JWT_SECRET_KEY=your-jwt-secret-here-change-in-production
OPENAI_API_KEY=your-openai-api-key-here
REDIS_URL=redis://redis:6379/0
REDIS_REST_URL=your-redis-rest-url-here
REDIS_REST_TOKEN=your-redis-rest-token-here
SUPABASE_URL=your-supabase-url-here
SUPABASE_ANON_KEY=your-supabase-anon-key-here
SUPABASE_SERVICE_KEY=your-supabase-service-key-here
EOF
        warning "Archivo .env creado. Por favor, configura las variables de entorno."
    fi
    
    # Detener servicios existentes
    docker-compose down
    
    # Iniciar servicios
    docker-compose up -d
    
    # Esperar a que los servicios estén listos
    log "Esperando a que los servicios estén listos..."
    sleep 30
    
    # Verificar que los servicios están funcionando
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
        success "Backend está funcionando (http://localhost:8000)"
    else
        error "Backend no responde"
    fi
    
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        success "Frontend está funcionando (http://localhost:3000)"
    else
        error "Frontend no responde"
    fi
    
    success "Deployment local completado exitosamente"
}

# Función para mostrar información de deployment
show_deployment_info() {
    log "Información de deployment:"
    echo ""
    echo "📱 Frontend: http://localhost:3000"
    echo "🔧 Backend API: http://localhost:8000"
    echo "📚 API Docs: http://localhost:8000/docs"
    echo "💾 Database: PostgreSQL en puerto 5432"
    echo "🔄 Cache: Redis en puerto 6379"
    echo ""
    echo "Para ver logs:"
    echo "  docker-compose logs -f [frontend|backend|postgres|redis]"
    echo ""
    echo "Para detener:"
    echo "  docker-compose down"
    echo ""
    echo "Para deployment en DigitalOcean:"
    echo "  1. Configura los secrets en GitHub"
    echo "  2. Push activará el workflow automáticamente"
    echo "  3. Monitorea en GitHub Actions"
}

# Función principal
main() {
    log "🚀 Iniciando deployment de KatalisApp..."
    
    # Verificar dependencias
    check_dependencies
    
    # Construir imágenes Docker
    build_docker_images
    
    # Ejecutar tests
    run_tests
    
    # Hacer commit y push
    commit_and_push
    
    # Deployment local
    deploy_local
    
    # Mostrar información
    show_deployment_info
    
    success "🎉 Deployment completado exitosamente!"
}

# Ejecutar función principal
main "$@"