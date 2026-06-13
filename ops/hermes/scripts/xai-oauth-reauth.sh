#!/usr/bin/env bash
# xAI OAuth Re-Authentication Script
# Handles revoked refresh tokens by running full PKCE OAuth flow with SSH tunnel support.
# Usage: bash ~/hermes/scripts/xai-oauth-reauth.sh [--profile <name>] [--no-tunnel] [--manual-paste]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
HERMES_AGENT_HOME="${HERMES_AGENT_HOME:-$HOME/.hermes}"
HERMES_PROFILE="${HERMES_PROFILE:-}"
USE_TUNNEL=1
MANUAL_PASTE=0
TIMEOUT=120

log() { printf '[xai-oauth-reauth] %s\n' "$*"; }
warn() { printf '[xai-oauth-reauth] WARN: %s\n' "$*" >&2; }
err() { printf '[xai-oauth-reauth] ERROR: %s\n' "$*" >&2; }

# Parse args
while [[ $# -gt 0 ]]; do
  case "$1" in
    --profile)
      HERMES_PROFILE="$2"; shift 2 ;;
    --no-tunnel)
      USE_TUNNEL=0; shift ;;
    --manual-paste)
      MANUAL_PASTE=1; shift ;;
    --timeout)
      TIMEOUT="$2"; shift 2 ;;
    -h|--help)
      cat <<EOF
Usage: $0 [options]
Options:
  --profile <name>    Hermes profile (default: default profile)
  --no-tunnel         Skip SSH tunnel setup (use when running locally with browser)
  --manual-paste      Use --manual-paste mode for headless/CI environments
  --timeout <seconds> OAuth timeout (default: 120)
  -h, --help          Show this help
EOF
      exit 0 ;;
    *)
      err "Unknown option: $1"; exit 1 ;;
  esac
done

# Determine auth.json path
if [[ -n "$HERMES_PROFILE" && "$HERMES_PROFILE" != "default" ]]; then
  AUTH_JSON="$HERMES_AGENT_HOME/profiles/$HERMES_PROFILE/auth.json"
  PROFILE_FLAG="--profile $HERMES_PROFILE"
else
  AUTH_JSON="$HERMES_AGENT_HOME/auth.json"
  PROFILE_FLAG=""
fi

# Check hermes CLI
HERMES_CLI="$HOME/.local/bin/hermes"
if [[ ! -x "$HERMES_CLI" ]]; then
  HERMES_CLI="$(command -v hermes || true)"
fi
if [[ ! -x "$HERMES_CLI" ]]; then
  err "hermes CLI not found. Install with: uv tool install hermes-agent"
  exit 1
fi

log "Using auth.json: $AUTH_JSON"
log "Hermes CLI: $HERMES_CLI"

# Check current status
if [[ -f "$AUTH_JSON" ]]; then
  if command -v jq >/dev/null 2>&1; then
    RELOGIN=$(jq -r '.providers["xai-oauth"].last_auth_error.relogin_required // false' "$AUTH_JSON" 2>/dev/null || echo "false")
    ERROR_CODE=$(jq -r '.providers["xai-oauth"].last_auth_error.code // "none"' "$AUTH_JSON" 2>/dev/null || echo "none")
    log "Current status: relogin_required=$RELOGIN, last_error_code=$ERROR_CODE"
    if [[ "$RELOGIN" != "true" && "$ERROR_CODE" != "xai_refresh_failed" ]]; then
      warn "xai-oauth does not appear to have revoked tokens. Continue anyway? [y/N]"
      read -r ans
      [[ "${ans,,}" == "y" ]] || { log "Aborted."; exit 0; }
    fi
  else
    warn "jq not installed, skipping status check"
  fi
else
  warn "No auth.json found at $AUTH_JSON"
fi

# SSH Tunnel setup for remote VPS
TUNNEL_PID=""
if [[ $USE_TUNNEL -eq 1 ]]; then
  # Check if we're on a remote host (Oracle VPS)
  if [[ "$(hostname)" == *"oracle"* ]] || [[ "$(whoami)" == "ubuntu" && -d "/home/ubuntu" ]]; then
    log "Detected remote VPS environment. SSH tunnel required for OAuth callback."
    log ""
    log "==========================================="
    log "RUN THIS ON YOUR LOCAL MAC (keep open):"
    log "  ssh -L 56121:127.0.0.1:56121 ubuntu@89.168.20.135"
    log "==========================================="
    log ""
    log "Press Enter when tunnel is active..."
    read -r
    
    # Verify tunnel works
    if timeout 3 bash -c "cat < /dev/null > /dev/tcp/127.0.0.1/56121" 2>/dev/null; then
      log "SSH tunnel verified on port 56121"
    else
      warn "Cannot verify tunnel on 127.0.0.1:56121. Continuing anyway..."
    fi
  else
    log "Local environment detected. Tunnel not needed (browser can access 127.0.0.1:56121 directly)."
    USE_TUNNEL=0
  fi
fi

# Build hermes auth add command
AUTH_CMD=("$HERMES_CLI" auth add xai-oauth --no-browser)
if [[ $MANUAL_PASTE -eq 1 ]]; then
  AUTH_CMD+=(--manual-paste)
fi
if [[ -n "$PROFILE_FLAG" ]]; then
  AUTH_CMD+=("$PROFILE_FLAG")
fi

log "Starting xAI OAuth PKCE flow..."
log "Command: ${AUTH_CMD[*]}"
log ""

# Run the OAuth flow
if "${AUTH_CMD[@]}"; then
  log "OAuth flow completed successfully!"
else
  EXIT_CODE=$?
  err "OAuth flow failed with exit code $EXIT_CODE"
  exit $EXIT_CODE
fi

# Verify new tokens
log ""
log "Verifying new tokens..."
sleep 2

REFRESH_PY="$HERMES_HOME/scripts/hermes-xai-oauth-refresh.py"
if [[ -f "$REFRESH_PY" ]]; then
  if "$HOME/.hermes/hermes-agent/venv/bin/python3" "$REFRESH_PY" --all-agent-profiles; then
    log "Token verification: PASSED"
  else
    warn "Token verification had issues (may be expected for some profiles)"
  fi
else
  warn "Refresh script not found at $REFRESH_PY"
fi

# Run credential maintenance
CRED_MAINTAIN="$HERMES_HOME/scripts/hermes-credential-maintain.sh"
if [[ -f "$CRED_MAINTAIN" ]]; then
  log "Running credential maintenance..."
  if bash "$CRED_MAINTAIN"; then
    log "Credential maintenance: PASSED"
  else
    warn "Credential maintenance had warnings (check logs)"
  fi
else
  warn "Credential maintenance script not found"
fi

log ""
log "==========================================="
log "xAI OAuth re-authentication complete!"
log "Check ~/.hermes/auth.json for new tokens."
log "==========================================="