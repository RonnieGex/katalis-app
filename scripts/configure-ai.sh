#!/bin/bash

# Script para configurar APIs de IA en KatalisApp
# Uso: ./scripts/configure-ai.sh

echo "🤖 Configurador de APIs de IA - KatalisApp"
echo "=========================================="

# Verificar si existe .env
if [ ! -f backend/.env ]; then
    echo "📄 Creando archivo .env desde .env.example..."
    cp backend/.env.example backend/.env
fi

echo ""
echo "🔧 Estado actual de APIs:"

# Verificar estado actual
if grep -q "OPENAI_API_KEY=sk-" backend/.env 2>/dev/null; then
    echo "✅ OpenAI API Key: Configurada"
else
    echo "❌ OpenAI API Key: No configurada"
fi

if grep -q "DEEPSEEK_API_KEY=sk-" backend/.env 2>/dev/null; then
    echo "✅ DeepSeek API Key: Configurada"
else
    echo "❌ DeepSeek API Key: No configurada"
fi

echo ""
echo "📋 Estrategia de IA Recomendada:"
echo "  🧠 DeepSeek R1: Razonamiento complejo, análisis financiero profundo"
echo "  ⚡ OpenAI GPT-4o-mini: Tareas simples, respuestas rápidas"
echo ""

# Preguntar si quiere configurar APIs
read -p "¿Quieres configurar las APIs de IA? (y/N): " configure_apis

if [[ $configure_apis =~ ^[Yy]$ ]]; then
    echo ""
    echo "🔑 Configuración de APIs:"
    
    # Configurar OpenAI
    echo ""
    echo "OpenAI API Key (GPT-4o-mini para tareas simples):"
    echo "Obtén tu key en: https://platform.openai.com/api-keys"
    read -p "OpenAI API Key (o Enter para omitir): " openai_key
    
    if [ ! -z "$openai_key" ]; then
        # Actualizar .env
        if grep -q "OPENAI_API_KEY=" backend/.env; then
            sed -i "s/OPENAI_API_KEY=.*/OPENAI_API_KEY=$openai_key/" backend/.env
        else
            echo "OPENAI_API_KEY=$openai_key" >> backend/.env
        fi
        echo "✅ OpenAI API Key configurada"
    fi
    
    # Configurar DeepSeek
    echo ""
    echo "DeepSeek API Key (R1 para razonamiento complejo):"
    echo "Obtén tu key en: https://platform.deepseek.com/api_keys"
    read -p "DeepSeek API Key (o Enter para omitir): " deepseek_key
    
    if [ ! -z "$deepseek_key" ]; then
        # Actualizar .env
        if grep -q "DEEPSEEK_API_KEY=" backend/.env; then
            sed -i "s/DEEPSEEK_API_KEY=.*/DEEPSEEK_API_KEY=$deepseek_key/" backend/.env
        else
            echo "DEEPSEEK_API_KEY=$deepseek_key" >> backend/.env
        fi
        echo "✅ DeepSeek API Key configurada"
    fi
    
    echo ""
    echo "🧪 Probando configuración..."
    
    # Test de configuración
    cd backend
    python3 -c "
from services.dual_ai_service import dual_ai_service
status = dual_ai_service.get_service_status()
print(f'📊 Estado: {status[\"strategy\"]} strategy')
print(f'🤖 Modelos disponibles:')
print(f'   Simples: {status[\"models\"][\"simple_tasks\"]}')
print(f'   Complejos: {status[\"models\"][\"complex_reasoning\"]}')
" 2>/dev/null || echo "⚠️ Error en test - verifica las APIs"
    
    cd ..
fi

echo ""
echo "📚 Documentación:"
echo "  • Endpoint de estado: GET /api/ai/ai-status"
echo "  • Test dual IA: POST /api/ai/test-dual-ai"
echo "  • Análisis complejo: POST /api/ai/reasoning-analysis"
echo ""
echo "🚀 Para aplicar cambios en producción:"
echo "  ./scripts/dev-sync.sh \"Configure dual AI strategy\""
echo ""
echo "✅ Configuración completada!"