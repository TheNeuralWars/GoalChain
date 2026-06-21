#!/usr/bin/env bash
# sync-gbrain.sh — reproducible VPS/Mac gbrain sync for GoalChain.
#
# Idempotent. Each invocation runs ONLY on the local host (no remote shell-out
# because we cannot SSH from here to Nico's Mac without explicit credentials).
# The flag selects which LOCAL host context we describe ourselves as:
#
#   bash ops/hermes/sync-gbrain.sh vps                # sync the VPS (this host)
#   bash ops/hermes/sync-gbrain.sh mac-cursor         # sync this Mac's Cursor brain
#   bash ops/hermes/sync-gbrain.sh mac-antigravity    # sync this Mac's Antigravity brain
#   bash ops/hermes/sync-gbrain.sh all                # every brain reachable from here
#
# Detection uses `uname -s` and the hostname. On a VPS only `vps` is reachable
# locally (the `mac-*` flags print a skipping NOTICE and return 0 — we never
# attempt cross-host imports). On a Mac, Cursor and Antigravity share the same
# ~/.gbrain/ PGLite instance, so `all` runs each branch once (gbrain import is
# idempotent). Run it after `git pull` on each host to reconcile the brain
# against the canonical `ai_context/`, `docs/intake/`, `docs/proposals/` dirs.
#
# Does NOT touch ~/.gbrain/brain.pglite directly. Uses `gbrain import` only.
#
# Exit codes:
#   0  success (or one of the requested targets was a non-local host — we skip + log)
#   1  pre-flight failure (bun/gbrain missing) — message goes to stderr.
#   2  git pull --ff-only failed (local repo diverged from origin).
set -euo pipefail

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
REPO="${GOALCHAIN_REPO_PATH:-$HERMES_HOME/workspace/GoalChain}"
CONFIG_ENV="${HERMES_HOME}/config.env"
LOGS_DIR="${HERMES_LOGS_DIR:-$HERMES_HOME/logs}"
SUBDIRS=(ai_context docs/intake docs/proposals)

# Path bootstrap mirrored from issue #813 (vps uses ubuntu paths; mac carries
# .bun/bin and ~/.local/bin). Kept verbatim per requirement.
export PATH="$HOME/.bun/bin:$HOME/.local/bin:$HOME/bin:$HOME/.npm-global/bin:$HOME/.grok/bin:$HOME/.cargo/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/snap/bin:/opt/homebrew/bin:/opt/homebrew/sbin"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
log()  { printf '[gbrain-sync] %s\n' "$*"; }
warn() { printf '[gbrain-sync] WARN: %s\n' "$*" >&2; }
err()  { printf '[gbrain-sync] ERROR: %s\n' "$*" >&2; }

detect_host() {
  case "$(uname -s)" in
    Linux)   printf 'vps' ;;
    Darwin)  printf 'mac' ;;
    *)       printf 'unknown' ;;
  esac
}

preflight() {
  local missing=0
  if ! command -v bun >/dev/null 2>&1 && ! [[ -x "$HOME/.bun/bin/bun" ]]; then
    err "bun not on PATH (install with bash ops/hermes/install-gbrain-hermes.sh)"
    export PATH="$HOME/.bun/bin:$PATH"
    missing=1
  fi
  if ! command -v gbrain >/dev/null 2>&1; then
    err "gbrain not on PATH (install with bash ops/hermes/install-gbrain-hermes.sh)"
    missing=1
  fi
  [[ "$missing" -eq 0 ]] || exit 1
  # Re-export PATH in case /etc/profile or shell init shadowed it.
  export PATH="$HOME/.bun/bin:$PATH"
  command -v bun    >/dev/null && log "bun: $(command -v bun)"
  command -v gbrain >/dev/null && log "gbrain: $(command -v gbrain)"
}

