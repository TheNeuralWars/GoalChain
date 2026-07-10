#!/usr/bin/env bash
# gbrain-push.sh — post-merge push hook for gbrain-sync-server.
# Best-effort: never fails the parent cron. 5s timeout.
# Usage: bash ops/hermes/gbrain-push.sh [message] [brain_change_json]
# Env:  VPS_TS_IP (default 100.101.211.44), HOST_ID (default gbrain-vps)
set -uo pipefail

VPS_TS_IP="${VPS_TS_IP:-100.101.211.44}"
URL="${GBRAIN_SYNC_URL:-http://${VPS_TS_IP}:8648}/webhook/gbrain-push"
HOST_ID="${HOST_ID:-gbrain-vps}"
MSG="${1:-auto-push}"
_DEFAULT_BC='{}'
BRAIN_CHANGE="${2:-$_DEFAULT_BC}"

log() { printf '[%s] [gbrain-push] %s\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" "$*"; }
err() { log "ERROR $*" >&2; }

# Build the JSON payload safely with python3 (handles quoting).
PAYLOAD="$(MESSAGE="${MSG}" HOST_ID="${HOST_ID}" BC="${BRAIN_CHANGE}" python3 - <<'PY'
import json, os
print(json.dumps({
    "message": os.environ.get("MESSAGE", ""),
    "host_id": os.environ.get("HOST_ID", "gbrain-vps"),
    "brain_change": json.loads(os.environ.get("BC", "{}")),
}))
PY
)"

# POST (5s timeout; never block the upstream cron).
HTTP_CODE="$(curl -s -o /dev/null -w '%{http_code}' \
  --max-time 5 \
  -X POST "${URL}" \
  -H 'Content-Type: application/json' \
  -H "X-Host-Id: ${HOST_ID}" \
  -d "${PAYLOAD}" || echo "000")"

if [[ "${HTTP_CODE}" =~ ^20 ]]; then
  log "pushed to ${URL} (HTTP ${HTTP_CODE}) message='${MSG}'"
  exit 0
else
  err "push failed (HTTP ${HTTP_CODE}) to ${URL} — server may be down; not failing parent cron"
  exit 0
fi
