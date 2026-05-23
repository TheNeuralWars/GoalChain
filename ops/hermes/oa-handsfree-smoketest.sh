#!/usr/bin/env bash
# Send a test task into OA webhook intake.
set -euo pipefail

HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
CONFIG_FILE="${HERMES_HOME}/config.env"
WEBHOOK_URL="${1:-http://127.0.0.1:3456/webhook}"
TEST_TEXT="${2:-dale un spike a antigravity para validar el flujo hands-free}"

if [[ ! -f "${CONFIG_FILE}" ]]; then
  echo "ERROR: config not found: ${CONFIG_FILE}"
  exit 1
fi

# shellcheck disable=SC1090
source "${CONFIG_FILE}"
TOKEN="${OA_WEBHOOK_TOKEN:-}"
if [[ -z "${TOKEN}" ]]; then
  echo "ERROR: OA_WEBHOOK_TOKEN missing in ${CONFIG_FILE}"
  exit 1
fi

curl -sS -X POST "${WEBHOOK_URL}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d "$(python3 -c 'import json,sys; print(json.dumps({"source":"discord","from":"nico-smoketest","text":sys.argv[1]}, ensure_ascii=True))' "${TEST_TEXT}")"
echo ""