load_keys() {
  if [[ -f "${CONFIG_ENV}" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "${CONFIG_ENV}" 2>/dev/null || true
    set +a
    has_embed=0
    [[ -n "${OPENAI_API_KEY:-}" || -n "${ZEROENTROPY_API_KEY:-}" || -n "${VOYAGE_API_KEY:-}" ]] \
      && has_embed=1
    log "config.env: loaded (embedding key detected: $has_embed)"
  else
    has_embed=0
    [[ -n "${OPENAI_API_KEY:-${ZEROENTROPY_API_KEY:-${VOYAGE_API_KEY:-}}}" ]] && has_embed=1
    log "config.env: not found at ${CONFIG_ENV} (embedding key in env: $has_embed)"
  fi
}

# ---------------------------------------------------------------------------
# Core per-host sync
# ---------------------------------------------------------------------------
sync_one_host() {
  local label="$1"  # vps | mac-cursor | mac-antigravity
  local real; real="$(detect_host)"
  log "== sync target: ${label} (detected host: ${real}) =="

  # Skip guards: a non-local brain cannot be reached from this shell.
  case "${label}:${real}" in
    mac-*:mac)
      : # we are on a Mac — fine, run the local brain
      ;;
    vps:vps)
      : # we are on the VPS — fine
      ;;
    vps:mac)
      warn "${label} requested on a Mac host (this host is Mac). Skipping — run on the VPS directly."
      return 0
      ;;
    mac-*:vps)
      warn "${label} requested on a VPS (this host is VPS). Skipping — run on the Mac directly."
      return 0
      ;;
    *)
      warn "Unknown host combination (label=${label}, detected=${real}). Skipping."
      return 0
      ;;
  esac

  ensure_repo || { err "repo unreachable: ${REPO}"; return 1; }
  ensure_clean_pull || { err "git pull --ff-only failed for ${REPO}"; return 2; }

  local imported=0 skipped=0 failed=0
  local sub
  for sub in "${SUBDIRS[@]}"; do
    if [[ -d "${REPO}/${sub}" ]]; then
      if gbrain import "${REPO}/${sub}" --no-embed >/dev/null 2>&1; then
        log "import OK: ${sub}"
        imported=$((imported + 1))
      else
        log "import FAIL (logged to file): ${sub}"
        gbrain import "${REPO}/${sub}" --no-embed 2>&1 | tail -2 >> "${LOG_FILE}" || true
        failed=$((failed + 1))
      fi
    else
      log "skip (missing dir): ${sub}"
      skipped=$((skipped + 1))
    fi
  done

  if [[ "${has_embed}" -eq 1 ]]; then
    log "embedding stale pages..."
    if gbrain embed --stale 2>&1 | tail -5 >> "${LOG_FILE}"; then
      log "embed OK"
    else
      warn "embed step failed (will retry on next sync). See ${LOG_FILE}."
    fi
  else
    log "embed: skipped (no OPENAI_API_KEY / ZEROENTROPY_API_KEY / VOYAGE_API_KEY)"
  fi

  # Sentinel mtime update for the `Validate` clause of issue #813.
  touch "${SENTINEL}"
  log "sentinel: $(date -Iseconds) ${SENTINEL}"

  printf '[gbrain-sync] %s summary: imported=%d skipped=%d failed=%d embed=%s\n' \
    "${label}" "${imported}" "${skipped}" "${failed}" \
    "$([[ "${has_embed}" -eq 1 ]] && echo ran || echo skipped)" \
    >> "${LOG_FILE}"
}

ensure_repo() {
  if [[ ! -d "${REPO}/.git" ]]; then
    err "not a git repo: ${REPO}"
    return 1
  fi
  return 0
}

ensure_clean_pull() {
  log "cd ${REPO} && git pull --ff-only"
  if ! (cd "${REPO}" && git pull --ff-only) >> "${LOG_FILE}" 2>&1; then
    err "git pull --ff-only failed at ${REPO} (likely diverged local history — resolve manually)."
    return 2
  fi
  log "git pull OK"
  return 0
}

# ---------------------------------------------------------------------------
# CLI dispatch
# ---------------------------------------------------------------------------
init_globals() {
  mkdir -p "${LOGS_DIR}"
  local date_utc; date_utc="$(date -u +%Y-%m-%d)"
  # LOG_FILE and SENTINEL are exported by name via `declare -g`.
  declare -g LOG_FILE="${LOGS_DIR}/gbrain-sync-${HOSTNAME:-host}-${date_utc}.log"
  declare -g SENTINEL="${LOGS_DIR}/gbrain-sync-${HOSTNAME:-host}.last-update-check"
  : > "${LOG_FILE}"
  log "==== start (script revision $(date -u +%Y-%m-%dT%H:%M:%SZ), ${HOSTNAME:-host}) ===="
  log "repo: ${REPO}"
}

dispatch() {
  case "$1" in
    vps)             sync_one_host vps ;;
    mac-cursor)      sync_one_host mac-cursor ;;
    mac-antigravity) sync_one_host mac-antigravity ;;
    all)
      local real; real="$(detect_host)"
      case "${real}" in
        vps) sync_one_host vps ;;
        mac)
          sync_one_host mac-cursor
          sync_one_host mac-antigravity
          ;;
        *)
          warn "all requested but host detection failed (${real}); running nothing."
          ;;
      esac
      ;;
    -h|--help|help|"")
      usage
      ;;
    *)
      err "unknown target: $1"
      usage
      exit 64
      ;;
  esac
}

usage() {
  cat <<'EOF'
ops/hermes/sync-gbrain.sh — idempotent local-brain sync

USAGE
  bash ops/hermes/sync-gbrain.sh <target>

TARGETS
  vps                sync the local VPS brain (~/.gbrain) from ~/hermes/workspace/GoalChain
  mac-cursor         sync the local Mac brain (~/.gbrain) — Cursor's view
  mac-antigravity    sync the local Mac brain (~/.gbrain) — Antigravity's view
                     (Cursor + Antigravity share ~/.gbrain on macOS; both work
                     on the same PGLite, so this just re-runs the import.)
  all                every brain reachable from this host (vps on VPS; mac-cursor
                     + mac-antigravity on Mac)

OUTPUT
  ~/hermes/logs/gbrain-sync-<host>-YYYY-MM-DD.log   per-run log
  ~/hermes/logs/gbrain-sync-<host>.last-update-check sentinel mtime

Note: this script never SSHs into other hosts. Run it on each host you want to
sync. See ai_context/AGENT_ORCHESTRATION.md §"GBrain ritual".

EOF
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
preflight
init_globals
load_keys

if [[ $# -lt 1 ]]; then
  usage
  exit 64
fi

dispatch "$1"
log "==== done (exit 0) ===="
exit 0
