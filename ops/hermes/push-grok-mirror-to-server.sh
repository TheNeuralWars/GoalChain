#!/usr/bin/env bash
# Push Mac Grok CLI config → VPS (inverse of install-grok-mirror-mac.sh).
#
# Use this when you have updated auth, config, or skills on your Mac and want
# the Grok CLI running on the GoalChain VPS (178.105.148.109) to stay in sync.
#
# This is the Grok equivalent of push-hermes-mirror-to-server.sh.
#
# Usage:
#   bash ops/hermes/push-grok-mirror-to-server.sh
#   bash ops/hermes/push-grok-mirror-to-server.sh --auth-only
#   bash ops/hermes/push-grok-mirror-to-server.sh --no-skills
#
# What it syncs:
#   - auth.json (fresh OAuth tokens from Mac)
#   - config.toml
#   - skills/ (optional)
#
# What it NEVER touches on the server:
#   - downloads/ (Linux binaries)
#   - sessions/, logs/, active_sessions*, models_cache.json
#   - ~/.hermes/grok-build/ (your custom experimental setup)
#   - Any other custom files you have under ~/.hermes/ related to grok-build
#
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SSH_HOST="${GOALCHAIN_SSH:-goalchain@178.105.148.109}"
GROK_HOME="${GROK_HOME:-$HOME/.grok}"
REMOTE_GROK="${REMOTE_GROK:-/home/goalchain/.grok}"
REMOTE_OPS="${REMOTE_GROK}/../hermes/workspace/GoalChain/ops/hermes"  # not used directly

PUSH_AUTH=true
PUSH_CONFIG=true
PUSH_SKILLS=true

for arg in "$@"; do
  case "${arg}" in
    --auth-only) PUSH_CONFIG=false; PUSH_SKILLS=false ;;
    --config-only) PUSH_AUTH=false; PUSH_SKILLS=false ;;
    --no-skills) PUSH_SKILLS=false ;;
    --no-auth) PUSH_AUTH=false ;;
    --no-config) PUSH_CONFIG=false ;;
    -h|--help)
      echo "Usage: $0 [--auth-only] [--config-only] [--no-skills] [--no-auth] [--no-config]"
      exit 0
      ;;
  esac
done

log() { printf '[grok-push] %s\n' "$*"; }

# Pre-flight SSH check
if ! ssh -o BatchMode=yes -o ConnectTimeout=8 "${SSH_HOST}" 'echo ssh-ok' >/dev/null 2>&1; then
  log "ERROR: Cannot SSH to ${SSH_HOST}"
  exit 1
fi

[[ -f "${GROK_HOME}/auth.json" ]] || { log "ERROR: ${GROK_HOME}/auth.json not found. Run grok login first."; exit 1; }

STAMP="$(date +%Y%m%d%H%M%S)"
STAGING="${GROK_HOME}/push-staging-${STAMP}"
mkdir -p "${STAGING}"

backup_remote() {
  log "creating remote backup on ${SSH_HOST}"
  ssh -o BatchMode=yes "${SSH_HOST}" "
    mkdir -p ${REMOTE_GROK}/backups &&
    cp -a ${REMOTE_GROK}/auth.json ${REMOTE_GROK}/backups/auth.pre-push-${STAMP} 2>/dev/null || true &&
    cp -a ${REMOTE_GROK}/config.toml ${REMOTE_GROK}/backups/config.pre-push-${STAMP} 2>/dev/null || true
  " 2>/dev/null || log "WARN: remote backup step had issues (continuing)"
}

prepare_push() {
  # We copy the files we want to push into a staging dir on the Mac
  [[ "${PUSH_AUTH}" == true ]] && cp -f "${GROK_HOME}/auth.json" "${STAGING}/auth.json"
  [[ "${PUSH_CONFIG}" == true ]] && cp -f "${GROK_HOME}/config.toml" "${STAGING}/config.toml"

  if [[ "${PUSH_SKILLS}" == true ]] && [[ -d "${GROK_HOME}/skills" ]]; then
    mkdir -p "${STAGING}/skills"
    rsync -a "${GROK_HOME}/skills/" "${STAGING}/skills/"
  fi
}

push_files() {
  log "pushing to ${SSH_HOST}:${REMOTE_GROK}"

  # Push auth.json (most important)
  if [[ "${PUSH_AUTH}" == true ]] && [[ -f "${STAGING}/auth.json" ]]; then
    scp -o BatchMode=yes -q "${STAGING}/auth.json" "${SSH_HOST}:${REMOTE_GROK}/auth.json.push-${STAMP}"
    ssh -o BatchMode=yes "${SSH_HOST}" "
      mv ${REMOTE_GROK}/auth.json.push-${STAMP} ${REMOTE_GROK}/auth.json &&
      chmod 600 ${REMOTE_GROK}/auth.json
    "
    log "auth.json pushed and activated on server"
  fi

  # Push config.toml
  if [[ "${PUSH_CONFIG}" == true ]] && [[ -f "${STAGING}/config.toml" ]]; then
    scp -o BatchMode=yes -q "${STAGING}/config.toml" "${SSH_HOST}:${REMOTE_GROK}/config.toml.push-${STAMP}"
    ssh -o BatchMode=yes "${SSH_HOST}" "
      mv ${REMOTE_GROK}/config.toml.push-${STAMP} ${REMOTE_GROK}/config.toml
    "
    log "config.toml pushed to server"
  fi

  # Push skills (additive on server side)
  if [[ "${PUSH_SKILLS}" == true ]] && [[ -d "${STAGING}/skills" ]]; then
    log "pushing skills/ ..."
    rsync -az \
      -e "ssh -o BatchMode=yes" \
      "${STAGING}/skills/" \
      "${SSH_HOST}:${REMOTE_GROK}/skills/" || log "WARN: skills rsync had issues"
    log "skills/ pushed to server"
  fi
}

cleanup() {
  rm -rf "${STAGING}" 2>/dev/null || true
}

main() {
  log "Grok mirror: Mac → VPS (${SSH_HOST})"
  backup_remote
  prepare_push
  push_files
  cleanup

  cat <<EOF

=== Grok push complete ===
Server: ${SSH_HOST}
Remote Grok: ${REMOTE_GROK}

To use the updated config on the server:
  ssh ${SSH_HOST}
  export PATH="\$HOME/.grok/bin:\$HOME/.local/bin:\$PATH"
  grok --version

Your custom ~/.hermes/grok-build/ setup on the server was left untouched.

EOF
}

main "$@"
