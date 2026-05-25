#!/usr/bin/env bash
# GoalChain Hermes superpowers: +swap, native-mcp (on-chain), webhooks → phone, cron scans.
# Safe to re-run (idempotent). Run on VPS after git pull / scp scripts.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
HERMES_BIN="${HERMES_BIN:-$HOME/.hermes/hermes-agent/venv/bin/hermes}"
HERMES_PYTHON="${HERMES_PYTHON:-$HOME/.hermes/hermes-agent/venv/bin/python3}"
HERMES_CONFIG="${HERMES_CONFIG:-$HOME/.hermes/config.yaml}"
HERMES_ENV="${HERMES_ENV:-$HOME/.hermes/.env}"
HERMES_AGENT_SCRIPTS="${HERMES_AGENT_SCRIPTS:-$HOME/.hermes/scripts}"
CONFIG_ENV="${HERMES_HOME}/config.env"
SCRIPTS="${HERMES_HOME}/scripts"
REPO="${GOALCHAIN_REPO_PATH:-$HERMES_HOME/workspace/GoalChain}"

log() { printf '[superpowers] %s\n' "$*"; }

copy_scripts() {
  mkdir -p "${SCRIPTS}" "${HERMES_AGENT_SCRIPTS}" "${HERMES_HOME}/oa/state" "${HERMES_HOME}/logs"
  for f in mcp-goalchain-ops.py goalchain-alpha-watch.sh goalchain-morning-conclusions.sh setup-swap-extra.sh install-hermes-superpowers.sh; do
    src="${SCRIPT_DIR}/${f}"
    [[ -f "${src}" ]] || continue
    for dst in "${SCRIPTS}/${f}" "${HERMES_AGENT_SCRIPTS}/${f}"; do
      if [[ "${src}" -ef "${dst}" ]]; then
        chmod 755 "${dst}"
      else
        install -m 755 "${src}" "${dst}"
      fi
    done
  done
  # Cron --script must be filename under ~/.hermes/scripts/
  patch_mcp_env_path "${HERMES_AGENT_SCRIPTS}/mcp-goalchain-ops.py"
  log "scripts: ${HERMES_AGENT_SCRIPTS} (+ ${SCRIPTS})"
}

patch_mcp_env_path() {
  local mcp_py="$1"
  python3 - "${HERMES_CONFIG}" "${mcp_py}" <<'PY'
import os, sys
from pathlib import Path
try:
    import yaml
except ImportError:
    raise SystemExit(0)
path = Path(sys.argv[1])
mcp_py = sys.argv[2]
cfg = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
entry = cfg.setdefault("mcp_servers", {}).setdefault("goalchain-ops", {})
entry["args"] = [mcp_py]
path.write_text(yaml.dump(cfg, default_flow_style=False, sort_keys=False), encoding="utf-8")
PY
}

load_whatsapp_target() {
  WHATSAPP_TARGET=""
  # shellcheck disable=SC1090
  [[ -f "${CONFIG_ENV}" ]] && source "${CONFIG_ENV}"
  WHATSAPP_TARGET="${WHATSAPP_TARGET:-}"
  export WHATSAPP_TARGET
}

patch_hermes_env() {
  load_whatsapp_target
  touch "${HERMES_ENV}"
  python3 - "${HERMES_ENV}" <<'PY'
import sys
from pathlib import Path

path = Path(sys.argv[1])
lines = path.read_text(encoding="utf-8").splitlines() if path.exists() else []
updates = {
    "WEBHOOK_ENABLED": "true",
    "WEBHOOK_PORT": "8644",
    "WHATSAPP_ENABLED": "true",
}
out, seen = [], set()
for line in lines:
    key = line.split("=", 1)[0].strip() if "=" in line and not line.strip().startswith("#") else ""
    if key in updates:
        out.append(f"{key}={updates[key]}")
        seen.add(key)
    else:
        out.append(line)
for k, v in updates.items():
    if k not in seen:
        out.append(f"{k}={v}")
# Global webhook secret (generated once if missing)
if not any(l.startswith("WEBHOOK_SECRET=") for l in out):
    import secrets
    out.append(f"WEBHOOK_SECRET={secrets.token_hex(24)}")
path.write_text("\n".join(out).rstrip() + "\n", encoding="utf-8")
print("patched", path)
PY
  chmod 600 "${HERMES_ENV}"
}

