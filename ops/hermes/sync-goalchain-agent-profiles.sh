#!/usr/bin/env bash
# Sync shared Discord / X / API keys and xAI OAuth into all GoalChain agent profiles.
# Run after changing ~/.hermes/.env or ~/hermes/config.env, or on a schedule.
#
# Usage:
#   bash ops/hermes/sync-goalchain-agent-profiles.sh
#   bash ops/hermes/sync-goalchain-agent-profiles.sh --profile new-agent
#   bash ops/hermes/sync-goalchain-agent-profiles.sh --prune-x-scout-cron
#   bash ops/hermes/sync-goalchain-agent-profiles.sh --prune-chat-crons
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROFILES_LIST="${GOALCHAIN_AGENT_PROFILES_LIST:-$SCRIPT_DIR/goalchain-agent-profiles.list}"
BOOTSTRAP="${SCRIPT_DIR}/bootstrap-profile-secrets.sh"

PRUNE_X_SCOUT_CRON=false
EXTRA_PROFILE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --profile) EXTRA_PROFILE="$2"; shift 2 ;;
    --prune-x-scout-cron) PRUNE_X_SCOUT_CRON=true; shift ;;
    --prune-chat-crons) log "WARN: --prune-chat-crons is deprecated (only removes x-scout-research-cycle; keeps daily-gm/gn)"; PRUNE_X_SCOUT_CRON=true; shift ;;
    -h|--help)
      cat <<'EOF'
Sync Discord, X API keys, and xAI OAuth (auth.json) into GoalChain agent profiles.

  bash ops/hermes/sync-goalchain-agent-profiles.sh
  bash ops/hermes/sync-goalchain-agent-profiles.sh --profile my-new-bot
  bash ops/hermes/sync-goalchain-agent-profiles.sh --prune-chat-crons

After creating a profile:
  hermes profile create NAME --clone --clone-from default
  bash ops/hermes/on-profile-created.sh NAME
EOF
      exit 0
      ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

log() { printf '[sync-agent-profiles] %s\n' "$*"; }

if [[ "${PRUNE_X_SCOUT_CRON}" == true ]]; then
  export PRUNE_X_SCOUT_CRON
  removed="$(python3 - <<'PY'
import json
import os
from pathlib import Path

drop_names = {"x-scout-research-cycle"} if os.environ.get("PRUNE_X_SCOUT_CRON") == "true" else set()
# daily-gm / daily-gn are intentional (profile daily-routine); never prune here

p = Path.home() / ".hermes" / "cron" / "jobs.json"
if not p.exists():
    print("missing")
    raise SystemExit(0)
data = json.loads(p.read_text())
jobs = data.get("jobs", [])
filtered = [j for j in jobs if j.get("name") not in drop_names]
removed = [j.get("name") for j in jobs if j.get("name") in drop_names]
if not removed:
    print("absent")
else:
    data["jobs"] = filtered
    p.write_text(json.dumps(data, indent=2) + "\n")
    print("ok:" + ",".join(removed))
PY
)"
  case "${removed}" in
    ok:*) log "Removed chat/cron jobs from jobs.json: ${removed#ok:}" ;;
    absent) log "No chat crons to prune (already removed)" ;;
    *) log "WARN: could not prune crons (${removed})" ;;
  esac
fi

if [[ -n "${EXTRA_PROFILE}" ]]; then
  bash "${BOOTSTRAP}" --profile "${EXTRA_PROFILE}" --also-auth
  log "Synced profile: ${EXTRA_PROFILE}"
  exit 0
fi

bash "${BOOTSTRAP}" --agent-profiles --also-auth
log "Synced all profiles in ${PROFILES_LIST}"
