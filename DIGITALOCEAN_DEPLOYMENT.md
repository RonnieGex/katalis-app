# DigitalOcean Deployment Guide

## Overview
Complete guide for deploying a multi-service application (FastAPI backend, React/HTML frontend, Redis, databases) on DigitalOcean App Platform and Droplets.

## DigitalOcean App Platform Deployment

### 1. App Specification Configuration

#### Complete App Spec (app.yaml)
```yaml
name: katalis-app
region: nyc1

# Environment variables (global)
envs:
- key: ENVIRONMENT
  value: production
  type: GENERAL
- key: SECRET_KEY
  value: ${APP_SECRET_KEY}
  type: SECRET
- key: DATABASE_URL
  value: ${DATABASE_URL}
  type: SECRET
- key: UPSTASH_REDIS_URL
  value: ${UPSTASH_REDIS_URL}
  type: SECRET
- key: OPENROUTER_API_KEY
  value: ${OPENROUTER_API_KEY}
  type: SECRET

# Frontend Service (Static Site)
static_sites:
- name: frontend
  source_dir: /frontend
  github:
    repo: your-username/katalis-app
    branch: main
    deploy_on_push: true
  build_command: npm run build
  output_dir: dist
  index_document: index.html
  error_document: 404.html
  catchall_document: index.html
  routes:
  - path: /
    preserve_path_prefix: false
  cors:
    allow_origins:
    - exact: "https://yourdomain.com"
    allow_methods:
    - GET
    - POST
    - OPTIONS
    allow_headers:
    - Content-Type
    - Authorization
    allow_credentials: true

# Backend API Service
services:
- name: backend
  source_dir: /backend
  github:
    repo: your-username/katalis-app
    branch: main
    deploy_on_push: true
  build_command: pip install -r requirements.txt
  run_command: gunicorn --worker-class uvicorn.workers.UvicornWorker --workers 2 --bind 0.0.0.0:8080 app.main:app
  environment_slug: python
  instance_count: 1
  instance_size_slug: apps-s-1vcpu-1gb
  
  # Health check configuration
  health_check:
    http_path: /health
    initial_delay_seconds: 30
    period_seconds: 10
    timeout_seconds: 5
    success_threshold: 1
    failure_threshold: 3
  
  # Auto-scaling configuration
  autoscaling:
    min_instance_count: 1
    max_instance_count: 5
    metrics:
      cpu:
        percent: 70
  
  # Routes configuration
  routes:
  - path: /api
    preserve_path_prefix: true
  
  # Environment variables specific to backend
  envs:
  - key: PORT
    value: "8080"
    type: GENERAL
  - key: CORS_ORIGINS
    value: "https://yourdomain.com"
    type: GENERAL
  - key: LOG_LEVEL
    value: "INFO"
    type: GENERAL
  
  # CORS configuration
  cors:
    allow_origins:
    - exact: "https://yourdomain.com"
    allow_methods:
    - GET
    - POST
    - PUT
    - DELETE
    - OPTIONS
    allow_headers:
    - Content-Type
    - Authorization
    - X-API-Key
    expose_headers:
    - X-Total-Count
    allow_credentials: true
    max_age: "86400"

# Database (if using DO managed database)
databases:
- name: katalis-db
  engine: PG
  version: "15"
  production: true
  size: db-s-1vcpu-1gb
  num_nodes: 1

# Domain configuration
domains:
- domain: yourdomain.com
  type: PRIMARY
  wildcard: false
  zone: yourdomain.com
- domain: www.yourdomain.com
  type: ALIAS
  wildcard: false

# Alerts configuration
alerts:
- rule: DEPLOYMENT_FAILED
  disabled: false
- rule: DOMAIN_FAILED
  disabled: false
- rule: CPU_UTILIZATION
  value: 80
  operator: GREATER_THAN
  window: FIVE_MINUTES
  disabled: false

# Static asset caching
ingress:
  rules:
  - match:
      path:
        prefix: /assets
    component:
      name: frontend
      preserve_path_prefix: true
  - match:
      path:
        prefix: /api
    component:
      name: backend
      preserve_path_prefix: true
```

### 2. Frontend Build Configuration

