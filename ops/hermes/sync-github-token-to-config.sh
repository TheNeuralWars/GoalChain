#!/usr/bin/env bash
# Write GITHUB_TOKEN into ~/hermes/config.env from `gh auth token` (never prints token).
set -euo pipefail

HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
CONFIG="${HERMES_HOME}/config.env"

if ! command -v gh >/dev/null 2>&1; then
  echo "ERROR: gh CLI not found. Install and run: gh auth login"
  exit 1
fi
if ! gh auth status >/dev/null 2>&1; then
  echo "ERROR: gh not authenticated. Run: gh auth login"
  exit 1
fi

TOKEN="$(gh auth token)"
[[ -n "${TOKEN}" ]] || { echo "ERROR: empty token from gh"; exit 1; }

[[ -f "${CONFIG}" ]] || {
  echo "ERROR: missing ${CONFIG}"
  exit 1
}

python3 - "${CONFIG}" "${TOKEN}" <<'PY'
import sys
from pathlib import Path

cfg = Path(sys.argv[1])
token = sys.argv[2]
lines = cfg.read_text(encoding="utf-8").splitlines()
prefix = "GITHUB_TOKEN="
out = []
found = False
for line in lines:
    if line.strip().startswith(prefix) or line.strip().startswith("# GITHUB_TOKEN"):
        out.append(f'GITHUB_TOKEN="{token}"')
        found = True
    else:
        out.append(line)
if not found:
    # Insert after GITHUB_DEFAULT_BRANCH block
    inserted = False
    final = []
    for line in out:
        final.append(line)
        if not inserted and line.strip().startswith("GITHUB_DEFAULT_BRANCH"):
            final.append("")
            final.append("# GitHub PAT for scripts (synced from gh auth token)")
            final.append(f'GITHUB_TOKEN="{token}"')
            inserted = True
    out = final if inserted else out + ["", f'GITHUB_TOKEN="{token}"']
cfg.write_text("\n".join(out) + "\n", encoding="utf-8")
print(f"updated {cfg} (GITHUB_TOKEN set from gh auth, not echoed)")
PY
