#!/bin/bash
# Install X Repost Monitor cron timer for Hermes
# Run: bash ops/hermes/install-hermes-x-repost-monitor-timer.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TIMER_NAME="hermes-x-repost-monitor.timer"
SERVICE_NAME="hermes-x-repost-monitor.service"
TIMER_FILE="/etc/systemd/system/${TIMER_NAME}"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}"

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ] && ! command -v systemctl &> /dev/null; then
    echo "ERROR: Need root privileges or systemd access"
    exit 1
fi

# Default: run every 2 hours
INTERVAL_HOURS="${X_REPOST_MONITOR_INTERVAL_HOURS:-2}"

echo "Installing X Repost Monitor timer (interval: ${INTERVAL_HOURS}h)..."

# Create systemd timer
cat > "$TIMER_FILE" << EOF
[Unit]
Description=Hermes X Repost Monitor Timer (every ${INTERVAL_HOURS}h)
After=network-online.target
Wants=network-online.target

[Timer]
OnCalendar=*:0/$(echo "$INTERVAL_HOURS * 60" | bc | cut -d. -f1)/1
Persistent=true
RandomizedDelaySec=300

[Install]
WantedBy=timers.target
EOF

# Create systemd service
cat > "$SERVICE_FILE" << EOF
[Unit]
Description=Hermes X Repost Monitor
After=network-online.target

[Service]
Type=oneshot
ExecStart=/usr/bin/python3 "${SCRIPT_DIR}/oa-x-repost-monitor.py"
EnvironmentFile=${HOME}/hermes/config.env
StandardOutput=journal
StandardError=journal
User=ubuntu

[Install]
WantedBy=default.target
EOF

# Reload systemd and enable timer
if command -v sudo &> /dev/null; then
    SUDO="sudo"
else
    SUDO=""
fi

$SUDO systemctl daemon-reload
$SUDO systemctl enable "$TIMER_NAME" 2>/dev/null || true
$SUDO systemctl enable "$SERVICE_NAME" 2>/dev/null || true
$SUDO systemctl start "$TIMER_NAME" 2>/dev/null || true

echo ""
echo "X Repost Monitor installed!"
echo "  Timer: $TIMER_NAME"
echo "  Service: $SERVICE_NAME"
echo "  Interval: ${INTERVAL_HOURS} hours"
echo ""
echo "Commands:"
echo "  View logs:  journalctl -u $SERVICE_NAME -f"
echo "  Run now:    $SERVICE_NAME"
echo "  Disable:    systemctl disable $TIMER_NAME"