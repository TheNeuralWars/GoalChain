#!/usr/bin/env bash
# Push Mac ~/.hermes config → VPS (inverse of install-hermes-mirror-mac.sh).
# Use after changing keys/model/SOUL on Mac so the 24/7 gateway matches.
#
# Usage:
#   bash ops/hermes/push-hermes-mirror-to-server.sh
#   bash ops/hermes/push-hermes-mirror-to-server.sh --env-only
#   bash ops/hermes/push-hermes-mirror-to-server.sh --no-restart
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SSH_HOST="${GOALCHAIN_SSH:-goalchain@178.105.148.109}"
HERMES_HOME="${HERMES_HOME:-$HOME/.hermes}"
REMOTE_HERMES="${REMOTE_HERMES:-/home/goalchain/.hermes}"
REMOTE_GOALCHAIN="${REMOTE_GOALCHAIN:-/home/goalchain/hermes/workspace/GoalChain}"
REMOTE_OPS="${REMOTE_GOALCHAIN}/ops/hermes"

PUSH_ENV=true
PUSH_AUTH=true
PUSH_CONFIG=true
PUSH_SOUL=true
RESTART_GATEWAY=true

for arg in "$@"; do
  case "${arg}" in
    --env-only) PUSH_AUTH=false; PUSH_CONFIG=false; PUSH_SOUL=false ;;
    --no-auth) PUSH_AUTH=false ;;
    --no-config) PUSH_CONFIG=false ;;
    --no-soul) PUSH_SOUL=false ;;
    --no-restart) RESTART_GATEWAY=false ;;
    -h|--help)
      echo "Usage: $0 [--env-only] [--no-auth] [--no-config] [--no-soul] [--no-restart]"
      exit 0
      ;;
  esac
done

log() { printf '[hermes-push] %s\n' "$*"; }

[[ -f "${HERMES_HOME}/.env" ]] || { log "ERROR: ${HERMES_HOME}/.env missing — run install-hermes-mirror-mac.sh first"; exit 1; }

STAMP="$(date +%Y%m%d%H%M%S)"
STAGING="${HERMES_HOME}/push-staging-${STAMP}"
mkdir -p "${STAGING}"

prepare_env_for_server() {
  python3 - "${HERMES_HOME}" "${STAGING}" <<'PY'
import sys
from pathlib import Path

home = Path(sys.argv[1])
out = Path(sys.argv[2]) / ".env"
local = home / ".env"

mac_only_prefixes = (
    "TERMINAL_", "BROWSER_", "AGENT_BROWSER_", "IMAGE_TOOLS_",
    "MOA_", "VISION_", "WEB_TOOLS_", "GOALCHAIN_REPO_PATH", "GOALCHAIN_HERMES_HOME",
)

def key_of(line: str) -> str:
    s = line.strip()
    if not s or s.startswith("#") or "=" not in s:
        return ""
    return s.split("=", 1)[0].strip()

lines = local.read_text(encoding="utf-8").splitlines() if local.exists() else []
out_lines = []
for line in lines:
    k = key_of(line)
    if k and any(k.startswith(p) for p in mac_only_prefixes):
        continue
    out_lines.append(line)

out_lines.append("")
out_lines.append("# --- pushed from Mac (push-hermes-mirror-to-server.sh) ---")
out.write_text("\n".join(out_lines).rstrip() + "\n", encoding="utf-8")
print("prepared", out)
PY
}

