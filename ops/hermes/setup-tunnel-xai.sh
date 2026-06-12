#!/usr/bin/env bash
# Setup Cloudflare Tunnel + xAI API key for OpenCode/OA on Hermes server.
set -euo pipefail

HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
CONFIG="${HERMES_HOME}/config.env"
BIN_DIR="${HOME}/bin"
TUNNEL_DIR="${HERMES_HOME}/tunnel"
TUNNEL_CONFIG="${TUNNEL_DIR}/config.yml"
TUNNEL_LOG="${TUNNEL_DIR}/cloudflared.log"
PID_FILE="${TUNNEL_DIR}/cloudflared.pid"

mkdir -p "${TUNNEL_DIR}" "${BIN_DIR}"

if [[ ! -x "${BIN_DIR}/cloudflared" ]]; then
  echo "ERROR: cloudflared not found. Install with:"
  echo "  curl -fsSL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o ~/bin/cloudflared && chmod +x ~/bin/cloudflared"
  exit 1
fi

if [[ ! -f "${CONFIG}" ]]; then
  echo "ERROR: missing ${CONFIG}"
  exit 1
fi

# shellcheck disable=SC1090
source "${CONFIG}"

TUNNEL_HOSTNAME="${TUNNEL_HOSTNAME:-}"
TUNNEL_ID="${TUNNEL_ID:-}"
TUNNEL_CREDENTIALS_FILE="${TUNNEL_CREDENTIALS_FILE:-}"
XAI_OAUTH_PORT="${XAI_OAUTH_PORT:-56121}"
XAI_API_KEY="${XAI_API_KEY:-}"
OA_MODEL="${OA_MODEL:-xai/grok-4.3}"

require_tunnel_config() {
  if [[ -z "${TUNNEL_HOSTNAME}" ]]; then
    echo "Set TUNNEL_HOSTNAME in ${CONFIG} (example: oa.YOURDOMAIN.com)"
    exit 1
  fi
}

require_xai_key() {
  if ! grep -q '^XAI_API_KEY=' "${CONFIG}" || grep -qE '^XAI_API_KEY=""?$' "${CONFIG}"; then
    echo "Missing XAI_API_KEY in ${CONFIG}"
    echo "Add: XAI_API_KEY=your_key_from_https://console.x.ai"
    exit 1
  fi
  export XAI_API_KEY
}

if [[ ! -f "${TUNNEL_CONFIG}" ]]; then
  cat > "${TUNNEL_CONFIG}" <<EOF
tunnel: ${TUNNEL_ID:-}
credentials-file: ${TUNNEL_CREDENTIALS_FILE:-/home/goalchain/.cloudflared/${TUNNEL_ID}.json}

ingress:
  - hostname: ${TUNNEL_HOSTNAME}
    path: /webhook*
    service: http://127.0.0.1:3456
  - hostname: ${TUNNEL_HOSTNAME}
    path: /callback*
    service: http://127.0.0.1:${XAI_OAUTH_PORT}
  - hostname: ${TUNNEL_HOSTNAME}
    service: http://127.0.0.1:18789
EOF
  echo "Wrote ${TUNNEL_CONFIG} (edit tunnel/credentials if needed)"
fi

start_tunnel() {
  require_tunnel_config
  if [[ -f "${PID_FILE}" ]] && kill -0 "$(cat "${PID_FILE}")" 2>/dev/null; then
    echo "tunnel: already running (pid $(cat "${PID_FILE}"))"
    return 0
  fi
  nohup "${BIN_DIR}/cloudflared" tunnel --config "${TUNNEL_CONFIG}" >"${TUNNEL_LOG}" 2>&1 &
  echo $! > "${PID_FILE}"
  echo "tunnel: started (log: ${TUNNEL_LOG})"
}

stop_tunnel() {
  if [[ -f "${PID_FILE}" ]]; then
    kill "$(cat "${PID_FILE}")" 2>/dev/null || true
    rm -f "${PID_FILE}"
  fi
  pkill -f "cloudflared tunnel" 2>/dev/null || true
  echo "tunnel: stopped"
}

status_tunnel() {
  if [[ -f "${PID_FILE}" ]] && kill -0 "$(cat "${PID_FILE}")" 2>/dev/null; then
    echo "tunnel: running pid=$(cat "${PID_FILE}")"
  else
    echo "tunnel: stopped"
  fi
  echo "hostname: ${TUNNEL_HOSTNAME}"
  echo "webhook: http://127.0.0.1:3456/webhook"
  echo "openclaw: http://127.0.0.1:18789"
}

verify_xai() {
  # bash "${HERMES_HOME}/scripts/install-opencode-xai.sh" >/dev/null # Obsolete
  echo "providers:"
  opencode providers list 2>&1 | head -25
  echo
  if opencode providers list 2>&1 | grep -qi 'xai'; then
    echo "models (xai):"
    opencode models xai 2>&1 | head -25 || true
    return 0
  fi
  if [[ -n "${XAI_API_KEY}" ]]; then
    export XAI_API_KEY
    echo "xAI not in credentials yet. Run:"
    echo "  bash ~/hermes/scripts/oa-xai-connect.sh headless"
    echo "  # or apikey if using console.x.ai key"
    return 1
  fi
  echo "xAI not configured. Subscription (no API key):"
  echo "  bash ~/hermes/scripts/oa-xai-connect.sh headless"
  return 1
}

case "${1:-status}" in
  start) start_tunnel ;;
  stop) stop_tunnel ;;
  restart) stop_tunnel; start_tunnel ;;
  status|"") status_tunnel ;;
  verify-xai) verify_xai ;;
  *)
    echo "Usage: $0 {start|stop|restart|status|verify-xai}"
    echo "Config vars in ${CONFIG}:"
    echo "  TUNNEL_HOSTNAME, TUNNEL_ID, TUNNEL_CREDENTIALS_FILE, XAI_API_KEY, OA_MODEL"
    exit 1
    ;;
esac
