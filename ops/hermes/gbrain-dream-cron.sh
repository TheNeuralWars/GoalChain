#!/usr/bin/env bash
# gbrain-dream-cron.sh — Install / uninstall / status for GBrain nightly dream.
# Idempotent. Verifies swap before running dream. Loads config.env for embedding keys.
# Usage:
#   bash ops/hermes/gbrain-dream-cron.sh install [--dry-run]
#   bash ops/hermes/gbrain-dream-cron.sh uninstall [--dry-run]
#   bash ops/hermes/gbrain-dream-cron.sh status
set -euo pipefail

HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
CONFIG_ENV="${HERMES_HOME}/config.env"
LOG_DIR="${HERMES_HOME}/logs"
LOG_FILE="${LOG_DIR}/gbrain-dream.log"
CRON_MARKER="# GBRAIN-DREAM-CRON"
CRON_EXPR="30 3 * * *"

DRY_RUN="${DRY_RUN:-false}"
for arg in "$@"; do
  case $arg in
    --dry-run) DRY_RUN=true ;;
  esac
done

log() { printf '[gbrain-dream-cron] %s\n' "$*"; }

has_swap() {
  swapon --show 2>/dev/null | grep -q '^/'; return
}

has_embedding_key() {
  if [[ -f "${CONFIG_ENV}" ]]; then
    # shellcheck disable=SC1090
    set -a; source "${CONFIG_ENV}" 2>/dev/null || true; set +a
  fi
  [[ -n "${ZEROENTROPY_API_KEY:-}" || -n "${OPENAI_API_KEY:-}" || -n "${VOYAGE_API_KEY:-}" ]]
}

# The cron command: verify swap + load config.env + run dream
cron_command() {
  printf '%s PATH=%s/.bun/bin:\\$PATH ' \
    "swap=\$(swapon --show 2>/dev/null | grep '^/')" "$HOME"
  printf '[ -n "\$swap" ] || { echo "gbrain-dream: no swap, skipping"; exit 0; }; '
  printf 'source %s >/dev/null 2>&1; ' "${CONFIG_ENV}"
  printf 'gbrain dream >> %s 2>&1\n' "${LOG_FILE}"
}

build_cron_line() {
  local cmd
  cmd="$(cron_command)"
  printf '%s\n%s %s %s\n' "${CRON_MARKER}" "${CRON_EXPR}" "${HOME}/.bun/bin/bash" "-c '${cmd}'"
}

do_install() {
  mkdir -p "${LOG_DIR}"

  if ! has_swap; then
    log "WARN: no swap detected. gbrain dream may OOM without it."
    log "Run: sudo bash ops/hermes/setup-swap.sh"
  fi

  if ! has_embedding_key; then
    log "WARN: no ZEROENTROPY_API_KEY / OPENAI_API_KEY in ${CONFIG_ENV}."
    log "Dream will run but embeddings won't refresh. Keyword search still works."
  fi

  local new_line
  new_line="$(build_cron_line)"

  if [[ "${DRY_RUN}" == "true" ]]; then
    log "[DRY-RUN] Would add cron line:"
    echo "  ${new_line}"
    log "[DRY-RUN] Dry-run complete. Remove --dry-run to apply."
    return 0
  fi

  # Remove any existing gbrain-dream entry, then append new one
  (crontab -l 2>/dev/null | grep -vF "${CRON_MARKER}" | grep -v '^$' || true) > /tmp/gbrain-cron.tmp
  echo "${new_line}" >> /tmp/gbrain-cron.tmp
  crontab /tmp/gbrain-cron.tmp
  rm -f /tmp/gbrain-cron.tmp

  log "Cron installed: ${CRON_EXPR} UTC daily"
  log "Log: ${LOG_FILE}"
}

do_uninstall() {
  if [[ "${DRY_RUN}" == "true" ]]; then
    log "[DRY-RUN] Would remove all gbrain-dream cron lines."
    return 0
  fi

  local before
  before="$(crontab -l 2>/dev/null | grep -cF "${CRON_MARKER}" || echo 0)"
  crontab -l 2>/dev/null | grep -vF "${CRON_MARKER}" | grep -v '^$' > /tmp/gbrain-cron.tmp || true
  crontab /tmp/gbrain-cron.tmp
  rm -f /tmp/gbrain-cron.tmp

  log "Removed ${before} gbrain-dream cron entry/entries."
}

do_status() {
  log "Swap:"
  if has_swap; then
    swapon --show
  else
    echo "  NOT AVAILABLE — run: sudo bash ops/hermes/setup-swap.sh"
  fi
  echo

  log "Memory:"
  free -h | head -3
  echo

  log "Embedding key:"
  if has_embedding_key; then
    echo "  PRESENT in ${CONFIG_ENV}"
  else
    echo "  ABSENT — keyword search works, embeddings need ZEROENTROPY_API_KEY or OPENAI_API_KEY"
  fi
  echo

  log "Cron:"
  if crontab -l 2>/dev/null | grep -qF "${CRON_MARKER}"; then
    crontab -l 2>/dev/null | grep "${CRON_MARKER}"
  else
    echo "  NOT installed — run: bash $0 install"
  fi
  echo

  log "Log file:"
  if [[ -f "${LOG_FILE}" ]]; then
    echo "  ${LOG_FILE} ($(wc -l < "${LOG_FILE}") lines)"
    echo "  Last 3 lines:"
    tail -3 "${LOG_FILE}" | sed 's/^/    /'
  else
    echo "  ${LOG_FILE} (not yet created)"
  fi
}

USAGE="Usage: $0 {install|uninstall|status} [--dry-run]"

ACTION="${1:-}"
case "${ACTION}" in
  install)   do_install ;;
  uninstall) do_uninstall ;;
  status)    do_status ;;
  *)         echo "${USAGE}" >&2; exit 1 ;;
esac