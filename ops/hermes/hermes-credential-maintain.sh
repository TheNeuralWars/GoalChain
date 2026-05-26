#!/usr/bin/env bash
# Scheduled maintenance: Hermes Vault oauth refresh + xAI auth.json refresh.
set -euo pipefail

export PATH="${HOME}/.local/bin:/usr/local/bin:${PATH}"
HERMES_AGENT_HOME="${HERMES_AGENT_HOME:-$HOME/.hermes}"
HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
PASSPHRASE_FILE="${HERMES_VAULT_PASSPHRASE_FILE:-$HERMES_AGENT_HOME/vault.env}"
[[ -f "${PASSPHRASE_FILE}" ]] || PASSPHRASE_FILE="${HERMES_AGENT_HOME}/vault.passphrase"
VAULT_HOME="${HERMES_VAULT_HOME:-$HERMES_AGENT_HOME/hermes-vault-data}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HERMES_PYTHON="${HERMES_PYTHON:-$HERMES_AGENT_HOME/hermes-agent/venv/bin/python3}"
LOG="${HERMES_HOME}/logs/credential-maintain.log"

mkdir -p "$(dirname "${LOG}")"
ts() { date -u '+%F %T UTC'; }
log() { printf '[%s] %s\n' "$(ts)" "$*" | tee -a "${LOG}"; }

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

if command -v hermes-vault >/dev/null 2>&1 && [[ -n "${HERMES_VAULT_PASSPHRASE:-}" ]]; then
  if timeout 120 hermes-vault --no-banner maintain --format json >> "${LOG}" 2>&1; then
    log "hermes-vault maintain: OK"
  else
    log "WARN hermes-vault maintain: exit $?"
  fi
else
  log "skip hermes-vault maintain (CLI or passphrase missing)"
fi

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

log "credential-maintain done"
