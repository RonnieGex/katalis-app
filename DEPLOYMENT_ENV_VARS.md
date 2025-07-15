# Variables de Entorno para DigitalOcean App Platform

## Instrucciones
Configura estas variables en DigitalOcean App Platform:
1. Ve a https://cloud.digitalocean.com/apps
2. Selecciona tu app "katalis-app"
3. Ve a Settings > App-Level Environment Variables
4. Agrega cada variable con su valor correspondiente

## Variables Requeridas

### 🔐 Seguridad y Autenticación
```bash
SECRET_KEY=tu-clave-secreta-muy-segura-de-al-menos-32-caracteres
JWT_SECRET_KEY=otra-clave-secreta-para-jwt-tokens
```

### 🤖 OpenAI API
```bash
OPENAI_API_KEY=sk-tu-api-key-de-openai
```

### 🗄️ Supabase
```bash
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-anon-key-de-supabase
SUPABASE_SERVICE_KEY=tu-service-key-de-supabase
```

### 📊 Redis (si usas Upstash)
```bash
REDIS_URL=redis://default:password@endpoint:port
REDIS_REST_URL=https://tu-redis-endpoint.upstash.io
REDIS_REST_TOKEN=tu-redis-rest-token
```

### 🌐 GitHub (para deployment)
```bash
GITHUB_REPO=RonnieGex/katalis-app
```

## Variables Opcionales

### 📧 Email (si implementas notificaciones)
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password
```

### 🔍 Monitoreo (si usas Sentry)
```bash
SENTRY_DSN=https://tu-sentry-dsn
```

## Verificación

Después de configurar todas las variables:
1. Haz clic en "Save"
2. La app se redesplegarĂ¡ automáticamente
3. Verifica en los logs que no haya errores de variables faltantes
4. Prueba la funcionalidad en https://katalis-app-32c9h.ondigitalocean.app

## Notas Importantes

- **NO** compartas estas claves en repositorios públicos
- **NO** uses las mismas claves en desarrollo y producción
- **SÍ** rota las claves periódicamente
- **SÍ** usa claves largas y seguras (mínimo 32 caracteres para SECRET_KEY)