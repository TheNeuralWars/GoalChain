#!/usr/bin/env bash
# Copy discord.* block from root ~/.hermes/config.yaml into the active profile config.
# Gateway runs with active_profile (e.g. jito-strategy) — root-only edits are ignored.
set -euo pipefail

HERMES_AGENT_HOME="${HERMES_AGENT_HOME:-$HOME/.hermes}"
ROOT_CONFIG="${HERMES_CONFIG:-${HERMES_AGENT_HOME}/config.yaml}"
ACTIVE_PROFILE="$(cat "${HERMES_AGENT_HOME}/active_profile" 2>/dev/null || echo "")"

[[ -n "${ACTIVE_PROFILE}" ]] || {
  echo "ERROR: no active_profile in ${HERMES_AGENT_HOME}/active_profile"
  exit 1
}

PROFILE_CONFIG="${HERMES_AGENT_HOME}/profiles/${ACTIVE_PROFILE}/config.yaml"
[[ -f "${ROOT_CONFIG}" ]] || { echo "ERROR: missing ${ROOT_CONFIG}"; exit 1; }
[[ -f "${PROFILE_CONFIG}" ]] || { echo "ERROR: missing ${PROFILE_CONFIG}"; exit 1; }

python3 - "${ROOT_CONFIG}" "${PROFILE_CONFIG}" <<'PY'
import sys
from pathlib import Path
import yaml

root_path = Path(sys.argv[1])
prof_path = Path(sys.argv[2])
root = yaml.safe_load(root_path.read_text(encoding="utf-8")) or {}
prof = yaml.safe_load(prof_path.read_text(encoding="utf-8")) or {}
root_disc = root.get("discord")
if not isinstance(root_disc, dict):
    print("WARN: no discord block in root config — nothing to sync")
    raise SystemExit(0)
prof["discord"] = root_disc
prof_path.write_text(yaml.dump(prof, default_flow_style=False, sort_keys=False), encoding="utf-8")
print("synced discord.* from", root_path, "->", prof_path)
PY

echo "Restart gateway if running: systemctl --user restart hermes-gateway"
