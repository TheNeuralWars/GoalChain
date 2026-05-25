#!/usr/bin/env bash
# Hermes X-Scout v2: synthesize radar + publish ONE forum thread (active-research).
set -euo pipefail

HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
set -a
# shellcheck disable=SC1090
source "${HERMES_HOME}/config.env"
set +a

SCRIPT="${HERMES_HOME}/scripts/oa-x-scout-run.py"
LOG="${HERMES_HOME}/oa/logs/x-scout.log"
STATE="${HERMES_HOME}/oa/state"

mkdir -p "${STATE}" "$(dirname "${LOG}")" "${HOME}/.hermes/workspace/docs"

{
  echo "=== $(date -u '+%F %T UTC') x-scout v2 ==="
  python3 "${SCRIPT}"
} >> "${LOG}" 2>&1

echo "x_scout: done (log: ${LOG})"
