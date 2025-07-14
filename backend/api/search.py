"""
Intelligent Search API - Search across financial data and educational content
"""
from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List, Optional
from datetime import datetime
import re
from pydantic import BaseModel

router = APIRouter(prefix="/api/search", tags=["search"])

class SearchResult(BaseModel):
    id: str
    title: str
    description: str
    type: str  # module, concept, data, calculation
    url: str
    score: float
    category: str
    snippet: Optional[str] = None

# Searchable content database
SEARCHABLE_CONTENT = {
    # Financial Modules
    "cash_flow": {
        "title": "Gestión de Flujo de Caja",
        "description": "Administra tu efectivo, proyecciones y liquidez",
        "keywords": ["efectivo", "liquidez", "cobros", "pagos", "flujo", "runway", "maya"],
        "url": "/app/cash-flow",
        "category": "modules",
        "type": "module"
    },
    "unit_economics": {
        "title": "Unit Economics y LTV/COCA",
        "description": "Analiza la rentabilidad por cliente y costo de adquisición",
        "keywords": ["ltv", "coca", "cac", "cliente", "rentabilidad", "carlos", "economia unitaria"],
        "url": "/app/unit-economics", 
        "category": "modules",
        "type": "module"
    },
    "costs_pricing": {
        "title": "Costos y Estrategia de Precios",
        "description": "Optimiza tu estructura de costos y estrategia de precios",
        "keywords": ["costos", "precios", "margen", "punto equilibrio", "fijos", "variables"],
        "url": "/app/costs-pricing",
        "category": "modules", 
        "type": "module"
    },
    "profitability": {
        "title": "Análisis de Rentabilidad",
        "description": "Mide ROI, EBITDA y rentabilidad del negocio",
        "keywords": ["roi", "ebitda", "rentabilidad", "utilidad", "ganancia", "margen"],
        "url": "/app/profitability",
        "category": "modules",
        "type": "module"
    },
    "planning": {
        "title": "Planificación Financiera",
        "description": "Crea presupuestos, escenarios y planes estratégicos",
        "keywords": ["presupuesto", "planeacion", "escenarios", "proyecciones", "estrategia"],
        "url": "/app/planning",
        "category": "modules",
        "type": "module"
    },
    "reports": {
        "title": "Reportes y Dashboard",
        "description": "Visualiza métricas, genera reportes y obtén insights de IA",
        "keywords": ["reportes", "dashboard", "metricas", "kpis", "graficos", "exportar"],
        "url": "/app/reports",
        "category": "modules",
        "type": "module"
    },
    
    # Financial Concepts
    "ltv_concept": {
        "title": "Valor de Vida del Cliente (LTV)",
        "description": "Ingresos totales que genera un cliente durante su relación contigo",
        "keywords": ["ltv", "lifetime value", "valor cliente", "ingresos totales"],
        "url": "/app/unit-economics#ltv",
        "category": "concepts",
        "type": "concept",
        "snippet": "LTV = Precio Promedio × Frecuencia de Compra × Tiempo de Retención"
    },
    "coca_concept": {
        "title": "Costo de Adquisición de Cliente (COCA)",
        "description": "Dinero invertido para conseguir un nuevo cliente",
        "keywords": ["coca", "cac", "adquisicion", "marketing", "costo cliente"],
        "url": "/app/unit-economics#coca",
        "category": "concepts", 
        "type": "concept",
        "snippet": "COCA = Gasto en Marketing / Número de Clientes Nuevos"
    },
    "cash_flow_concept": {
        "title": "Flujo de Efectivo",
        "description": "Dinero que entra y sale de tu negocio en un período",
        "keywords": ["flujo efectivo", "cash flow", "liquidez", "entrada", "salida"],
        "url": "/app/cash-flow#concept",
        "category": "concepts",
        "type": "concept",
        "snippet": "Flujo de Efectivo = Ingresos en Efectivo - Egresos en Efectivo"
    },
    "break_even": {
        "title": "Punto de Equilibrio",
        "description": "Nivel de ventas donde no ganas ni pierdes dinero",
        "keywords": ["punto equilibrio", "break even", "costos fijos", "margen contribucion"],
        "url": "/app/costs-pricing#break-even",
        "category": "concepts",
        "type": "concept",
        "snippet": "Punto de Equilibrio = Costos Fijos / Margen de Contribución por Unidad"
    },
    "roi_concept": {
        "title": "Retorno sobre Inversión (ROI)",
        "description": "Porcentaje de ganancia generada por cada peso invertido",
        "keywords": ["roi", "retorno", "inversion", "rentabilidad", "porcentaje"],
        "url": "/app/profitability#roi",
        "category": "concepts",
        "type": "concept",
        "snippet": "ROI = (Ganancia - Inversión) / Inversión × 100"
    },
    
    # Quick Actions
    "add_transaction": {
        "title": "Agregar Transacción",
        "description": "Registra un ingreso o gasto en tu flujo de caja",
        "keywords": ["agregar", "transaccion", "ingreso", "gasto", "registrar"],
        "url": "/app/cash-flow?action=add",
        "category": "actions",
        "type": "action"
    },
    "calculate_ltv": {
        "title": "Calcular LTV/COCA",
        "description": "Calcula el valor de vida del cliente y costo de adquisición",
        "keywords": ["calcular", "ltv", "coca", "calculadora"],
        "url": "/app/unit-economics?action=calculate",
        "category": "actions", 
        "type": "action"
    },
    "generate_report": {
        "title": "Generar Reporte",
        "description": "Crea un reporte financiero completo de tu negocio",
        "keywords": ["generar", "reporte", "pdf", "excel", "export"],
        "url": "/app/reports?action=generate",
        "category": "actions",
        "type": "action"
    }
}

