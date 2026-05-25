#!/usr/bin/env bash
# Install user systemd timer for Hermes X-Scout (no OpenClaw).
set -euo pipefail

HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
RUN_SH="${HERMES_HOME}/scripts/oa-x-scout-run.sh"
# shellcheck disable=SC1090
source "${HERMES_HOME}/config.env" 2>/dev/null || true

# Default matches OA_SCOUT_RADAR_CRON="15 */2 * * *" (minute 15, every 2h)
ON_CALENDAR="${OA_SCOUT_SYSTEMD_CALENDAR:-*-*-* 0/2:15:00}"
UNIT_DIR="${HOME}/.config/systemd/user"
mkdir -p "${UNIT_DIR}"

cat > "${UNIT_DIR}/hermes-x-scout.service" <<EOF
[Unit]
Description=GoalChain Hermes X-Scout (radar + Discord publish)
After=network-online.target

[Service]
Type=oneshot
Environment=HERMES_HOME=${HERMES_HOME}
ExecStart=${RUN_SH}
EOF

cat > "${UNIT_DIR}/hermes-x-scout.timer" <<EOF
[Unit]
Description=GoalChain Hermes X-Scout timer

[Timer]
OnCalendar=${ON_CALENDAR}
Persistent=true
RandomizedDelaySec=120

[Install]
WantedBy=timers.target
EOF

systemctl --user daemon-reload
systemctl --user enable --now hermes-x-scout.timer
systemctl --user list-timers hermes-x-scout.timer --no-pager || true
echo "Installed hermes-x-scout.timer (OnCalendar=${ON_CALENDAR})"
