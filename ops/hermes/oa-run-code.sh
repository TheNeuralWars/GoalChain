#!/usr/bin/env bash
# Run GoalChain code-agent tasks (Free Claude Code preferred, OpenCode fallback).
set -euo pipefail

usage() {
  echo "Usage: $0 --workdir <repo> --prompt-file <file> [--tier opus|sonnet|haiku] [--log <file>]"
  exit 1
}

WORKDIR=""
PROMPT_FILE=""
LOG_FILE=""
FCC_TIER="${OA_FCC_TIER:-}"
PROFILE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --workdir) WORKDIR="$2"; shift 2 ;;
    --prompt-file) PROMPT_FILE="$2"; shift 2 ;;
    --tier) FCC_TIER="$2"; shift 2 ;;
    --log) LOG_FILE="$2"; shift 2 ;;
    --profile) PROFILE="$2"; shift 2 ;;
    -h|--help) usage ;;
    *) echo "Unknown arg: $1"; usage ;;
  esac
done

[[ -n "${WORKDIR}" && -n "${PROMPT_FILE}" ]] || usage
[[ -f "${PROMPT_FILE}" ]] || { echo "ERROR: prompt file not found: ${PROMPT_FILE}"; exit 1; }

HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [[ -f "${HERMES_HOME}/config.env" ]]; then
  # shellcheck disable=SC1090
  source "${HERMES_HOME}/config.env"
fi

resolve_tier() {
  local t="${FCC_TIER:-${OA_FCC_TIER:-}}"
  case "${t}" in
    opus|sonnet|haiku) printf '%s' "${t}"; return ;;
  esac
  if [[ -x "${SCRIPT_DIR}/fcc-resolve-tier.sh" ]]; then
    bash "${SCRIPT_DIR}/fcc-resolve-tier.sh" --priority "${OA_TASK_PRIORITY:-P1}"
    return
  fi
  printf '%s' "sonnet"
}

OA_CODE_ENGINE="${OA_CODE_ENGINE:-auto}"
OA_CODE_CMD="${OA_CODE_CMD:-}"
OA_CODE_MODEL="opencode/nemotron-3-ultra-free"
OA_MODEL="${OA_MODEL:-xai/grok-4.3}"
TIMEOUT_SEC="${OA_CODE_TIMEOUT_SEC:-3600}"

export PATH="${HOME}/.local/bin:${HOME}/.npm-global/bin:/usr/local/bin:${PATH}"

log_line() {
  local msg="$1"
  if [[ -n "${LOG_FILE}" ]]; then
    printf '[%s] %s\n' "$(date -u '+%F %T UTC')" "${msg}" >> "${LOG_FILE}"
  fi
  printf '%s\n' "${msg}"
}

# Detect rate limit in response
is_rate_limited() {
  local response="$1"
  echo "${response}" | grep -q -i "rate_limit\|HTTP 429\|Too Many Requests\|rate limit" && return 0 || return 1
}

# Call FCC REST API with retry (no lock - let NIM rate limit naturally)
call_fcc_rest_api() {
  local prompt_content="$1"
  local model_id="$2"
  local max_retries=1
  local retry=0
  local wait=2

  while [[ ${retry} -le ${max_retries} ]]; do
    local response
    # Use 30s timeout for FCC REST API call (fail fast to Hermes Proxy)
    response="$(timeout 30 curl -s -X POST "http://localhost:${PORT:-8082}/v1/messages" \
      -H "Content-Type: application/json" \
      -H "x-api-key: fcc-local" \
      -d "$(python3 -c '
import json, sys
data = {
    "model": sys.argv[1],
    "max_tokens": 8192,
    "messages": [{"role": "user", "content": sys.argv[2]}]
}
print(json.dumps(data))
' "${model_id}" "${prompt_content}")" 2>&1)"

    local curl_exit=$?
    if [[ ${curl_exit} -eq 124 ]]; then
      log_line "FCC REST API timeout (attempt $((retry+1))/${max_retries})"
      [[ ${retry} -lt ${max_retries} ]] && sleep ${wait}
      retry=$((retry + 1))
      wait=$((wait * 2))
      continue
    elif [[ ${curl_exit} -ne 0 ]]; then
      log_line "FCC REST API curl error: ${curl_exit}"
      [[ ${retry} -lt ${max_retries} ]] && sleep ${wait}
      retry=$((retry + 1))
      wait=$((wait * 2))
      continue
    fi

    if is_rate_limited "${response}"; then
      log_line "FCC rate limited (attempt $((retry+1))/${max_retries}), falling back to Hermes Proxy"
      return 1
    fi

    # Parse streaming response and extract text content
    echo "${response}" | python3 -c '
import sys, json
full_text = ""
for line in sys.stdin:
    line = line.strip()
    if line.startswith("data: "):
        try:
            data = json.loads(line[6:])
            if data.get("type") == "content_block_delta":
                delta = data.get("delta", {})
                if delta.get("type") == "text_delta":
                    full_text += delta.get("text", "")
        except:
            pass
print(full_text, end="")
'
    return ${PIPESTATUS[0]}
  done

  log_line "FCC rate limit/timeout exceeded after ${max_retries} retries"
  return 1
}

