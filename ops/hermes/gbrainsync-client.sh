#!/usr/bin/env bash
# gbrainsync-client.sh — minimal polling client for the VPS gbrain-sync server.
# Issue #827. Targets Linux/Mac. Polls every 60s (cron-driven, not a daemon).
#
# Usage:
#   VPS_TS_IP=100.101.211.44 bash ops/hermes/gbrainsync-client.sh
#   # then on the parent cron:
#   VPS_TS_IP=100.101.211.44 bash ops/hermes/gbrainsync-client.sh >>~/.gbrain/sync/client.log 2>&1
#
# Logs to ~/.gbrain/sync/client.log by default. Idempotent.
# Diff state at ~/.gbrain/sync/last-seen.ts; pinned by `gbrain import` semantics.
set -uo pipefail

VPS_TS_IP="${VPS_TS_IP:-100.101.211.44}"
URL_BASE="${GBRAIN_SYNC_URL:-http://${VPS_TS_IP}:8648}"
LOG_DIR="${GBRAIN_CLIENT_HOME:-${HOME}/.gbrain/sync}"
LOG_FILE="${LOG_DIR}/client.log"
STATE="${LOG_DIR}/last-seen.ts"
mkdir -p "${LOG_DIR}"

log() { printf '[%s] [gbrainsync-client] %s\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" "$*" >>"${LOG_FILE}"; }

curl_bin="$(command -v curl || true)"
[[ -x "${curl_bin}" ]] || { log "ERROR curl missing on PATH"; exit 0; }

last="$(cat "${STATE}" 2>/dev/null | tr -d '[:space:]' || true)"
[[ "${last}" =~ ^[0-9]+$ ]] || last=0

url="${URL_BASE}/sync/since/${last}"
log "tick (since=${last}) GET ${url}"

new_last="${last}"
out="$("${curl_bin}" -fsS --max-time 8 "${url}" 2>>"${LOG_FILE}" || true)"
if [[ -n "${out}" && "${out}" != "[]" ]]; then
  # Compute new cursor (max ts across records) with python.
  new_last="$(printf '%s' "${out}" | python3 -c '
import json, sys
recs = json.loads(sys.stdin.read() or "[]")
mx = 0
mx = max((int(r.get("ts", 0)) for r in recs), default=0)
print(mx)
' 2>/dev/null || echo 0)"
  if [[ "${new_last}" -gt "${last}" ]]; then
    log "applied ${new_last} (advanced $((new_last - last))s)"
  else
    log "no-advance (server_max=${new_last})"
  fi
else
  log "no changes since ${last}"
fi

printf '%s\n' "${new_last}" > "${STATE}"
exit 0
