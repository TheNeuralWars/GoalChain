#!/usr/bin/env bash
# Install GBrain for Cursor IDE on macOS/Linux (GoalChain repo).
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BRAIN_REPO="${GBRAIN_BRAIN_REPO:-$HOME/brain}"
CURSOR_MCP="${REPO_ROOT}/.cursor/mcp.json"
SEARCH_MODE="${GBRAIN_SEARCH_MODE:-balanced}"

log() { printf '[gbrain-cursor] %s\n' "$*"; }

install_bun() {
  export PATH="$HOME/.bun/bin:${PATH:-}"
  if command -v bun >/dev/null 2>&1; then
    log "bun: $(bun --version)"
    return 0
  fi
  log "installing bun..."
  curl -fsSL https://bun.sh/install | bash
  export PATH="$HOME/.bun/bin:$PATH"
}

install_gbrain() {
  export PATH="$HOME/.bun/bin:${PATH:-}"
  if command -v gbrain >/dev/null 2>&1; then
    log "gbrain: $(gbrain --version 2>/dev/null || true)"
    return 0
  fi
  bun install -g github:garrytan/gbrain
  gbrain --version
}

load_keys() {
  set -a
  [[ -f "${REPO_ROOT}/.env" ]] && source "${REPO_ROOT}/.env" 2>/dev/null || true
  set +a
}

init_brain() {
  export PATH="$HOME/.bun/bin:${PATH:-}"
  load_keys
  if [[ ! -d "${HOME}/.gbrain" ]]; then
    if [[ -n "${ZEROENTROPY_API_KEY:-}" || -n "${OPENAI_API_KEY:-}" ]]; then
      gbrain init --pglite
    else
      log "init --pglite --no-embedding (add ZEROENTROPY_API_KEY or OPENAI_API_KEY to .env for vectors)"
      gbrain init --pglite --no-embedding || gbrain init --pglite
    fi
  fi
  gbrain config set search.mode "${SEARCH_MODE}" 2>/dev/null || true
  gbrain doctor --fast 2>/dev/null || gbrain doctor || true
}

setup_brain_repo() {
  mkdir -p "${BRAIN_REPO}"/{projects,operations,concepts,people,companies}
  [[ -d "${BRAIN_REPO}/.git" ]] || git -C "${BRAIN_REPO}" init -q 2>/dev/null || true
}

import_goalchain() {
  export PATH="$HOME/.bun/bin:${PATH:-}"
  log "importing GoalChain context..."
  for sub in ai_context docs/intake docs/proposals; do
    [[ -d "${REPO_ROOT}/${sub}" ]] || continue
    gbrain import "${REPO_ROOT}/${sub}" --no-embed 2>/dev/null || gbrain import "${REPO_ROOT}/${sub}" || true
  done
  for f in IMPLEMENTATION_STATUS.md FRONTEND_ROUTING.md PLAY_DEPLOY_GUIDE.md; do
    [[ -f "${REPO_ROOT}/docs/${f}" ]] && gbrain import "${REPO_ROOT}/docs/${f}" --no-embed 2>/dev/null || true
  done
  if [[ -n "${ZEROENTROPY_API_KEY:-}" || -n "${OPENAI_API_KEY:-}" ]]; then
    gbrain embed --stale 2>/dev/null || log "WARN: embed skipped"
  fi
}

wire_cursor_mcp() {
  export PATH="$HOME/.bun/bin:${PATH:-}"
  mkdir -p "${REPO_ROOT}/.cursor"
  GBRAIN_BIN="$(command -v gbrain)"
  python3 - "${CURSOR_MCP}" "${GBRAIN_BIN}" <<'PY'
import json
import sys
from pathlib import Path

path = Path(sys.argv[1])
gbin = sys.argv[2]
data = {}
if path.exists():
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        data = {}
servers = data.setdefault("mcpServers", data.get("mcpServers", {}))
servers["gbrain"] = {"command": gbin, "args": ["serve"]}
path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
print("wrote", path)
PY
  log "Cursor MCP: ${CURSOR_MCP} — reload Cursor window to enable gbrain"
}

main() {
  install_bun
  install_gbrain
  init_brain
  setup_brain_repo
  import_goalchain
  wire_cursor_mcp
  cat <<EOF

=== GBrain ready for Cursor ===
CLI:     $(command -v gbrain)
Brain:   ~/.gbrain
Repo:    ${BRAIN_REPO}
MCP:     ${CURSOR_MCP}

Test: gbrain query "GoalChain Hermes FCC pipeline"
In Cursor: Settings → MCP → enable gbrain, then reload window.

EOF
}

main "$@"
