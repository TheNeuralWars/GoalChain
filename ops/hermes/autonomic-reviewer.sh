#!/usr/bin/env bash
#
# autonomic-reviewer.sh — Automatically review and merge open local branches from agent workers.
# Part of the GoalChain "Humans-0" Extreme Automation pipeline.
#
set -euo pipefail

HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

log() { printf "[%s] [REVIWER-AGENT] %s\n" "$(date -u '+%Y-%m-%d %H:%M:%S UTC')" "$*"; }

log "Invoking local-reviewer python engine..."

if [[ -f "${SCRIPT_DIR}/local-reviewer.py" ]]; then
  python3 "${SCRIPT_DIR}/local-reviewer.py"
elif [[ -f "${HERMES_HOME}/scripts/local-reviewer.py" ]]; then
  python3 "${HERMES_HOME}/scripts/local-reviewer.py"
else
  log "ERROR: local-reviewer.py not found!"
  exit 1
fi

log "PR / local branch review cycle finished."
