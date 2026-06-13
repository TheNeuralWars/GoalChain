#!/usr/bin/env bash
# Scheduled maintenance: Hermes Vault oauth refresh + xAI auth.json refresh.
# Updated to detect revoked xAI OAuth tokens and alert for re-authentication.
set -euo pipefail

# Get real home (not profile-overridden HOME)
_real_home() {
    # Try passwd entry first (most reliable on Linux)
    if command -v getent >/dev/null 2>&1; then
        getent passwd "$(whoami)" | cut -d: -f6
        return
    fi
    # Fallback: if HOME looks like a profile override, use /home/<user>
    case "$HOME" in
        */.hermes/profiles/*/home)
            echo "/home/$(whoami)"
            return
            ;;
    esac
    echo "$HOME"
}

REAL_HOME="$(_real_home)"
export PATH="${REAL_HOME}/.local/bin:/usr/local/bin:${PATH}"
HERMES_AGENT_HOME="${HERMES_AGENT_HOME:-$REAL_HOME/.hermes}"
HERMES_HOME="${HERMES_HOME:-$REAL_HOME/hermes}"
LOG="${REAL_HOME}/hermes/logs/credential-maintain.log"
PASSPHRASE_FILE="${HERMES_VAULT_PASSPHRASE_FILE:-$HERMES_AGENT_HOME/vault.env}"
[[ -f "${PASSPHRASE_FILE}" ]] || PASSPHRASE_FILE="${HERMES_AGENT_HOME}/vault.passphrase"
VAULT_HOME="${HERMES_VAULT_HOME:-$HERMES_AGENT_HOME/hermes-vault-data}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HERMES_PYTHON="${HERMES_PYTHON:-$HERMES_AGENT_HOME/hermes-agent/venv/bin/python3}"

mkdir -p "$(dirname "${LOG}")"
ts() { date -u '+%F %T UTC'; }
log() { printf '[%s] %s\n' "$(ts)" "$*" | tee -a "${LOG}"; }
alert() { printf '[%s] ALERT: %s\n' "$(ts)" "$*" | tee -a "${LOG}"; }

export HERMES_VAULT_HOME="${VAULT_HOME}"
if [[ -f "${PASSPHRASE_FILE}" ]]; then
  # shellcheck disable=SC1090
  source "${PASSPHRASE_FILE}" 2>/dev/null || true
fi
if [[ -z "${HERMES_VAULT_PASSPHRASE:-}" && -f "${HERMES_AGENT_HOME}/vault.passphrase" ]]; then
  export HERMES_VAULT_PASSPHRASE
  HERMES_VAULT_PASSPHRASE="$(tr -d '\n\r' < "${HERMES_AGENT_HOME}/vault.passphrase")"
fi

log "credential-maintain start"

# Check for revoked xAI OAuth tokens BEFORE attempting refresh
AUTH_JSON="${HERMES_AGENT_HOME}/auth.json"
if [[ -f "${AUTH_JSON}" ]] && command -v jq >/dev/null 2>&1; then
  RELOGIN=$(jq -r '.providers["xai-oauth"].last_auth_error.relogin_required // false' "${AUTH_JSON}" 2>/dev/null || echo "false")
  ERROR_CODE=$(jq -r '.providers["xai-oauth"].last_auth_error.code // "none"' "${AUTH_JSON}" 2>/dev/null || echo "none")
  if [[ "${RELOGIN}" == "true" || "${ERROR_CODE}" == "xai_refresh_failed" ]]; then
    alert "xai-oauth relogin_required detected (error: ${ERROR_CODE})"
    alert "Run: bash ${HERMES_HOME}/scripts/xai-oauth-reauth.sh"
    # Send push notification via webhook if configured
    if [[ -n "${GOALCHAIN_ALPHA_WEBHOOK:-}" ]]; then
      curl -s -X POST "${GOALCHAIN_ALPHA_WEBHOOK}" \
        -H "Content-Type: application/json" \
        -d '{"message":"🚨 xAI OAuth token revoked! Run `bash ~/hermes/scripts/xai-oauth-reauth.sh` to re-authenticate."}' \
        >/dev/null 2>&1 || true
    fi
    # Don't attempt refresh - it will fail. Exit with warning.
    log "Skipping xai-oauth refresh due to revoked token. Manual re-auth required."
  else
    # Proceed with normal xai-oauth refresh
    refresh_py="${HERMES_HOME}/scripts/hermes-xai-oauth-refresh.py"
    [[ -f "${refresh_py}" ]] || refresh_py="${SCRIPT_DIR}/hermes-xai-oauth-refresh.py"
    if [[ -x "${HERMES_PYTHON}" && -f "${refresh_py}" ]]; then
      if "${HERMES_PYTHON}" "${refresh_py}" --all-agent-profiles >> "${LOG}" 2>&1; then
        log "xai-oauth refresh (default + agent profiles): OK"
      else
        log "WARN xai-oauth refresh: exit $?"
      fi
    else
      log "skip xai-oauth refresh (python or script missing)"
    fi
  fi
else
  # Fallback: attempt refresh without pre-check
  refresh_py="${HERMES_HOME}/scripts/hermes-xai-oauth-refresh.py"
  [[ -f "${refresh_py}" ]] || refresh_py="${SCRIPT_DIR}/hermes-xai-oauth-refresh.py"
  if [[ -x "${HERMES_PYTHON}" && -f "${refresh_py}" ]]; then
    if "${HERMES_PYTHON}" "${refresh_py}" --all-agent-profiles >> "${LOG}" 2>&1; then
      log "xai-oauth refresh (default + agent profiles): OK"
    else
      log "WARN xai-oauth refresh: exit $?"
    fi
  else
    log "skip xai-oauth refresh (python or script missing)"
  fi
fi

if command -v hermes-vault >/dev/null 2>&1 && [[ -n "${HERMES_VAULT_PASSPHRASE:-}" ]]; then
  if timeout 120 hermes-vault --no-banner maintain --format json >> "${LOG}" 2>&1; then
    log "hermes-vault maintain: OK"
  else
    log "WARN hermes-vault maintain: exit $?"
  fi
else
  log "skip hermes-vault maintain (CLI or passphrase missing)"
fi

log "credential-maintain done"