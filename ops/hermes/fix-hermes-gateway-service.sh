#!/usr/bin/env bash
# Repair hermes-gateway.service after a bad HERMES_HOME sed (wrong venv path).
# Correct layout:
#   Agent install:  ~/.hermes/hermes-agent/
#   GoalChain ops:  ~/hermes/  (config.env, scripts, workspace)
set -euo pipefail

# Agent config, .env, SOUL.md live here (NOT ~/hermes):
HERMES_AGENT_ROOT="${HERMES_AGENT_ROOT:-$HOME/.hermes}"
HERMES_AGENT_HOME="${HERMES_AGENT_HOME:-${HERMES_AGENT_ROOT}/hermes-agent}"
# GoalChain ops scripts + config.env:
GOALCHAIN_HERMES_HOME="${GOALCHAIN_HERMES_HOME:-$HOME/hermes}"
UNIT="${XDG_CONFIG_HOME:-$HOME/.config}/systemd/user/hermes-gateway.service"
PYTHON="${HERMES_AGENT_HOME}/venv/bin/python"

log() { printf '[fix-gateway] %s\n' "$*"; }

[[ -x "${PYTHON}" ]] || {
  log "ERROR: missing ${PYTHON}"
  log "Run: hermes onboard  OR  reinstall Hermes agent venv under ~/.hermes/hermes-agent"
  exit 1
}

mkdir -p "$(dirname "${UNIT}")"
cat > "${UNIT}" <<EOF
[Unit]
Description=Hermes Agent Gateway - Messaging Platform Integration
After=network-online.target
Wants=network-online.target
StartLimitIntervalSec=0

[Service]
Type=simple
ExecStart=${PYTHON} -m hermes_cli.main gateway run --replace
WorkingDirectory=${HERMES_AGENT_HOME}
Environment="PATH=${HERMES_AGENT_HOME}/venv/bin:/home/goalchain/.bun/bin:/home/goalchain/.local/bin:/usr/bin:/bin"
Environment="VIRTUAL_ENV=${HERMES_AGENT_HOME}/venv"
Environment="HERMES_HOME=${HERMES_AGENT_ROOT}"
Environment="GOALCHAIN_HERMES_HOME=${GOALCHAIN_HERMES_HOME}"
Restart=always
RestartSec=5
RestartMaxDelaySec=300
RestartSteps=5
RestartForceExitStatus=75
KillMode=mixed
KillSignal=SIGTERM
TimeoutStopSec=210
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=default.target
EOF

log "wrote ${UNIT}"
log "HERMES_HOME=${HERMES_AGENT_ROOT} (agent)"
log "GOALCHAIN_HERMES_HOME=${GOALCHAIN_HERMES_HOME} (ops scripts)"
log "PYTHON=${PYTHON}"

systemctl --user daemon-reload
systemctl --user reset-failed hermes-gateway.service 2>/dev/null || true
systemctl --user restart hermes-gateway.service
sleep 6

if systemctl --user is-active --quiet hermes-gateway.service; then
  log "hermes-gateway: active"
  systemctl --user status hermes-gateway.service --no-pager | head -12
else
  log "ERROR: gateway still not active — check: journalctl --user -u hermes-gateway -n 40"
  exit 1
fi
