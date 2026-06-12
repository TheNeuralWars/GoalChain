#!/usr/bin/env bash
# Mirror Grok CLI config from VPS → Mac (same auth / model / skills as the server instance).
#
# This is the Grok equivalent of install-hermes-mirror-mac.sh.
# Use it when you want your local Grok (this Mac) to have the same credentials
# and configuration as the Grok CLI running on the GoalChain VPS.
#
# Usage:
#   bash ops/hermes/install-grok-mirror-mac.sh
#   GOALCHAIN_SSH=ubuntu@89.168.20.135 bash ops/hermes/install-grok-mirror-mac.sh
#
# What it syncs (safe subset):
#   - auth.json (OIDC / xAI OAuth)
#   - config.toml
#   - skills/ (optional, use --no-skills to skip)
#
# What it NEVER touches:
#   - downloads/ (platform-specific binaries)
#   - sessions/, logs/, active_sessions*, models_cache.json
#   - Anything under ~/.hermes/grok-build/ on the server side
#
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SSH_HOST="${GOALCHAIN_SSH:-ubuntu@89.168.20.135}"
GROK_HOME="${GROK_HOME:-$HOME/.grok}"
REMOTE_GROK="${REMOTE_GROK:-/home/ubuntu/.grok}"

SYNC_AUTH=true
SYNC_CONFIG=true
SYNC_SKILLS=true

for arg in "$@"; do
  case "${arg}" in
    --auth-only) SYNC_CONFIG=false; SYNC_SKILLS=false ;;
    --config-only) SYNC_AUTH=false; SYNC_SKILLS=false ;;
    --no-skills) SYNC_SKILLS=false ;;
    --no-auth) SYNC_AUTH=false ;;
    --no-config) SYNC_CONFIG=false ;;
    -h|--help)
      echo "Usage: $0 [--auth-only] [--config-only] [--no-skills] [--no-auth] [--no-config]"
      echo ""
      echo "Examples:"
      echo "  bash ops/hermes/install-grok-mirror-mac.sh"
      echo "  bash ops/hermes/install-grok-mirror-mac.sh --auth-only"
      exit 0
      ;;
  esac
done

log() { printf '[grok-mirror] %s\n' "$*"; }

# Safety: ensure we have SSH access
if ! ssh -o BatchMode=yes -o ConnectTimeout=8 "${SSH_HOST}" 'echo ssh-ok' >/dev/null 2>&1; then
  log "ERROR: Cannot SSH to ${SSH_HOST}. Check your SSH config / keys."
  exit 1
fi

STAMP="$(date +%Y%m%d%H%M%S)"
BACKUP="${GROK_HOME}/backups/pre-mirror-${STAMP}"
mkdir -p "${BACKUP}"

backup_local() {
  mkdir -p "${BACKUP}"
  for f in auth.json config.toml; do
    [[ -f "${GROK_HOME}/${f}" ]] && cp -a "${GROK_HOME}/${f}" "${BACKUP}/${f}"
  done
  if [[ "${SYNC_SKILLS}" == true ]] && [[ -d "${GROK_HOME}/skills" ]]; then
    cp -a "${GROK_HOME}/skills" "${BACKUP}/skills" 2>/dev/null || true
  fi
  log "local backup created at ${BACKUP}"
}

pull_remote() {
  local staging="${GROK_HOME}/mirror-staging-${STAMP}"
  mkdir -p "${staging}"

  log "pulling from ${SSH_HOST}:${REMOTE_GROK}"

  # Always pull auth + config (small and critical)
  scp -o BatchMode=yes -q \
    "${SSH_HOST}:${REMOTE_GROK}/auth.json" \
    "${SSH_HOST}:${REMOTE_GROK}/config.toml" \
    "${staging}/" 2>/dev/null || {
      log "ERROR: failed to scp core files from ${SSH_HOST}"
      exit 1
    }

  if [[ "${SYNC_SKILLS}" == true ]]; then
    log "pulling skills/ (this may take a moment)..."
    mkdir -p "${staging}/skills"
    rsync -az --delete \
      -e "ssh -o BatchMode=yes" \
      "${SSH_HOST}:${REMOTE_GROK}/skills/" \
      "${staging}/skills/" 2>/dev/null || log "WARN: skills rsync had issues (continuing)"
  fi

  echo "${staging}"
}

merge_files() {
  local staging="$1"

  # auth.json — replace entirely (it contains the live OAuth tokens)
  if [[ "${SYNC_AUTH}" == true ]] && [[ -f "${staging}/auth.json" ]]; then
    cp -f "${staging}/auth.json" "${GROK_HOME}/auth.json"
    chmod 600 "${GROK_HOME}/auth.json"
    log "auth.json updated from server"
  fi

  # config.toml — replace (server is often the source of truth for model/provider)
  if [[ "${SYNC_CONFIG}" == true ]] && [[ -f "${staging}/config.toml" ]]; then
    cp -f "${staging}/config.toml" "${GROK_HOME}/config.toml"
    log "config.toml updated from server"
  fi

  # skills/ — rsync into place (additive, won't delete local-only skills unless --delete is added later)
  if [[ "${SYNC_SKILLS}" == true ]] && [[ -d "${staging}/skills" ]]; then
    mkdir -p "${GROK_HOME}/skills"
    rsync -a "${staging}/skills/" "${GROK_HOME}/skills/"
    log "skills/ synced from server"
  fi
}

cleanup() {
  rm -rf "${GROK_HOME}/mirror-staging-${STAMP}" 2>/dev/null || true
}

main() {
  log "Grok mirror: VPS → Mac (${SSH_HOST})"
  backup_local
  local staging
  staging="$(pull_remote)"
  merge_files "${staging}"
  cleanup
  log "done. Restart any running grok sessions for config changes to take effect."
}

main "$@"
