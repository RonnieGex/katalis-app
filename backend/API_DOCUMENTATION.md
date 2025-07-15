# 📚 KatalisApp API Documentation

## 🌟 Visión General

KatalisApp proporciona una API REST completa para análisis financiero empresarial con inteligencia artificial. La API está construida con FastAPI y utiliza PydanticAI para generar insights financieros inteligentes.

### 🏗️ Arquitectura Base

- **Framework**: FastAPI con Python 3.11+
- **IA**: PydanticAI + OpenAI GPT-4o-mini + DeepSeek R1
- **Validación**: Pydantic v2 para validación de datos
- **Documentación**: OpenAPI 3.0 automática
- **Autenticación**: JWT (en módulos auth)

### 🔗 URLs Base

- **Desarrollo**: `http://localhost:8000`
- **Producción**: `https://api.katalisapp.com`
- **Docs Interactivas**: `/docs`
- **Health Check**: `/health`

---

## 🤖 Módulo AI Insights

### Endpoints Principales

#### 1. **Análisis Integral de Negocio**
```http
POST /api/ai/analyze/business-health
Content-Type: application/json
```

**Descripción**: Análisis completo de la salud financiera del negocio usando IA.

**Request Body**:
```json
{
  "financial_metrics": {
    "revenue": 100000,
    "expenses": 80000,
    "net_profit": 20000,
    "cash_flow": 15000,
    "ltv": 1200,
    "coca": 300,
    "fixed_costs": 50000,
    "variable_costs": 30000
  },
  "unit_economics": {
    "price_per_unit": 50,
    "variable_cost_per_unit": 20,
    "marketing_spend": 5000,
    "new_customers": 100,
    "avg_purchase_frequency": 2.5,
    "retention_months": 12
  },
  "business_context": {
    "industry": "saas",
    "business_stage": "growth",
    "employee_count": 15,
    "months_operating": 18
  }
}
```

**Response**:
```json
{
  "analysis": {
    "overall_health": "Saludable",
    "key_insights": [
      "Ratio LTV/COCA de 4x indica eficiencia en adquisición",
      "Margen neto del 20% está por encima del promedio de industria"
    ],
    "recommendations": [
      {
        "category": "growth",
        "priority": "Alta",
        "title": "Optimizar canales de adquisición",
        "description": "Concentrar inversión en canales con mejor ROI"
      }
    ]
  },
  "health_score": {
    "total_score": 85,
    "component_scores": {
      "profitability": 22,
      "unit_economics": 20,
      "cash_flow": 23,
      "efficiency": 20
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### 2. **Score de Salud Rápido**
```http
GET /api/ai/health-score?revenue=100000&expenses=80000&net_profit=20000&cash_flow=15000&ltv=1200&coca=300&price_per_unit=50&variable_cost_per_unit=20
```

**Response**:
```json
{
  "total_score": 85,
  "health_level": "Saludable",
  "component_scores": {
    "profitability": 22,
    "unit_economics": 20,
    "cash_flow": 23,
    "efficiency": 20
  },
  "recommendations_priority": "Media"
}
```

#### 3. **Recomendaciones Rápidas**
```http
POST /api/ai/recommendations/quick
```

**Response**:
```json
{
  "recommendations": [
    {
      "category": "unit_economics",
      "priority": "Alta",
      "title": "Optimizar Ratio LTV/COCA",
      "description": "Tu ratio LTV/COCA es 2.1x, por debajo del mínimo recomendado de 3x",
      "actions": [
        "Revisar canales de marketing más eficientes",
        "Implementar estrategias de retención"
      ]
    }
  ],
  "summary": "Analizadas 2 áreas prioritarias",
  "overall_status": "Necesita atención"
}
```

#### 4. **Optimización de Precios**
```http
POST /api/ai/optimize/pricing
```

**Request**:
```json
{
  "current_pricing": {
    "price_per_unit": 50,
    "pricing_strategy": "competitive"
  },
  "cost_structure": {
    "variable_cost_per_unit": 20,
    "fixed_costs_monthly": 10000
  },
  "market_data": {
    "competitor_prices": [45, 55, 60],
    "customer_willingness_to_pay": 65
  }
}
```

#### 5. **Análisis de Flujo de Caja**
```http
POST /api/ai/analyze/cash-flow
```

**Request**:
```json
{
  "historical_data": [
    {
      "date": "2024-01-01",
      "inflow": 15000,
      "outflow": 12000,
      "balance": 3000,
      "category": "operations"
    }
  ],
  "current_balance": 25000,
  "business_context": {
    "industry": "retail",
    "seasonal_patterns": true
  }
}
```

#### 6. **Análisis de Escenarios**
```http
POST /api/ai/scenario/analysis
```

**Request**:
```json
{
  "base_metrics": {
    "revenue": 100000,
    "expenses": 80000,
    "net_profit": 20000
  },
  "scenarios": [
    {
      "name": "optimistic",
      "revenue_growth": 0.25,
      "cost_increase": 0.15
    },
    {
      "name": "pessimistic", 
      "revenue_growth": -0.10,
      "cost_increase": 0.05
    }
  ]
}
```

#### 7. **Análisis de Razonamiento Complejo**
```http
POST /api/ai/reasoning-analysis
```

**Descripción**: Utiliza DeepSeek R1 para análisis profundo y razonamiento complejo.

**Features**:
- Análisis estratégico detallado
- Identificación de patrones complejos
- Proyecciones financieras avanzadas
- Recomendaciones priorizadas

#### 8. **Test de IA Dual**
```http
POST /api/ai/test-dual-ai
```

**Request**:
```json
{
  "question": "¿Cómo puedo mejorar la rentabilidad?",
  "provider": "openai"  // "openai", "deepseek", o null para auto
}
```

### Endpoints de Utilidad

#### **Benchmarks de Industria**
```http
GET /api/ai/benchmarks/{industry}
```

**Industrias Soportadas**: `retail`, `saas`, `manufacturing`, `services`

#### **Estado de Servicios IA**
```http
GET /api/ai/ai-status
```

#### **Definiciones de KPIs**
```http
GET /api/ai/kpis/definitions
```

---

## 📊 Módulo Dashboard

### Endpoints

#### **Estadísticas del Dashboard**
```http
GET /api/dashboard/stats
```

**Response**:
```json
{
  "stats": [
    {
      "title": "Ingresos del Mes",
      "value": "$125,430",
      "change": "+12%",
      "trend": "up"
    }
  ],
  "revenue_data": [
    {
      "month": "Enero",
      "revenue": 125430,
      "profit": 37780
    }
  ],
  "cash_flow_data": [
    {
      "date": "2024-01-01",
      "inflow": 15000,
      "outflow": 12000
    }
  ]
}
```

---

## 💰 Módulo Flujo de Caja

### Endpoints

#### **Proyecciones de Flujo de Caja**
```http
GET /api/cash-flow/projections
```

#### **Análisis de Flujo de Caja**
```http
GET /api/cash-flow/analysis
```

---

## 🔐 Módulo Autenticación

### Endpoints

#### **Login**
```http
POST /api/auth/login
```

#### **Registro**
```http
POST /api/auth/register
```

#### **Perfil de Usuario**
```http
GET /api/auth/me
```

---

## 📈 Módulos Financieros

### Unit Economics
```http
GET /api/unit-economics/calculate
POST /api/unit-economics/optimize
```

### Costos y Precios
```http
GET /api/costs-pricing/analysis
POST /api/costs-pricing/structure
```

### Rentabilidad
```http
GET /api/profitability/analysis
POST /api/profitability/optimize
```

### Planeación Financiera
```http
GET /api/planning/budgets
POST /api/planning/scenarios
```

### Reportes
```http
GET /api/reports/executive
POST /api/reports/generate
```

---

## 🚀 Configuración y Deployment

### Variables de Entorno Requeridas

```bash
# OpenAI API (para IA)
OPENAI_API_KEY=sk-your-openai-key

