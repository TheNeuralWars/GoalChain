#!/usr/bin/env bash
# Align Hermes VPS runtime: Manager (Grok) + code agent (FCC) + OA worker on-server.
# Safe to re-run. Does not print secrets.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
SCRIPTS_DIR="${HERMES_HOME}/scripts"
CONFIG_FILE="${HERMES_HOME}/config.env"
HERMES_AGENT_HOME="${HERMES_AGENT_HOME:-$HOME/.hermes}"

echo "==> GoalChain Hermes runtime setup"
echo "    HERMES_HOME=${HERMES_HOME}"

bash "${SCRIPT_DIR}/install-hermes-server.sh"

if [[ -x "${SCRIPT_DIR}/configure-git-identity.sh" ]]; then
  bash "${SCRIPT_DIR}/configure-git-identity.sh"
elif [[ -x "${SCRIPTS_DIR}/configure-git-identity.sh" ]]; then
  bash "${SCRIPTS_DIR}/configure-git-identity.sh"
fi

ensure_key() {
  local key="$1"
  local value="$2"
  python3 - "$CONFIG_FILE" "$key" "$value" <<'PY'
import sys
from pathlib import Path

cfg = Path(sys.argv[1])
key = sys.argv[2]
val = sys.argv[3]
lines = cfg.read_text(encoding="utf-8").splitlines() if cfg.exists() else []
prefix = f"{key}="
replaced = False
for i, line in enumerate(lines):
    if line.strip().startswith(prefix):
        lines[i] = f'{key}="{val}"'
        replaced = True
        break
if not replaced:
    lines.append(f'{key}="{val}"')
cfg.parent.mkdir(parents=True, exist_ok=True)
cfg.write_text("\n".join(lines) + "\n", encoding="utf-8")
PY
}

# Manager model (chat / triage) vs code model (repo edits).
ensure_key "GIT_AUTHOR_NAME" "Hermes"
ensure_key "GIT_AUTHOR_EMAIL" "hermes@goalchain.local"
ensure_key "OA_MODEL" "xai/grok-4.3"
ensure_key "OA_CODE_ENGINE" "hermes"
ensure_key "OA_CODE_MODEL" "nemotron-3-ultra-free"
ensure_key "OA_CODE_CMD" "${HOME}/.hermes/hermes-agent/venv/bin/python -m hermes_cli.main"
ensure_key "OA_RESEARCH_PUBLISHER_ENABLED" "false"

if [[ "$(uname -s)" == "Linux" ]]; then
  ensure_key "OA_AGENT_GROK_CMD" "bash ${HERMES_HOME}/scripts/oa-agent-runner.sh grok"
  ensure_key "OA_AGENT_OPENCODE_CMD" "bash ${HERMES_HOME}/scripts/oa-agent-runner.sh opencode"
  ensure_key "OA_AGENT_CURSOR_CMD" ""
  ensure_key "OA_AGENT_ANTIGRAVITY_CMD" ""
else
  ensure_key "OA_AGENT_GROK_CMD" "bash ${HERMES_HOME}/scripts/oa-agent-runner.sh grok"
  ensure_key "OA_AGENT_OPENCODE_CMD" "bash ${HERMES_HOME}/scripts/oa-dispatch-local.sh opencode"
  ensure_key "OA_AGENT_CURSOR_CMD" "bash ${HERMES_HOME}/scripts/oa-dispatch-local.sh cursor"
  ensure_key "OA_AGENT_ANTIGRAVITY_CMD" "bash ${HERMES_HOME}/scripts/oa-dispatch-local.sh antigravity"
fi

mkdir -p "${HERMES_AGENT_HOME}/workspace/docs" "${HERMES_AGENT_HOME}/workspace/memory"

if [[ -f "${SCRIPT_DIR}/deploy-hermes-workspace.sh" ]]; then
  bash "${SCRIPT_DIR}/deploy-hermes-workspace.sh" --update
fi

if [[ -x "${SCRIPT_DIR}/configure-hermes-language.sh" ]]; then
  bash "${SCRIPT_DIR}/configure-hermes-language.sh"
elif [[ -x "${SCRIPTS_DIR}/configure-hermes-language.sh" ]]; then
  bash "${SCRIPTS_DIR}/configure-hermes-language.sh"
fi

if [[ -x "${HOME}/.hermes/hermes-agent/venv/bin/python" ]]; then
  echo "==> Hermes CLI: OK"
  if [[ -x "${SCRIPT_DIR}/install-hermes-superpowers.sh" ]]; then
    bash "${SCRIPT_DIR}/install-hermes-superpowers.sh" || echo "WARN: install-hermes-superpowers.sh failed (retry manually)"
  fi
else
  echo "WARN: Hermes CLI not found at ~/.hermes/hermes-agent/venv/bin/python"
fi

if [[ "${INSTALL_SYSTEMD:-true}" == "true" ]] && [[ "$(uname -s)" == "Linux" ]]; then
  INSTALL_SYSTEMD=true bash "${SCRIPTS_DIR}/oa-systemd-install.sh" 2>/dev/null \
    || bash "${SCRIPT_DIR}/oa-systemd-install.sh"
fi

if [[ -x "${SCRIPTS_DIR}/oa-control.sh" ]]; then
  bash "${SCRIPTS_DIR}/oa-control.sh" restart || true
fi

echo ""
echo "Runtime setup complete."
echo "  Manager: Hermes Agent + OA_MODEL=xai/grok-4.3"
echo "  Code:    OA_CODE_ENGINE=fcc (Free Claude Code)"
echo "  Check:   bash ${SCRIPTS_DIR}/oa-control.sh status"
echo "  Context: bash ${SCRIPTS_DIR}/hermes-context.sh"