prepare_config_for_server() {
  export HERMES_HOME REPO_ROOT STAGING REMOTE_GOALCHAIN
  python3 - <<'PY'
import os
from pathlib import Path

try:
    import yaml
except ImportError:
    raise SystemExit("pip install pyyaml")

home = Path(os.environ["HERMES_HOME"])
staging = Path(os.environ["STAGING"])
repo = Path(os.environ["REPO_ROOT"])
remote_repo = os.environ["REMOTE_GOALCHAIN"]

src = yaml.safe_load((home / "config.yaml").read_text(encoding="utf-8")) or {}
out = {}

for key in ("model", "custom_providers", "providers", "fallback_providers",
            "display", "agent", "x_search", "compression", "skills"):
    if key in src:
        out[key] = src[key]

# Language: keep server public-channel prompts — merge display only partially
display = out.setdefault("display", {})
if isinstance(src.get("display"), dict):
    if "language" in src["display"]:
        display["language"] = src["display"]["language"]

# MCP → server paths
mcp = out.setdefault("mcp_servers", {})
gbrain = str(Path.home() / ".bun/bin/gbrain")
mcp["gbrain"] = {"command": "/home/goalchain/.bun/bin/gbrain", "args": ["serve"]}
ops_py = f"{remote_repo}/ops/hermes/mcp-goalchain-ops.py"
mcp["goalchain-ops"] = {
    "command": "/home/goalchain/.hermes/hermes-agent/venv/bin/python3",
    "args": [ops_py],
    "env": {
        "GOALCHAIN_API_BASE": "https://crm.goalchain.fun/goalchain-api",
        "RPC_URL": "https://api.devnet.solana.com",
        "PROGRAM_ID": "FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg",
        "GOALCHAIN_REPO_PATH": remote_repo,
    },
    "timeout": 90,
    "connect_timeout": 30,
}

(staging / "config.yaml").write_text(
    yaml.dump(out, default_flow_style=False, sort_keys=False), encoding="utf-8"
)
print("prepared config patch sections:", list(out.keys()))
PY
}

remote_backup_and_push() {
  ssh -o BatchMode=yes "${SSH_HOST}" "mkdir -p ${REMOTE_HERMES}/backups && \
    cp -a ${REMOTE_HERMES}/.env ${REMOTE_HERMES}/backups/.env.pre-push-${STAMP} 2>/dev/null || true; \
    cp -a ${REMOTE_HERMES}/config.yaml ${REMOTE_HERMES}/backups/config.pre-push-${STAMP} 2>/dev/null || true; \
    cp -a ${REMOTE_HERMES}/auth.json ${REMOTE_HERMES}/backups/auth.pre-push-${STAMP} 2>/dev/null || true"
  log "remote backup: ${REMOTE_HERMES}/backups/*.${STAMP}"

  if [[ "${PUSH_ENV}" == true ]]; then
    scp -o BatchMode=yes -q "${STAGING}/.env" "${SSH_HOST}:${REMOTE_HERMES}/.env.push"
    ssh -o BatchMode=yes "${SSH_HOST}" "REMOTE_HERMES='${REMOTE_HERMES}' python3 - <<'PY'
from pathlib import Path
import os

remote = Path(os.environ['REMOTE_HERMES'])
push = remote / '.env.push'
target = remote / '.env'
server_only_prefixes = ('TERMINAL_', 'BROWSER_')

def parse_lines(text):
    return text.splitlines()

def key_of(line):
    s = line.strip()
    if not s or s.startswith('#') or '=' not in s:
        return ''
    return s.split('=', 1)[0].strip()

def merge(push_path, target_path):
    old = parse_lines(target_path.read_text()) if target_path.exists() else []
    new = parse_lines(push_path.read_text())
    out = []
    seen = set()
    for line in new:
        k = key_of(line)
        if k:
            seen.add(k)
        out.append(line)
    for line in old:
        k = key_of(line)
        if not k:
            if line.strip() or (out and not out[-1].strip()):
                out.append(line)
            continue
        if k in seen:
            continue
        if any(k.startswith(p) for p in server_only_prefixes):
            out.append(line)
            seen.add(k)
    out.append('')
    out.append('# --- GoalChain server paths (do not mirror to Mac) ---')
    out.append('GOALCHAIN_REPO_PATH=\"/home/goalchain/hermes/workspace/GoalChain\"')
    out.append('GOALCHAIN_HERMES_HOME=\"/home/goalchain/hermes\"')
    target_path.write_text(chr(10).join(out).rstrip() + chr(10))
    push_path.unlink(missing_ok=True)

merge(push, target)
print('merged', target)
PY"
    ssh -o BatchMode=yes "${SSH_HOST}" "chmod 600 ${REMOTE_HERMES}/.env"
    log "pushed .env"
  fi

  if [[ "${PUSH_AUTH}" == true && -f "${HERMES_HOME}/auth.json" ]]; then
    scp -o BatchMode=yes -q "${HERMES_HOME}/auth.json" "${SSH_HOST}:${REMOTE_HERMES}/auth.json"
    ssh -o BatchMode=yes "${SSH_HOST}" "chmod 600 ${REMOTE_HERMES}/auth.json"
    log "pushed auth.json"
  fi

  if [[ "${PUSH_CONFIG}" == true ]]; then
    scp -o BatchMode=yes -q "${STAGING}/config.yaml" "${SSH_HOST}:${REMOTE_HERMES}/config.patch.yaml"
    ssh -o BatchMode=yes "${SSH_HOST}" "REMOTE_HERMES='${REMOTE_HERMES}' python3 - <<'PY'
import os
from pathlib import Path
import yaml

remote = Path(os.environ['REMOTE_HERMES'])
patch = yaml.safe_load((remote / 'config.patch.yaml').read_text()) or {}
cfg_path = remote / 'config.yaml'
cfg = yaml.safe_load(cfg_path.read_text()) if cfg_path.exists() else {}

for key, val in patch.items():
    if key == 'mcp_servers' and isinstance(val, dict):
        cfg.setdefault('mcp_servers', {}).update(val)
    elif key == 'display' and isinstance(val, dict):
        d = cfg.setdefault('display', {})
        d.update(val)
    else:
        cfg[key] = val

cfg_path.write_text(yaml.dump(cfg, default_flow_style=False, sort_keys=False))
(remote / 'config.patch.yaml').unlink(missing_ok=True)
print('merged config.yaml')
PY"
    log "merged config.yaml (model + MCP; kept discord/slack blocks)"
  fi

  if [[ "${PUSH_SOUL}" == true && -f "${HERMES_HOME}/SOUL.md" ]]; then
    scp -o BatchMode=yes -q "${HERMES_HOME}/SOUL.md" "${SSH_HOST}:${REMOTE_HERMES}/SOUL.md"
    log "pushed SOUL.md"
  fi
}