def calculate_search_score(query: str, content: Dict[str, Any]) -> float:
    """Calculate relevance score for search result"""
    query_lower = query.lower()
    score = 0.0
    
    # Title match (highest weight)
    if query_lower in content["title"].lower():
        score += 100
    
    # Description match
    if query_lower in content["description"].lower():
        score += 50
    
    # Keywords match
    for keyword in content["keywords"]:
        if query_lower in keyword.lower():
            score += 30
        # Partial match
        if any(word in keyword.lower() for word in query_lower.split()):
            score += 15
    
    # Snippet match (if exists)
    if content.get("snippet") and query_lower in content["snippet"].lower():
        score += 25
    
    # Category bonus for modules
    if content["category"] == "modules":
        score += 10
    
    return score

@router.get("/")
async def search(q: str, limit: int = 10):
    """Search across all financial content and features"""
    try:
        if not q or len(q.strip()) < 2:
            return {
                "success": False,
                "message": "Query too short",
                "results": []
            }
        
        query = q.strip()
        results = []
        
        # Search through all content
        for content_id, content in SEARCHABLE_CONTENT.items():
            score = calculate_search_score(query, content)
            
            if score > 0:
                result = SearchResult(
                    id=content_id,
                    title=content["title"],
                    description=content["description"],
                    type=content["type"],
                    url=content["url"],
                    score=score,
                    category=content["category"],
                    snippet=content.get("snippet")
                )
                results.append(result)
        
        # Sort by score
        results.sort(key=lambda x: x.score, reverse=True)
        
        # Limit results
        results = results[:limit]
        
        return {
            "success": True,
            "query": query,
            "results": [r.dict() for r in results],
            "total_found": len(results)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search error: {str(e)}")

@router.get("/suggestions")
async def get_search_suggestions(q: str = ""):
    """Get search suggestions based on partial query"""
    try:
        if not q or len(q.strip()) < 1:
            # Return popular searches when no query
            return {
                "suggestions": [
                    "flujo de caja",
                    "ltv coca",
                    "punto de equilibrio", 
                    "roi",
                    "costos fijos",
                    "margen de ganancia",
                    "presupuesto",
                    "reportes"
                ]
            }
        
        query = q.strip().lower()
        suggestions = []
        
        # Find matching keywords and titles
        for content in SEARCHABLE_CONTENT.values():
            # Check title
            if query in content["title"].lower():
                suggestions.append(content["title"])
            
            # Check keywords
            for keyword in content["keywords"]:
                if query in keyword.lower() and keyword not in suggestions:
                    suggestions.append(keyword)
        
        # Remove duplicates and limit
        unique_suggestions = list(dict.fromkeys(suggestions))[:8]
        
        return {
            "suggestions": unique_suggestions
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Suggestions error: {str(e)}")

@router.get("/categories")
async def get_search_categories():
    """Get available search categories"""
    try:
        categories = {}
        
        for content in SEARCHABLE_CONTENT.values():
            category = content["category"]
            if category not in categories:
                categories[category] = {
                    "name": category.title(),
                    "count": 0,
                    "description": ""
                }
            categories[category]["count"] += 1
        
        # Add descriptions
        categories["modules"]["description"] = "Herramientas financieras principales"
        categories["concepts"]["description"] = "Conceptos y definiciones"
        categories["actions"]["description"] = "Acciones rápidas"
        
        return {
            "categories": categories
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Categories error: {str(e)}")

@router.get("/quick-help")
async def get_quick_help():
    """Get quick help and common searches"""
    try:
        help_items = [
            {
                "question": "¿Cómo calculo mi flujo de caja?",
                "answer": "Ve a Flujo de Caja y agrega tus ingresos y gastos mensuales",
                "url": "/app/cash-flow"
            },
            {
                "question": "¿Qué es LTV y COCA?",
                "answer": "LTV es el valor de vida del cliente, COCA es el costo de adquisición",
                "url": "/app/unit-economics"
            },
            {
                "question": "¿Cómo mejorar mi rentabilidad?",
                "answer": "Analiza tus costos y precios en la sección de Rentabilidad",
                "url": "/app/profitability"
            },
            {
                "question": "¿Cómo generar un reporte?",
                "answer": "Ve a Reportes y selecciona el tipo de reporte que necesitas",
                "url": "/app/reports"
            }
        ]
        
        return {
            "help_items": help_items,
            "contact": {
                "documentation": "/docs",
                "support": "mailto:support@katalis.com"
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quick help error: {str(e)}")