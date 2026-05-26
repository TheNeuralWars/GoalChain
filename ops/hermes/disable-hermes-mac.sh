#!/usr/bin/env bash
# Pause Hermes on macOS (VPS remains source of truth). Does not delete profiles or .env.
set -euo pipefail

export PATH="${HOME}/.local/bin:${PATH}"

log() { printf '[disable-hermes-mac] %s\n' "$*"; }

if ! command -v hermes >/dev/null 2>&1; then
  log "hermes CLI not found; nothing to stop"
  exit 0
fi

hermes gateway list 2>/dev/null || true

for profile in $(hermes gateway list 2>/dev/null | awk '/PID/ {print $2}' | tr -d '—' || true); do
  [[ -z "${profile}" || "${profile}" == "Gateways:" ]] && continue
done

# Stop every profile gateway that is running
while read -r line; do
  if [[ "${line}" =~ ^[[:space:]]*✓[[:space:]]+([^[:space:]]+) ]]; then
    name="${BASH_REMATCH[1]}"
    log "Stopping gateway profile: ${name}"
    hermes -p "${name}" gateway stop 2>/dev/null || hermes gateway stop 2>/dev/null || true
  fi
done < <(hermes gateway list 2>/dev/null || true)

hermes gateway stop 2>/dev/null || true
log "Hermes gateways stopped on Mac. Re-enable: hermes -p default gateway start"
