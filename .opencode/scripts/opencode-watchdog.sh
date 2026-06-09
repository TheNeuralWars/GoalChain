#!/usr/bin/env bash
# opencode-watchdog.sh
# Kill runaway opencode sessions on a free Oracle VPS.
# Usage:
#   ./opencode-watchdog.sh           # dry-run, prints actions
#   ./opencode-watchdog.sh --apply   # actually kill/signal
#   ./opencode-watchdog.sh --max-min 45
#
# Cron suggestion (run every 5 min):
#   */5 * * * * /home/ubuntu/.opencode/scripts/opencode-watchdog.sh --apply --max-min 45 >> /home/ubuntu/.opencode/logs/watchdog.log 2>&1

set -u

APPLY=0
MAX_MIN=45
WARN_MIN=40
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="${SCRIPT_DIR%/scripts}/logs"
mkdir -p "$LOG_DIR"

for arg in "$@"; do
  case "$arg" in
    --apply) APPLY=1 ;;
    --max-min) shift; MAX_MIN="${1:-45}" ;;
  esac
done

ts() { date +"%Y-%m-%d %H:%M:%S"; }
log() { echo "[$(ts)] $*" | tee -a "$LOG_DIR/watchdog.log"; }

# Find opencode PIDs (main process + any nested agents)
PIDS=$(pgrep -f "opencode" || true)

if [ -z "$PIDS" ]; then
  log "no opencode process running"
  exit 0
fi

# Longest-running PID's elapsed time (minutes)
OLDEST_MIN=0
OLDEST_PID=""
for pid in $PIDS; do
    ELAPSED_S=$(ps -o etimes= -p "$pid" | tr -d ' ')
    if [ -n "$ELAPSED_S" ]; then
      ELAPSED_MIN=$(( ELAPSED_S / 60 ))
      if [ "$ELAPSED_MIN" -gt "$OLDEST_MIN" ]; then
        OLDEST_MIN=$ELAPSED_MIN
        OLDEST_PID=$pid
      fi
    fi
done

log "opencode pids: $PIDS | oldest=$OLDEST_PID age=${OLDEST_MIN}m (max=${MAX_MIN}m)"

if [ "$OLDEST_MIN" -ge "$MAX_MIN" ]; then
  log "KILL: oldest session exceeded ${MAX_MIN}m"
  if [ "$APPLY" -eq 1 ]; then
    kill -TERM $PIDS 2>/dev/null
    sleep 5
    # If still alive, force kill
    REMAINING=$(pgrep -f "opencode" || true)
    if [ -n "$REMAINING" ]; then
      log "force-killing leftovers: $REMAINING"
      kill -KILL $REMAINING 2>/dev/null
    fi
    log "killed."
  else
    log "DRY-RUN: would kill $PIDS. Re-run with --apply to enforce."
  fi
elif [ "$OLDEST_MIN" -ge "$WARN_MIN" ]; then
  log "WARN: session at ${OLDEST_MIN}m, will kill at ${MAX_MIN}m"
else
  log "OK: session healthy"
fi
