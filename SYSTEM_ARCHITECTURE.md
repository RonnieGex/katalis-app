# Katalis App - Complete System Architecture

## Overview
This document outlines the complete system architecture for a secure, scalable web application featuring admin access key management, user authentication, AI agents, and SEO-optimized frontend.

## Core Technology Stack

### Frontend (Google Indexable)
- **Framework**: HTML/CSS/JavaScript (Vanilla or with minimal framework)
- **SEO Optimization**: Meta tags, robots.txt, structured data
- **Hosting**: DigitalOcean App Platform (Static Site)

### Backend (Private/Non-Indexable)
- **Framework**: Python FastAPI
- **Authentication**: JWT tokens + API key management
- **Security**: CORS, rate limiting, input validation
- **Hosting**: DigitalOcean App Platform (Web Service)

### Caching Layer
- **Service**: Upstash Redis
- **Purpose**: Session storage, API response caching, rate limiting

### Database
- **Development**: SQLite (local development)
- **Production**: Supabase PostgreSQL

### AI Integration
- **Framework**: LangChain for AI Agents
- **LLM Provider**: OpenRouter API (280+ models)
- **Use Cases**: Chat agents, document processing, automated responses

### Containerization & Deployment
- **Container**: Docker multi-service setup
- **Orchestration**: Docker Compose for local development
- **Deployment**: DigitalOcean App Platform

## Detailed Architecture Components

### 1. Authentication System

#### Admin Authentication
```python
# Admin access key generation system
import secrets
import hashlib
from datetime import datetime, timedelta

class AdminKeyManager:
    def generate_access_key(self, admin_id: str, expires_days: int = 30):
        """Generate secure access key for admin"""
        key = secrets.token_urlsafe(32)
        key_hash = hashlib.sha256(key.encode()).hexdigest()
        expiry = datetime.utcnow() + timedelta(days=expires_days)
        
        # Store in database with metadata
        return {
            'key': key,
            'hash': key_hash,
            'admin_id': admin_id,
            'expires_at': expiry,
            'created_at': datetime.utcnow()
        }
    
    def validate_key(self, provided_key: str) -> bool:
        """Validate provided access key"""
        key_hash = hashlib.sha256(provided_key.encode()).hexdigest()
        # Check against database hash and expiry
        return self.is_valid_hash(key_hash)
```

#### User Authentication (Access Code)
```python
# Simple access code system for users
class UserAuth:
    def generate_access_code(self, length: int = 8):
        """Generate simple access code for users"""
        import string
        import random
        
        chars = string.ascii_uppercase + string.digits
        return ''.join(random.choice(chars) for _ in range(length))
    
    def validate_access_code(self, code: str) -> bool:
        """Validate user access code"""
        # Check against database of valid codes
        return self.check_code_in_db(code)
```

### 2. FastAPI Backend Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Configuration settings
│   ├── auth/
│   │   ├── __init__.py
│   │   ├── admin.py         # Admin authentication
│   │   ├── user.py          # User authentication
│   │   └── dependencies.py  # Auth dependencies
│   ├── api/
│   │   ├── __init__.py
│   │   ├── admin/
│   │   │   ├── __init__.py
│   │   │   ├── dashboard.py
│   │   │   └── keys.py      # Access key management
│   │   ├── user/
│   │   │   ├── __init__.py
│   │   │   └── dashboard.py
│   │   └── ai/
│   │       ├── __init__.py
│   │       ├── agents.py    # LangChain agents
│   │       └── chat.py      # Chat endpoints
│   ├── models/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── user.py
│   │   └── ai.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── redis_service.py # Upstash Redis integration
│   │   ├── db_service.py    # Supabase integration
│   │   └── ai_service.py    # LangChain/OpenRouter
│   └── utils/
│       ├── __init__.py
│       ├── security.py
│       └── helpers.py
├── requirements.txt
└── Dockerfile
```

### 3. Frontend Structure (SEO Optimized)

```
frontend/
├── index.html           # Main landing page (SEO optimized)
├── admin/
│   ├── index.html      # Admin login
│   └── dashboard.html  # Admin dashboard
├── user/
│   ├── login.html      # User access code entry
│   └── dashboard.html  # User dashboard
├── ai/
│   └── chat.html       # AI chat interface
├── assets/
│   ├── css/
│   ├── js/
│   └── images/
├── robots.txt          # SEO crawling rules
└── sitemap.xml         # Site structure for SEO
```

#### SEO Implementation

**robots.txt**
```
User-agent: *
Allow: /
Allow: /assets/
Disallow: /admin/
Disallow: /api/
Disallow: /user/dashboard
Disallow: /ai/

