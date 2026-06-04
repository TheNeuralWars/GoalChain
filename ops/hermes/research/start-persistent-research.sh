#!/usr/bin/env bash
#
# Persistent Research Loop with Watchdog
# Ejecutar con: ./start-persistent-research.sh

set -euo pipefail

SESSION_NAME="autonomic-research"
SCRIPT_PATH="$HOME/hermes/scripts/autonomic-dispatch.sh"

echo "Iniciando loop persistente de investigación autónoma con watchdog..."

while true; do
    # Verificar si la sesión ya existe
    if tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
        echo "[$(date)] Sesión $SESSION_NAME ya existe. Verificando salud..."
        
        # Ver si el proceso principal sigue vivo
        if ! tmux list-panes -t "$SESSION_NAME" -F '#{pane_pid}' 2>/dev/null | xargs -I {} ps -p {} > /dev/null 2>&1; then
            echo "[$(date)] Proceso muerto. Reiniciando sesión..."
            tmux kill-session -t "$SESSION_NAME" 2>/dev/null || true
            sleep 2
        else
            echo "[$(date)] Sesión saludable. Esperando..."
            sleep 300
            continue
        fi
    fi

    # Crear nueva sesión persistente
    echo "[$(date)] Creando nueva sesión persistente: $SESSION_NAME"
    tmux new-session -d -s "$SESSION_NAME" -n research \
        "bash -c 'while true; do 
            echo \"[$(date)] Ejecutando ciclo de investigación autónoma...\"
            $SCRIPT_PATH || true
            echo \"[$(date)] Ciclo completado. Esperando 15 minutos...\"
            sleep 900
         done'"

    echo "[$(date)] Sesión $SESSION_NAME iniciada."
    sleep 60
done
