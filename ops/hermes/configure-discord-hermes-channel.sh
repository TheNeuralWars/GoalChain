#!/usr/bin/env bash
# Ensure #hermes ops channel is in discord.free_response_channels (root + active profile).
set -euo pipefail

HERMES_AGENT_HOME="${HERMES_AGENT_HOME:-$HOME/.hermes}"
HERMES_CHANNEL_ID="${DISCORD_HERMES_CHANNEL_ID:-1508596088125522001}"

ROOT_CONFIG="${HERMES_CONFIG:-${HERMES_AGENT_HOME}/config.yaml}"
ACTIVE_PROFILE="$(cat "${HERMES_AGENT_HOME}/active_profile" 2>/dev/null || echo "")"
PROFILE_CONFIG=""
if [[ -n "${ACTIVE_PROFILE}" ]]; then
  PROFILE_CONFIG="${HERMES_AGENT_HOME}/profiles/${ACTIVE_PROFILE}/config.yaml"
fi

python3 - "${HERMES_CHANNEL_ID}" "${ROOT_CONFIG}" "${PROFILE_CONFIG}" <<'PY'
import sys
from pathlib import Path
import yaml

cid = sys.argv[1]
paths = [Path(p) for p in sys.argv[2:] if p and Path(p).exists()]
prompt = (
    "Hermes ops channel for GoalChain Manager. Reply in Spanish when Nico writes in Spanish; "
    "English for public-facing copy. No @mention required."
)

for path in paths:
    cfg = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    disc = cfg.setdefault("discord", {})
    raw = disc.get("free_response_channels") or ""
    ids = [p.strip() for p in str(raw).split(",") if p.strip() and p.strip() != "*"]
    if cid not in ids:
        ids.append(cid)
    disc["free_response_channels"] = ",".join(ids)
    disc.setdefault("channel_prompts", {})
    if isinstance(disc["channel_prompts"], dict):
        disc["channel_prompts"][cid] = prompt
    path.write_text(yaml.dump(cfg, default_flow_style=False, sort_keys=False), encoding="utf-8")
    print("hermes", cid, "->", path)
PY