#### Package.json for Build Process
```json
{
  "name": "katalis-frontend",
  "version": "1.0.0",
  "scripts": {
    "build": "npm run build:css && npm run build:js && npm run copy:assets",
    "build:css": "postcss src/css/main.css -o dist/css/main.css --config postcss.config.js",
    "build:js": "webpack --mode production --config webpack.config.js",
    "copy:assets": "cp -r src/assets/* dist/ && cp src/*.html dist/",
    "dev": "webpack serve --mode development",
    "lint": "eslint src/js/**/*.js",
    "test": "jest"
  },
  "devDependencies": {
    "webpack": "^5.88.0",
    "webpack-cli": "^5.1.0",
    "webpack-dev-server": "^4.15.0",
    "postcss": "^8.4.24",
    "postcss-cli": "^10.1.0",
    "autoprefixer": "^10.4.14",
    "cssnano": "^6.0.1",
    "eslint": "^8.44.0"
  }
}
```

#### Webpack Configuration
```javascript
// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  entry: './src/js/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].[contenthash].js',
    clean: true,
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader'
        ]
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|webp)$/,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name].[hash][ext]'
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name].[hash][ext]'
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      inject: 'body',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      }
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash].css'
    })
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true
          }
        }
      }),
      new CssMinimizerPlugin()
    ],
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  }
};
```

### 3. Backend Production Configuration

#### Production Dockerfile
```dockerfile
# Multi-stage build for smaller production image
FROM python:3.11-slim as builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Production stage
FROM python:3.11-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy installed packages from builder stage
COPY --from=builder /root/.local /root/.local

# Copy application code
COPY ./app ./app

# Create non-root user for security
RUN useradd --create-home --shell /bin/bash appuser && \
    chown -R appuser:appuser /app
USER appuser

# Add local packages to PATH
ENV PATH=/root/.local/bin:$PATH

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

EXPOSE 8080

# Use gunicorn for production
CMD ["gunicorn", "--worker-class", "uvicorn.workers.UvicornWorker", "--workers", "2", "--bind", "0.0.0.0:8080", "app.main:app"]
```

#### Production Requirements.txt
```txt
# Core framework
fastapi==0.104.1
uvicorn[standard]==0.24.0
gunicorn==21.2.0

# Database
sqlalchemy==2.0.23
alembic==1.13.0
asyncpg==0.29.0  # For PostgreSQL
psycopg2-binary==2.9.7

# Redis
redis==5.0.1
aioredis==2.0.1

# Authentication & Security
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6

# HTTP client
httpx==0.25.2
aiohttp==3.9.1

# AI/ML
langchain==0.0.350
langchain-openai==0.0.5
openai==1.3.7

# Data processing
pandas==2.1.4
numpy==1.25.2

# Monitoring & Logging
structlog==23.2.0
sentry-sdk[fastapi]==1.38.0

# Environment & Config
python-dotenv==1.0.0
pydantic==2.5.1
pydantic-settings==2.1.0

# Production server
gunicorn==21.2.0
```

#### Production FastAPI Configuration
```python
# app/config.py
from pydantic_settings import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    # App settings
    app_name: str = "Katalis API"
    debug: bool = False
    version: str = "1.0.0"
    
    # Server settings
    host: str = "0.0.0.0"
    port: int = 8080
    workers: int = 2
    
    # Security
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Database
    database_url: str
    
    # Redis
    redis_url: str
    
    # External APIs
    openrouter_api_key: str
    
    # CORS
    cors_origins: List[str] = ["https://yourdomain.com"]
    
    # Monitoring
    sentry_dsn: Optional[str] = None
    log_level: str = "INFO"
    
    # Rate limiting
    rate_limit_requests: int = 100
    rate_limit_window: int = 60
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# Global settings instance
settings = Settings()

# Production-specific configuration
if not settings.debug:
    # Disable API docs in production
    import fastapi
    fastapi.FastAPI.__init__.__defaults__ = (
        None, None, None, None, None, None, None, None, None, None, None, 
        None, None, None, None, None, None, None, None, None, None, None, 
        None, None, None, None, None, None, None, None, None
    )
```

### 4. Database Migration and Setup

#### Alembic Configuration
```python
# alembic/env.py
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
from app.models import Base
from app.config import settings

# Alembic Config object
config = context.config

# Set database URL from environment
config.set_main_option("sqlalchemy.url", settings.database_url)

# Configure logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, 
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

#### Migration Scripts
```bash
#!/bin/bash
# deploy/migrate.sh

