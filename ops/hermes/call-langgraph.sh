#!/usr/bin/env bash
# Hermes / CEO: call local LangGraph service (loopback). Usage:
#   bash ops/hermes/call-langgraph.sh "estado cola FCC y demo Mundial"
#   bash ops/hermes/call-langgraph.sh --reply "empresa: estado cola FCC"   # Discord: paste stdout ONLY
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
ENV_FILE="${GOALCHAIN_MA_ENV:-$HOME/.config/goalchain-multiagent.env}"
URL="${GOALCHAIN_MA_URL:-http://127.0.0.1:8790}"
REPLY_MODE=0
RAW=""

if [[ "${1:-}" == "--reply" ]]; then
  REPLY_MODE=1
  shift
fi
RAW="${*:-}"

if [[ -z "${RAW}" ]]; then
  echo "Usage: $0 \"<objective>\"" >&2
  echo "  Prefix empresa: or grafo: is stripped automatically." >&2
  exit 1
fi

if [[ -f "${HERMES_HOME}/config.env" ]]; then
  # shellcheck disable=SC1090
  source "${HERMES_HOME}/config.env"
fi

OBJECTIVE="${RAW}"
OBJECTIVE="${OBJECTIVE#empresa:}"
OBJECTIVE="${OBJECTIVE#grafo:}"
OBJECTIVE="${OBJECTIVE#Empresa:}"
OBJECTIVE="${OBJECTIVE#Grafo:}"
OBJECTIVE="$(printf '%s' "${OBJECTIVE}" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"

if [[ -z "${OBJECTIVE}" ]]; then
  echo "ERROR: empty objective after stripping empresa:/grafo: prefix" >&2
  exit 1
fi

if [[ -f "${ENV_FILE}" ]]; then
  # shellcheck disable=SC1090
  source "${ENV_FILE}"
fi

TOKEN="${GOALCHAIN_MA_TOKEN:-}"
if [[ -z "${TOKEN}" ]]; then
  echo "ERROR: GOALCHAIN_MA_TOKEN not set in ${ENV_FILE}" >&2
  exit 1
fi

RESPONSE="$(curl -sf -X POST "${URL}/v1/run" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$(python3 -c 'import json,sys; print(json.dumps({"objective":sys.argv[1],"source":"hermes","actor":"nico"}))' "${OBJECTIVE}")")"

if [[ "${REPLY_MODE}" -eq 1 ]]; then
  printf '%s' "${RESPONSE}" | python3 "${SCRIPT_DIR}/format-langgraph-reply.py"
else
  printf '%s' "${RESPONSE}" | python3 -m json.tool
fi
