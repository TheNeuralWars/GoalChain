#!/usr/bin/env bash
# Verify the OA code-engine provider switch in issue #832.
# Probes NVIDIA NIM and (optionally) fires a live 1-token ping.
# Never logs the API key; redacts any token in error output.
set -euo pipefail

HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
CONFIG_FILE="${HERMES_HOME}/config.env"
PROVIDER_BASE="https://integrate.api.nvidia.com/v1"
MODEL_DEFAULT="nvidia/nemotron-3-super-120b-a12b"

# shellcheck disable=SC1090
[[ -f "${CONFIG_FILE}" ]] && source "${CONFIG_FILE}"
KEY="${NVIDIA_NIM_API_KEY:-}"
OA_CODE_MODEL="${OA_CODE_MODEL:-${MODEL_DEFAULT}}"
LIVE=0
[[ "${1:-}" == "--live" ]] && LIVE=1

redact() { local s="${1:-}"; printf '%s' "${s}" | sed -E 's/(Bearer[[:space:]]+)?[A-Za-z0-9_\-]{12,}/[REDACTED]/g'; }

log() { printf '[verify] %s\n' "$*"; }

log "provider_base=${PROVIDER_BASE}"
log "model=${OA_CODE_MODEL}"
log "live=${LIVE}"
log "key_present=$( [[ -n "${KEY}" ]] && echo yes || echo no )"

if [[ -z "${KEY}" ]]; then
  log "SKIP: NVIDIA_NIM_API_KEY not set in ${CONFIG_FILE}."
  log "Set it then re-run, e.g.: export NVIDIA_NIM_API_KEY=nvapi-..."
  exit 0
fi

code=$(curl -sS -o /tmp/verify-nvidia-nim.json -w '%{http_code}' \
  --max-time 10 -H "Authorization: Bearer ${KEY}" \
  "${PROVIDER_BASE}/models" || echo "000")
log "GET /models -> HTTP ${code}"
if [[ "${code}" != "200" ]]; then
  log "FAIL: auth or network error. Body:"; redact "$(cat /tmp/verify-nvidia-nim.json 2>/dev/null || true)"
  exit 1
fi

if [[ "${LIVE}" == "1" ]]; then
  payload='{"model":"'"${OA_CODE_MODEL}"'","messages":[{"role":"user","content":"ping"}],"max_tokens":1}'
  code=$(curl -sS -o /tmp/verify-nvidia-nim.json -w '%{http_code}' \
    --max-time 30 -H "Authorization: Bearer ${KEY}" -H 'Content-Type: application/json' \
    -d "${payload}" "${PROVIDER_BASE}/chat/completions" || echo "000")
  log "POST /chat/completions -> HTTP ${code}"
  [[ "${code}" == "200" ]] || { log "FAIL body:"; redact "$(cat /tmp/verify-nvidia-nim.json 2>/dev/null || true)"; exit 2; }
fi

log "OK: provider reachable and authenticated."
