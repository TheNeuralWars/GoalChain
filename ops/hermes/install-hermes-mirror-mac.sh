#!/usr/bin/env bash
# Mirror Hermes Agent config from VPS → Mac CLI (same API keys / model as server).
# Usage: GOALCHAIN_SSH=ubuntu@89.168.20.135 bash ops/hermes/install-hermes-mirror-mac.sh
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SSH_HOST="${GOALCHAIN_SSH:-ubuntu@89.168.20.135}"
HERMES_HOME="${HERMES_HOME:-$HOME/.hermes}"
REMOTE_HERMES="${REMOTE_HERMES:-/home/ubuntu/.hermes}"
STAMP="$(date +%Y%m%d%H%M%S)"
BACKUP="${HERMES_HOME}/backups/pre-mirror-${STAMP}"

log() { printf '[hermes-mirror] %s\n' "$*"; }

install_or_update_cli() {
  if command -v hermes >/dev/null 2>&1; then
    log "hermes: $(hermes --version 2>/dev/null | head -1 || true)"
    hermes update 2>/dev/null || log "WARN: hermes update skipped (run manually: hermes update)"
  else
    log "installing Hermes CLI..."
    if command -v uv >/dev/null 2>&1; then
      uv tool install hermes-agent 2>/dev/null || curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
    else
      curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
    fi
  fi
  command -v hermes >/dev/null 2>&1 || { log "ERROR: hermes not in PATH"; exit 1; }
}

backup_local() {
  mkdir -p "${BACKUP}"
  for f in .env config.yaml auth.json SOUL.md; do
    [[ -f "${HERMES_HOME}/${f}" ]] && cp -a "${HERMES_HOME}/${f}" "${BACKUP}/${f}"
  done
  log "backup: ${BACKUP}"
}

pull_remote_files() {
  mkdir -p "${HERMES_HOME}/mirror-staging"
  scp -o BatchMode=yes -q \
    "${SSH_HOST}:${REMOTE_HERMES}/.env" \
    "${SSH_HOST}:${REMOTE_HERMES}/auth.json" \
    "${SSH_HOST}:${REMOTE_HERMES}/config.yaml" \
    "${SSH_HOST}:${REMOTE_HERMES}/SOUL.md" \
    "${HERMES_HOME}/mirror-staging/" 2>/dev/null || {
    log "ERROR: scp failed — check SSH: ${SSH_HOST}"
    exit 1
  }
  log "pulled .env auth.json config.yaml SOUL.md from ${SSH_HOST}"
}

merge_env() {
  python3 - "${HERMES_HOME}" "${REPO_ROOT}" <<'PY'
import sys
from pathlib import Path

home = Path(sys.argv[1])
repo = Path(sys.argv[2])
staging = home / "mirror-staging"
local = home / ".env"
remote = staging / ".env"

def parse(path: Path) -> list[str]:
    if not path.exists():
        return []
    return path.read_text(encoding="utf-8").splitlines()

def key_of(line: str) -> str:
    s = line.strip()
    if not s or s.startswith("#") or "=" not in s:
        return ""
    return s.split("=", 1)[0].strip()

# Keys only on Mac (terminal/browser local)
mac_keep_prefixes = ("TERMINAL_", "BROWSER_", "AGENT_BROWSER_", "IMAGE_TOOLS_", "MOA_", "VISION_", "WEB_TOOLS_")

remote_lines = parse(remote)
local_lines = parse(local)
remote_keys = {key_of(l) for l in remote_lines if key_of(l)}

out: list[str] = []
seen = set()

for line in remote_lines:
    k = key_of(line)
    if k:
        seen.add(k)
    out.append(line)

for line in local_lines:
    k = key_of(line)
    if not k:
        if line.strip() or (out and not out[-1].strip()):
            out.append(line)
        continue
    if k in seen:
        continue
    if any(k.startswith(p) for p in mac_keep_prefixes):
        out.append(line)
        seen.add(k)

# GoalChain paths for Mac
extras = {
    "GOALCHAIN_REPO_PATH": str(repo),
    "GOALCHAIN_HERMES_HOME": str(Path.home() / "hermes"),
}
out.append("")
out.append("# --- GoalChain Mac mirror (install-hermes-mirror-mac.sh) ---")
for k, v in extras.items():
    if k not in seen:
        out.append(f'{k}="{v}"')

local.write_text("\n".join(out).rstrip() + "\n", encoding="utf-8")
print("merged", local)
PY
  chmod 600 "${HERMES_HOME}/.env"
}

