#!/usr/bin/env bash
# install-gbrainsync-macos.sh — LaunchAgent for gbrainsync-client.sh on macOS.
# Usage: bash install-gbrainsync-macos.sh [install|uninstall|status]
# Polls every 60s via launchd.
set -euo pipefail
ACTION="${1:-install}"
LABEL="com.goalchain.gbrainsync"
PLIST="${HOME}/Library/LaunchAgents/${LABEL}.plist"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLIENT="${HERE}/gbrainsync-client.sh"
LOG="${HOME}/.gbrain/sync/client.log"

case "${ACTION}" in
  install)
    mkdir -p "$(dirname "${PLIST}")" "${HOME}/.gbrain/sync"
    cat > "${PLIST}" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>${LABEL}</string>
  <key>ProgramArguments</key>
  <array><string>bash</string><string>${CLIENT}</string></array>
  <key>StartInterval</key><integer>60</integer>
  <key>StandardOutPath</key><string>${LOG}</string>
  <key>StandardErrorPath</key><string>${LOG}</string>
  <key>RunAtLoad</key><true/>
  <key>EnvironmentVariables</key>
  <dict>
    <key>VPS_TS_IP</key><string>100.101.211.44</string>
  </dict>
</dict>
</plist>
EOF
    launchctl unload "${PLIST}" 2>/dev/null || true
    launchctl load "${PLIST}"
    echo "[gbrainsync-macos] installed and loaded ${LABEL}"
    ;;
  uninstall)
    launchctl unload "${PLIST}" 2>/dev/null || true
    rm -f "${PLIST}"
    echo "[gbrainsync-macos] uninstalled ${LABEL}"
    ;;
  status)
    launchctl list | grep "${LABEL}" || echo "(not loaded)"
    ;;
  *)
    echo "Usage: $0 [install|uninstall|status]" >&2; exit 1
    ;;
esac
