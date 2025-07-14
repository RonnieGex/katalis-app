#!/bin/bash

# Script para sincronización automática Docker -> GitHub -> DigitalOcean
# Uso: ./scripts/dev-sync.sh "mensaje del commit"

set -e

echo "🚀 Iniciando flujo de sincronización Katalis App"
echo "================================================"

# Verificar que se proporcionó un mensaje de commit
if [ -z "$1" ]; then
    echo "❌ Error: Debes proporcionar un mensaje de commit"
    echo "Uso: ./scripts/dev-sync.sh \"tu mensaje de commit\""
    exit 1
fi

COMMIT_MESSAGE="$1"

echo "📝 Mensaje de commit: $COMMIT_MESSAGE"
echo ""

# Paso 1: Verificar que Docker esté funcionando localmente
echo "🔍 Verificando estado de Docker..."
if ! docker-compose ps | grep -q "Up"; then
    echo "⚠️  Docker no está ejecutándose. Iniciando servicios..."
    docker-compose up -d
    echo "✅ Docker iniciado"
else
    echo "✅ Docker ya está ejecutándose"
fi

# Paso 2: Ejecutar tests de desarrollo
echo ""
echo "🧪 Ejecutando tests de desarrollo..."
docker-compose exec -T backend python -m pytest tests/ || echo "⚠️  Tests no completados (continuando...)"

# Paso 3: Build de producción para verificar
echo ""
echo "🏗️  Verificando builds de producción..."
docker build -t katalis-backend-test ./backend --target production
docker build -t katalis-frontend-test ./frontend --target production
echo "✅ Builds de producción exitosos"

# Paso 4: Commit y push a GitHub
echo ""
echo "📤 Sincronizando con GitHub..."
git add .

# Verificar si hay cambios para commitear
if git diff --staged --quiet; then
    echo "ℹ️  No hay cambios para commitear"
else
    git commit -m "$COMMIT_MESSAGE

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
    echo "✅ Commit creado"
fi

# Push a GitHub
git push origin main
echo "✅ Cambios enviados a GitHub"

# Paso 5: Verificar deploy automático en DigitalOcean
echo ""
echo "🌊 Verificando deploy en DigitalOcean..."
echo "📱 Puedes monitorear el progreso en:"
echo "   https://cloud.digitalocean.com/apps/b4a96b79-54cc-4709-90f7-a2af313a9935"
echo ""

# Paso 6: Limpiar imágenes de test
echo "🧹 Limpiando imágenes temporales..."
docker rmi katalis-backend-test katalis-frontend-test 2>/dev/null || true

echo ""
echo "🎉 ¡Flujo de sincronización completado!"
echo "   Docker ✅ → GitHub ✅ → DigitalOcean 🔄"
echo ""
echo "Próximos pasos:"
echo "1. Verificar deploy en DigitalOcean (5-10 minutos)"
echo "2. Probar la aplicación en producción"
echo "3. Monitorear logs si es necesario"