read_webhook_secret() {
  WEBHOOK_SECRET=""
  if [[ -f "${HERMES_ENV}" ]]; then
    WEBHOOK_SECRET="$(grep -E '^WEBHOOK_SECRET=' "${HERMES_ENV}" | head -1 | cut -d= -f2- || true)"
  fi
  if [[ -z "${WEBHOOK_SECRET}" ]]; then
    WEBHOOK_SECRET="$(python3 -c 'import secrets; print(secrets.token_hex(24))')"
  fi
  export WEBHOOK_SECRET
}

patch_config_yaml() {
  # shellcheck disable=SC1090
  [[ -f "${CONFIG_ENV}" ]] && set -a && source "${CONFIG_ENV}" && set +a
  read_webhook_secret
  export HERMES_CONFIG HERMES_PYTHON GOALCHAIN_API_BASE="${API_BASE_URL:-https://crm.goalchain.fun/goalchain-api}"
  export RPC_URL="${RPC_URL:-https://api.devnet.solana.com}"
  export PROGRAM_ID="${PROGRAM_ID:-FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg}"
  export GOALCHAIN_REPO_PATH="${REPO}"
  export WEBHOOK_PORT="${WEBHOOK_PORT:-8644}"
  python3 - <<'PY'
import os
from pathlib import Path

try:
    import yaml
except ImportError:
    raise SystemExit("PyYAML required: pip install pyyaml")

path = Path(os.environ["HERMES_CONFIG"])
cfg = yaml.safe_load(path.read_text(encoding="utf-8")) or {}

cfg.setdefault("approvals", {})["cron_mode"] = "allow"

bridge_port = int(os.environ.get("WHATSAPP_BRIDGE_PORT", "3001"))

platforms = cfg.setdefault("platforms", {})
platforms["webhook"] = {
    "enabled": True,
    "extra": {
        "host": "0.0.0.0",
        "port": int(os.environ.get("WEBHOOK_PORT", "8644")),
        "secret": os.environ.get("WEBHOOK_SECRET", ""),
    },
}

wa = cfg.setdefault("whatsapp", {})
if not isinstance(wa, dict):
    wa = {}
    cfg["whatsapp"] = wa
wa_extra = wa.setdefault("extra", {})
if not isinstance(wa_extra, dict):
    wa_extra = {}
    wa["extra"] = wa_extra
wa_extra["bridge_port"] = bridge_port
wa.setdefault("enabled", True)
platforms.setdefault("whatsapp", wa)

mcp = cfg.setdefault("mcp_servers", {})
mcp_py = str(Path.home() / ".hermes/scripts/mcp-goalchain-ops.py")
mcp["goalchain-ops"] = {
    "command": os.environ["HERMES_PYTHON"],
    "args": [mcp_py],
    "env": {
        "GOALCHAIN_API_BASE": os.environ.get("GOALCHAIN_API_BASE", ""),
        "RPC_URL": os.environ.get("RPC_URL", ""),
        "PROGRAM_ID": os.environ.get("PROGRAM_ID", ""),
        "GOALCHAIN_REPO_PATH": os.environ.get("GOALCHAIN_REPO_PATH", ""),
    },
    "timeout": 90,
    "connect_timeout": 30,
}

path.write_text(yaml.dump(cfg, default_flow_style=False, sort_keys=False), encoding="utf-8")
print("config.yaml: webhook platform, cron_mode=allow, goalchain-ops MCP")
PY
}

setup_swap_extra() {
  if swapon --show 2>/dev/null | grep -qF "/swapfile2"; then
    log "swapfile2 already active"
    return 0
  fi
  if sudo -n true 2>/dev/null; then
    sudo SWAP_SIZE_GB=2 SWAP_FILE=/swapfile2 bash "${SCRIPTS}/setup-swap-extra.sh"
  else
    log "WARN: run manually for +2GB swap:"
    log "  sudo SWAP_SIZE_GB=2 SWAP_FILE=/swapfile2 bash ${SCRIPTS}/setup-swap-extra.sh"
  fi
}

