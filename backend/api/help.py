"""
API de ayuda y documentación para KatalisApp
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from typing import Optional, Dict, List, Any
from datetime import datetime
import json

from api.auth import get_current_user

router = APIRouter(prefix="/help", tags=["Help & Documentation"])

# Base de datos en memoria para contenido de ayuda
help_content_db = {}
user_help_progress_db = {}
faq_db = {}

class HelpSection(BaseModel):
    """Sección de ayuda"""
    id: str
    title: str
    description: str
    content: str
    category: str
    difficulty: str = "beginner"  # beginner, intermediate, advanced
    estimated_time_minutes: int = 5
    prerequisites: List[str] = []
    related_sections: List[str] = []
    tags: List[str] = []
    video_url: Optional[str] = None
    images: List[str] = []
    last_updated: str
    views: int = 0

class FAQ(BaseModel):
    """Pregunta frecuente"""
    id: str
    question: str
    answer: str
    category: str
    tags: List[str] = []
    helpful_votes: int = 0
    not_helpful_votes: int = 0
    created_at: str
    updated_at: str

class UserProgress(BaseModel):
    """Progreso del usuario en la documentación"""
    user_id: int
    completed_sections: List[str] = []
    bookmarked_sections: List[str] = []
    time_spent_minutes: int = 0
    last_accessed: str

class HelpFeedback(BaseModel):
    """Feedback sobre contenido de ayuda"""
    section_id: str
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None
    is_helpful: bool

@router.get("/sections")
async def get_help_sections(
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(50, le=100)
):
    """Obtener secciones de ayuda con filtros opcionales"""
    
    sections = list(help_content_db.values())
    
    # Filtrar por categoría
    if category:
        sections = [s for s in sections if s["category"].lower() == category.lower()]
    
    # Filtrar por dificultad
    if difficulty:
        sections = [s for s in sections if s["difficulty"].lower() == difficulty.lower()]
    
    # Búsqueda en título y contenido
    if search:
        search_lower = search.lower()
        sections = [
            s for s in sections 
            if search_lower in s["title"].lower() or 
               search_lower in s["content"].lower() or
               any(search_lower in tag.lower() for tag in s["tags"])
        ]
    
    # Ordenar por views (más populares primero)
    sections.sort(key=lambda x: x["views"], reverse=True)
    
    return {
        "sections": sections[:limit],
        "total": len(sections),
        "filters_applied": {
            "category": category,
            "difficulty": difficulty,
            "search": search
        }
    }

@router.get("/sections/{section_id}")
async def get_help_section(
    section_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Obtener una sección específica de ayuda"""
    
    if section_id not in help_content_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sección de ayuda no encontrada"
        )
    
    section = help_content_db[section_id]
    
    # Incrementar contador de vistas
    section["views"] += 1
    
    # Registrar que el usuario accedió a esta sección
    user_id = current_user["id"]
    if user_id not in user_help_progress_db:
        user_help_progress_db[user_id] = {
            "user_id": user_id,
            "completed_sections": [],
            "bookmarked_sections": [],
            "time_spent_minutes": 0,
            "last_accessed": datetime.utcnow().isoformat()
        }
    
    user_help_progress_db[user_id]["last_accessed"] = datetime.utcnow().isoformat()
    
    return section

@router.post("/sections/{section_id}/complete")
async def mark_section_complete(
    section_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Marcar una sección como completada"""
    
    if section_id not in help_content_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sección de ayuda no encontrada"
        )
    
    user_id = current_user["id"]
    if user_id not in user_help_progress_db:
        user_help_progress_db[user_id] = {
            "user_id": user_id,
            "completed_sections": [],
            "bookmarked_sections": [],
            "time_spent_minutes": 0,
            "last_accessed": datetime.utcnow().isoformat()
        }
    
    if section_id not in user_help_progress_db[user_id]["completed_sections"]:
        user_help_progress_db[user_id]["completed_sections"].append(section_id)
        user_help_progress_db[user_id]["time_spent_minutes"] += help_content_db[section_id]["estimated_time_minutes"]
    
    return {
        "message": "Sección marcada como completada",
        "section_id": section_id,
        "total_completed": len(user_help_progress_db[user_id]["completed_sections"])
    }

@router.post("/sections/{section_id}/bookmark")
async def toggle_bookmark_section(
    section_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Agregar o quitar bookmark de una sección"""
    
    if section_id not in help_content_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sección de ayuda no encontrada"
        )
    
    user_id = current_user["id"]
    if user_id not in user_help_progress_db:
        user_help_progress_db[user_id] = {
            "user_id": user_id,
            "completed_sections": [],
            "bookmarked_sections": [],
            "time_spent_minutes": 0,
            "last_accessed": datetime.utcnow().isoformat()
        }
    
    bookmarks = user_help_progress_db[user_id]["bookmarked_sections"]
    
    if section_id in bookmarks:
        bookmarks.remove(section_id)
        action = "removed"
    else:
        bookmarks.append(section_id)
        action = "added"
    
    return {
        "message": f"Bookmark {action}",
        "section_id": section_id,
        "is_bookmarked": section_id in bookmarks,
        "total_bookmarks": len(bookmarks)
    }

