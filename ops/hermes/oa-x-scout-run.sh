#!/usr/bin/env bash
# Run Hermes X-Scout (Grok + X API) and optionally publish to Discord active-research.
set -euo pipefail

HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
# shellcheck disable=SC1090
source "${HERMES_HOME}/config.env"

SCRIPT="${HERMES_HOME}/scripts/oa-x-scout-run.py"
PUBLISHER="${HERMES_HOME}/scripts/oa-discord-research-publisher.py"
STATE="${HERMES_HOME}/oa/state"
LOG="${HERMES_HOME}/oa/logs/x-scout.log"

mkdir -p "${STATE}" "$(dirname "${LOG}")" "${HOME}/.hermes/workspace/docs"

{
  echo "=== $(date -u '+%F %T UTC') x-scout run ==="
  python3 "${SCRIPT}"
  if [[ "${OA_RESEARCH_PUBLISHER_ENABLED}" == "true" ]]; then
    export OA_RESEARCH_PUBLISHER_ENABLED
    python3 "${PUBLISHER}" \
      --state-file "${STATE}/research-discord-posted.json" \
      --max-per-run 1
  else
    echo "x_scout: publisher disabled (set OA_RESEARCH_PUBLISHER_ENABLED=true)"
  fi
} >> "${LOG}" 2>&1

echo "x_scout: done (log: ${LOG})"
