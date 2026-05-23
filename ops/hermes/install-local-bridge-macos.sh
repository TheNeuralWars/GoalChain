#!/usr/bin/env bash
# Install local bridge on macOS using launchd.
set -euo pipefail

if [[ "$(uname)" != "Darwin" ]]; then
  echo "ERROR: this installer is for macOS only."
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
SRC_DIR="${REPO_ROOT}/ops/hermes"

HERMES_LOCAL_HOME="${HERMES_LOCAL_HOME:-$HOME/.goalchain}"
BIN_DIR="${HERMES_LOCAL_HOME}/bin"
LOG_DIR="${HERMES_LOCAL_HOME}/logs"
STATE_DIR="${HERMES_LOCAL_HOME}/state"
CONFIG_FILE="${HERMES_LOCAL_HOME}/local-bridge.env"
PLIST_PATH="$HOME/Library/LaunchAgents/com.goalchain.local-agent-bridge.plist"

mkdir -p "${BIN_DIR}" "${LOG_DIR}" "${STATE_DIR}" "$HOME/Library/LaunchAgents"

cp "${SRC_DIR}/local-agent-bridge.sh" "${BIN_DIR}/local-agent-bridge.sh"
chmod +x "${BIN_DIR}/local-agent-bridge.sh"

if [[ ! -f "${CONFIG_FILE}" ]]; then
  cp "${SRC_DIR}/local-bridge.env.example" "${CONFIG_FILE}"
fi

cat > "${PLIST_PATH}" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.goalchain.local-agent-bridge</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>-lc</string>
    <string>LOCAL_BRIDGE_CONFIG="${CONFIG_FILE}" HERMES_LOCAL_HOME="${HERMES_LOCAL_HOME}" "${BIN_DIR}/local-agent-bridge.sh" loop</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>${LOG_DIR}/launchd.out.log</string>
  <key>StandardErrorPath</key>
  <string>${LOG_DIR}/launchd.err.log</string>
</dict>
</plist>
EOF

launchctl unload "${PLIST_PATH}" >/dev/null 2>&1 || true
launchctl load "${PLIST_PATH}"

echo "Local bridge installed."
echo "Config: ${CONFIG_FILE}"
echo "Logs:   ${LOG_DIR}"
echo "Plist:  ${PLIST_PATH}"
echo ""
echo "Next:"
echo "1) Edit commands: nano ${CONFIG_FILE}"
echo "2) Reload daemon: launchctl unload ${PLIST_PATH}; launchctl load ${PLIST_PATH}"
echo "3) Verify:        launchctl list | grep com.goalchain.local-agent-bridge"
