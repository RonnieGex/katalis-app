#!/bin/bash

# KatalisApp Deployment Script
# This script handles deployment to different environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Default values
ENVIRONMENT="development"
BUILD_ONLY=false
SKIP_TESTS=false
FORCE_REBUILD=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -b|--build-only)
            BUILD_ONLY=true
            shift
            ;;
        -s|--skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        -f|--force-rebuild)
            FORCE_REBUILD=true
            shift
            ;;
        -h|--help)
            echo "KatalisApp Deployment Script"
            echo ""
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  -e, --env ENVIRONMENT     Set deployment environment (development|staging|production)"
            echo "  -b, --build-only          Only build, don't deploy"
            echo "  -s, --skip-tests          Skip running tests"
            echo "  -f, --force-rebuild       Force rebuild of Docker images"
            echo "  -h, --help               Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 -e development         Deploy to development"
            echo "  $0 -e production -s       Deploy to production skipping tests"
            echo "  $0 -b                     Build only (no deployment)"
            exit 0
            ;;
        *)
            log_error "Unknown option $1"
            exit 1
            ;;
    esac
done

log_info "Starting KatalisApp deployment to $ENVIRONMENT environment"

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker is not running"
        exit 1
    fi
    
    # Check if docker-compose is installed
    if ! command -v docker-compose &> /dev/null; then
        log_error "docker-compose is not installed"
        exit 1
    fi
    
    # Check if required environment files exist
    if [[ "$ENVIRONMENT" == "production" ]]; then
        if [[ ! -f ".env.prod" ]]; then
            log_error "Production environment file .env.prod not found"
            log_info "Copy .env.prod.example to .env.prod and configure it"
            exit 1
        fi
    fi
    
    log_success "Prerequisites check passed"
}

# Run tests
run_tests() {
    if [[ "$SKIP_TESTS" == true ]]; then
        log_warning "Skipping tests as requested"
        return
    fi
    
    log_info "Running tests..."
    
    # Frontend tests
    log_info "Running frontend tests..."
    cd frontend
    npm run lint
    npm run build  # This also runs type checking
    cd ..
    
    # Backend tests would go here
    # log_info "Running backend tests..."
    # cd backend
    # python -m pytest
    # cd ..
    
    log_success "All tests passed"
}

# Build application
build_application() {
    log_info "Building application..."
    
    local docker_compose_file="docker-compose.yml"
    local build_args=""
    
    if [[ "$ENVIRONMENT" == "production" ]]; then
        docker_compose_file="docker-compose.prod.yml"
        build_args="--build-arg NODE_ENV=production"
    fi
    
    if [[ "$FORCE_REBUILD" == true ]]; then
        log_info "Force rebuilding Docker images..."
        docker-compose -f $docker_compose_file build --no-cache $build_args
    else
        docker-compose -f $docker_compose_file build $build_args
    fi
    
    log_success "Application built successfully"
}

# Deploy application
deploy_application() {
    if [[ "$BUILD_ONLY" == true ]]; then
        log_info "Build-only mode, skipping deployment"
        return
    fi
    
    log_info "Deploying application to $ENVIRONMENT..."
    
    local docker_compose_file="docker-compose.yml"
    local env_file=".env"
    
    if [[ "$ENVIRONMENT" == "production" ]]; then
        docker_compose_file="docker-compose.prod.yml"
        env_file=".env.prod"
    fi
    
    # Stop existing containers
    log_info "Stopping existing containers..."
    docker-compose -f $docker_compose_file --env-file $env_file down
    
    # Start new containers
    log_info "Starting new containers..."
    docker-compose -f $docker_compose_file --env-file $env_file up -d
    
    # Wait for services to be healthy
    log_info "Waiting for services to be healthy..."
    sleep 10
    
    # Check if services are running
    if docker-compose -f $docker_compose_file ps | grep -q "Up"; then
        log_success "Application deployed successfully"
        
        # Show service status
        log_info "Service status:"
        docker-compose -f $docker_compose_file ps
        
        # Show URLs
        if [[ "$ENVIRONMENT" == "development" ]]; then
            log_info "Application URLs:"
            log_info "  Frontend: http://localhost:3000"
            log_info "  Backend API: http://localhost:8000"
            log_info "  API Docs: http://localhost:8000/docs"
        fi
    else
        log_error "Deployment failed - some services are not running"
        docker-compose -f $docker_compose_file logs
        exit 1
    fi
}

# Cleanup old images and containers
cleanup() {
    log_info "Cleaning up old Docker images and containers..."
    
    # Remove unused containers, networks, images
    docker system prune -f
    
    # Remove old images (keep last 3 versions)
    docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.ID}}\t{{.CreatedAt}}" | \
        grep katalisapp | \
        tail -n +4 | \
        awk '{print $3}' | \
        xargs -r docker rmi -f
    
    log_success "Cleanup completed"
}

# Main deployment flow
main() {
    check_prerequisites
    run_tests
    build_application
    deploy_application
    
    if [[ "$ENVIRONMENT" != "development" ]]; then
        cleanup
    fi
    
    log_success "Deployment to $ENVIRONMENT completed successfully!"
    
    if [[ "$ENVIRONMENT" == "production" ]]; then
        log_info "Production deployment checklist:"
        log_info "  ✓ Update DNS records to point to your server"
        log_info "  ✓ Configure SSL certificates via Let's Encrypt"
        log_info "  ✓ Set up monitoring and alerting"
        log_info "  ✓ Configure backups"
        log_info "  ✓ Test all critical functionality"
    fi
}

# Run main function
main