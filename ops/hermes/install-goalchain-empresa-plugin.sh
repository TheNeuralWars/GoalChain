#!/usr/bin/env bash
# Install goalchain-empresa Hermes plugin (bypass LLM for empresa:/grafo:).
set -euo pipefail

HERMES_HOME="${HERMES_HOME:-$HOME/.hermes}"
SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hermes-plugin-goalchain-empresa"
DEST="${HERMES_HOME}/plugins/goalchain-empresa"
CONFIG="${HERMES_HOME}/config.yaml"

log() { printf '[install-goalchain-empresa] %s\n' "$*"; }

if [[ ! -f "${SRC_DIR}/plugin.yaml" ]]; then
  echo "ERROR: ${SRC_DIR}/plugin.yaml not found" >&2
  exit 1
fi

mkdir -p "${HERMES_HOME}/plugins"
rm -rf "${DEST}"
cp -a "${SRC_DIR}" "${DEST}"
log "Installed plugin → ${DEST}"

python3 <<'PY'
import sys
from pathlib import Path

try:
    import yaml
except ImportError:
    print("ERROR: PyYAML required (pip install pyyaml)", file=sys.stderr)
    sys.exit(1)

config_path = Path.home() / ".hermes" / "config.yaml"
data = {}
if config_path.exists():
    data = yaml.safe_load(config_path.read_text(encoding="utf-8")) or {}
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
print(f"plugins.enabled includes {name!r}")
PY

log "Restart gateway: systemctl --user restart hermes-gateway.service"
