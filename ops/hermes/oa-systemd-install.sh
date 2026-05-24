#!/usr/bin/env bash
# Install OA services under systemd --user for restart persistence.
set -euo pipefail

UNIT_DIR="${HOME}/.config/systemd/user"
HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
OA_HOME="${HERMES_HOME}/oa"

mkdir -p "${UNIT_DIR}" "${OA_HOME}/logs" "${OA_HOME}/state" "${OA_HOME}/inbox"

cat > "${UNIT_DIR}/oa-worker.service" <<EOF
[Unit]
Description=GoalChain OA Worker
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
Environment=PATH=%h/.local/bin:%h/.npm-global/bin:/usr/local/bin:/usr/bin:/bin
WorkingDirectory=%h/hermes/workspace/GoalChain
ExecStart=/usr/bin/env bash -lc 'touch "%h/hermes/oa/RUNNING"; exec "%h/hermes/scripts/oa-worker.sh" >> "%h/hermes/oa/logs/worker.log" 2>&1'
ExecStopPost=/usr/bin/env bash -lc 'rm -f "%h/hermes/oa/RUNNING"'
Restart=always
RestartSec=5

[Install]
WantedBy=default.target
EOF

cat > "${UNIT_DIR}/oa-webhook.service" <<EOF
[Unit]
Description=GoalChain OA Webhook
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
Environment=PATH=%h/.local/bin:%h/.npm-global/bin:/usr/local/bin:/usr/bin:/bin
WorkingDirectory=%h/hermes/workspace/GoalChain
ExecStart=/usr/bin/env bash -lc 'exec python3 "%h/hermes/scripts/oa-webhook.py" >> "%h/hermes/oa/logs/webhook.log" 2>&1'
Restart=always
RestartSec=3

[Install]
WantedBy=default.target
EOF

cat > "${UNIT_DIR}/oa-health.service" <<EOF
[Unit]
Description=GoalChain OA health watchdog
After=oa-worker.service

[Service]
Type=oneshot
WorkingDirectory=%h/hermes/workspace/GoalChain
ExecStart=/usr/bin/env bash -lc 'source "%h/hermes/config.env" 2>/dev/null || true; exec python3 "%h/hermes/scripts/oa-healthcheck.py" >> "%h/hermes/oa/logs/health.log" 2>&1'
EOF

cat > "${UNIT_DIR}/oa-health.timer" <<EOF
[Unit]
Description=Run OA health watchdog every 5 minutes

[Timer]
OnBootSec=2m
OnUnitActiveSec=5m
Unit=oa-health.service

[Install]
WantedBy=timers.target
EOF

systemctl --user daemon-reload
systemctl --user enable --now oa-worker.service oa-webhook.service oa-health.timer

echo "Installed and started: oa-worker.service, oa-webhook.service, oa-health.timer"
systemctl --user is-active oa-worker.service oa-webhook.service oa-health.timer
