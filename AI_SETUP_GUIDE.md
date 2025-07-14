# 🤖 Guía de Configuración de IA para KatalisApp

## 📋 Resumen de Agentes Implementados

### 🧠 **Agentes PydanticAI Completos:**

#### 1. **Financial Advisor Agent** (Principal)
```python
# Ubicación: backend/agents/financial_advisor.py
# Modelo: OpenAI GPT-4o-mini
# Funciones:
- Análisis integral de salud financiera
- Evaluación de Unit Economics (LTV/COCA)
- Análisis de flujo de caja y liquidez
- Optimización de estructura de costos
- Evaluación de rentabilidad y ROI
- Estrategias de planeación financiera
```

#### 2. **Pricing Optimizer Agent**
```python
# Especialista en estrategias de precios
- Análisis de costos fijos vs variables
- Pricing basado en valor/competencia/costos
- Optimización de punto de equilibrio
- Estrategias de penetración vs premium
```

#### 3. **Growth Analyzer Agent**
```python
# Analista de crecimiento empresarial
- Métricas de adquisición de clientes (CAC/COCA)
- Análisis de retención y churn
- Expansion revenue y upselling
- Unit economics saludables para escalar
```

#### 4. **Cash Flow Analyzer Agent**
```python
# Ubicación: backend/agents/cash_flow_advisor.py
# Especialista en gestión de flujo de caja
- Proyecciones de entradas y salidas
- Identificación de patrones estacionales
- Cálculo de runway financiero
- Alertas tempranas de liquidez
```

#### 5. **Collections Optimizer Agent**
```python
# Optimizador de cobros y cuentas por cobrar
- Reducción de días promedio de cobro
- Gestión de cartera vencida
- Términos de pago óptimos
- Automatización de procesos de cobranza
```

### 📊 **Funcionalidades de IA Implementadas:**

#### **Score de Salud Financiera (0-100)**
- ✅ **Profitabilidad** (25 pts): Basado en margen neto
- ✅ **Unit Economics** (25 pts): Ratio LTV/COCA
- ✅ **Cash Flow** (25 pts): Margen de flujo de efectivo
- ✅ **Eficiencia de Crecimiento** (25 pts): Margen de contribución

#### **Análisis Inteligente**
- ✅ **Recomendaciones Priorizadas**: Por impacto y urgencia
- ✅ **Análisis Contextual**: Por industria y etapa del negocio
- ✅ **Alertas Tempranas**: Detección de riesgos financieros
- ✅ **Benchmarks**: Comparación con estándares de industria

## 🔑 **Configuración de OpenAI API**

### **Opción 1: Con API Key Real (Recomendado)**

1. **Obtener API Key de OpenAI:**
   ```bash
   # Ve a: https://platform.openai.com/
   # Crea cuenta → API Keys → Create new secret key
   ```

2. **Configurar en el backend:**
   ```bash
   # Editar backend/.env
   OPENAI_API_KEY=sk-tu-clave-real-de-openai-aqui
   ```

3. **Costos estimados:**
   ```
   GPT-4o-mini: ~$0.150 por 1M tokens de entrada
                ~$0.600 por 1M tokens de salida
   
   Uso típico por análisis: ~2,000 tokens
   Costo por análisis: ~$0.002 (2 centavos)
   ```

### **Opción 2: Modo Mock (Para Testing)**

Si no quieres usar OpenAI inicialmente:

```bash
# En backend/.env, deja la clave como placeholder:
OPENAI_API_KEY=sk-test-placeholder-key-replace-with-real-key
```

**El sistema automáticamente detectará esto y usará el Mock AI Service que:**
- ✅ Calcula métricas reales (LTV/COCA, márgenes, etc.)
- ✅ Genera recomendaciones basadas en reglas de negocio
- ✅ Proporciona score de salud financiera preciso
- ✅ **No requiere conexión a internet ni costos**

## 🚀 **Testing de la IA**

