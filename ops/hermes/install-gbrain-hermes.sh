#!/usr/bin/env bash
# Install GBrain on Hermes server and wire it to OpenClaw + GoalChain context.
# Idempotent. Safe on 4GB VPS: PGLite, optional --no-embedding without API keys.
set -euo pipefail

HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
REPO="${GOALCHAIN_REPO_PATH:-$HERMES_HOME/workspace/GoalChain}"
BRAIN_REPO="${GBRAIN_REPO:-$HOME/brain}"
OPENCLAW_CONFIG="${OPENCLAW_CONFIG:-$HOME/.openclaw/openclaw.json}"
# Hermes Agent (primary on VPS); OpenClaw workspace is legacy fallback.
HERMES_WORKSPACE="${HERMES_WORKSPACE:-$HOME/.hermes/workspace}"
WORKSPACE="${GBRAIN_SKILLPACK_WORKSPACE:-$HERMES_WORKSPACE}"
HERMES_CONFIG="${HERMES_CONFIG:-$HOME/.hermes/config.yaml}"
CONFIG_ENV="${HERMES_HOME}/config.env"
SEARCH_MODE="${GBRAIN_SEARCH_MODE:-balanced}"
INSTALL_DREAM_CRON="${INSTALL_DREAM_CRON:-false}"

log() { printf '[gbrain-install] %s\n' "$*"; }

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "ERROR: missing command: $1" >&2
    exit 1
  }
}

install_bun() {
  export PATH="$HOME/.bun/bin:${PATH:-}"
  if command -v bun >/dev/null 2>&1; then
    log "bun: $(bun --version)"
    return 0
  fi
  if command -v unzip >/dev/null 2>&1; then
    log "installing bun (curl installer)..."
    curl -fsSL https://bun.sh/install | bash
  else
    log "installing bun (zip + python; unzip not available)..."
    mkdir -p "$HOME/.bun/bin"
    curl -fsSL -o /tmp/bun.zip "https://github.com/oven-sh/bun/releases/download/bun-v1.2.15/bun-linux-x64.zip"
    python3 -c 'import zipfile; zipfile.ZipFile("/tmp/bun.zip").extractall("/tmp/bun-extract")'
    cp /tmp/bun-extract/bun-linux-x64/bun "$HOME/.bun/bin/bun"
    chmod +x "$HOME/.bun/bin/bun"
  fi
  export PATH="$HOME/.bun/bin:$PATH"
  grep -q '.bun/bin' "$HOME/.bashrc" 2>/dev/null || echo 'export PATH="$HOME/.bun/bin:$PATH"' >> "$HOME/.bashrc"
  bun --version
}

install_gbrain_cli() {
  export PATH="$HOME/.bun/bin:${PATH:-}"
  if command -v gbrain >/dev/null 2>&1; then
    log "gbrain: $(gbrain --version 2>/dev/null || echo present)"
    return 0
  fi
  if [[ ! -d "${HOME}/gbrain-src/.git" ]]; then
    log "cloning gbrain source..."
    git clone --depth 1 https://github.com/garrytan/gbrain.git "${HOME}/gbrain-src"
  fi
  cd "${HOME}/gbrain-src"
  bun install
  bun link
  export PATH="$HOME/.bun/bin:$PATH"
  gbrain --version
}

load_api_keys() {
  if [[ -f "${CONFIG_ENV}" ]]; then
    # shellcheck disable=SC1090
    set -a
    source "${CONFIG_ENV}" 2>/dev/null || true
    set +a
  fi
}

has_embedding_key() {
  [[ -n "${ZEROENTROPY_API_KEY:-}" || -n "${OPENAI_API_KEY:-}" || -n "${VOYAGE_API_KEY:-}" ]]
}

init_brain() {
  export PATH="$HOME/.bun/bin:${PATH:-}"
  load_api_keys
  if [[ ! -d "${HOME}/.gbrain" ]]; then
    if has_embedding_key; then
      log "gbrain init --pglite (with embedding provider)"
      gbrain init --pglite
    else
      log "gbrain init --pglite --no-embedding (no API keys; keyword search only)"
      gbrain init --pglite --no-embedding || gbrain init --pglite
    fi
  else
    log "gbrain already initialized (~/.gbrain exists)"
  fi
  gbrain doctor --fast 2>/dev/null || gbrain doctor || true
  if has_embedding_key; then
    gbrain config set search.mode "${SEARCH_MODE}" 2>/dev/null || true
  fi
}

