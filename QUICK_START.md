# 🚀 KatalisApp - Inicio Rápido

## ✅ API Key Configurada

Tu API key de OpenAI ya está configurada en el sistema:
```
OPENAI_API_KEY=your_openai_api_key_here
```

## 🎯 Pasos para Probar KatalisApp

### 1. Levantar la aplicación
```bash
cd /home/ronniegex/katalis-app
docker-compose up -d
```

### 2. Verificar que los servicios estén ejecutándose
```bash
docker-compose ps
```

Deberías ver:
- ✅ frontend corriendo en puerto 3000
- ✅ backend corriendo en puerto 8000  
- ✅ postgres disponible
- ✅ redis disponible

### 3. Acceder a la aplicación

**Frontend Principal:**
- 🌐 http://localhost:3000

**API y Documentación:**
- 📖 http://localhost:8000/docs (Swagger UI)
- 🔍 http://localhost:8000/redoc (ReDoc)
- ❤️ http://localhost:8000/health (Health check)

### 4. Probar IA Insights

1. **Ve al frontend:** http://localhost:3000
2. **Navega a:** Reports → **IA Insights** tab
3. **Observa:**
   - 📊 Score de Salud Financiera (0-100)
   - 🤖 Análisis automático con IA real
   - 💡 Recomendaciones personalizadas
   - 📈 Benchmarks por industria

### 5. Explorar módulos financieros

**Módulos implementados:**
- 📈 **Unit Economics** - LTV/COCA, margen de contribución
- 💰 **Flujo de Caja** - Proyecciones y análisis de liquidez
- 💲 **Costos y Precios** - Estructura de costos y pricing
- 📊 **Rentabilidad** - ROI, EBITDA, análisis de rentabilidad
- 📋 **Planeación** - Presupuestos y escenarios
- 📑 **Reportes** - Dashboard ejecutivo + IA Insights

## 🤖 Características de IA que verás

### **Score de Salud Financiera**
```
🎯 Score: XX/100 (Excelente/Bueno/Regular/Crítico)

Componentes:
• Profitabilidad: XX/25 pts
• Unit Economics: XX/25 pts  
• Cash Flow: XX/25 pts
• Eficiencia Crecimiento: XX/25 pts
```

### **Recomendaciones Inteligentes**
- 🔴 **Críticas:** Flujo de caja negativo, ratios peligrosos
- 🟡 **Altas:** LTV/COCA bajo, margen neto insuficiente
- 🟢 **Medias:** Optimizaciones de crecimiento

### **Análisis Contextual**
- 🏭 **Por industria:** Benchmarks específicos
- 📈 **Por etapa:** Startup vs Growth vs Mature
- 👥 **Por tamaño:** Métricas ajustadas al contexto

## 🛠 Troubleshooting

### Si no funcionan los contenedores:
```bash
# Ver logs
docker-compose logs

# Reiniciar servicios
docker-compose restart

# Rebuild si hay cambios
docker-compose up --build -d
```

### Si la IA no responde:
```bash
# Verificar logs del backend
docker-compose logs backend

# Buscar líneas como:
# "⚠️ Usando Mock AI Service" (sin API key)
# "✅ OpenAI API configurada" (con API key real)
```

### Si hay errores de API:
```bash
# Verificar que la API key sea válida
curl -H "Authorization: Bearer sk-proj-0PBOZD5yjdtEnQ08cjE_..." \
     https://api.openai.com/v1/models
```

## 💰 Costos de la API

**Con tu API key configurada:**
- 💲 **Costo por análisis:** ~$0.002 (2 centavos)
- 📊 **Análisis mensual típico:** ~$1-5 USD
- 🎯 **Muy económico** para el valor que aporta

## 🎉 ¡Listo para usar!

Tu KatalisApp está completamente configurada con:
- ✅ **7 módulos financieros** interactivos
- ✅ **5 agentes de IA** especializados  
- ✅ **API key real** de OpenAI configurada
- ✅ **Score de salud** automático
- ✅ **Recomendaciones** personalizadas
- ✅ **Dashboard ejecutivo** completo

**🚀 Disfruta transformando tu gestión financiera con IA!**