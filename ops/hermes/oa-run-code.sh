#!/usr/bin/env bash
# Run GoalChain code-agent tasks (Hermes CEO engine).
set -euo pipefail

usage() {
  echo "Usage: $0 --workdir <repo> --prompt-file <file> [--log <file>]"
  exit 1
}

WORKDIR=""
PROMPT_FILE=""
LOG_FILE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --workdir) WORKDIR="$2"; shift 2 ;;
    --prompt-file) PROMPT_FILE="$2"; shift 2 ;;
    --log) LOG_FILE="$2"; shift 2 ;;
    -h|--help) usage ;;
    *) shift ;; # Skip any other obsolete arguments like --tier or --profile
  esac
done

[[ -n "${WORKDIR}" && -n "${PROMPT_FILE}" ]] || usage
[[ -f "${PROMPT_FILE}" ]] || { echo "ERROR: prompt file not found: ${PROMPT_FILE}"; exit 1; }

HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
if [[ -f "${HERMES_HOME}/config.env" ]]; then
  # shellcheck disable=SC1090
  source "${HERMES_HOME}/config.env"
fi

export PATH="${HOME}/.local/bin:${HOME}/.npm-global/bin:/usr/local/bin:${PATH}"

log_line() {
  local msg="$1"
  if [[ -n "${LOG_FILE}" ]]; then
    printf '[%s] %s\n' "$(date -u '+%F %T UTC')" "${msg}" >> "${LOG_FILE}"
  fi
  printf '%s\n' "${msg}"
}

run_hermes() {
  local profile="hermes-ceo"
  log_line "code_engine=hermes profile=${profile} (waiting for concurrency lock...)"
  
  local acquired=0
  local lock_num=0
  while [[ ${acquired} -eq 0 ]]; do
    for i in {1..4}; do
      exec 9>"/home/ubuntu/hermes/oa/worker_${i}.lock"
      if flock -n 9; then
        acquired=1
        lock_num=$i
        break
      else
        exec 9>&-
      fi
    done
    if [[ ${acquired} -eq 0 ]]; then
      sleep 5
    fi
  done

  log_line "code_engine=hermes profile=${profile} (lock ${lock_num} acquired, running task)"
  (
    cd "${WORKDIR}"
    /home/ubuntu/.hermes/hermes-agent/venv/bin/python -m hermes_cli.main --profile "${profile}" --oneshot "$(cat "${PROMPT_FILE}")" --yolo --accept-hooks
  )
  exec 9>&-
}

run_hermes
