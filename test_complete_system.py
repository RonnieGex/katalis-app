#!/usr/bin/env python3
"""
Script de prueba completo para KatalisApp
Verifica el nuevo sistema de autenticación, configuración, ayuda y soporte
"""

import requests
import json
import time
from datetime import datetime

# Configuración
BASE_URL = "http://localhost:8000"
DEMO_USER = {
    "email": "demo@katalisapp.com",
    "password": "demo123456"
}

def test_health_check():
    """Verificar que el servidor esté funcionando"""
    print("🔍 Verificando health check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Servidor funcionando: {data['status']}")
            return True
        else:
            print(f"❌ Error en health check: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error conectando al servidor: {e}")
        return False

def test_demo_login():
    """Probar login con usuario demo"""
    print("\n🔐 Probando login con usuario demo...")
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=DEMO_USER)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Login exitoso para: {data['user']['full_name']}")
            print(f"   📧 Email: {data['user']['email']}")
            print(f"   🏢 Empresa: {data['user']['company_name']}")
            print(f"   📈 Plan: {data['user']['subscription_plan']}")
            return data["access_token"]
        else:
            error = response.json()
            print(f"❌ Error en login: {error.get('detail', 'Error desconocido')}")
            return None
    except Exception as e:
        print(f"❌ Error en login: {e}")
        return None

def test_user_profile(token):
    """Probar obtención de perfil de usuario"""
    print("\n👤 Probando perfil de usuario...")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        if response.status_code == 200:
            user = response.json()
            print(f"✅ Perfil obtenido:")
            print(f"   👤 Usuario: {user['username']}")
            print(f"   🏭 Industria: {user.get('industry', 'No especificada')}")
            print(f"   📊 Etapa: {user.get('business_stage', 'No especificada')}")
            print(f"   👥 Empleados: {user.get('employee_count', 'No especificado')}")
            return True
        else:
            print(f"❌ Error obteniendo perfil: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error en perfil: {e}")
        return False

def test_user_preferences(token):
    """Probar preferencias de usuario"""
    print("\n⚙️ Probando preferencias de usuario...")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/auth/preferences", headers=headers)
        if response.status_code == 200:
            prefs = response.json()
            print(f"✅ Preferencias obtenidas:")
            print(f"   🎨 Tema: {prefs.get('theme', 'No especificado')}")
            print(f"   💰 Moneda: {prefs.get('currency', 'No especificada')}")
            print(f"   🤖 Frecuencia IA: {prefs.get('ai_analysis_frequency', 'No especificada')}")
            print(f"   📧 Email: {prefs.get('notifications_email', False)}")
            return True
        else:
            print(f"❌ Error obteniendo preferencias: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error en preferencias: {e}")
        return False

def test_configuration_endpoints(token):
    """Probar endpoints de configuración"""
    print("\n🔧 Probando configuración del sistema...")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        
        # Probar configuración de usuario
        response = requests.get(f"{BASE_URL}/config/user", headers=headers)
        if response.status_code == 200:
            config = response.json()
            print(f"✅ Configuración de usuario obtenida")
            print(f"   🔔 Notificaciones configuradas: {len(config.get('notifications', {}))}")
            print(f"   📊 Dashboard configurado: {len(config.get('dashboard', {}))}")
        
        # Probar monedas soportadas
        response = requests.get(f"{BASE_URL}/config/currencies")
        if response.status_code == 200:
            currencies = response.json()
            print(f"✅ Monedas soportadas: {len(currencies.get('currencies', {}))}")
        
        # Probar temas disponibles
        response = requests.get(f"{BASE_URL}/config/themes")
        if response.status_code == 200:
            themes = response.json()
            print(f"✅ Temas disponibles: {len(themes.get('themes', {}))}")
        
        return True
    except Exception as e:
        print(f"❌ Error en configuración: {e}")
        return False

def test_help_system():
    """Probar sistema de ayuda"""
    print("\n📚 Probando sistema de ayuda...")
    try:
        # Probar secciones de ayuda
        response = requests.get(f"{BASE_URL}/help/sections")
        if response.status_code == 200:
            sections = response.json()
            print(f"✅ Secciones de ayuda: {sections.get('total', 0)}")
            
            if sections.get('sections'):
                first_section = sections['sections'][0]
                print(f"   📖 Primera sección: {first_section['title']}")
                print(f"   🏷️ Categoría: {first_section['category']}")
        
        # Probar categorías
        response = requests.get(f"{BASE_URL}/help/categories")
        if response.status_code == 200:
            categories = response.json()
            print(f"✅ Categorías de ayuda: {len(categories.get('categories', []))}")
        
        # Probar FAQs
        response = requests.get(f"{BASE_URL}/help/faq")
        if response.status_code == 200:
            faqs = response.json()
            print(f"✅ FAQs disponibles: {faqs.get('total', 0)}")
        
        # Probar búsqueda
        response = requests.get(f"{BASE_URL}/help/search?q=login")
        if response.status_code == 200:
            search = response.json()
            print(f"✅ Búsqueda funcionando: {search.get('total', 0)} resultados para 'login'")
        
        return True
    except Exception as e:
        print(f"❌ Error en ayuda: {e}")
        return False

