#!/usr/bin/env bash
# Ensure #openclaw-chat (Manager DM channel) is in discord.free_response_channels.
set -euo pipefail

HERMES_CONFIG="${HERMES_CONFIG:-$HOME/.hermes/config.yaml}"
CONFIG_ENV="${HERMES_HOME:-$HOME/hermes}/config.env"

# shellcheck disable=SC1090
[[ -f "${CONFIG_ENV}" ]] && source "${CONFIG_ENV}"

# Default: channel seen in gateway logs during openclaw-chat sessions (override in config.env)
OPENCLAW_CHAT_ID="${DISCORD_OPENCLAW_CHAT_ID:-1507803555765944421}"

python3 - "${HERMES_CONFIG}" "${OPENCLAW_CHAT_ID}" <<'PY'
import os, sys
from pathlib import Path
import yaml

path = Path(sys.argv[1])
cid = sys.argv[2]
cfg = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
disc = cfg.setdefault("discord", {})
raw = disc.get("free_response_channels") or ""
ids = [p.strip() for p in str(raw).split(",") if p.strip() and p.strip() != "*"]
if cid not in ids:
    ids.append(cid)
disc["free_response_channels"] = ",".join(ids)
disc.setdefault("channel_prompts", {})
if isinstance(disc["channel_prompts"], dict):
    disc["channel_prompts"][cid] = (
        "Private Manager channel with Nico (owner). Reply in Spanish when Nico writes in Spanish; "
        "use English for technical logs destined for GitHub/issues. No @mention required."
    )
path.write_text(yaml.dump(cfg, default_flow_style=False, sort_keys=False), encoding="utf-8")
print("openclaw-chat", cid, "added to free_response_channels")
PY
