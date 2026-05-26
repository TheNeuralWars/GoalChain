#!/usr/bin/env bash
# Install Hermes Vault + GoalChain credential maintenance (xAI OAuth refresh + vault).
# Mac or VPS (goalchain user). Idempotent.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# When copied to ~/hermes/scripts/, pull siblings from the GoalChain repo clone.
REPO_OPS="${GOALCHAIN_REPO_PATH:-$HOME/hermes/workspace/GoalChain}/ops/hermes"
if [[ -d "${REPO_OPS}" ]]; then
  SCRIPT_DIR="${REPO_OPS}"
fi
HERMES_AGENT_HOME="${HERMES_AGENT_HOME:-$HOME/.hermes}"
HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
HERMES_ENV="${HERMES_ENV:-$HERMES_AGENT_HOME/.env}"
HERMES_CONFIG="${HERMES_CONFIG:-$HERMES_AGENT_HOME/config.yaml}"
PASSPHRASE_FILE="${HERMES_VAULT_PASSPHRASE_FILE:-$HERMES_AGENT_HOME/vault.passphrase}"
VAULT_HOME="${HERMES_VAULT_HOME:-$HERMES_AGENT_HOME/hermes-vault-data}"
VAULT_VERSION="${HERMES_VAULT_VERSION:-v0.10.1}"
HERMES_PYTHON="${HERMES_PYTHON:-$HERMES_AGENT_HOME/hermes-agent/venv/bin/python3}"
SKIP_IMPORT="${SKIP_VAULT_IMPORT:-0}"
SKIP_SYSTEMD="${SKIP_VAULT_SYSTEMD:-0}"

log() { printf '[hermes-vault] %s\n' "$*"; }

install_cli() {
  export PATH="${HOME}/.local/bin:${PATH}"
  if command -v hermes-vault >/dev/null 2>&1; then
    log "CLI: $(command -v hermes-vault)"
  fi
  local uv_bin=""
  if command -v uv >/dev/null 2>&1; then
    uv_bin="$(command -v uv)"
  elif [[ -x "${HOME}/.local/bin/uv" ]]; then
    uv_bin="${HOME}/.local/bin/uv"
  fi
  if [[ -z "${uv_bin}" ]]; then
    log "ERROR: uv required — curl -LsSf https://astral.sh/uv/install.sh | sh"
    exit 1
  fi
  log "installing hermes-vault@${VAULT_VERSION} via ${uv_bin} tool"
  "${uv_bin}" tool install "git+https://github.com/asimons81/hermes-vault.git@${VAULT_VERSION}" --force-reinstall >/dev/null
  export PATH="${HOME}/.local/bin:${PATH}"
  log "CLI: $(command -v hermes-vault)"
}

ensure_passphrase() {
  mkdir -p "$(dirname "${PASSPHRASE_FILE}")"
  if [[ ! -f "${PASSPHRASE_FILE}" ]]; then
    if command -v openssl >/dev/null 2>&1; then
      openssl rand -hex 24 > "${PASSPHRASE_FILE}"
    else
      python3 -c 'import secrets; print(secrets.token_hex(24))' > "${PASSPHRASE_FILE}"
    fi
    chmod 600 "${PASSPHRASE_FILE}"
    log "created passphrase file: ${PASSPHRASE_FILE} (backup somewhere safe)"
  else
    log "passphrase file: ${PASSPHRASE_FILE}"
  fi
  chmod 600 "${PASSPHRASE_FILE}" 2>/dev/null || true
}

vault_env() {
  export HERMES_VAULT_HOME="${VAULT_HOME}"
  export HERMES_VAULT_PASSPHRASE
  HERMES_VAULT_PASSPHRASE="$(tr -d '\n\r' < "${PASSPHRASE_FILE}")"
  export HERMES_VAULT_PASSPHRASE
}

install_scripts() {
  mkdir -p "${HERMES_HOME}/scripts"
  for f in install-hermes-vault.sh hermes-credential-maintain.sh hermes-xai-oauth-refresh.py; do
    src="${SCRIPT_DIR}/${f}"
    dst="${HERMES_HOME}/scripts/${f}"
    [[ -f "${src}" ]] || continue
    if [[ "$(cd "$(dirname "${src}")" && pwd -P)/$(basename "${src}")" == "$(cd "$(dirname "${dst}")" 2>/dev/null && pwd -P)/$(basename "${dst}")" ]]; then
      chmod 755 "${dst}" 2>/dev/null || true
      continue
    fi
    install -m 755 "${src}" "${dst}"
  done
  log "scripts → ${HERMES_HOME}/scripts/"
}

