#!/bin/bash

echo "🚀 Iniciando KatalisApp en modo desarrollo"
echo "================================================"

# Verificar si el puerto 8000 está ocupado
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️ Puerto 8000 ocupado, deteniendo proceso..."
    pkill -f "python3 main.py" 2>/dev/null || true
    sleep 2
fi

# Navegar al directorio backend
cd /home/ronniegex/katalis-app/backend

# Establecer variables de entorno como si fuera Docker
export ENVIRONMENT=development
export JWT_SECRET_KEY="katalis-jwt-secret-change-in-production"
export SECRET_KEY="development-secret-key-change-in-production"
export OPENAI_API_KEY="your_openai_api_key_here"

echo "🔧 Configurando entorno..."
echo "   ✅ Variables de entorno establecidas"
echo "   ✅ Puerto 8000 disponible"

echo ""
echo "🚀 Iniciando servidor backend..."
nohup python3 main.py > server.log 2>&1 &
SERVER_PID=$!

echo "   📋 PID del servidor: $SERVER_PID"
echo "   📄 Logs en: server.log"

# Esperar a que el servidor inicie
sleep 3

# Verificar si el servidor está funcionando
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "   ✅ Servidor iniciado correctamente"
else
    echo "   ❌ Error al iniciar servidor"
    exit 1
fi

echo ""
echo "🌐 KatalisApp está funcionando:"
echo "   • API Backend: http://localhost:8000"
echo "   • Documentación: http://localhost:8000/docs"
echo "   • Health Check: http://localhost:8000/health"

echo ""
echo "👤 Usuario demo para pruebas:"
echo "   • Email: demo@katalisapp.com"
echo "   • Contraseña: demo123456"

echo ""
echo "📋 Para ejecutar las pruebas:"
echo "   cd /home/ronniegex/katalis-app && python3 test_complete_system.py"

echo ""
echo "🛑 Para detener el servidor:"
echo "   kill $SERVER_PID"

echo ""
echo "✅ Sistema listo para usar!"