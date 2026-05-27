#!/usr/bin/env bash
# Install goalchain-empresa Hermes plugin (bypass LLM for empresa:/grafo:).
# Profile-aware: installs to root and active profile.
set -euo pipefail

HERMES_ROOT="${HERMES_HOME:-$HOME/.hermes}"
SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hermes-plugin-goalchain-empresa"

log() { printf '[install-goalchain-empresa] %s\n' "$*"; }

if [[ ! -f "${SRC_DIR}/plugin.yaml" ]]; then
  echo "ERROR: ${SRC_DIR}/plugin.yaml not found" >&2
  exit 1
fi

# Determine target directories (root + active profile if any)
TARGETS=("${HERMES_ROOT}")
ACTIVE_PROFILE_FILE="${HERMES_ROOT}/active_profile"
if [[ -f "${ACTIVE_PROFILE_FILE}" ]]; then
  PROFILE="$(cat "${ACTIVE_PROFILE_FILE}" | xargs)"
  if [[ -n "${PROFILE}" ]]; then
    PROFILE_DIR="${HERMES_ROOT}/profiles/${PROFILE}"
    if [[ -d "${PROFILE_DIR}" ]]; then
      log "Detected active profile: ${PROFILE}"
      TARGETS+=("${PROFILE_DIR}")
    fi
  fi
fi

for TARGET in "${TARGETS[@]}"; do
  DEST="${TARGET}/plugins/goalchain-empresa"
  mkdir -p "${TARGET}/plugins"
  rm -rf "${DEST}"
  cp -a "${SRC_DIR}" "${DEST}"
  log "Installed plugin → ${DEST}"

  python3 - "${TARGET}/config.yaml" <<'PY'
import sys
from pathlib import Path

try:
    import yaml
except ImportError:
    print("ERROR: PyYAML required (pip install pyyaml)", file=sys.stderr)
    sys.exit(1)

config_path = Path(sys.argv[1])
data = {}
if config_path.exists():
    try:
        data = yaml.safe_load(config_path.read_text(encoding="utf-8")) or {}
    except Exception:
        data = {}
if not isinstance(data, dict):
    data = {}

plugins = data.setdefault("plugins", {})
if not isinstance(plugins, dict):
    plugins = {}
    data["plugins"] = plugins

enabled = plugins.get("enabled")
if enabled is None:
    enabled = []
if not isinstance(enabled, list):
    enabled = []
name = "goalchain-empresa"
if name not in enabled:
    enabled.append(name)
plugins["enabled"] = enabled

config_path.write_text(yaml.safe_dump(data, sort_keys=False, allow_unicode=True), encoding="utf-8")
print(f"Configured plugins.enabled in {config_path}")
PY
done

log "Restart gateway: systemctl --user restart hermes-gateway.service"