set -e

echo "Running database migrations..."

# Wait for database to be ready
echo "Waiting for database..."
python -c "
import time
import psycopg2
from app.config import settings

while True:
    try:
        conn = psycopg2.connect(settings.database_url)
        conn.close()
        break
    except psycopg2.OperationalError:
        time.sleep(1)
        
print('Database is ready!')
"

# Run migrations
alembic upgrade head

echo "Migrations completed successfully!"
```

### 5. Environment Variables and Secrets

#### Environment Configuration
```bash
# Production environment variables for DigitalOcean
# Set these in the App Platform dashboard

# App Configuration
APP_SECRET_KEY=your-super-secret-key-here
ENVIRONMENT=production
LOG_LEVEL=INFO

# Database (if using DO managed database)
DATABASE_URL=postgresql://user:password@db-host:port/database

# Supabase (alternative)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key

# Redis (Upstash)
UPSTASH_REDIS_URL=rediss://default:password@redis-host:port

# AI Services
OPENROUTER_API_KEY=your-openrouter-api-key

# Security
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Monitoring (optional)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60
```

### 6. Monitoring and Logging

#### Structured Logging Configuration
```python
# app/logging_config.py
import structlog
import logging
from app.config import settings

def configure_logging():
    """Configure structured logging for production"""
    
    # Configure standard library logging
    logging.basicConfig(
        format="%(message)s",
        stream=None,
        level=getattr(logging, settings.log_level.upper()),
    )
    
    # Configure structlog
    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer()
        ],
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

# Usage in FastAPI
from structlog import get_logger

logger = get_logger()

@app.middleware("http")
async def logging_middleware(request: Request, call_next):
    start_time = time.time()
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    
    logger.info(
        "request_processed",
        method=request.method,
        url=str(request.url),
        status_code=response.status_code,
        process_time=process_time,
        user_agent=request.headers.get("user-agent"),
        client_ip=request.client.host
    )
    
    return response
```

#### Health Check Implementation
```python
# app/health.py
from fastapi import APIRouter, HTTPException
from sqlalchemy import text
from app.database import get_db
from app.redis_client import redis_client
import httpx
import asyncio

router = APIRouter()

@router.get("/health")
async def health_check():
    """Comprehensive health check"""
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": settings.version,
        "services": {}
    }
    
    # Check database
    try:
        db = next(get_db())
        db.execute(text("SELECT 1"))
        health_status["services"]["database"] = "healthy"
    except Exception as e:
        health_status["services"]["database"] = f"unhealthy: {str(e)}"
        health_status["status"] = "unhealthy"
    
    # Check Redis
    try:
        await redis_client.ping()
        health_status["services"]["redis"] = "healthy"
    except Exception as e:
        health_status["services"]["redis"] = f"unhealthy: {str(e)}"
        health_status["status"] = "unhealthy"
    
    # Check external APIs
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://openrouter.ai/api/v1/models",
                headers={"Authorization": f"Bearer {settings.openrouter_api_key}"},
                timeout=5.0
            )
            if response.status_code == 200:
                health_status["services"]["openrouter"] = "healthy"
            else:
                health_status["services"]["openrouter"] = f"unhealthy: HTTP {response.status_code}"
    except Exception as e:
        health_status["services"]["openrouter"] = f"unhealthy: {str(e)}"
    
    if health_status["status"] == "unhealthy":
        raise HTTPException(status_code=503, detail=health_status)
    
    return health_status

@router.get("/ready")
async def readiness_check():
    """Readiness check for load balancer"""
    try:
        # Quick database check
        db = next(get_db())
        db.execute(text("SELECT 1"))
        return {"status": "ready"}
    except Exception:
        raise HTTPException(status_code=503, detail={"status": "not ready"})
```

### 7. Performance Optimization

#### Caching Strategy
```python
# app/cache.py
import redis.asyncio as redis
from functools import wraps
import json
import hashlib
from typing import Any, Optional
import pickle

