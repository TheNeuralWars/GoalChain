#!/usr/bin/env bash
# install-gbrain-sync-service.sh — wire gbrain-sync-server.py into systemd-user.
# Idempotent. Stops, re-installs unit, reloads daemon, (re)starts.
# Usage: bash ops/hermes/install-gbrain-sync-service.sh [install|uninstall|status]
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
UNIT_SRC="${HERE}/gbrain-sync.service"
UNIT_DEST="${HOME}/.config/systemd/user/gbrain-sync.service"
ACTION="${1:-install}"

die() { echo "ERROR: $*" >&2; exit 1; }

case "${ACTION}" in
  install|"")
    mkdir -p "${HOME}/.config/systemd/user"
    mkdir -p "${HOME}/.gbrain/sync"

    # Copy with %h expanded for current user
    sed "s|%h|${HOME}|g" "${UNIT_SRC}" > "${UNIT_DEST}"
    chmod 644 "${UNIT_DEST}"

    systemctl --user daemon-reload
    systemctl --user enable gbrain-sync.service

    if systemctl --user is-active --quiet gbrain-sync.service; then
      systemctl --user restart gbrain-sync.service
    else
      systemctl --user start gbrain-sync.service
    fi

    echo "=== gbrain-sync.service status ==="
    systemctl --user --no-pager status gbrain-sync.service | head -20 || true
    echo ""
    echo "=== smoke test ==="
    sleep 1
    curl -s --max-time 5 http://127.0.0.1:8648/health || echo "(server didn't respond, check logs: ~/.gbrain/sync/server.log)"
    echo ""
    echo "Install complete. Uninstall with: $0 uninstall"
    ;;

  uninstall)
    systemctl --user disable --now gbrain-sync.service 2>/dev/null || true
    rm -f "${UNIT_DEST}"
    systemctl --user daemon-reload
    echo "Uninstalled gbrain-sync.service"
    ;;

  status)
    systemctl --user --no-pager status gbrain-sync.service || true
    echo ""
    curl -s --max-time 5 http://127.0.0.1:8648/health || echo "(server not responding)"
    ;;

  *)
    die "Usage: $0 [install|uninstall|status]"
    ;;
esac