setup_brain_repo() {
  mkdir -p "${BRAIN_REPO}"/{projects,operations,concepts,people,companies}
  if [[ ! -d "${BRAIN_REPO}/.git" ]]; then
    git -C "${BRAIN_REPO}" init -q 2>/dev/null || true
  fi
  cat > "${BRAIN_REPO}/projects/goalchain.md" <<EOF
# GoalChain

Transactional football prediction game on Solana devnet.
Canonical repo: ${REPO}
Play: https://play.goalchain.fun
API ops: https://crm.goalchain.fun/goalchain-api
Hermes server: ubuntu@89.168.20.135 (Oracle)
EOF
}

import_goalchain_context() {
  export PATH="$HOME/.bun/bin:${PATH:-}"
  [[ -d "${REPO}" ]] || { log "WARN: repo missing at ${REPO}"; return 0; }
  log "importing GoalChain docs into brain (no mint assets)..."
  for sub in ai_context docs/intake docs/proposals; do
    [[ -d "${REPO}/${sub}" ]] || continue
    gbrain import "${REPO}/${sub}" --no-embed 2>/dev/null || gbrain import "${REPO}/${sub}" || true
  done
  for f in IMPLEMENTATION_STATUS.md FRONTEND_ROUTING.md PLAY_DEPLOY_GUIDE.md BACKLOG_STATUS_MODEL.md; do
    [[ -f "${REPO}/docs/${f}" ]] && gbrain import "${REPO}/docs/${f}" --no-embed 2>/dev/null || true
  done
  if has_embedding_key; then
    log "embedding stale pages..."
    gbrain embed --stale 2>/dev/null || log "WARN: embed failed (check API keys)"
  fi
}

scaffold_skills() {
  export PATH="$HOME/.bun/bin:${PATH:-}"
  mkdir -p "${WORKSPACE}"
  gbrain skillpack scaffold --all --workspace "${WORKSPACE}" 2>/dev/null \
    || log "WARN: skillpack scaffold skipped (re-run: gbrain skillpack scaffold --all --workspace ${WORKSPACE})"
}

wire_hermes_mcp() {
  need_cmd python3
  [[ -f "${HERMES_CONFIG}" ]] || { log "WARN: no ${HERMES_CONFIG}"; return 0; }
  cp "${HERMES_CONFIG}" "${HERMES_CONFIG}.bak-gbrain-$(date +%Y%m%d%H%M%S)"
  export HERMES_CONFIG GBRAIN_CMD="${HOME}/.bun/bin/gbrain"
  python3 - <<'PY'
import os
from pathlib import Path

try:
    import yaml
except ImportError:
    print("WARN: PyYAML missing; pip install pyyaml or patch mcp_servers manually")
    raise SystemExit(0)

path = Path(os.environ["HERMES_CONFIG"])
cfg = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
gbrain_cmd = os.environ.get("GBRAIN_CMD", "gbrain")
if not Path(gbrain_cmd).exists():
    gbrain_cmd = "gbrain"
servers = cfg.setdefault("mcp_servers", {})
servers["gbrain"] = {"command": gbrain_cmd, "args": ["serve"]}
path.write_text(yaml.dump(cfg, default_flow_style=False, sort_keys=False), encoding="utf-8")
print("patched mcp_servers.gbrain in", path)
PY
  log "Hermes MCP gbrain registered (restart hermes-gateway)"
}

wire_openclaw_mcp() {
  need_cmd python3
  [[ -f "${OPENCLAW_CONFIG}" ]] || { log "WARN: no ${OPENCLAW_CONFIG}"; return 0; }
  cp "${OPENCLAW_CONFIG}" "${OPENCLAW_CONFIG}.bak-gbrain-$(date +%Y%m%d%H%M%S)"
  python3 - "${OPENCLAW_CONFIG}" <<'PY'
import json
import sys
from pathlib import Path

path = Path(sys.argv[1])
cfg = json.loads(path.read_text(encoding="utf-8"))
mcp = cfg.setdefault("mcp", {})
servers = mcp.setdefault("servers", {})
servers["gbrain"] = {
    "command": str(Path.home() / ".bun/bin/gbrain"),
    "args": ["serve"],
}
if not Path(servers["gbrain"]["command"]).exists():
    servers["gbrain"]["command"] = "gbrain"
path.write_text(json.dumps(cfg, indent=2) + "\n", encoding="utf-8")
print("patched mcp.servers.gbrain in", path)
PY
  log "OpenClaw MCP gbrain registered (restart gateway if running)"
}