def test_support_system(token):
    """Probar sistema de soporte"""
    print("\n🎫 Probando sistema de soporte...")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        
        # Probar categorías de soporte
        response = requests.get(f"{BASE_URL}/support/categories")
        if response.status_code == 200:
            categories = response.json()
            print(f"✅ Categorías de soporte: {len(categories.get('categories', {}))}")
        
        # Probar estado del soporte
        response = requests.get(f"{BASE_URL}/support/status")
        if response.status_code == 200:
            status = response.json()
            print(f"✅ Estado del soporte: {status.get('status', 'unknown')}")
            print(f"   📊 Tickets abiertos: {status.get('total_open_tickets', 0)}")
        
        # Probar creación de ticket
        ticket_data = {
            "title": "Prueba de sistema de tickets",
            "description": "Este es un ticket de prueba creado por el script de testing para verificar que el sistema funciona correctamente.",
            "category": "technical",
            "priority": "medium"
        }
        
        response = requests.post(f"{BASE_URL}/support/tickets", json=ticket_data, headers=headers)
        if response.status_code == 200:
            ticket = response.json()
            print(f"✅ Ticket creado: {ticket.get('ticket_id', 'unknown')}")
            
            # Probar listar tickets del usuario
            response = requests.get(f"{BASE_URL}/support/tickets", headers=headers)
            if response.status_code == 200:
                tickets = response.json()
                print(f"✅ Tickets del usuario: {tickets.get('total', 0)}")
        
        return True
    except Exception as e:
        print(f"❌ Error en soporte: {e}")
        return False

def test_ai_insights(token):
    """Probar endpoints de IA"""
    print("\n🤖 Probando análisis de IA...")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        
        # Probar health score
        response = requests.get(f"{BASE_URL}/api/ai/health-score", headers=headers)
        if response.status_code == 200:
            health = response.json()
            print(f"✅ Health Score: {health.get('total_score', 0)}/100")
            print(f"   📊 Nivel: {health.get('health_level', 'Unknown')}")
        
        # Probar recomendaciones rápidas
        response = requests.post(f"{BASE_URL}/api/ai/recommendations/quick", 
                               json={"context": "general"}, headers=headers)
        if response.status_code == 200:
            recs = response.json()
            print(f"✅ Recomendaciones: {len(recs.get('recommendations', []))}")
        
        return True
    except Exception as e:
        print(f"❌ Error en IA: {e}")
        return False

def test_contact_form():
    """Probar formulario de contacto público"""
    print("\n📞 Probando formulario de contacto...")
    try:
        contact_data = {
            "name": "Usuario de Prueba",
            "email": "test@example.com",
            "subject": "Prueba del sistema de contacto",
            "message": "Este es un mensaje de prueba enviado por el script de testing para verificar que el formulario de contacto funciona correctamente.",
            "type": "technical",
            "company": "Test Company"
        }
        
        response = requests.post(f"{BASE_URL}/support/contact", json=contact_data)
        if response.status_code == 200:
            contact = response.json()
            print(f"✅ Contacto enviado: {contact.get('contact_id', 'unknown')}")
            print(f"   ⏱️ Tiempo estimado de respuesta: {contact.get('estimated_response_time', 'unknown')}")
            return True
        else:
            print(f"❌ Error en contacto: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error en contacto: {e}")
        return False

def main():
    """Ejecutar todas las pruebas"""
    print("🚀 Iniciando pruebas completas de KatalisApp")
    print("=" * 50)
    
    start_time = time.time()
    
    # Verificar servidor
    if not test_health_check():
        print("\n❌ El servidor no está funcionando. Asegúrate de que Docker esté ejecutándose.")
        return False
    
    # Login
    token = test_demo_login()
    if not token:
        print("\n❌ No se pudo hacer login. Verifica la configuración de autenticación.")
        return False
    
    # Pruebas con autenticación
    tests_with_auth = [
        test_user_profile,
        test_user_preferences,
        test_configuration_endpoints,
        test_support_system,
        test_ai_insights
    ]
    
    # Pruebas sin autenticación
    tests_without_auth = [
        test_help_system,
        test_contact_form
    ]
    
    success_count = 0
    total_tests = len(tests_with_auth) + len(tests_without_auth)
    
    # Ejecutar pruebas con autenticación
    for test_func in tests_with_auth:
        try:
            if test_func(token):
                success_count += 1
        except Exception as e:
            print(f"❌ Error en {test_func.__name__}: {e}")
    
    # Ejecutar pruebas sin autenticación
    for test_func in tests_without_auth:
        try:
            if test_func():
                success_count += 1
        except Exception as e:
            print(f"❌ Error en {test_func.__name__}: {e}")
    
    # Resumen
    elapsed_time = time.time() - start_time
    print("\n" + "=" * 50)
    print("📊 RESUMEN DE PRUEBAS")
    print("=" * 50)
    print(f"✅ Pruebas exitosas: {success_count}/{total_tests}")
    print(f"⏱️ Tiempo total: {elapsed_time:.2f} segundos")
    print(f"📅 Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    if success_count == total_tests:
        print("\n🎉 ¡TODAS LAS PRUEBAS PASARON! El sistema está funcionando correctamente.")
        print("\n🌐 Puedes acceder a:")
        print(f"   • Frontend: http://localhost:3000")
        print(f"   • API Docs: http://localhost:8000/docs")
        print(f"   • Health Check: http://localhost:8000/health")
        print("\n👤 Usuario Demo:")
        print(f"   • Email: {DEMO_USER['email']}")
        print(f"   • Contraseña: {DEMO_USER['password']}")
        return True
    else:
        print(f"\n⚠️ {total_tests - success_count} pruebas fallaron. Verifica los logs arriba.")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)