# DeepSeek API (para razonamiento complejo)
DEEPSEEK_API_KEY=sk-your-deepseek-key

# Base de datos
DATABASE_URL=postgresql://user:pass@localhost/katalis

# Seguridad
SECRET_KEY=your-secret-key-here
JWT_SECRET=your-jwt-secret

# Configuración de entorno
ENVIRONMENT=development
API_VERSION=v1
```

### Comandos de Desarrollo

```bash
# Instalar dependencias
pip install -r requirements.txt

# Ejecutar servidor de desarrollo
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Ejecutar con Docker
docker-compose up backend

# Ver logs
docker-compose logs -f backend
```

---

## 🛡️ Seguridad y Límites

### Rate Limiting
- **Análisis IA**: 100 requests/hora por usuario
- **Endpoints generales**: 1000 requests/hora
- **Health checks**: Sin límite

### Autenticación
- JWT tokens con expiración de 24 horas
- Refresh tokens para renovación automática
- Middleware de autenticación en rutas protegidas

### Validación
- Pydantic para validación de entrada
- Sanitización de datos de usuario
- Manejo de errores estructurado

---

## 📋 Códigos de Error

### HTTP Status Codes

| Código | Descripción |
|--------|-------------|
| 200 | Éxito |
| 201 | Creado |
| 400 | Solicitud incorrecta |
| 401 | No autorizado |
| 403 | Prohibido |
| 404 | No encontrado |
| 422 | Error de validación |
| 429 | Demasiadas solicitudes |
| 500 | Error interno del servidor |

### Estructura de Errores

```json
{
  "detail": "Descripción del error",
  "error_code": "VALIDATION_ERROR",
  "timestamp": "2024-01-15T10:30:00Z",
  "request_id": "req_12345"
}
```

---

## 🧪 Testing

### Endpoints de Prueba

```bash
# Health check
curl http://localhost:8000/health

# Análisis básico
curl -X POST http://localhost:8000/api/ai/health-score \
  -H "Content-Type: application/json" \
  -d '{"revenue": 100000, "expenses": 80000, ...}'

# Estado de IA
curl http://localhost:8000/api/ai/ai-status
```

### Ejemplos de Uso

```python
import requests

# Cliente Python
class KatalisClient:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.session = requests.Session()
    
    def analyze_business_health(self, metrics, unit_economics, context):
        response = self.session.post(
            f"{self.base_url}/api/ai/analyze/business-health",
            json={
                "financial_metrics": metrics,
                "unit_economics": unit_economics,
                "business_context": context
            }
        )
        return response.json()
```

---

## 📞 Soporte y Recursos

### Documentación Interactiva
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Recursos Adicionales
- **Guías de Integración**: `/guides/integration`
- **Ejemplos de Código**: `/examples`
- **Changelog**: `/CHANGELOG.md`

### Contacto
- **Email**: api-support@katalisapp.com
- **Documentación**: https://docs.katalisapp.com
- **GitHub Issues**: https://github.com/katalisapp/issues

---

**Última actualización**: 2024-01-15
**Versión API**: v1.0.0
**Mantenido por**: Equipo KatalisApp