### **1. Probar con Mock (Sin API Key)**
```bash
# Asegurar que .env tiene placeholder
echo "OPENAI_API_KEY=sk-test-placeholder-key" >> backend/.env

# Levantar aplicación
docker-compose up -d

# Ir a frontend y probar IA Insights
# Frontend: http://localhost:3000
# Reports → IA Insights tab
```

### **2. Probar con IA Real**
```bash
# Configurar API key real
echo "OPENAI_API_KEY=sk-tu-clave-real" >> backend/.env

# Reiniciar backend
docker-compose restart backend

# La IA real proveerá análisis más detallados y contextuales
```

## 📋 **Endpoints de IA Disponibles**

### **Análisis Principal**
```http
POST /api/ai/analyze/business-health
# Análisis integral con IA
# Input: métricas financieras + unit economics + contexto
# Output: análisis completo + score de salud
```

### **Score Rápido**
```http
GET /api/ai/health-score?revenue=50000&expenses=35000&...
# Cálculo rápido de score de salud
# Input: parámetros URL
# Output: score 0-100 + nivel de salud
```

### **Recomendaciones**
```http
POST /api/ai/recommendations/quick
# Recomendaciones basadas en reglas + IA
# Input: métricas financieras
# Output: recomendaciones priorizadas
```

### **Optimización de Precios**
```http
POST /api/ai/optimize/pricing
# Análisis de estrategias de pricing
# Input: pricing actual + costos + mercado
# Output: recomendaciones de optimización
```

### **Análisis de Flujo de Caja**
```http
POST /api/ai/analyze/cash-flow
# Análisis detallado de cash flow
# Input: datos históricos + balance actual
# Output: proyecciones + alertas + KPIs
```

### **Benchmarks de Industria**
```http
GET /api/ai/benchmarks/{industry}
# Benchmarks por industria
# Input: retail|saas|manufacturing|services
# Output: métricas de referencia
```

## 🎯 **Casos de Uso Implementados**

### **Emprendedor Inicial (Mock IA Ideal)**
```python
# Métricas de ejemplo:
revenue = 10000       # $10k mensuales
expenses = 8000       # $8k gastos
ltv = 500            # LTV de $500
coca = 200           # COCA de $200

# IA detectará:
# - Ratio LTV/COCA de 2.5x (necesita mejora)
# - Margen neto del 20% (excelente)
# - Recomendación: optimizar adquisición de clientes
```

### **PyME Establecida (IA Real Ideal)**
```python
# Métricas complejas que se benefician de análisis contextual
# IA real proveerá insights más sofisticados sobre:
# - Patrones estacionales
# - Optimizaciones específicas por industria
# - Estrategias de crecimiento personalizadas
```

## 🔧 **Troubleshooting**

### **Error: "OpenAI API key not configured"**
```bash
# Verificar configuración
cat backend/.env | grep OPENAI

# Si no existe, agregar:
echo "OPENAI_API_KEY=sk-test-placeholder-key" >> backend/.env
```

### **Error: "Rate limit exceeded"**
```bash
# Usar plan de pago de OpenAI o implementar rate limiting
# El mock AI no tiene límites
```

### **IA no responde o errores**
```bash
# Verificar logs del backend
docker-compose logs backend

# Cambiar temporalmente a mock
sed -i 's/OPENAI_API_KEY=sk-.*/OPENAI_API_KEY=sk-test-placeholder-key/' backend/.env
docker-compose restart backend
```

## 📈 **Roadmap de IA**

### **v1.1 (Próximo)**
- [ ] Análisis predictivo con ML local
- [ ] Integración con datos bancarios para análisis automático
- [ ] Alertas en tiempo real por WhatsApp/Email

### **v1.2 (Futuro)**
- [ ] Agente de Planeación Estratégica
- [ ] Análisis de Competencia con web scraping
- [ ] Recomendaciones de Inversión y Financiamiento

---

**💡 Tip:** Empieza con el Mock AI para familiarizarte con las funcionalidades, luego migra a OpenAI para análisis más sofisticados cuando tu negocio crezca.