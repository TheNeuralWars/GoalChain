#!/usr/bin/env bash
# Keep FCC proxy running (required for fcc-claude / oa-worker).
set -euo pipefail

export PATH="${HOME}/.local/bin:${PATH}"
LOG="${FCC_SERVER_LOG:-$HOME/.fcc/logs/fcc-server.log}"
mkdir -p "$(dirname "${LOG}")"

if curl -sf http://127.0.0.1:8082/health >/dev/null 2>&1; then
  echo "fcc-server: healthy"
  exit 0
fi

if ! command -v fcc-server >/dev/null 2>&1; then
  echo "ERROR: fcc-server not installed (uv tool install free-claude-code)"
  exit 1
fi

nohup fcc-server >> "${LOG}" 2>&1 &
sleep 3
if curl -sf http://127.0.0.1:8082/health >/dev/null 2>&1; then
  echo "fcc-server: started"
else
  echo "ERROR: fcc-server failed to start — tail ${LOG}"
  exit 1
fi