Sitemap: https://yourdomain.com/sitemap.xml
```

**Meta Tags Template**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Your SEO-optimized description">
    <meta name="keywords" content="relevant, keywords, here">
    <meta name="robots" content="index,follow">
    <meta property="og:title" content="Page Title">
    <meta property="og:description" content="Page description">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://yourdomain.com">
    <title>Your Page Title</title>
    
    <!-- JSON-LD Structured Data -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Your App Name",
        "description": "Your app description"
    }
    </script>
</head>
```

### 4. LangChain + OpenRouter Integration

```python
# ai_service.py
from langchain_openai import ChatOpenAI
from langchain.agents import initialize_agent, AgentType
from langchain.tools import Tool
from langchain.memory import ConversationBufferMemory
from langchain.schema import HumanMessage, SystemMessage

class AIService:
    def __init__(self):
        self.llm = ChatOpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=os.getenv("OPENROUTER_API_KEY"),
            model="anthropic/claude-3-sonnet"
        )
        self.memory = ConversationBufferMemory(return_messages=True)
        
    def create_agent(self, tools: list = None):
        """Create LangChain agent with tools"""
        if tools is None:
            tools = self.get_default_tools()
            
        return initialize_agent(
            tools=tools,
            llm=self.llm,
            agent=AgentType.CHAT_CONVERSATIONAL_REACT_DESCRIPTION,
            memory=self.memory,
            verbose=True
        )
    
    def get_default_tools(self):
        """Define default tools for the agent"""
        return [
            Tool(
                name="Search",
                description="Search for information",
                func=self.search_tool
            ),
            Tool(
                name="Calculator",
                description="Perform calculations",
                func=self.calculator_tool
            )
        ]
    
    async def chat_with_agent(self, message: str, user_id: str):
        """Process chat message through agent"""
        agent = self.create_agent()
        
        # Add user context
        context = f"User ID: {user_id}\nMessage: {message}"
        
        try:
            response = agent.run(context)
            
            # Cache response in Redis
            await self.cache_response(user_id, message, response)
            
            return response
        except Exception as e:
            return f"Error processing request: {str(e)}"
```

### 5. Security Implementation

#### Backend Security (FastAPI)
```python
# main.py security setup
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import PlainTextResponse
import redis
import time

app = FastAPI(
    title="Katalis API",
    description="Secure API with AI capabilities",
    docs_url=None,  # Disable docs in production
    redoc_url=None  # Disable redoc in production
)

# Security middleware
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=["yourdomain.com", "*.yourdomain.com"]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Rate limiting
redis_client = redis.from_url(os.getenv("UPSTASH_REDIS_URL"))

async def rate_limit(request: Request):
    """Rate limiting middleware"""
    client_ip = request.client.host
    key = f"rate_limit:{client_ip}"
    
    current = redis_client.get(key)
    if current is None:
        redis_client.setex(key, 60, 1)  # 1 request per minute
    else:
        if int(current) >= 10:  # Max 10 requests per minute
            raise HTTPException(429, "Rate limit exceeded")
        redis_client.incr(key)

# Prevent indexing
@app.get('/robots.txt', response_class=PlainTextResponse, include_in_schema=False)
def robots():
    return """User-agent: *
Disallow: /api/
Disallow: /docs
Disallow: /redoc"""

# Add noindex headers to all API routes
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    if request.url.path.startswith("/api/"):
        response.headers["X-Robots-Tag"] = "noindex, nofollow"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
    return response
```

### 6. Docker Configuration

#### Docker Compose (Development)
```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    volumes:
      - ./frontend:/usr/share/nginx/html
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - UPSTASH_REDIS_URL=${UPSTASH_REDIS_URL}
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
      - SECRET_KEY=${SECRET_KEY}
    depends_on:
      - redis
    volumes:
      - ./backend:/code

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  redis_data:
```

#### Backend Dockerfile
```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /code

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY ./app /code/app

# Security: Create non-root user
RUN useradd --create-home --shell /bin/bash app
RUN chown -R app:app /code
USER app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Frontend Dockerfile
```dockerfile
# frontend/Dockerfile
FROM nginx:alpine

# Copy static files
COPY . /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Security headers
RUN echo 'add_header X-Frame-Options "SAMEORIGIN" always;' > /etc/nginx/conf.d/security.conf && \
    echo 'add_header X-Content-Type-Options "nosniff" always;' >> /etc/nginx/conf.d/security.conf && \
    echo 'add_header X-XSS-Protection "1; mode=block" always;' >> /etc/nginx/conf.d/security.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 7. DigitalOcean Deployment

