#!/usr/bin/env bash
# configure-discord-oa-research.sh
# Sets up a dedicated Discord channel for OA worker research notifications.
# Writes DISCORD_OA_RESEARCH_CHANNEL_ID and enables OA_WORKER_PUBLISH_RESEARCH
# in ~/hermes/config.env so the worker posts findings exclusively to that channel.
#
# Usage:
#   bash ops/hermes/configure-discord-oa-research.sh <CHANNEL_ID>
#   bash ops/hermes/configure-discord-oa-research.sh  # uses DISCORD_OA_RESEARCH_CHANNEL_ID env var
#
# After running, restart the oa-worker for changes to take effect:
#   sudo systemctl restart oa-worker  (VPS)
set -euo pipefail

HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
CONFIG_ENV="${HERMES_HOME}/config.env"

CHANNEL_ID="${1:-${DISCORD_OA_RESEARCH_CHANNEL_ID:-}}"

if [[ -z "${CHANNEL_ID}" ]]; then
  echo "ERROR: Provide channel ID as argument or set DISCORD_OA_RESEARCH_CHANNEL_ID."
  echo "Usage: $0 <DISCORD_CHANNEL_ID>"
  echo ""
  echo "How to get the channel ID:"
  echo "  1. Open Discord → right-click the target channel → 'Copy Channel ID'"
  echo "  2. Developer Mode must be enabled (User Settings → Advanced → Developer Mode)"
  exit 1
fi

if [[ ! -f "${CONFIG_ENV}" ]]; then
  echo "ERROR: ${CONFIG_ENV} not found. Run bootstrap.sh first."
  exit 1
fi

log() { printf '[%s] %s\n' "$(date -u '+%F %T UTC')" "$*"; }

# --- Update or append each key in config.env ---
set_env_key() {
  local key="$1"
  local value="$2"
  local file="$3"
  if grep -q "^${key}=" "${file}" 2>/dev/null; then
    # Replace existing line
    sed -i.bak "s|^${key}=.*|${key}=${value}|" "${file}"
    rm -f "${file}.bak"
  else
    echo "${key}=${value}" >> "${file}"
  fi
}

log "Configuring OA research Discord channel: ${CHANNEL_ID}"

# Set the dedicated OA research channel (separate from X-Scout active-research forum)
set_env_key "DISCORD_OA_RESEARCH_CHANNEL_ID" "\"${CHANNEL_ID}\"" "${CONFIG_ENV}"

# Enable the worker's research publisher flag
set_env_key "OA_WORKER_PUBLISH_RESEARCH" "true" "${CONFIG_ENV}"

# Also wire DISCORD_RESEARCH_CHANNEL_ID if not already set (fallback used by publisher script)
if ! grep -q "^DISCORD_RESEARCH_CHANNEL_ID=" "${CONFIG_ENV}" 2>/dev/null || \
   grep -q '^DISCORD_RESEARCH_CHANNEL_ID=""' "${CONFIG_ENV}" 2>/dev/null; then
  set_env_key "DISCORD_RESEARCH_CHANNEL_ID" "\"${CHANNEL_ID}\"" "${CONFIG_ENV}"
  log "Also set DISCORD_RESEARCH_CHANNEL_ID (was empty)"
fi

log "Done. Verify with:"
log "  grep -E 'DISCORD_OA_RESEARCH|OA_WORKER_PUBLISH' ${CONFIG_ENV}"
echo ""
echo "Next steps:"
echo "  1. Ensure DISCORD_TOKEN is set in ${CONFIG_ENV}"
echo "  2. Restart worker: sudo systemctl restart oa-worker"
echo "  3. Tail logs:      journalctl -u oa-worker -f"
echo ""
echo "The OA worker will now post research findings to channel ${CHANNEL_ID}."