class CacheManager:
    def __init__(self, redis_url: str):
        self.redis = redis.from_url(redis_url)
    
    async def get(self, key: str) -> Optional[Any]:
        """Get cached value"""
        try:
            value = await self.redis.get(key)
            if value:
                return pickle.loads(value)
        except Exception as e:
            logger.warning(f"Cache get error: {e}")
        return None
    
    async def set(self, key: str, value: Any, expire: int = 3600):
        """Set cached value"""
        try:
            await self.redis.setex(key, expire, pickle.dumps(value))
        except Exception as e:
            logger.warning(f"Cache set error: {e}")
    
    async def delete(self, key: str):
        """Delete cached value"""
        try:
            await self.redis.delete(key)
        except Exception as e:
            logger.warning(f"Cache delete error: {e}")

# Cache decorator
def cache_result(expire: int = 3600, key_prefix: str = ""):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key
            key_data = f"{key_prefix}:{func.__name__}:{str(args)}:{str(kwargs)}"
            cache_key = hashlib.md5(key_data.encode()).hexdigest()
            
            # Try to get from cache
            cached_result = await cache_manager.get(cache_key)
            if cached_result is not None:
                return cached_result
            
            # Execute function and cache result
            result = await func(*args, **kwargs)
            await cache_manager.set(cache_key, result, expire)
            
            return result
        return wrapper
    return decorator
```

### 8. Deployment Automation

#### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to DigitalOcean

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  DO_TOKEN: ${{ secrets.DO_TOKEN }}
  DO_APP_ID: ${{ secrets.DO_APP_ID }}

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    
    - name: Install dependencies
      run: |
        cd backend
        pip install -r requirements.txt
        pip install pytest pytest-asyncio
    
    - name: Run tests
      run: |
        cd backend
        pytest tests/ -v
    
    - name: Run linting
      run: |
        cd backend
        pip install flake8
        flake8 app/ --max-line-length=88 --exclude=migrations
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Install doctl
      uses: digitalocean/action-doctl@v2
      with:
        token: ${{ secrets.DO_TOKEN }}
    
    - name: Update app
      run: |
        doctl apps update ${{ secrets.DO_APP_ID }} --spec .do/app.yaml
    
    - name: Wait for deployment
      run: |
        doctl apps wait ${{ secrets.DO_APP_ID }}
    
    - name: Get app info
      run: |
        doctl apps get ${{ secrets.DO_APP_ID }}
```

### 9. SSL and Domain Configuration

#### Domain Setup Script
```bash
#!/bin/bash
# scripts/setup-domain.sh

set -e

DOMAIN="yourdomain.com"
APP_ID="your-app-id"

echo "Setting up domain: $DOMAIN"

# Add domain to app
doctl apps update $APP_ID --spec - <<EOF
domains:
- domain: $DOMAIN
  type: PRIMARY
  wildcard: false
- domain: www.$DOMAIN
  type: ALIAS
  wildcard: false
EOF

echo "Domain configuration updated"
echo "Please update your DNS records:"
echo "A record: $DOMAIN -> (DigitalOcean will provide IP)"
echo "CNAME record: www.$DOMAIN -> $DOMAIN"
```

### 10. Backup and Disaster Recovery

#### Database Backup Strategy
```bash
#!/bin/bash
# scripts/backup-database.sh

set -e

# Configuration
DB_CONNECTION_STRING="$DATABASE_URL"
BACKUP_BUCKET="your-backup-bucket"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${DATE}.sql"

echo "Starting database backup..."

# Create backup
pg_dump "$DB_CONNECTION_STRING" > "$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_FILE"

# Upload to DigitalOcean Spaces (or AWS S3)
aws s3 cp "${BACKUP_FILE}.gz" "s3://${BACKUP_BUCKET}/database/${BACKUP_FILE}.gz" \
  --endpoint-url="https://nyc3.digitaloceanspaces.com"

# Clean up local files
rm "${BACKUP_FILE}.gz"

echo "Backup completed: ${BACKUP_FILE}.gz"

# Retention: Keep last 30 daily backups
aws s3 ls "s3://${BACKUP_BUCKET}/database/" \
  --endpoint-url="https://nyc3.digitaloceanspaces.com" \
  | sort -k1,2 | head -n -30 | awk '{print $4}' \
  | xargs -I {} aws s3 rm "s3://${BACKUP_BUCKET}/database/{}" \
    --endpoint-url="https://nyc3.digitaloceanspaces.com"
```

This comprehensive DigitalOcean deployment guide provides everything needed to successfully deploy and manage a production application with proper security, monitoring, and automation practices.