@router.get("/progress")
async def get_user_progress(current_user: dict = Depends(get_current_user)):
    """Obtener progreso del usuario en la documentación"""
    
    user_id = current_user["id"]
    
    if user_id not in user_help_progress_db:
        return {
            "user_id": user_id,
            "completed_sections": [],
            "bookmarked_sections": [],
            "time_spent_minutes": 0,
            "completion_percentage": 0,
            "total_sections": len(help_content_db)
        }
    
    progress = user_help_progress_db[user_id]
    total_sections = len(help_content_db)
    completion_percentage = (len(progress["completed_sections"]) / total_sections * 100) if total_sections > 0 else 0
    
    return {
        **progress,
        "completion_percentage": round(completion_percentage, 1),
        "total_sections": total_sections
    }

@router.get("/categories")
async def get_help_categories():
    """Obtener categorías disponibles de ayuda"""
    
    categories = {}
    for section in help_content_db.values():
        category = section["category"]
        if category not in categories:
            categories[category] = {
                "name": category,
                "count": 0,
                "description": get_category_description(category)
            }
        categories[category]["count"] += 1
    
    return {"categories": list(categories.values())}

@router.get("/faq")
async def get_faq(
    category: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(20, le=50)
):
    """Obtener preguntas frecuentes"""
    
    faqs = list(faq_db.values())
    
    # Filtrar por categoría
    if category:
        faqs = [f for f in faqs if f["category"].lower() == category.lower()]
    
    # Búsqueda en pregunta y respuesta
    if search:
        search_lower = search.lower()
        faqs = [
            f for f in faqs 
            if search_lower in f["question"].lower() or 
               search_lower in f["answer"].lower()
        ]
    
    # Ordenar por votos útiles
    faqs.sort(key=lambda x: x["helpful_votes"] - x["not_helpful_votes"], reverse=True)
    
    return {
        "faqs": faqs[:limit],
        "total": len(faqs)
    }

