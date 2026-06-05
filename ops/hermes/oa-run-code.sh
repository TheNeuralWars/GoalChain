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

while [[ $# -gt 0 ]]; do
  case "$1" in
    --workdir) WORKDIR="$2"; shift 2 ;;
    --prompt-file) PROMPT_FILE="$2"; shift 2 ;;
    --tier) FCC_TIER="$2"; shift 2 ;;
    --log) LOG_FILE="$2"; shift 2 ;;
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
  return 1
}

run_fcc() {
  local fcc_bin="$1"
  local tier
  tier="$(resolve_tier)"
  log_line "code_engine=fcc cmd=${fcc_bin} tier=${tier} (FCC maps to MODEL_$(printf '%s' "${tier}" | tr '[:lower:]' '[:upper:]') in ~/.fcc/.env)"
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
    timeout "${TIMEOUT_SEC}" opencode run --dangerously-skip-permissions --model "${model}" "$(cat "${PROMPT_FILE}")"
  )
}

case "${OA_CODE_ENGINE}" in
  fcc)
    fcc_bin="$(resolve_fcc || true)"
    [[ -n "${fcc_bin}" ]] || { log_line "ERROR: FCC requested but fcc-claude not found"; exit 127; }
    run_fcc "${fcc_bin}"
    ;;
  opencode)
    run_opencode
    ;;
  auto|*)
    if fcc_bin="$(resolve_fcc)"; then
      run_fcc "${fcc_bin}"
    else
      run_opencode
    fi
    ;;
esac
