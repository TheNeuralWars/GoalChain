
# 3. Build the JSON payload safely with python3 (handles quoting).
PAYLOAD="$(MESSAGE="${MSG}" HOST_ID="${HOST_ID}" BC="${BRAIN_CHANGE}" python3 - <<'PY'
import json, os
print(json.dumps({
    "message": os.environ.get("MESSAGE", ""),
    "host_id": os.environ.get("HOST_ID", "gbrain-vps"),
    "brain_change": json.loads(os.environ.get("BC", "{}")),
}))
PY
)"

# 4. POST (5s timeout; never block the upstream cron).
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