#### App Spec Configuration
```yaml
# .do/app.yaml
name: katalis-app
region: nyc1

services:
- name: frontend
  source_dir: /frontend
  github:
    repo: your-username/katalis-app
    branch: main
  run_command: nginx -g 'daemon off;'
  environment_slug: html
  instance_count: 1
  instance_size_slug: apps-s-1vcpu-0.5gb
  routes:
  - path: /
  
- name: backend
  source_dir: /backend
  github:
    repo: your-username/katalis-app
    branch: main
  run_command: uvicorn app.main:app --host 0.0.0.0 --port 8080
  environment_slug: python
  instance_count: 1
  instance_size_slug: apps-s-1vcpu-1gb
  routes:
  - path: /api
  envs:
  - key: DATABASE_URL
    value: ${supabase.DATABASE_URL}
    type: SECRET
  - key: UPSTASH_REDIS_URL
    value: ${upstash.REDIS_URL}
    type: SECRET
  - key: OPENROUTER_API_KEY
    value: ${openrouter.API_KEY}
    type: SECRET

databases:
- name: katalis-db
  engine: PG
  production: true
```

### 8. Environment Configuration

#### Environment Variables
```bash
# .env (development)
DATABASE_URL=sqlite:///./test.db
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
UPSTASH_REDIS_URL=your_upstash_redis_url
OPENROUTER_API_KEY=your_openrouter_key
SECRET_KEY=your_secret_key_here
ADMIN_EMAIL=admin@yourdomain.com
CORS_ORIGINS=["http://localhost:3000"]

# Production (DigitalOcean App Platform environment variables)
DATABASE_URL=${supabase.DATABASE_URL}
UPSTASH_REDIS_URL=${upstash.REDIS_URL}
OPENROUTER_API_KEY=${openrouter.API_KEY}
SECRET_KEY=${app.SECRET_KEY}
CORS_ORIGINS=["https://yourdomain.com"]
```

## API Structure

### RESTful Endpoint Design
```
Frontend Routes (Public/SEO):
GET /                    # Landing page
GET /about              # About page
GET /contact            # Contact page
GET /robots.txt         # SEO robots file
GET /sitemap.xml        # SEO sitemap

Backend API Routes (Private):
POST /api/auth/admin/login        # Admin authentication
POST /api/auth/user/login         # User access code login
GET  /api/admin/dashboard         # Admin dashboard data
POST /api/admin/keys/generate     # Generate access keys
GET  /api/admin/keys/list         # List all keys
DELETE /api/admin/keys/{key_id}   # Revoke access key
GET  /api/user/dashboard          # User dashboard data
POST /api/ai/chat                 # AI chat endpoint
POST /api/ai/agents/create        # Create AI agent
GET  /api/ai/agents/list          # List user's agents
POST /api/ai/agents/{id}/chat     # Chat with specific agent
```

## Security Best Practices Implemented

1. **Access Key Management**: Cryptographically secure key generation with expiration
2. **Authentication Layers**: Separate admin/user authentication systems
3. **Rate Limiting**: Redis-based rate limiting to prevent abuse
4. **CORS Protection**: Restricted origins for API access
5. **Input Validation**: Pydantic models for all inputs
6. **SQL Injection Prevention**: ORM-based queries only
7. **XSS Prevention**: Content Security Policy headers
8. **HTTPS Enforcement**: All traffic encrypted
9. **Secret Management**: Environment-based secret storage
10. **API Documentation**: Disabled in production to prevent exposure

## Monitoring & Maintenance

### Health Checks
```python
@app.get("/health")
async def health_check():
    """System health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "redis": await check_redis_connection(),
            "database": await check_db_connection(),
            "openrouter": await check_openrouter_connection()
        }
    }
```

### Logging
```python
import logging
from datetime import datetime

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format='{"timestamp": "%(asctime)s", "level": "%(levelname)s", "message": "%(message)s"}',
    handlers=[
        logging.FileHandler("app.log"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Log security events
def log_security_event(event_type: str, user_id: str, details: dict):
    logger.warning(f"Security event: {event_type}", extra={
        "user_id": user_id,
        "event_type": event_type,
        "details": details,
        "timestamp": datetime.utcnow().isoformat()
    })
```

This architecture provides a secure, scalable, and SEO-friendly foundation for your application with proper separation of concerns, robust authentication, and modern deployment practices.