#!/usr/bin/env bash
# install-gbrain-sync-push-cron.sh — install / uninstall the hourly dispatch
# that runs ops/hermes/gbrain-push.sh AFTER the morning cron at 07:00 UTC.
# Issue #827. Idempotent. Pairs with install-hermes-superpowers.sh cron setup.
#
# Usage:
#   bash ops/hermes/install-gbrain-sync-push-cron.sh install
#   bash ops/hermes/install-gbrain-sync-push-cron.sh uninstall
#   bash ops/hermes/install-gbrain-sync-push-cron.sh status
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PUSH_SH="${REPO_ROOT}/ops/hermes/gbrain-push.sh"

UNIT_DIR="${XDG_CONFIG_HOME:-${HOME}/.config}/systemd/user"
TIMER="gbrain-sync-push.timer"
SERV="gbrain-sync-push.service"

die() { echo "ERROR: $*" >&2; exit 1; }
[[ -x "${PUSH_SH}" ]] || die "gbrain-push.sh not executable: ${PUSH_SH}"

mkdir -p "${UNIT_DIR}"

write_units() {
  cat >"${UNIT_DIR}/${SERV}" <<EOF
[Unit]
Description=GoalChain gbrain POST-push (issue #827)
After=gbrain-sync.service
Wants=gbrain-sync.service

[Service]
Type=oneshot
ExecStart=${PUSH_SH} "morning cron"
WorkingDirectory=${REPO_ROOT}
Nice=10
# SuccessExitStatus=0 only — we want to see non-zero in journalctl.
EOF

  cat >"${UNIT_DIR}/${TIMER}" <<EOF
[Unit]
Description=Daily gbrain push (07:30 UTC) — runs after goalchain-morning-conclusions

[Timer]
OnCalendar=*-*-* 07:30:00 UTC
Persistent=true
AccuracySec=2min
RandomizedDelaySec=5min
Unit=${SERV}

[Install]
WantedBy=timers.target
EOF
}

case "${1:-install}" in
  install|"")
    write_units
    systemctl --user daemon-reload
    systemctl --user enable --now "${TIMER}"
    echo "Installed + enabled ${TIMER} (07:30 UTC daily + jitter; runs ${PUSH_SH})."
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
    die "unknown arg: ${1} (use install|uninstall|status)"
    ;;
esac