apply_auth() {
  cp -a "${HERMES_HOME}/mirror-staging/auth.json" "${HERMES_HOME}/auth.json"
  chmod 600 "${HERMES_HOME}/auth.json"
  log "auth.json mirrored (xai-oauth / providers)"
}

patch_config_for_mac() {
  export HERMES_HOME REPO_ROOT
  python3 - <<'PY'
import os
from pathlib import Path

try:
    import yaml
except ImportError:
    raise SystemExit("pip install pyyaml")

home = Path(os.environ["HERMES_HOME"])
repo = Path(os.environ["REPO_ROOT"])
src = yaml.safe_load((home / "mirror-staging/config.yaml").read_text(encoding="utf-8"))
dst_path = home / "config.yaml"
dst = {}
if dst_path.exists():
    dst = yaml.safe_load(dst_path.read_text(encoding="utf-8")) or {}

# Model = server mirror (Grok default)
for key in ("model", "custom_providers", "mcp_servers", "x_search", "display"):
    if key in src:
        dst[key] = src[key]

# Mac-friendly display language
dst.setdefault("display", {})["language"] = dst.get("display", {}).get("language") or "en"

# MCP paths → Mac
mcp = dst.setdefault("mcp_servers", {})
gbin = Path.home() / ".bun/bin/gbrain"
if not gbin.exists():
    import shutil
    gbin = shutil.which("gbrain") or str(gbin)
mcp["gbrain"] = {"command": str(gbin), "args": ["serve"]}
ops_py = repo / "ops/hermes/mcp-goalchain-ops.py"
py = Path.home() / ".hermes/hermes-agent/venv/bin/python3"
if not py.exists():
    import shutil
    py = shutil.which("python3") or "python3"
mcp["goalchain-ops"] = {
    "command": str(py),
    "args": [str(ops_py)],
    "env": {
        "GOALCHAIN_API_BASE": "https://crm.goalchain.fun/goalchain-api",
        "RPC_URL": "https://api.devnet.solana.com",
        "PROGRAM_ID": "FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg",
        "GOALCHAIN_REPO_PATH": str(repo),
    },
    "timeout": 90,
}

if "hermes-vault" in mcp:
    mcp["hermes-vault"]["command"] = str(Path.home() / ".local/bin/hermes-vault")


# CLI: do not mirror gateway-only platform blocks blindly
dst_path.write_text(yaml.dump(dst, default_flow_style=False, sort_keys=False), encoding="utf-8")
print("patched", dst_path, "model=", dst.get("model", {}))
PY
}

copy_soul() {
  cp -a "${HERMES_HOME}/mirror-staging/SOUL.md" "${HERMES_HOME}/SOUL.md"
  log "SOUL.md mirrored from server"
}

link_goalchain_workspace() {
  mkdir -p "${HERMES_HOME}/workspace"
  local link="${HERMES_HOME}/workspace/GoalChain"
  if [[ -e "${link}" && ! -L "${link}" ]]; then
    log "workspace/GoalChain exists (not symlink) — left as-is"
    return 0
  fi
  ln -sfn "${REPO_ROOT}" "${link}"
  log "workspace → ${REPO_ROOT}"
}

verify_cli() {
  log "smoke test (grok mirror)..."
  if hermes chat -q "Reply with exactly: MIRROR_OK" 2>&1 | grep -q MIRROR_OK; then
    log "CLI mirror OK"
  else
    log "WARN: smoke test did not return MIRROR_OK — run: hermes chat -q 'ping'"
    log "      If xAI OAuth expired: hermes auth login xai"
  fi
}

main() {
  log "GoalChain Hermes Mac mirror ← ${SSH_HOST}"
  install_or_update_cli
  backup_local
  pull_remote_files
  merge_env
  apply_auth
  patch_config_for_mac
  copy_soul
  link_goalchain_workspace
  rm -rf "${HERMES_HOME}/mirror-staging"
  cat <<EOF

=== Hermes Mac mirror ready ===
CLI:     $(command -v hermes)
Home:    ${HERMES_HOME}
Model:   grok-4.3 (xai-oauth) — same as VPS
Repo:    ${REPO_ROOT}

Examples:
  hermes
  hermes chat -q "GoalChain status"
  hermes chat --provider openrouter -q "hello"
  hermes -s hermes-agent-dev -q "list open PRs"
  hermes --continue
  hermes -w -q "Fix issue #93"

Re-sync from server: bash ${REPO_ROOT}/ops/hermes/install-hermes-mirror-mac.sh

EOF
  verify_cli
}

main "$@"
