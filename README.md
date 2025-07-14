# KatalisApp - SaaS Financiero para Emprendedores

🚀 **Una plataforma SaaS completa que transforma el libro "Finanzas para Emprendedores" en herramientas financieras interactivas.**

## 📋 Descripción

KatalisApp es una aplicación SaaS desarrollada para PyMEs y emprendedores que necesitan herramientas financieras prácticas y análisis inteligente. La aplicación implementa todos los conceptos del libro "Finanzas para Emprendedores" como módulos interactivos con análisis de IA powered by PydanticAI.

## 🎯 Características Principales

### 📊 Módulos Financieros Implementados

1. **Unit Economics** (Capítulo 5)
   - Cálculo de LTV/COCA
   - Análisis de margen de contribución
   - Optimización de pricing

2. **Flujo de Caja** (Capítulos 3-4)
   - Proyecciones de cash flow
   - Análisis de liquidez
   - Alertas tempranas

3. **Costos y Precios** (Capítulos 6-9)
   - Estructura de costos
   - Estrategias de pricing
   - Punto de equilibrio

4. **Rentabilidad y ROI** (Capítulos 10-12)
   - Análisis de rentabilidad
   - Cálculo de ROI/EBITDA
   - Centros de ganancia

5. **Planeación Financiera** (Capítulos 13-15)
   - Presupuestos
   - Escenarios
   - Metas financieras

6. **Reportes y Dashboard Ejecutivo**
   - Métricas clave
   - Visualizaciones interactivas
   - Análisis de tendencias

7. **🤖 IA Insights** (Powered by PydanticAI)
   - Análisis inteligente de métricas
   - Recomendaciones personalizadas
   - Benchmarks de industria
   - Score de salud financiera

## 🛠 Tecnologías Utilizadas

### Frontend
- **React 18** con TypeScript
- **Vite** para build y desarrollo
- **TailwindCSS v3** para styling
- **GSAP** para animaciones
- **Recharts** para gráficos
- **Axios** para API calls

### Backend
- **FastAPI** (Python)
- **PydanticAI** para análisis inteligente
- **OpenAI GPT-4o-mini** para insights
- **Supabase** como base de datos principal
- **Uvicorn** como servidor ASGI

### Infraestructura
- **Docker** y **Docker Compose**
- **Nginx** para proxy reverse
- **Traefik** para SSL y load balancing
- **Redis** para caché
- **PostgreSQL** (opcional, via Supabase)

## 🚀 Instalación y Desarrollo

### Prerrequisitos

- Node.js 18+
- Python 3.11+
- Docker y Docker Compose
- OpenAI API Key

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd katalis-app
```

### 2. Configurar variables de entorno

```bash
# Backend
cp backend/.env.example backend/.env
# Editar backend/.env con tus claves de API

# Frontend
cp frontend/.env.example frontend/.env
# Configurar URL de API si es necesaria
```

### 3. Desarrollo local

```bash
# Opción 1: Con Docker (recomendado)
docker-compose up -d

# Opción 2: Desarrollo nativo
# Terminal 1 - Backend
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
uvicorn main:app --reload

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

### 4. Acceder a la aplicación

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Documentación API**: http://localhost:8000/docs

## 🌐 Deployment

### Desarrollo

```bash
./deploy.sh -e development
```

### Producción

1. **Configurar variables de entorno de producción:**

```bash
cp .env.prod.example .env.prod
# Editar .env.prod con valores reales
```

2. **Deploy a producción:**

```bash
./deploy.sh -e production
```

### Variables de Entorno Críticas

```env
# OpenAI para IA Insights
OPENAI_API_KEY=sk-your-openai-key

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Seguridad
SECRET_KEY=your-secure-secret-key
```

## 📱 Uso de la Aplicación

### 1. **Dashboard Principal**
- Visión general de métricas financieras
- KPIs clave en tiempo real
- Alertas y notificaciones

### 2. **Módulos Financieros**
- Navegación por conceptos del libro
- Calculadoras interactivas
- Visualizaciones dinámicas

### 3. **🤖 IA Insights**
- Análisis automático de tus datos
- Recomendaciones personalizadas
- Score de salud financiera
- Comparación con benchmarks

### 4. **Reportes Ejecutivos**
- Exportación de reportes
- Análisis de tendencias
- Métricas de crecimiento

## 🧪 Testing

```bash
# Frontend
cd frontend
npm run lint
npm run build  # Include type checking

# Backend
cd backend
python -m pytest

# E2E con Docker
./deploy.sh -b  # Build only
```

## 📁 Estructura del Proyecto

```
katalis-app/
├── frontend/                 # Aplicación React
│   ├── src/
│   │   ├── components/       # Componentes reutilizables
│   │   │   ├── ai/          # Componentes de IA
│   │   │   ├── common/      # Componentes comunes
│   │   │   └── ui/          # Componentes UI
│   │   ├── modules/         # Módulos financieros
│   │   │   ├── cash-flow/
│   │   │   ├── costs-pricing/
│   │   │   ├── profitability/
│   │   │   ├── reports/
│   │   │   └── unit-economics/
│   │   ├── services/        # Servicios API
│   │   │   ├── api.ts       # Cliente base
│   │   │   └── aiService.ts # Servicio IA
│   │   └── pages/           # Páginas principales
│   ├── Dockerfile
│   └── nginx.conf
├── backend/                  # API FastAPI
│   ├── agents/              # Agentes PydanticAI
│   │   ├── financial_advisor.py
│   │   └── cash_flow_advisor.py
│   ├── api/                 # Endpoints
│   │   ├── ai_insights.py   # Endpoints IA
│   │   └── [otros módulos]
│   ├── models/              # Modelos de datos
│   ├── services/            # Servicios de negocio
│   ├── Dockerfile
│   └── requirements.txt
├── docker-compose.yml       # Desarrollo
├── docker-compose.prod.yml  # Producción
└── deploy.sh               # Script de deploy
```

## 🔐 Seguridad

- Autenticación JWT
- HTTPS obligatorio en producción
- Validación de inputs con Pydantic
- Rate limiting en API
- Contenedores sin privilegios
- Variables de entorno para secretos

## 📊 Monitoreo

- Health checks automáticos
- Logs estructurados
- Métricas de Prometheus (opcional)
- Dashboard Grafana (opcional)
- Alertas por email/Slack

## 🤝 Contribución

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para detalles.

## 🆘 Soporte

Para reportar bugs o solicitar features:
- 📧 Email: support@katalisapp.com
- 🐛 Issues: [GitHub Issues](issues-url)
- 📖 Docs: [Documentación](docs-url)

## 🎯 Roadmap

### v1.1 (Próximo)
- [ ] Integración con bancos
- [ ] Análisis predictivo avanzado
- [ ] Notificaciones en tiempo real
- [ ] Móvil responsive mejorado

### v1.2 (Futuro)
- [ ] Integración con contabilidad
- [ ] Dashboards personalizables
- [ ] API pública
- [ ] Aplicación móvil nativa

---

**Desarrollado con ❤️ para emprendedores que buscan claridad financiera**