# Call OpenRouter directly for Nemotron 3 Ultra free
call_openrouter() {
  local prompt_content="$1"
  local model="nvidia/nemotron-3-ultra:free"
  local api_key="${OPENROUTER_API_KEY:-}"

  [[ -n "${api_key}" ]] || { log_line "ERROR: OPENROUTER_API_KEY not set"; return 1; }

  local response
  response="$(curl -s -X POST "https://openrouter.ai/api/v1/chat/completions" \
    -H "Authorization: Bearer ${api_key}" \
    -H "Content-Type: application/json" \
    -H "HTTP-Referer: https://goalchain.io" \
    -H "X-Title: GoalChain Workers" \
    -d "$(python3 -c '
import json, sys
data = {
    "model": sys.argv[1],
    "max_tokens": 8192,
    "messages": [{"role": "user", "content": sys.argv[2]}],
    "stream": false
}
print(json.dumps(data))
' "${model}" "${prompt_content}")" 2>&1)"

  echo "${response}" | python3 -c '
import sys, json
try:
    data = json.load(sys.stdin)
    if "choices" in data and data["choices"]:
        content = data["choices"][0].get("message", {}).get("content", "")
        print(content, end="")
    elif "error" in data:
        print(f"OpenRouter error: {data['error']}", file=sys.stderr)
        sys.exit(1)
except Exception as e:
    print(f"Parse error: {e}", file=sys.stderr)
    sys.exit(1)
'
  return ${PIPESTATUS[0]}
}

# Call Hermes Proxy (port 8642) for Nemotron 3 Ultra free via Nous
call_hermes_proxy() {
  local prompt_content="$1"
  local model="hermes-agent"
  local api_key="11596a45bdfc22d3c4d6c7d6dcd59bb043818ed69236988389110ec87e5d4b2e"

  local response
  response="$(timeout 120 curl -s -X POST "http://localhost:8642/v1/chat/completions" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${api_key}" \
    -d "$(python3 -c '
import json, sys
data = {
    "model": sys.argv[1],
    "max_tokens": 8192,
    "messages": [{"role": "user", "content": sys.argv[2]}],
    "stream": false
}
print(json.dumps(data))
' "${model}" "${prompt_content}")" 2>&1)"

  local curl_exit=$?
  if [[ ${curl_exit} -eq 124 ]]; then
    log_line "Hermes Proxy timeout"
    return 124
  elif [[ ${curl_exit} -ne 0 ]]; then
    log_line "Hermes Proxy curl error: ${curl_exit}"
    return 1
  fi

  echo "${response}" | python3 -c '
import sys, json
try:
    data = json.load(sys.stdin)
    if "choices" in data and data["choices"]:
        content = data["choices"][0].get("message", {}).get("content", "")
        print(content, end="")
    elif "error" in data:
        print(f"Hermes Proxy error: {data['error']}", file=sys.stderr)
        sys.exit(1)
except Exception as e:
    print(f"Parse error: {e}", file=sys.stderr)
    sys.exit(1)
'
  return ${PIPESTATUS[0]}
}