wire_fcc_mcp() {
  need_cmd python3
  local fcc_config="${HOME}/.claude/config.json"
  mkdir -p "$(dirname "${fcc_config}")"
  export FCC_CONFIG="${fcc_config}" GBRAIN_CMD="${HOME}/.bun/bin/gbrain"
  python3 - <<'PY'
import os
import json
from pathlib import Path

path = Path(os.environ["FCC_CONFIG"])
gbrain_cmd = os.environ.get("GBRAIN_CMD", "gbrain")
if not Path(gbrain_cmd).exists():
    gbrain_cmd = "gbrain"

cfg = {}
if path.exists():
    try:
        cfg = json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        cfg = {}

servers = cfg.setdefault("mcpServers", {})
servers["gbrain"] = {
    "command": gbrain_cmd,
    "args": ["serve"]
}

path.write_text(json.dumps(cfg, indent=2) + "\n", encoding="utf-8")
print("patched mcpServers.gbrain in FCC config:", path)
PY
  log "FCC MCP gbrain registered (~/.claude/config.json)"
}

wire_opencode_mcp() {
  need_cmd python3
  local opencode_config="${HOME}/.opencode/opencode.json"
  mkdir -p "$(dirname "${opencode_config}")"
  export OPENCODE_CONFIG="${opencode_config}" GBRAIN_CMD="${HOME}/.bun/bin/gbrain"
  python3 - <<'PY'
import os
import json
from pathlib import Path

path = Path(os.environ["OPENCODE_CONFIG"])
gbrain_cmd = os.environ.get("GBRAIN_CMD", "gbrain")
if not Path(gbrain_cmd).exists():
    gbrain_cmd = "gbrain"

cfg = {}
if path.exists():
    try:
        cfg = json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        cfg = {}

servers = cfg.setdefault("mcpServers", {})
servers["gbrain"] = {
    "command": gbrain_cmd,
    "args": ["serve"]
}

path.write_text(json.dumps(cfg, indent=2) + "\n", encoding="utf-8")
print("patched mcpServers.gbrain in OpenCode config:", path)
PY
  log "OpenCode MCP gbrain registered (~/.opencode/opencode.json)"
}

install_dream_cron_hint() {
  if [[ "${INSTALL_DREAM_CRON}" != "true" ]]; then
    log "dream cron: set INSTALL_DREAM_CRON=true to run: gbrain autopilot --install"
    return 0
  fi
  export PATH="$HOME/.bun/bin:${PATH:-}"
  gbrain autopilot --install 2>/dev/null || log "WARN: autopilot install failed"
}

print_next_steps() {
  cat <<EOF

=== GBrain install done ===
Brain repo:     ${BRAIN_REPO}
Hermes MCP:     mcp_servers.gbrain → gbrain serve (${HERMES_CONFIG})
Workspace:      ${WORKSPACE} (skills scaffolded)
FCC Config:     ~/.claude/config.json (gbrain registered)
OpenCode/Grok:  ~/.opencode/opencode.json (gbrain registered)

Copilot (already on server):
  - OpenClaw agent 'dev' → github-copilot/claude-sonnet-4.5
  - OpenCode: opencode providers list

Next:
  1) Add ZEROENTROPY_API_KEY or OPENAI_API_KEY to ${CONFIG_ENV}
  2) gbrain embed --stale
  3) Restart OpenClaw gateway / tmux session
  4) Test: gbrain think "GoalChain open blockers"

Guide: ${REPO}/docs/intake/2026-05-24-hermes-gbrain-copilot-setup.md
EOF
}

main() {
  log "Hermes GBrain install (GoalChain)"
  free -h | head -2 || true
  install_bun
  install_gbrain_cli
  init_brain
  setup_brain_repo
  import_goalchain_context
  scaffold_skills
  wire_hermes_mcp
  wire_openclaw_mcp
  wire_fcc_mcp
  wire_opencode_mcp
  install_dream_cron_hint
  print_next_steps
}

main "$@"
