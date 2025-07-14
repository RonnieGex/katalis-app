"""
Mock AI Service para testing sin OpenAI API
"""

from typing import Dict, List
from datetime import datetime
import random

class MockFinancialAdvisor:
    """Mock service que simula respuestas de IA para testing"""
    
    def analyze_business_health(self, metrics, unit_economics, context):
        """Simula análisis de salud del negocio"""
        
        # Calcular algunas métricas reales
        ltv_coca_ratio = metrics.ltv / metrics.coca if metrics.coca > 0 else 0
        net_margin = (metrics.net_profit / metrics.revenue * 100) if metrics.revenue > 0 else 0
        
        # Generar respuesta mock basada en métricas reales
        if ltv_coca_ratio >= 3 and net_margin >= 10:
            health = "Excelente"
            strengths = [
                f"Ratio LTV/COCA saludable de {ltv_coca_ratio:.1f}x",
                f"Margen neto sólido del {net_margin:.1f}%",
                "Modelo de negocio escalable y rentable"
            ]
            concerns = []
            opportunities = [
                "Considerar expansión a nuevos mercados",
                "Optimizar procesos para mayor eficiencia",
                "Invertir en crecimiento acelerado"
            ]
        elif ltv_coca_ratio >= 2 or net_margin >= 5:
            health = "Bueno"
            strengths = [
                "Fundamentos financieros estables",
                "Tendencia de crecimiento positiva"
            ]
            concerns = [
                "Margen neto por debajo del óptimo" if net_margin < 10 else "",
                "Ratio LTV/COCA necesita mejoras" if ltv_coca_ratio < 3 else ""
            ]
            concerns = [c for c in concerns if c]  # Remove empty
            opportunities = [
                "Optimizar estructura de costos",
                "Mejorar eficiencia en adquisición de clientes",
                "Implementar estrategias de retención"
            ]
        else:
            health = "Crítico"
            strengths = [
                "Potencial de mejora significativo identificado"
            ]
            concerns = [
                f"Ratio LTV/COCA crítico de {ltv_coca_ratio:.1f}x",
                f"Margen neto bajo del {net_margin:.1f}%",
                "Requiere atención inmediata en unit economics"
            ]
            opportunities = [
                "Reestructurar costos de adquisición",
                "Revisar modelo de pricing",
                "Optimizar operaciones para reducir costos"
            ]
        
        # Generar recomendaciones específicas
        recommendations = []
        
        if ltv_coca_ratio < 3:
            recommendations.append({
                "category": "unit_economics",
                "priority": "Alta",
                "title": "Optimizar Ratio LTV/COCA",
                "description": f"Tu ratio actual de {ltv_coca_ratio:.1f}x está por debajo del mínimo recomendado de 3x",
                "potential_impact": "Mejora en sostenibilidad del modelo de negocio",
                "implementation_steps": [
                    "Analizar y reducir costos de marketing",
                    "Implementar estrategias de retención de clientes",
                    "Optimizar canales de adquisición más eficientes"
                ],
                "estimated_time": "2-3 meses",
                "risk_level": "Medio"
            })
        
        if net_margin < 10:
            recommendations.append({
                "category": "profitability",
                "priority": "Alta",
                "title": "Mejorar Margen Neto",
                "description": f"Margen neto actual del {net_margin:.1f}% por debajo del 10% recomendado",
                "potential_impact": "Incremento directo en rentabilidad",
                "implementation_steps": [
                    "Revisar y optimizar estructura de costos",
                    "Evaluar oportunidades de aumento de precios",
                    "Eliminar gastos innecesarios"
                ],
                "estimated_time": "1-2 meses",
                "risk_level": "Bajo"
            })
        
        if metrics.cash_flow < 0:
            recommendations.append({
                "category": "cash_flow",
                "priority": "Crítica",
                "title": "Resolver Flujo de Caja Negativo",
                "description": "Flujo de caja negativo representa riesgo inmediato",
                "potential_impact": "Supervivencia del negocio",
                "implementation_steps": [
                    "Acelerar cobros pendientes",
                    "Negociar términos de pago con proveedores",
                    "Reducir gastos no esenciales temporalmente"
                ],
                "estimated_time": "Inmediato",
                "risk_level": "Alto"
            })
        
        return {
            "overall_health": health,
            "key_strengths": strengths,
            "areas_of_concern": concerns,
            "growth_opportunities": opportunities,
            "financial_recommendations": recommendations
        }
    
    def calculate_health_score(self, metrics, unit_economics):
        """Calcula score de salud financiera"""
        
        scores = {}
        
        # 1. Profitability Score (0-25 puntos)
        net_margin = (metrics.net_profit / metrics.revenue * 100) if metrics.revenue > 0 else 0
        if net_margin >= 20:
            scores["profitability"] = 25
        elif net_margin >= 15:
            scores["profitability"] = 20
        elif net_margin >= 10:
            scores["profitability"] = 15
        elif net_margin >= 5:
            scores["profitability"] = 10
        else:
            scores["profitability"] = max(0, 5 + net_margin)
        
        # 2. Unit Economics Score (0-25 puntos)
        ltv_coca_ratio = (metrics.ltv / metrics.coca) if metrics.coca > 0 else 0
        if ltv_coca_ratio >= 5:
            scores["unit_economics"] = 25
        elif ltv_coca_ratio >= 3:
            scores["unit_economics"] = 20
        elif ltv_coca_ratio >= 2:
            scores["unit_economics"] = 15
        elif ltv_coca_ratio >= 1:
            scores["unit_economics"] = 10
        else:
            scores["unit_economics"] = 0
        
        # 3. Cash Flow Score (0-25 puntos)
        cash_flow_margin = (metrics.cash_flow / metrics.revenue * 100) if metrics.revenue > 0 else 0
        if cash_flow_margin >= 15:
            scores["cash_flow"] = 25
        elif cash_flow_margin >= 10:
            scores["cash_flow"] = 20
        elif cash_flow_margin >= 5:
            scores["cash_flow"] = 15
        elif cash_flow_margin >= 0:
            scores["cash_flow"] = 10
        else:
            scores["cash_flow"] = max(0, 10 + cash_flow_margin * 2)
        
        # 4. Growth Efficiency Score (0-25 puntos)
        contribution_margin = unit_economics.price_per_unit - unit_economics.variable_cost_per_unit
        contribution_margin_pct = (contribution_margin / unit_economics.price_per_unit * 100) if unit_economics.price_per_unit > 0 else 0
        
        if contribution_margin_pct >= 60:
            scores["growth_efficiency"] = 25
        elif contribution_margin_pct >= 40:
            scores["growth_efficiency"] = 20
        elif contribution_margin_pct >= 30:
            scores["growth_efficiency"] = 15
        elif contribution_margin_pct >= 20:
            scores["growth_efficiency"] = 10
        else:
            scores["growth_efficiency"] = max(0, contribution_margin_pct / 4)
        
        # Score total
        total_score = sum(scores.values())
        
        # Determinar nivel de salud
        if total_score >= 80:
            health_level = "Excelente"
        elif total_score >= 60:
            health_level = "Bueno"
        elif total_score >= 40:
            health_level = "Regular"
        else:
            health_level = "Crítico"
        
        return {
            "total_score": total_score,
            "health_level": health_level,
            "component_scores": scores,
            "recommendations_priority": "Alta" if total_score < 60 else "Media" if total_score < 80 else "Mantenimiento"
        }
    
    def get_quick_recommendations(self, metrics, unit_economics, context):
        """Genera recomendaciones rápidas"""
        
        ltv_coca_ratio = metrics.ltv / metrics.coca if metrics.coca > 0 else 0
        net_margin = (metrics.net_profit / metrics.revenue * 100) if metrics.revenue > 0 else 0
        contribution_margin = unit_economics.price_per_unit - unit_economics.variable_cost_per_unit
        contribution_margin_pct = (contribution_margin / unit_economics.price_per_unit * 100) if unit_economics.price_per_unit > 0 else 0
        
        recommendations = []
        
        # Recomendaciones basadas en ratios
        if ltv_coca_ratio < 3:
            recommendations.append({
                "category": "unit_economics",
                "priority": "Alta",
                "title": "Optimizar Ratio LTV/COCA",
                "description": f"Tu ratio LTV/COCA es {ltv_coca_ratio:.1f}x, por debajo del mínimo recomendado de 3x. Considera reducir costos de adquisición o aumentar el valor del cliente.",
                "actions": [
                    "Revisar canales de marketing más eficientes",
                    "Implementar estrategias de retención",
                    "Optimizar el precio o reducir costos variables"
                ]
            })
        
        if net_margin < 10:
            recommendations.append({
                "category": "profitability",
                "priority": "Alta",
                "title": "Mejorar Margen Neto",
                "description": f"Tu margen neto de {net_margin:.1f}% está por debajo del 10% recomendado. Es crucial mejorar la rentabilidad.",
                "actions": [
                    "Revisar estructura de costos",
                    "Optimizar precios",
                    "Eliminar gastos innecesarios"
                ]
            })
        
        if contribution_margin_pct < 30:
            recommendations.append({
                "category": "pricing",
                "priority": "Media",
                "title": "Aumentar Margen de Contribución",
                "description": f"Tu margen de contribución de {contribution_margin_pct:.1f}% podría mejorarse para tener más flexibilidad financiera.",
                "actions": [
                    "Analizar posibilidad de aumento de precios",
                    "Optimizar costos variables",
                    "Añadir servicios de mayor valor"
                ]
            })
        
        if metrics.cash_flow < 0:
            recommendations.append({
                "category": "cash_flow",
                "priority": "Crítica",
                "title": "Resolver Flujo de Caja Negativo",
                "description": "Tu flujo de caja es negativo, lo que representa un riesgo inmediato para la operación.",
                "actions": [
                    "Acelerar cobros a clientes",
                    "Negociar términos de pago con proveedores",
                    "Reducir gastos no esenciales",
                    "Considerar línea de crédito de emergencia"
                ]
            })
        
        # Si todo está bien
        if not recommendations and ltv_coca_ratio >= 3 and net_margin >= 15:
            recommendations.append({
                "category": "growth",
                "priority": "Media",
                "title": "Acelerar Crecimiento",
                "description": "Tus métricas financieras son saludables. Es momento de considerar estrategias de crecimiento.",
                "actions": [
                    "Invertir más en marketing con ROI comprobado",
                    "Expandir a nuevos mercados o segmentos",
                    "Desarrollar nuevos productos/servicios",
                    "Optimizar operaciones para escalar"
                ]
            })
        
        overall_status = "Crítico" if any(r["priority"] == "Crítica" for r in recommendations) else \
                        "Necesita atención" if any(r["priority"] == "Alta" for r in recommendations) else \
                        "Saludable"
        
        return {
            "recommendations": recommendations,
            "summary": f"Analizadas {len(recommendations)} áreas prioritarias",
            "overall_status": overall_status,
            "generated_at": datetime.now().isoformat()
        }

# Instancia global del mock service
mock_financial_advisor = MockFinancialAdvisor()