#!/usr/bin/env bash
# install-gbrainsync-server.sh — wire gbrain-sync-server.py into systemd-user.
# Idempotent. Stops, re-installs unit, reloads daemon, (re)starts.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
UNIT_SRC="${HERE}/gbrain-sync.service"
UNIT_DEST="${HOME}/.config/systemd/user/gbrain-sync.service"

mkdir -p "${HOME}/.config/systemd/user"
mkdir -p "${HOME}/.gbrain/sync"

# Expand %h correctly for current user when copying
sed "s|%h|${HOME}|g" "${UNIT_SRC}" > "${UNIT_DEST}"
chmod 644 "${UNIT_DEST}"

systemctl --user daemon-reload
systemctl --user enable gbrain-sync.service
if systemctl --user is-active --quiet gbrain-sync.service; then
  systemctl --user restart gbrain-sync.service
else
  systemctl --user start gbrain-sync.service
fi

echo "=== status ==="
systemctl --user --no-pager status gbrain-sync.service | head -20 || true
echo ""
echo "=== smoke test ==="
sleep 1
curl -s --max-time 5 http://127.0.0.1:8648/health || echo "(server didn't respond, check logs: ~/.gbrain/sync/server.log)"
echo ""
echo "tip: uninstall with:
   systemctl --user disable --now gbrain-sync.service
   rm -f ~/.config/systemd/user/gbrain-sync.service"