push_repo_scripts() {
  scp -o BatchMode=yes -q \
    "${REPO_ROOT}/ops/hermes/fix-hermes-gateway-service.sh" \
    "${REPO_ROOT}/ops/hermes/configure-hermes-language.sh" \
    "${REPO_ROOT}/ops/hermes/configure-discord-openclaw-chat.sh" \
    "${REPO_ROOT}/ops/hermes/push-hermes-mirror-to-server.sh" \
    "${REPO_ROOT}/ops/hermes/install-hermes-mirror-mac.sh" \
    "${SSH_HOST}:${REMOTE_OPS}/" 2>/dev/null || log "WARN: ops/hermes scp skipped (git pull on server instead)"
}

restart_remote_gateway() {
  [[ "${RESTART_GATEWAY}" == true ]] || return 0
  ssh -o BatchMode=yes "${SSH_HOST}" \
    "bash ${REMOTE_OPS}/fix-hermes-gateway-service.sh 2>/dev/null || systemctl --user restart hermes-gateway; sleep 4; systemctl --user is-active hermes-gateway && echo gateway_ok || echo gateway_fail"
  log "gateway restart requested"
}

main() {
  log "Mac → server push (${SSH_HOST})"
  prepare_env_for_server
  if [[ "${PUSH_CONFIG}" == true ]]; then
    prepare_config_for_server
  fi
  remote_backup_and_push
  push_repo_scripts
  restart_remote_gateway
  rm -rf "${STAGING}"
  cat <<EOF

=== Push complete ===
Server: ${SSH_HOST}:${REMOTE_HERMES}
Backup: ${REMOTE_HERMES}/backups/*.${STAMP}

Pull server → Mac again:  bash ops/hermes/install-hermes-mirror-mac.sh
Push Mac → server:         bash ops/hermes/push-hermes-mirror-to-server.sh

EOF
}

main "$@"
