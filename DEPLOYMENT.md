# 🚀 KatalisApp Deployment Guide

## Deployment Completo: Docker + GitHub + DigitalOcean

### 📋 Pre-requisitos

- Docker y Docker Compose instalados
- Git configurado
- Cuenta de GitHub con repositorio
- Cuenta de DigitalOcean con App Platform
- Variables de entorno configuradas

### 🔧 Configuración de Variables de Entorno

Crea un archivo `.env` en el directorio raíz con las siguientes variables:

```env
# Environment Variables para KatalisApp
ENVIRONMENT=production
DEBUG=false
SECRET_KEY=tu-clave-secreta-aqui-cambiar-en-produccion
JWT_SECRET_KEY=tu-jwt-secret-aqui-cambiar-en-produccion
OPENAI_API_KEY=tu-openai-api-key-aqui
REDIS_URL=redis://redis:6379/0
REDIS_REST_URL=tu-redis-rest-url-aqui
REDIS_REST_TOKEN=tu-redis-rest-token-aqui
SUPABASE_URL=tu-supabase-url-aqui
SUPABASE_ANON_KEY=tu-supabase-anon-key-aqui
SUPABASE_SERVICE_KEY=tu-supabase-service-key-aqui
```

### 🐳 Deployment con Docker

#### Opción 1: Script Automático (Recomendado)

```bash
./deploy.sh
```

Este script:
- ✅ Verifica dependencias
- ✅ Construye imágenes Docker
- ✅ Ejecuta tests
- ✅ Hace commit y push a GitHub
- ✅ Inicia servicios localmente
- ✅ Verifica que todo funcione

#### Opción 2: Manual

```bash
# Construir imágenes
docker build -t katalis-app-frontend:latest --target production ./frontend
docker build -t katalis-app-backend:latest --target production ./backend

# Iniciar servicios
docker-compose up -d

# Verificar estado
docker-compose ps
```

### 🐙 GitHub Actions

El workflow `.github/workflows/deploy.yml` se activa automáticamente en:
- Push a la rama `main`
- Pull requests a `main`

**Secrets necesarios en GitHub:**
- `DIGITALOCEAN_ACCESS_TOKEN`: Token de acceso a DigitalOcean
- `DIGITALOCEAN_APP_ID`: ID de la aplicación en DigitalOcean

### 🌊 DigitalOcean Deployment

#### Configuración inicial:

1. **Crear App en DigitalOcean:**
   ```bash
   doctl apps create --spec .digitalocean/app.yaml
   ```

2. **Configurar variables de entorno** en el panel de DigitalOcean:
   - `SECRET_KEY`
   - `JWT_SECRET_KEY`
   - `OPENAI_API_KEY`
   - `REDIS_URL`
   - `REDIS_REST_URL`
   - `REDIS_REST_TOKEN`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY`

3. **Configurar dominio** (opcional):
   - Agregar dominio personalizado en DigitalOcean
   - Configurar DNS records

#### Deployment automático:

Cada push a `main` ejecuta:
- Tests del frontend y backend
- Build de imágenes Docker
- Push a DigitalOcean Container Registry
- Deployment a DigitalOcean App Platform

### 🔍 Monitoreo

#### URLs de servicios:

**Local:**
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Database: localhost:5432
- Redis: localhost:6379

**Producción:**
- Frontend: https://tu-dominio.com
- Backend: https://tu-dominio.com/api
- API Docs: https://tu-dominio.com/docs

#### Comandos útiles:

```bash
# Ver logs
docker-compose logs -f [frontend|backend|postgres|redis]

# Verificar estado
docker-compose ps

# Detener servicios
docker-compose down

# Reiniciar servicios
docker-compose restart

# Limpiar recursos
docker system prune -a
```

### 🔒 Seguridad

- ✅ Imágenes Docker con usuario no-root
- ✅ Health checks configurados
- ✅ Variables de entorno seguras
- ✅ Headers de seguridad en nginx
- ✅ Compresión gzip habilitada
- ✅ CORS configurado correctamente

### 🐛 Troubleshooting

#### Frontend no carga:
```bash
docker-compose logs frontend
```

#### Backend no responde:
```bash
docker-compose logs backend
curl http://localhost:8000/health
```

#### Base de datos no conecta:
```bash
docker-compose logs postgres
```

#### Redis no funciona:
```bash
docker-compose logs redis
```

### 📊 Métricas y Logging

- Logs centralizados en DigitalOcean
- Health checks cada 30 segundos
- Métricas de CPU y memoria
- Alertas automáticas en fallos

### 🔄 Rollback

En caso de problemas:

```bash
# Rollback local
docker-compose down
git checkout HEAD~1
docker-compose up -d

# Rollback en DigitalOcean
doctl apps list-deployments <app-id>
doctl apps create-deployment <app-id> --deployment-id <previous-deployment-id>
```

### 📚 Recursos Adicionales

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [DigitalOcean App Platform](https://docs.digitalocean.com/products/app-platform/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [React Production Build](https://react.dev/learn/start-a-new-react-project#production-ready-react-frameworks)

---

## 🎯 Checklist de Deployment

- [ ] Variables de entorno configuradas
- [ ] Secrets de GitHub configurados
- [ ] App de DigitalOcean creada
- [ ] Dominio configurado (opcional)
- [ ] DNS configurado (opcional)
- [ ] Monitoreo configurado
- [ ] Backup configurado
- [ ] Tests pasando
- [ ] Deployment verificado

¡Listo para producción! 🚀