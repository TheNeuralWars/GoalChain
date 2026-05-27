#!/usr/bin/env bash
# Install goalchain-multiagent on GoalChain VPS (user systemd, loopback API).
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
APP_DIR="${GOALCHAIN_MA_HOME:-$HOME/goalchain-multiagent}"
ENV_FILE="${GOALCHAIN_MA_ENV:-$HOME/.config/goalchain-multiagent.env}"
SERVICE_NAME="goalchain-multiagent.service"

echo "==> App dir: ${APP_DIR}"
mkdir -p "${APP_DIR}" "$(dirname "${ENV_FILE}")"

rsync -a --delete \
  "${REPO_ROOT}/ops/goalchain-multiagent/" \
  "${APP_DIR}/" \
  --exclude .venv \
  --exclude __pycache__ \
  --exclude .pytest_cache

cd "${APP_DIR}"
python3 -m venv .venv
# shellcheck disable=SC1091
source .venv/bin/activate
pip install -q --upgrade pip
pip install -q -r requirements.txt

if [[ ! -f "${ENV_FILE}" ]]; then
  cp .env.example "${ENV_FILE}"
  echo "Created ${ENV_FILE} — set GOALCHAIN_MA_TOKEN and GOALCHAIN_MULTIAGENT_ENABLED=1"
fi

UNIT_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/systemd/user"
mkdir -p "${UNIT_DIR}"
cat > "${UNIT_DIR}/${SERVICE_NAME}" <<EOF
[Unit]
Description=GoalChain LangGraph multi-agent API (loopback)
After=network.target

[Service]
Type=simple
WorkingDirectory=${APP_DIR}
EnvironmentFile=${ENV_FILE}
Environment=PYTHONPATH=${APP_DIR}
ExecStart=${APP_DIR}/.venv/bin/uvicorn goalchain_multiagent.api:app --host 127.0.0.1 --port 8790
Restart=on-failure
RestartSec=5

[Install]
WantedBy=default.target
EOF

systemctl --user daemon-reload
echo "Installed ${SERVICE_NAME}. Enable with:"
echo "  systemctl --user enable --now ${SERVICE_NAME}"
