#!/usr/bin/env bash
# Configure xAI in OpenCode on Hermes (SuperGrok subscription or API key).
set -euo pipefail

HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
CONFIG="${HERMES_HOME}/config.env"
SESSION="oa-xai-auth"
MODE="${1:-headless}"

bash "${HERMES_HOME}/scripts/install-opencode-xai.sh"

# shellcheck disable=SC1090
[[ -f "${CONFIG}" ]] && source "${CONFIG}" || true
XAI_API_KEY="${XAI_API_KEY:-}"
OA_MODEL="${OA_MODEL:-xai/grok-4.3}"

start_login_session() {
  local method="$1"
  if tmux has-session -t "${SESSION}" 2>/dev/null; then
    echo "session: already running (${SESSION})"
    echo "attach: tmux attach -t ${SESSION}"
    return 0
  fi
  tmux new-session -d -s "${SESSION}" \
    "cd '${HERMES_HOME}/workspace/GoalChain' && opencode providers login -p xai -m '${method}'; echo; echo 'Done. Press Enter to close.'; read"
  echo "session: started (${SESSION})"
  echo "attach: tmux attach -t ${SESSION}"
}

verify_xai() {
  echo "providers:"
  opencode providers list 2>&1 || true
  echo
  echo "models (xai):"
  opencode models xai 2>&1 | head -25 || true
}

case "${MODE}" in
  headless|subscription|oauth)
    echo "SuperGrok subscription (headless device code — recommended on VPS)"
    echo "1) attach: tmux attach -t ${SESSION}"
    echo "2) select: xAI Grok OAuth (Headless / Remote / VPS)"
    echo "3) open https://x.ai/device on phone/laptop and enter the code shown"
    start_login_session "xAI Grok OAuth (Headless / Remote / VPS)"
    ;;
  browser|oauth-browser)
    echo "SuperGrok subscription (browser OAuth — needs local port forward)"
    echo "On your laptop run:"
    echo "  ssh -L 56121:127.0.0.1:56121 goalchain@178.105.148.109"
    echo "Then attach tmux and complete browser login."
    start_login_session "xAI Grok OAuth (SuperGrok Subscription)"
    ;;
  apikey|key)
    if [[ -z "${XAI_API_KEY}" ]]; then
      echo "Set XAI_API_KEY in ${CONFIG} first (https://console.x.ai)"
      exit 1
    fi
    export XAI_API_KEY
    start_login_session "Manually enter API Key"
    echo "In tmux: paste API key when prompted."
    ;;
  verify|status)
    verify_xai
    ;;
  *)
    echo "Usage: $0 {headless|browser|apikey|verify}"
    echo
    echo "  headless     SuperGrok OAuth via https://x.ai/device (best for server)"
    echo "  browser      SuperGrok OAuth via localhost:56121 + SSH -L 56121:..."
    echo "  apikey       Pay-as-you-go API key from config.env"
    echo "  verify       List providers and xai models"
    exit 1
    ;;
esac

echo
echo "After login, set OA_MODEL=${OA_MODEL} in ${CONFIG} and run:"
echo "  bash ~/hermes/scripts/oa-control.sh restart"