@router.post("/sections/{section_id}/feedback")
async def submit_help_feedback(
    section_id: str,
    feedback: HelpFeedback,
    current_user: dict = Depends(get_current_user)
):
    """Enviar feedback sobre una sección de ayuda"""
    
    if section_id not in help_content_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sección de ayuda no encontrada"
        )
    
    # En una implementación real, esto se guardaría en la base de datos
    feedback_data = {
        "user_id": current_user["id"],
        "section_id": section_id,
        "rating": feedback.rating,
        "comment": feedback.comment,
        "is_helpful": feedback.is_helpful,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    return {
        "message": "Feedback enviado exitosamente",
        "feedback": feedback_data
    }

@router.get("/search")
async def search_help_content(
    q: str = Query(..., min_length=2),
    category: Optional[str] = None,
    limit: int = Query(20, le=50)
):
    """Búsqueda avanzada en contenido de ayuda"""
    
    results = []
    search_lower = q.lower()
    
    # Buscar en secciones de ayuda
    for section in help_content_db.values():
        score = 0
        
        # Puntuación por título
        if search_lower in section["title"].lower():
            score += 10
        
        # Puntuación por contenido
        if search_lower in section["content"].lower():
            score += 5
        
        # Puntuación por tags
        for tag in section["tags"]:
            if search_lower in tag.lower():
                score += 3
        
        if score > 0:
            results.append({
                "type": "section",
                "id": section["id"],
                "title": section["title"],
                "description": section["description"],
                "category": section["category"],
                "score": score,
                "url": f"/help/sections/{section['id']}"
            })
    
    # Buscar en FAQs
    for faq in faq_db.values():
        score = 0
        
        if search_lower in faq["question"].lower():
            score += 8
        
        if search_lower in faq["answer"].lower():
            score += 4
        
        if score > 0:
            results.append({
                "type": "faq",
                "id": faq["id"],
                "title": faq["question"],
                "description": faq["answer"][:200] + "...",
                "category": faq["category"],
                "score": score,
                "url": f"/help/faq#{faq['id']}"
            })
    
    # Filtrar por categoría si se especifica
    if category:
        results = [r for r in results if r["category"].lower() == category.lower()]
    
    # Ordenar por puntuación
    results.sort(key=lambda x: x["score"], reverse=True)
    
    return {
        "query": q,
        "results": results[:limit],
        "total": len(results)
    }

def get_category_description(category: str) -> str:
    """Obtener descripción de categoría"""
    descriptions = {
        "getting_started": "Primeros pasos y configuración inicial",
        "financial_modules": "Uso de módulos financieros",
        "ai_insights": "Análisis con inteligencia artificial",
        "reports": "Generación y análisis de reportes",
        "configuration": "Configuración y personalización",
        "integrations": "Integraciones con terceros",
        "troubleshooting": "Solución de problemas",
        "advanced": "Características avanzadas"
    }
    return descriptions.get(category, "Documentación general")

def initialize_help_content():
    """Inicializar contenido de ayuda por defecto"""
    
    if not help_content_db:
        # Secciones de Getting Started
        help_content_db["getting_started_overview"] = {
            "id": "getting_started_overview",
            "title": "Introducción a KatalisApp",
            "description": "Visión general de KatalisApp y sus principales características",
            "content": """
# Bienvenido a KatalisApp

KatalisApp es una plataforma integral de gestión financiera diseñada específicamente para PyMEs y emprendedores. Basada en los conceptos del libro "Finanzas para Emprendedores", la aplicación transforma teoría financiera compleja en herramientas prácticas e intuitivas.

## ¿Qué puedes hacer con KatalisApp?

### 📊 Análisis Financiero Inteligente
- Evaluación automática de la salud financiera de tu negocio
- Score de salud financiera de 0-100 puntos
- Recomendaciones personalizadas con IA

### 💰 Módulos Financieros Especializados
- **Unit Economics**: Análisis LTV/COCA y margen de contribución
- **Flujo de Caja**: Proyecciones y análisis de liquidez
- **Costos y Precios**: Optimización de estructura de costos
- **Rentabilidad**: Análisis ROI y centros de ganancia
- **Planeación**: Presupuestos y escenarios futuros

### 🤖 Inteligencia Artificial
- 5 agentes especializados en diferentes áreas financieras
- Análisis contextual por industria y etapa del negocio
- Alertas tempranas de riesgos financieros

## Primeros Pasos

1. **Configura tu perfil**: Ingresa información básica de tu empresa
2. **Explora los módulos**: Comienza con Unit Economics para entender tu modelo de negocio
3. **Revisa los reportes**: Ve a la sección de Reportes para obtener insights con IA
4. **Personaliza la configuración**: Ajusta preferencias en Configuración

¡Comienza transformando la gestión financiera de tu negocio!
            """,
            "category": "getting_started",
            "difficulty": "beginner",
            "estimated_time_minutes": 10,
            "prerequisites": [],
            "related_sections": ["profile_setup", "first_analysis"],
            "tags": ["introducción", "overview", "primeros pasos"],
            "video_url": None,
            "images": [],
            "last_updated": datetime.utcnow().isoformat(),
            "views": 0
        }
        
        help_content_db["profile_setup"] = {
            "id": "profile_setup",
            "title": "Configuración de Perfil de Empresa",
            "description": "Cómo configurar correctamente el perfil de tu empresa",
            "content": """
# Configuración de Perfil de Empresa

El perfil de tu empresa es fundamental para obtener análisis precisos y recomendaciones relevantes.

## Información Básica Requerida

### 📋 Datos de la Empresa
- **Nombre de la empresa**: Tu razón social o nombre comercial
- **Industria**: Selecciona la industria que mejor describe tu negocio
- **Etapa del negocio**: Startup, Crecimiento, o Maduro
- **Número de empleados**: Incluye empleados de tiempo completo y parcial

### 💰 Información Financiera
- **Ingresos mensuales promedio**: Datos de los últimos 6 meses
- **País de operación**: Para ajustar moneda y contexto económico

## ¿Por qué es importante?

La IA de KatalisApp utiliza esta información para:
- Proporcionar benchmarks específicos de tu industria
- Ajustar recomendaciones según la etapa de tu negocio
- Calcular métricas relevantes para tu tamaño de empresa
- Generar alertas contextualizadas

## Consejos para Datos Precisos

✅ **Sé preciso con los ingresos**: Usa datos reales de los últimos 6 meses
✅ **Actualiza regularmente**: Revisa tu perfil cada trimestre
✅ **Industria específica**: Elige la categoría más específica posible
✅ **Empleados actuales**: Cuenta solo empleados activos

La precisión de tu perfil impacta directamente la calidad de los análisis de IA.
            """,
            "category": "getting_started",
            "difficulty": "beginner",
            "estimated_time_minutes": 5,
            "prerequisites": ["getting_started_overview"],
            "related_sections": ["configuration_basics", "first_analysis"],
            "tags": ["perfil", "configuración", "empresa", "setup"],
            "video_url": None,
            "images": [],
            "last_updated": datetime.utcnow().isoformat(),
            "views": 0
        }
        
        # Sección de Unit Economics
        help_content_db["unit_economics_guide"] = {
            "id": "unit_economics_guide",
            "title": "Guía Completa de Unit Economics",
            "description": "Aprende a calcular y optimizar las métricas fundamentales de tu negocio",
            "content": """
# Unit Economics: La Base de tu Modelo de Negocio

Unit Economics son las métricas que determinan si tu modelo de negocio es viable y escalable.

## Métricas Clave

### 💰 LTV (Lifetime Value)
El valor total que genera un cliente durante toda su relación con tu empresa.

**Cómo calcularlo:**
```
LTV = Ingreso promedio por compra × Frecuencia de compra × Duración de la relación
```

### 📈 COCA (Costo de Adquisición de Cliente)
Cuánto gastas para adquirir un nuevo cliente.

**Cómo calcularlo:**
```
COCA = Gastos de marketing y ventas / Número de clientes nuevos
```

### 📊 Ratio LTV/COCA
La métrica más importante para evaluar viabilidad.

- **Ratio < 1**: Pierdes dinero en cada cliente
- **Ratio 1-3**: Marginal, difícil de escalar
- **Ratio > 3**: Modelo saludable y escalable
- **Ratio > 5**: Excelente, gran potencial de crecimiento

## Usando el Módulo Unit Economics

### 1. Ingresa tus datos
- Precio promedio por venta
- Costo variable por unidad
- Gastos de marketing mensuales
- Clientes nuevos por mes
- Frecuencia de compra
- Tiempo promedio de retención

### 2. Analiza los resultados
KatalisApp calcula automáticamente:
- LTV real de tus clientes
- COCA actual
- Ratio LTV/COCA
- Margen de contribución
- Punto de equilibrio

### 3. Optimiza tu modelo
La IA te sugerirá acciones específicas para:
- Aumentar el LTV
- Reducir el COCA
- Mejorar la retención
- Optimizar precios

## Alertas Importantes

🚨 **Ratio LTV/COCA < 2**: Tu modelo necesita optimización urgente
⚠️ **COCA en aumento**: Revisa la eficiencia de marketing
✅ **LTV creciente**: Enfócate en retener y expandir clientes existentes

La optimización continua de Unit Economics es clave para el crecimiento sostenible.
            """,
            "category": "financial_modules",
            "difficulty": "intermediate",
            "estimated_time_minutes": 15,
            "prerequisites": ["profile_setup"],
            "related_sections": ["pricing_optimization", "customer_retention"],
            "tags": ["unit economics", "ltv", "coca", "métricas", "modelo de negocio"],
            "video_url": None,
            "images": [],
            "last_updated": datetime.utcnow().isoformat(),
            "views": 0
        }
        
        # Agregar FAQs
        faq_db["login_issues"] = {
            "id": "login_issues",
            "question": "No puedo iniciar sesión, ¿qué hago?",
            "answer": "Si tienes problemas para iniciar sesión: 1) Verifica que tu email sea correcto, 2) Usa la opción 'Olvidé mi contraseña' si no recuerdas tu contraseña, 3) Asegúrate de que tu cuenta esté verificada, 4) Contacta soporte si el problema persiste.",
            "category": "account",
            "tags": ["login", "contraseña", "acceso"],
            "helpful_votes": 15,
            "not_helpful_votes": 2,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        faq_db["ai_not_working"] = {
            "id": "ai_not_working",
            "question": "¿Por qué no funciona el análisis de IA?",
            "answer": "El análisis de IA requiere que tengas datos suficientes en tu perfil. Asegúrate de haber completado: 1) Información básica de la empresa, 2) Datos financieros mensuales, 3) Al menos un módulo con datos ingresados. Si cumples estos requisitos y persiste el problema, contacta soporte técnico.",
            "category": "ai_insights",
            "tags": ["ia", "análisis", "datos", "error"],
            "helpful_votes": 22,
            "not_helpful_votes": 1,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        faq_db["data_security"] = {
            "id": "data_security",
            "question": "¿Qué tan seguros están mis datos financieros?",
            "answer": "KatalisApp utiliza encriptación de grado bancario (AES-256) para proteger tus datos. Toda la información se almacena en servidores seguros con acceso restringido. No compartimos ni vendemos tus datos financieros. Además, puedes exportar o eliminar tus datos en cualquier momento desde la configuración.",
            "category": "security",
            "tags": ["seguridad", "datos", "privacidad", "encriptación"],
            "helpful_votes": 31,
            "not_helpful_votes": 0,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }

# Inicializar contenido al cargar el módulo
initialize_help_content()