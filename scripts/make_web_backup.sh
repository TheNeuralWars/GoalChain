#!/bin/bash

# GoalChain Web Backup Script
# Creates a timestamped backup of the 'docs/' folder

SOURCE_DIR="docs"
BACKUP_PARENT="_backups/web_history"
TIMESTAMP=$(date +"%Y%m%d_%H%M")
BACKUP_DIR="$BACKUP_PARENT/web_backup_$TIMESTAMP"

# Crear directorio padre si no existe
mkdir -p "$BACKUP_PARENT"

# Verificar si la carpeta docs existe
if [ -d "$SOURCE_DIR" ]; then
    echo "📦 Creando backup de la web en: $BACKUP_DIR..."
    cp -R "$SOURCE_DIR" "$BACKUP_DIR"
    echo "✅ Backup completado con éxito."
    
    # Mantener solo los últimos 5 backups para no llenar el disco
    ls -dt "$BACKUP_PARENT"/* | tail -n +6 | xargs rm -rf
    echo "🧹 Limpieza realizada (se mantienen los últimos 5)."
else
    echo "❌ Error: La carpeta '$SOURCE_DIR' no existe."
    exit 1
fi