resolve_fcc() {
  if [[ -n "${OA_CODE_CMD}" ]]; then
    printf '%s' "${OA_CODE_CMD}"
    return 0
  fi
  if command -v fcc-claude >/dev/null 2>&1; then
    command -v fcc-claude
    return 0
  fi
  if [[ -x "${HOME}/.local/bin/fcc-claude" ]]; then
    printf '%s' "${HOME}/.local/bin/fcc-claude"
    return 0
  fi
  log_line "DEBUG resolve_fcc: checking ss for :${PORT:-8082}"
  if ss -tlnp 2>/dev/null | grep -q ":${PORT:-8082}"; then
    log_line "DEBUG resolve_fcc: FCC server found"
    printf '%s' "rest-api"
    return 0
  fi
  log_line "DEBUG resolve_fcc: FCC server NOT found"
  return 1
}

run_fcc() {
  local fcc_bin="$1"
  local tier
  tier="$(resolve_tier)"
  log_line "code_engine=fcc tier=${tier} (using FCC server REST API)"

  # Map tier to model ID from FCC server (all map to NIM Nemotron 3 Super)
  local model_id
  case "${tier}" in
    opus) model_id="anthropic/nvidia_nim/nvidia/nemotron-3-super-120b-a12b" ;;
    sonnet) model_id="anthropic/nvidia_nim/nvidia/nemotron-3-super-120b-a12b" ;;
    haiku) model_id="anthropic/nvidia_nim/nvidia/nemotron-3-super-120b-a12b" ;;
    *) model_id="anthropic/nvidia_nim/nvidia/nemotron-3-super-120b-a12b" ;;
  esac

  local prompt_content
  prompt_content="$(cat "${PROMPT_FILE}")"

  # If fcc_bin is "rest-api" or CLI not found, use REST API with Hermes Proxy fallback
  if [[ "${fcc_bin}" == "rest-api" ]] || ! command -v "${fcc_bin}" >/dev/null 2>&1; then
    log_line "Using FCC REST API with rate limit retry + Hermes Proxy fallback"
    if ! call_fcc_rest_api "${prompt_content}" "${model_id}"; then
      log_line "FCC REST API failed, falling back to Hermes Proxy (Nemotron 3 Ultra free via Nous)"
      if ! call_hermes_proxy "${prompt_content}"; then
        log_line "Hermes Proxy failed, falling back to OpenRouter (Nemotron 3 Ultra free)"
        call_openrouter "${prompt_content}"
        return $?
      fi
      return 0
    fi
    return 0
  fi

  # Fallback to CLI if available
  log_line "code_engine=fcc cmd=${fcc_bin} tier=${tier} (FCC CLI)"
  (
    cd "${WORKDIR}"
    timeout "${TIMEOUT_SEC}" "${fcc_bin}" --model "${tier}" -p "$(cat "${PROMPT_FILE}")" </dev/null
  )
}

run_opencode() {
  local model="${OA_CODE_MODEL:-${OA_MODEL}}"
  if ! command -v opencode >/dev/null 2>&1; then
    log_line "ERROR: opencode not in PATH and FCC unavailable"
    return 127
  fi
  log_line "code_engine=opencode model=${model}"
  (
    cd "${WORKDIR}"
    timeout "${TIMEOUT_SEC}" xvfb-run --auto-servernum opencode run --no-sandbox --dangerously-skip-permissions --model "${model}" "$(cat "${PROMPT_FILE}")"
  )
}

run_hermes() {
  local profile="${PROFILE:-default}"
  log_line "code_engine=hermes profile=${profile}"
  (
    cd "${WORKDIR}"
    /home/ubuntu/.hermes/hermes-agent/venv/bin/python -m hermes_cli.main --profile "${profile}" --oneshot "$(cat "${PROMPT_FILE}")" --yolo --accept-hooks
  )
}

case "${OA_CODE_ENGINE}" in
  hermes)
    run_hermes
    ;;
  fcc)
    fcc_bin="$(resolve_fcc || true)"
    [[ -n "${fcc_bin}" ]] || { log_line "ERROR: FCC requested but fcc-claude not found"; exit 127; }
    run_fcc "${fcc_bin}"
    ;;
  opencode)
    run_opencode
    ;;
  auto|*)
    if [[ "${OA_CODE_ENGINE}" == "hermes" ]]; then
      run_hermes
    elif fcc_bin="$(resolve_fcc)"; then
      run_fcc "${fcc_bin}"
    else
      run_opencode
    fi
    ;;
esac
