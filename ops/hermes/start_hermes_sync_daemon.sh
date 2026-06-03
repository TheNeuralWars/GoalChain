#!/usr/bin/env bash
# macOS background daemon to persistently sync ~/.hermes between Mac and OCI server.
#
# Usage:
#   bash ops/hermes/start_hermes_sync_daemon.sh
#
# Press Ctrl+C to stop, or run it in background.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SSH_HOST="ubuntu@89.168.20.135"
LOCAL_HERMES="$HOME/.hermes"
REMOTE_HERMES="/home/ubuntu/.hermes"
INTERVAL_SECONDS=60

log() { printf '[hermes-sync-daemon] %s\n' "$*"; }

# Sync functions
pull_changes() {
  log "Pulling updates from OCI server..."
  # Pull config edits, memories, and session databases
  rsync -avz --exclude 'logs/' --exclude 'cache/' \
    "${SSH_HOST}:${REMOTE_HERMES}/" "${LOCAL_HERMES}/"
}

push_changes() {
  log "Pushing local config changes to OCI server..."
  rsync -avz --exclude 'logs/' --exclude 'cache/' \
    "${LOCAL_HERMES}/" "${SSH_HOST}:${REMOTE_HERMES}/"
  
  # Restart remote gateway to apply config changes
  ssh -o ConnectTimeout=5 "${SSH_HOST}" "systemctl --user restart hermes-gateway.service 2>/dev/null || true"
}

# Trap exit
cleanup() {
  log "Stopping sync daemon."
  exit 0
}
trap cleanup SIGINT SIGTERM

log "Starting persistent sync between Mac and OCI server..."
log "Local:  ${LOCAL_HERMES}"
log "Remote: ${SSH_HOST}:${REMOTE_HERMES}"

# First sync
pull_changes

# Daemon Loop
LAST_SYNC=$(date +%s)
while true; do
  # Check if fswatch is installed for instant file-change detection
  if command -v fswatch >/dev/null 2>&1; then
    log "Watching for local changes (fswatch enabled)..."
    # Block until a file changes, excluding logs and cache
    fswatch -1 -e "logs/" -e "cache/" -e "\.DS_Store" "${LOCAL_HERMES}" >/dev/null
    log "Local change detected!"
    push_changes
  else
    # Fallback to polling sleep
    sleep "${INTERVAL_SECONDS}"
    
    # Check if local files are newer than last sync
    MODIFIED=$(find "${LOCAL_HERMES}" -type f -not -path "*/logs/*" -not -path "*/cache/*" -newermt "@${LAST_SYNC}" | wc -l)
    if [ "${MODIFIED}" -gt 0 ]; then
      log "Local modifications detected via polling."
      push_changes
    else
      # Periodically pull remote changes (sessions, memories)
      pull_changes
    fi
    LAST_SYNC=$(date +%s)
  fi
done
