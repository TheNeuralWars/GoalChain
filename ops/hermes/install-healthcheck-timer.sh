#!/usr/bin/env bash
# Install / uninstall the user timer that runs ops/hermes/healthcheck.sh.
# Issue #815. Idempotent: safe to re-run.
#
# Usage:
#   install-healthcheck-timer.sh            # install + enable + start
#   install-healthcheck-timer.sh --uninstall
#   install-healthcheck-timer.sh --status
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
HC_SH="${REPO_ROOT}/ops/hermes/healthcheck.sh"
UNIT_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/systemd/user"
TIMER="goalchain-ops-healthcheck.timer"
SERV="goalchain-ops-healthcheck.service"

die() { echo "ERROR: $*" >&2; exit 1; }
[[ -x "$HC_SH" ]] || die "healthcheck.sh not executable: $HC_SH"

mkdir -p "$UNIT_DIR"

write_unit() {
cat >"$UNIT_DIR/$TIMER" <<EOF
[Unit]
Description=GoalChain ops healthcheck (issue #815) — runs every 1h
After=network-online.target

[Timer]
OnBootSec=90s
OnUnitActiveSec=1h
Persistent=true
AccuracySec=30s
Unit=$SERV

[Install]
WantedBy=timers.target
EOF

cat >"$UNIT_DIR/$SERV" <<EOF
[Unit]
Description=GoalChain ops healthcheck one-shot runner

[Service]
Type=oneshot
ExecStart=$HC_SH --audit
Nice=10
# Accept WARN/FAIL exit codes — healthcheck probes deliberately surface
# PASS/WARN/FAIL via its own exit code; we don't want systemd to flap
# "failed" state, just record the run.
SuccessExitStatus=1 2
EOF
}

case "${1:-install}" in
  install|"")
    write_unit
    systemctl --user daemon-reload
    systemctl --user enable --now "$TIMER"
    echo "Installed + enabled $TIMER (1h cadence; OnBootSec=90s)."
    systemctl --user list-timers "$TIMER" --no-pager
    ;;
  uninstall)
    systemctl --user disable --now "$TIMER" 2>/dev/null || true
    rm -f "$UNIT_DIR/$TIMER" "$UNIT_DIR/$SERV"
    systemctl --user daemon-reload
    echo "Removed $TIMER + $SERV."
    ;;
  status)
    systemctl --user status "$TIMER" --no-pager || true
    ;;
  *)
    die "unknown arg: $1 (use install|uninstall|status)"
    ;;
esac
