#!/usr/bin/env bash
# install-gbrain-vacuum-timer.sh — install / uninstall / status the systemd --user
# units that run ops/hermes/gbrain-vacuum.sh on a weekly cadence.
# Issue #816. Idempotent. Pattern: ops/hermes/install-healthcheck-timer.sh.
#
# Units produced (under XDG_CONFIG_HOME/systemd/user):
#   gbrain-vacuum.service   (Type=oneshot, runs the vacuum script)
#   gbrain-vacuum.timer     (weekly Sun 03:00 UTC, Persistent=true)
#
# Usage:
#   install-gbrain-vacuum-timer.sh                # install + enable + start
#   install-gbrain-vacuum-timer.sh --uninstall
#   install-gbrain-vacuum-timer.sh --status
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
VAC_SH="${REPO_ROOT}/ops/hermes/gbrain-vacuum.sh"
UNIT_DIR="${XDG_CONFIG_HOME:-${HOME}/.config}/systemd/user"
TIMER="gbrain-vacuum.timer"
SERV="gbrain-vacuum.service"

die() { echo "ERROR: $*" >&2; exit 1; }
[[ -x "${VAC_SH}" ]] || die "gbrain-vacuum.sh not executable: ${VAC_SH}"

mkdir -p "${UNIT_DIR}"

write_service() {
cat >"${UNIT_DIR}/${SERV}" <<EOF
[Unit]
Description=GoalChain gBrain PGLite VACUUM (issue #816)
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
ExecStart=${VAC_SH}
WorkingDirectory=${HOME}
Nice=10
StandardOutput=journal
StandardError=journal
EOF
}

write_timer() {
cat >"${UNIT_DIR}/${TIMER}" <<EOF
[Unit]
Description=Weekly gbrain PGLite VACUUM (Sun 03:00 UTC)

[Timer]
OnCalendar=Sun 03:00:00 UTC
Persistent=true
AccuracySec=1min
RandomizedDelaySec=5min
Unit=${SERV}

[Install]
WantedBy=timers.target
EOF
}

case "${1:-install}" in
  install|"")
    write_service
    write_timer
    systemctl --user daemon-reload
    systemctl --user enable --now "${TIMER}"
    echo "Installed + enabled ${TIMER} (weekly Sunday 03:00 UTC, Persistent=true)."
    systemctl --user list-timers "${TIMER}" --no-pager || true
    ;;
  uninstall)
    systemctl --user disable --now "${TIMER}" 2>/dev/null || true
    rm -f "${UNIT_DIR}/${TIMER}" "${UNIT_DIR}/${SERV}"
    systemctl --user daemon-reload
    echo "Removed ${TIMER} + ${SERV}."
    ;;
  status)
    systemctl --user status "${TIMER}" --no-pager || true
    ;;
  *)
    die "unknown arg: $1 (use install|uninstall|status)"
    ;;
esac
