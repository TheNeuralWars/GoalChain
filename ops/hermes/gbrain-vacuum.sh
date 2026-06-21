#!/usr/bin/env bash
# gbrain-vacuum.sh — periodic PGLite VACUUM for ~/.gbrain/brain.pglite (issue #816).
# Idempotent: safe to run by hand, by cron, or by systemd --user timer.
# Concurrency: mkdir-based lock at ~/.gbrain/.locks/vacuum.lock (atomic on POSIX).
# Failure: returns non-zero on any gbrain error so systemd marks service failed.
# Logging: appends to ~/hermes/logs/gbrain-vacuum-YYYY-MM-DD.log (one file per UTC day).
# Required by: ops/hermes/install-gbrain-vacuum-timer.sh.
set -uo pipefail

# bun lives at ~/.bun/bin/ but it is NOT on default PATH. Required by gbrain.
export PATH="${HOME}/.bun/bin:${PATH}"

LOG_DIR="${HERMES_LOG_DIR:-${HOME}/hermes/logs}"
mkdir -p "${LOG_DIR}"
LOG_FILE="${LOG_DIR}/gbrain-vacuum-$(date -u +%F).log"

GBRAIN_HOME="${GBRAIN_HOME:-${HOME}/.gbrain}"
LOCK_DIR="${GBRAIN_HOME}/.locks/vacuum.lock"
mkdir -p "${GBRAIN_HOME}/.locks" 2>/dev/null || true

log() { printf '[%s] %s\n' "$(date -u '+%F %T UTC')" "$*" >>"${LOG_FILE}"; }

# ---- mkdir-based flock ----
if ! mkdir "${LOCK_DIR}" 2>/dev/null; then
  log "SKIP: vacuum lock already held at ${LOCK_DIR}"
  exit 0
fi
trap 'rc=$?; rmdir "${LOCK_DIR}" 2>/dev/null || true; exit ${rc}' EXIT INT TERM
log "START pid=$$ host=$(hostname) brain=${GBRAIN_HOME}"

# ---- size before ----
BEFORE=$(du -sm "${GBRAIN_HOME}/brain.pglite" 2>/dev/null | awk '{print $1}' || echo "?")
log "size_before_mb=${BEFORE}"

# ---- vacuum with the fallback chain the issue mandated ----
rc=0
if command -v gbrain >/dev/null 2>&1; then
  log "RUN: gbrain vacuum --analyze"
  if ! gbrain vacuum --analyze 2>&1 | tee -a "${LOG_FILE}"; then
    log "RUN: gbrain vacuum (fallback, no --analyze)"
    if ! gbrain vacuum 2>&1 | tee -a "${LOG_FILE}"; then
      log "WARN: no vacuum command — gbrain build lacks a 'vacuum' subcommand; see gbrain --help"
      rc=1
    fi
  fi
else
  log "ERROR: gbrain binary not found on PATH"
  rc=2
fi

# ---- size after ----
AFTER=$(du -sm "${GBRAIN_HOME}/brain.pglite" 2>/dev/null | awk '{print $1}' || echo "?")
log "size_after_mb=${AFTER}"
log "END rc=${rc}"
exit "${rc}"