import_env_to_vault() {
  [[ "${SKIP_IMPORT}" == "1" ]] && { log "SKIP_VAULT_IMPORT=1 — skip import"; return 0; }
  [[ -f "${HERMES_ENV}" ]] || { log "WARN: no ${HERMES_ENV} to import"; return 0; }
  vault_env
  log "import API keys from ${HERMES_ENV} (dry-run first)"
  hermes-vault --no-banner import --from-env "${HERMES_ENV}" --dry-run || true
  hermes-vault --no-banner import --from-env "${HERMES_ENV}" \
    --tags "goalchain,hermes" \
    --notes "Imported by install-hermes-vault.sh" || log "WARN: import had issues (check policy)"
  log "vault list:"
  hermes-vault --no-banner list 2>/dev/null | head -20 || true
}

scan_hermes_home() {
  vault_env
  log "scan ~/.hermes for plaintext secrets (report only)"
  hermes-vault --no-banner scan "${HERMES_AGENT_HOME}" --format table 2>/dev/null | tail -30 || true
}

setup_systemd() {
  [[ "${SKIP_SYSTEMD}" == "1" ]] && { log "SKIP_VAULT_SYSTEMD=1"; return 0; }
  if ! command -v systemctl >/dev/null 2>&1; then
    log "no systemd — skip timer (Mac: use launchd manually or cron)"
    return 0
  fi
  vault_env
  mkdir -p "${HOME}/.config/systemd/user"
  local maintain_py="${HERMES_HOME}/scripts/hermes-credential-maintain.sh"
  [[ -x "${maintain_py}" ]] || maintain_py="${SCRIPT_DIR}/hermes-credential-maintain.sh"

  local vault_env_file="${HERMES_AGENT_HOME}/vault.env"
  if [[ ! -f "${vault_env_file}" ]] || ! grep -q '^HERMES_VAULT_PASSPHRASE=' "${vault_env_file}" 2>/dev/null; then
    {
      echo "# GoalChain Hermes Vault — chmod 600, do not commit"
      echo "HERMES_VAULT_PASSPHRASE=$(tr -d '\n\r' < "${PASSPHRASE_FILE}")"
    } > "${vault_env_file}"
    chmod 600 "${vault_env_file}"
  fi

  cat > "${HOME}/.config/systemd/user/goalchain-credential-maintain.service" <<EOF
[Unit]
Description=GoalChain credential maintain (Hermes Vault + xAI OAuth refresh)
After=network-online.target

[Service]
Type=oneshot
Environment=HERMES_VAULT_HOME=${VAULT_HOME}
EnvironmentFile=-${vault_env_file}
Environment=HERMES_AGENT_HOME=${HERMES_AGENT_HOME}
Environment=HERMES_HOME=${HERMES_HOME}
ExecStart=${maintain_py}
EOF

  cat > "${HOME}/.config/systemd/user/goalchain-credential-maintain.timer" <<EOF
[Unit]
Description=GoalChain credential maintain every 15 minutes

[Timer]
OnBootSec=3m
OnUnitActiveSec=15m
Persistent=true

[Install]
WantedBy=timers.target
EOF

  systemctl --user daemon-reload
  systemctl --user enable --now goalchain-credential-maintain.timer
  log "systemd: goalchain-credential-maintain.timer enabled"
}

patch_hermes_config_mcp() {
  [[ -f "${HERMES_CONFIG}" ]] || { log "WARN: ${HERMES_CONFIG} missing"; return 0; }
  [[ -x "${HERMES_PYTHON}" ]] || { log "WARN: Hermes python missing — skip MCP patch"; return 0; }
  vault_env
  local hv_bin
  hv_bin="$(command -v hermes-vault)"
  python3 - "${HERMES_CONFIG}" "${hv_bin}" <<'PY'
import sys
from pathlib import Path
try:
    import yaml
except ImportError:
    raise SystemExit(0)
path = Path(sys.argv[1])
hv = sys.argv[2]
cfg = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
mcp = cfg.setdefault("mcp_servers", {})
mcp["hermes-vault"] = {
    "command": hv,
    "args": ["mcp"],
    "timeout": 120,
    "connect_timeout": 30,
}
path.write_text(yaml.dump(cfg, default_flow_style=False, sort_keys=False), encoding="utf-8")
print("patched mcp_servers.hermes-vault")
PY
  log "optional: restart hermes-gateway to load hermes-vault MCP"
}

main() {
  log "GoalChain Hermes Vault install"
  log "  HERMES_AGENT_HOME=${HERMES_AGENT_HOME}"
  log "  HERMES_VAULT_HOME=${VAULT_HOME}"
  install_cli
  ensure_passphrase
  install_scripts
  vault_env
  hermes-vault --no-banner health 2>/dev/null | tail -8 || true
  import_env_to_vault
  scan_hermes_home
  setup_systemd
  patch_hermes_config_mcp
  log "done — xAI refresh: bash ${HERMES_HOME}/scripts/hermes-credential-maintain.sh"
  log "passphrase backup: ${PASSPHRASE_FILE} (or ${HERMES_AGENT_HOME}/vault.env on VPS)"
}

main "$@"