setup_cron_and_webhooks() {
  load_whatsapp_target
  [[ -x "${HERMES_BIN}" ]] || { log "ERROR: hermes CLI not found at ${HERMES_BIN}"; exit 1; }

  DELIVER_ARGS=()
  if [[ -n "${WHATSAPP_TARGET}" ]]; then
    DELIVER_ARGS=(--deliver "whatsapp:${WHATSAPP_TARGET}")
  else
    log "WARN: WHATSAPP_TARGET empty — cron will use --deliver origin"
    DELIVER_ARGS=(--deliver origin)
  fi

  # Remove old jobs with same names (idempotent reinstall)
  for job in goalchain-alpha-watch goalchain-morning-conclusions goalchain-nightly-scan goalchain-sync-digest test2; do
    "${HERMES_BIN}" cron remove "${job}" 2>/dev/null || true
  done

  # Alpha → phone every 30m (script only, no LLM cost)
  "${HERMES_BIN}" cron create "*/30 * * * *" \
    --name goalchain-alpha-watch \
    --script goalchain-alpha-watch.sh \
    --no-agent \
    "${DELIVER_ARGS[@]}" \
    >/dev/null
  log "cron: goalchain-alpha-watch (30m → WhatsApp)"

  # Morning conclusions 07:00 UTC (~04:00 ART)
  "${HERMES_BIN}" cron create "0 7 * * *" \
    --name goalchain-morning-conclusions \
    --script goalchain-morning-conclusions.sh \
    --no-agent \
    "${DELIVER_ARGS[@]}" \
    >/dev/null
  log "cron: morning-conclusions (07:00 UTC)"

  # Nightly agent scan 05:00 UTC — uses on-chain MCP + briefing
  NIGHTLY_PROMPT="GoalChain nightly scan. Use MCP goalchain_ops_status, goalchain_economy_health, goalchain_onchain_program_info. Spanish, max 10 bullets."
  "${HERMES_BIN}" cron create "0 5 * * *" "${NIGHTLY_PROMPT}" \
    --name goalchain-nightly-scan \
    --skill briefing,data-research \
    --workdir "${REPO}" \
    "${DELIVER_ARGS[@]}" \
    >/dev/null
  log "cron: nightly-scan (05:00 UTC, agent + MCP)"

  # Webhook: internal alpha push (deliver-only = instant phone, no LLM)
  "${HERMES_BIN}" webhook remove goalchain-alpha-push 2>/dev/null || true
  if [[ -n "${WHATSAPP_TARGET}" ]]; then
    "${HERMES_BIN}" webhook subscribe goalchain-alpha-push \
      --deliver-only \
      --deliver "whatsapp:${WHATSAPP_TARGET}" \
      --prompt "📡 GoalChain: {message}" \
      --description "Alpha push to WhatsApp (internal + external)" \
      >/dev/null
    log "webhook: goalchain-alpha-push → WhatsApp"
  fi

  "${HERMES_BIN}" cron list 2>/dev/null | head -20 || true
}

restart_gateway() {
  systemctl --user restart hermes-gateway.service 2>/dev/null && log "hermes-gateway restarted" \
    || log "restart hermes-gateway manually"
  sleep 3
  curl -sf http://127.0.0.1:8644/health 2>/dev/null && log "webhook health: OK" \
    || log "WARN: webhook :8644 not up yet (check gateway logs)"
}

main() {
  log "installing GoalChain Hermes superpowers"
  copy_scripts
  patch_hermes_env
  patch_config_yaml
  setup_swap_extra
  setup_cron_and_webhooks
  restart_gateway
  cat <<EOF

=== Listo para esta noche ===
• Swap: +2GB en /swapfile2 (si sudo OK)
• MCP: goalchain-ops (on-chain + API) en Hermes
• Cron: alpha cada 30m, scan 05:00 UTC, resumen 07:00 UTC → WhatsApp
• Webhook: :8644/health + goalchain-alpha-push

Verificar:
  ${HERMES_BIN} cron list
  curl http://127.0.0.1:8644/health
  free -h && swapon --show

EOF
}

main "$@"
