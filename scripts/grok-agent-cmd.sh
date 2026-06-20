#!/usr/bin/env bash
# scripts/grok-agent-cmd.sh
# Sends a command to the grok-cli tmux session on the VPS and monitors the response until complete.

set -euo pipefail

SSH_HOST="ubuntu@89.168.20.135"
CMD_PROMPT="${1:-}"

if [[ -z "${CMD_PROMPT}" ]]; then
  echo "Usage: $0 \"your instruction for Grok\""
  exit 1
fi

log() { printf '[%s] [GROK-AGENT] %s\n' "$(date -u '+%F %T UTC')" "$*"; }

# Clean up input for tmux send-keys
escaped_prompt="${CMD_PROMPT//\"/\\\"}"
escaped_prompt="${escaped_prompt//\`/\\\`}"
escaped_prompt="${escaped_prompt//\$/\\\$}"

log "Sending command to grok-cli session..."
ssh -o BatchMode=yes "${SSH_HOST}" "tmux send-keys -t grok-cli \"${escaped_prompt}\" Enter"

log "Waiting for Grok to begin execution..."
sleep 3

# Monitor loop
max_checks=120 # 10 minutes max timeout
check_interval=5
completed=0

# Clean up console view helpers
get_clean_output() {
  ssh -o BatchMode=yes "${SSH_HOST}" "tmux capture-pane -t grok-cli -p" | sed '/^$/d' | tail -n 25
}

last_output=""
for ((i=1; i<=max_checks; i++)); do
  current_output="$(get_clean_output)"
  
  # Print new output lines
  if [[ "${current_output}" != "${last_output}" ]]; then
    # Simple diff representation to show progress
    echo "--- Grok Output Stream ---"
    echo "${current_output}"
    last_output="${current_output}"
  fi

  # Check if the shell prompt '❯' is back at the bottom, indicating execution completed
  if echo "${current_output}" | grep -q "❯"; then
    log "Grok CLI finished executing the command."
    completed=1
    break
  fi

  sleep "${check_interval}"
done

if [[ "${completed}" -eq 0 ]]; then
  log "WARNING: Command monitoring timed out. Grok may still be running."
  exit 1
fi

log "Done."
exit 0
