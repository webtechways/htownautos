#!/bin/bash

# Script para matar procesos en un puerto específico
# Uso: ./scripts/kill-port.sh [puerto]
# Ejemplo: ./scripts/kill-port.sh 3000

PORT=${1:-3000}

echo "🔍 Buscando procesos en el puerto $PORT..."

# Buscar procesos usando el puerto
PIDS=$(lsof -ti:$PORT)

if [ -z "$PIDS" ]; then
  echo "✅ No hay procesos ejecutándose en el puerto $PORT"
  exit 0
fi

echo "📋 Procesos encontrados:"
lsof -i:$PORT

echo ""
echo "💀 Matando procesos: $PIDS"
kill -9 $PIDS

# Verificar si se mataron exitosamente
sleep 1
REMAINING=$(lsof -ti:$PORT)

if [ -z "$REMAINING" ]; then
  echo "✅ Puerto $PORT liberado exitosamente"
  exit 0
else
  echo "❌ Error: Algunos procesos todavía están activos en el puerto $PORT"
  exit 1
fi
