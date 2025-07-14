#!/usr/bin/env python3
"""
Script para probar la integración de IA de KatalisApp
"""

import os
import sys
import json
import asyncio
from datetime import datetime

# Agregar el path del backend
sys.path.append('backend')

# Configurar la variable de entorno
os.environ['OPENAI_API_KEY'] = 'your_openai_api_key_here'

try:
    from backend.agents.financial_advisor import (
        FinancialMetrics, 
        UnitEconomics, 
        BusinessContext,
        financial_advisor_service
    )
    print("✅ Módulos de IA importados correctamente")
except ImportError as e:
    print(f"❌ Error importando módulos: {e}")
    sys.exit(1)

async def test_ai_integration():
    """Prueba la integración completa de IA"""
    
    print("\n🤖 Probando KatalisApp IA Integration")
    print("=" * 50)
    
    # Datos de prueba: Emprendimiento típico
    test_metrics = FinancialMetrics(
        revenue=25000,      # $25k mensuales
        expenses=18000,     # $18k gastos
        net_profit=7000,    # $7k utilidad
        cash_flow=5000,     # $5k flujo positivo
        ltv=800,           # LTV $800
        coca=150,          # COCA $150
        fixed_costs=12000,  # $12k costos fijos
        variable_costs=6000 # $6k costos variables
    )
    
    test_unit_economics = UnitEconomics(
        price_per_unit=100,              # Precio $100
        variable_cost_per_unit=40,       # Costo variable $40
        marketing_spend=3000,            # $3k marketing
        new_customers=20,                # 20 clientes nuevos
        avg_purchase_frequency=2,        # 2 compras/año
        retention_months=18              # 18 meses retención
    )
    
    test_context = BusinessContext(
        industry="technology",
        business_stage="growth",
        monthly_revenue=25000,
        employee_count=8,
        months_operating=24
    )
    
    print(f"📊 Datos de prueba:")
    print(f"   • Ingresos: ${test_metrics.revenue:,}")
    print(f"   • Utilidad: ${test_metrics.net_profit:,}")
    print(f"   • LTV/COCA: {test_metrics.ltv}/{test_metrics.coca} = {test_metrics.ltv/test_metrics.coca:.1f}x")
    print(f"   • Margen: {(test_metrics.net_profit/test_metrics.revenue*100):.1f}%")
    
    try:
        print(f"\n🧠 Ejecutando análisis de IA...")
        start_time = datetime.now()
        
        # Test 1: Health Score
        print("   1. Calculando Score de Salud...")
        health_score = financial_advisor_service.calculate_financial_health_score(
            metrics=test_metrics,
            unit_economics=test_unit_economics
        )
        
        print(f"      ✅ Score: {health_score['total_score']}/100 ({health_score['health_level']})")
        
        # Test 2: Business Analysis con IA Real
        print("   2. Ejecutando análisis completo con IA...")
        business_analysis = await financial_advisor_service.analyze_business_health(
            metrics=test_metrics,
            unit_economics=test_unit_economics,
            context=test_context
        )
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        print(f"      ✅ Análisis completado en {duration:.2f} segundos")
        print(f"      ✅ Salud general: {business_analysis.overall_health}")
        print(f"      ✅ Fortalezas encontradas: {len(business_analysis.key_strengths)}")
        print(f"      ✅ Recomendaciones: {len(business_analysis.financial_recommendations)}")
        
        # Mostrar algunas recomendaciones
        if business_analysis.financial_recommendations:
            print(f"\n💡 Recomendaciones de IA:")
            for i, rec in enumerate(business_analysis.financial_recommendations[:3]):
                print(f"   {i+1}. [{rec.priority}] {rec.title}")
                print(f"      {rec.description[:100]}...")
        
        # Test 3: Análisis de Growth Opportunities
        print(f"\n   3. Analizando oportunidades de crecimiento...")
        growth_opportunities = await financial_advisor_service.analyze_growth_opportunities(
            current_metrics=test_metrics,
            growth_data={
                "revenue_growth_rate": 15,  # 15% crecimiento
                "customer_acquisition_trend": "increasing",
                "market_size": "large"
            },
            objectives={
                "target_revenue": 50000,  # Meta $50k
                "target_growth_rate": 25,
                "expansion_plans": "new_products"
            }
        )
        
        print(f"      ✅ Oportunidades identificadas: {len(growth_opportunities)}")
        
        print(f"\n🎉 ¡Integración de IA funcionando perfectamente!")
        print(f"\n📋 Resumen del test:")
        print(f"   • Score de salud: {health_score['total_score']}/100")
        print(f"   • Nivel de salud: {health_score['health_level']}")
        print(f"   • Tiempo de respuesta: {duration:.2f}s")
        print(f"   • Recomendaciones generadas: {len(business_analysis.financial_recommendations)}")
        print(f"   • Oportunidades de crecimiento: {len(growth_opportunities)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error en análisis de IA: {e}")
        print(f"   Tipo de error: {type(e).__name__}")
        return False

def main():
    """Función principal"""
    print("🚀 KatalisApp - Test de Integración IA")
    
    # Verificar API key
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("❌ No se encontró OPENAI_API_KEY")
        return False
        
    if api_key.startswith('sk-test-placeholder'):
        print("⚠️ Usando API key de placeholder - cambiando a Mock AI")
        return False
    
    print(f"✅ API Key configurada: {api_key[:20]}...")
    
    # Ejecutar test asíncrono
    try:
        result = asyncio.run(test_ai_integration())
        if result:
            print(f"\n🎯 PRÓXIMOS PASOS:")
            print(f"   1. Levantar la app: docker-compose up -d")
            print(f"   2. Ir a: http://localhost:3000")
            print(f"   3. Navegar a: Reports → IA Insights")
            print(f"   4. ¡Disfrutar del análisis inteligente!")
        return result
    except KeyboardInterrupt:
        print(f"\n⚠️ Test interrumpido por usuario")
        return False
    except Exception as e:
        print(f"❌ Error ejecutando test: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)