#!/usr/bin/env bash
# One-shot installer to enable hands-free Discord/WhatsApp -> OA dispatch.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
SRC_DIR="${REPO_ROOT}/ops/hermes"

HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
SCRIPTS_DIR="${HERMES_HOME}/scripts"
CONFIG_FILE="${HERMES_HOME}/config.env"
OA_HOME="${HERMES_HOME}/oa"

mkdir -p "${SCRIPTS_DIR}" "${OA_HOME}/inbox" "${OA_HOME}/logs" "${OA_HOME}/state"

if [[ ! -f "${CONFIG_FILE}" ]]; then
  cp "${SRC_DIR}/config.env.example" "${CONFIG_FILE}"
  if [[ "$(uname)" == "Darwin" ]]; then
    sed -i '' "s|\${HOME}|${HOME}|g" "${CONFIG_FILE}"
  else
    sed -i "s|\${HOME}|${HOME}|g" "${CONFIG_FILE}"
  fi
fi

copy_script() {
  local name="$1"
  cp "${SRC_DIR}/${name}" "${SCRIPTS_DIR}/${name}"
  chmod +x "${SCRIPTS_DIR}/${name}" || true
}

copy_script "create-task.sh"
copy_script "oa-worker.sh"
copy_script "oa-control.sh"
copy_script "oa-auth.sh"
copy_script "oa-agent-runner.sh"
copy_script "oa-dispatch-local.sh"
copy_script "oa-handsfree-smoketest.sh"
copy_script "oa-systemd-install.sh"
copy_script "oa-webhook.py"
copy_script "oa-healthcheck.py"
copy_script "oa-discord-research-publisher.py"
copy_script "oa-xai-connect.sh"
copy_script "setup-tunnel-xai.sh"
copy_script "install-opencode-xai.sh"
copy_script "oa-run-code.sh"
copy_script "hermes-context.sh"
copy_script "setup-hermes-runtime.sh"
copy_script "deploy-hermes-workspace.sh"
copy_script "configure-git-identity.sh"

ensure_key() {
  local key="$1"
  local value="$2"
  python3 - "$CONFIG_FILE" "$key" "$value" <<'PY'
import sys
from pathlib import Path

cfg = Path(sys.argv[1])
key = sys.argv[2]
val = sys.argv[3]

lines = cfg.read_text(encoding="utf-8").splitlines()
prefix = f"{key}="
for i, line in enumerate(lines):
    if line.strip().startswith(prefix):
        lines[i] = f'{key}="{val}"'
        break
else:
    lines.append(f'{key}="{val}"')
cfg.write_text("\n".join(lines) + "\n", encoding="utf-8")
PY
}

read_key() {
  local key="$1"
  python3 - "$CONFIG_FILE" "$key" <<'PY'
import sys
from pathlib import Path

cfg = Path(sys.argv[1])
key = sys.argv[2]
prefix = f"{key}="
for line in cfg.read_text(encoding="utf-8").splitlines():
    s = line.strip()
    if s.startswith(prefix):
        print(s.split("=", 1)[1].strip().strip('"').strip("'"))
        raise SystemExit(0)
print("")
PY
}

token="$(python3 - <<'PY'
import secrets
print(secrets.token_urlsafe(32))
PY
)"

existing_token="$(read_key OA_WEBHOOK_TOKEN)"
if [[ -n "${existing_token}" ]]; then
  token="${existing_token}"
fi

ensure_key "OA_WEBHOOK_TOKEN" "${token}"
ensure_key "OA_WEBHOOK_ALLOWED_SOURCES" "discord,whatsapp,unknown"
if [[ "$(uname -s)" == "Linux" ]]; then
  ensure_key "OA_AGENT_CURSOR_CMD" ""
  ensure_key "OA_AGENT_ANTIGRAVITY_CMD" ""
  ensure_key "OA_AGENT_GROK_CMD" "bash ${HERMES_HOME}/scripts/oa-agent-runner.sh grok"
  ensure_key "OA_AGENT_OPENCODE_CMD" "bash ${HERMES_HOME}/scripts/oa-agent-runner.sh opencode"
  ensure_key "OA_CODE_ENGINE" "fcc"
  ensure_key "OA_CODE_CMD" "${HOME}/.local/bin/fcc-claude"
else
  ensure_key "OA_AGENT_CURSOR_CMD" "bash ${HERMES_HOME}/scripts/oa-dispatch-local.sh cursor"
  ensure_key "OA_AGENT_ANTIGRAVITY_CMD" "bash ${HERMES_HOME}/scripts/oa-dispatch-local.sh antigravity"
  ensure_key "OA_AGENT_GROK_CMD" "bash ${HERMES_HOME}/scripts/oa-agent-runner.sh grok"
  ensure_key "OA_AGENT_OPENCODE_CMD" "bash ${HERMES_HOME}/scripts/oa-dispatch-local.sh opencode"
fi
ensure_key "OA_MODEL" "xai/grok-4.3"
ensure_key "OA_CODE_MODEL" "github-copilot/claude-sonnet-4.5"

echo "Hands-free installer completed."
echo ""
echo "Updated files:"
echo "- ${CONFIG_FILE}"
echo "- ${SCRIPTS_DIR}/oa-worker.sh"
echo "- ${SCRIPTS_DIR}/oa-webhook.py"
echo "- ${SCRIPTS_DIR}/oa-agent-runner.sh"
echo "- ${SCRIPTS_DIR}/oa-control.sh"
echo ""
echo "Next steps:"
echo "1) Review config:  nano ${CONFIG_FILE}"
echo "2) Restart OA:     bash ${SCRIPTS_DIR}/oa-control.sh restart"
echo "3) Check status:   bash ${SCRIPTS_DIR}/oa-control.sh status"
echo "4) Save token:     grep '^OA_WEBHOOK_TOKEN=' ${CONFIG_FILE}"
