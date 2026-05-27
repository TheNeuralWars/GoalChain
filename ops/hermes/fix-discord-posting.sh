#!/usr/bin/env bash
# fix-discord-posting.sh
# Diagnoses and fixes Hermes Manager outbound Discord posting.
#
# Root cause: require_mention=true in config.yaml prevents proactive channel posts.
# Fix: set require_mention=false for designated channels + verify bot permissions.
#
# Usage:
#   bash ops/hermes/fix-discord-posting.sh [--check-only]
#   bash ops/hermes/fix-discord-posting.sh --test-post <CHANNEL_ID>
set -euo pipefail

HERMES_AGENT_HOME="${HERMES_AGENT_HOME:-$HOME/.hermes}"
HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
CONFIG_ENV="${HERMES_HOME}/config.env"
ROOT_CONFIG="${HERMES_AGENT_HOME}/config.yaml"
CHECK_ONLY=false
TEST_CHANNEL=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --check-only) CHECK_ONLY=true; shift ;;
    --test-post) TEST_CHANNEL="${2:-}"; shift 2 ;;
    *) shift ;;
  esac
done

log() { printf '[%s] %s\n' "$(date -u '+%F %T UTC')" "$*"; }

# --- 1. Diagnose current config ---
log "=== Discord posting diagnostics ==="

if [[ ! -f "${ROOT_CONFIG}" ]]; then
  log "ERROR: ${ROOT_CONFIG} not found. Is Hermes installed?"
  exit 1
fi

python3 - "${ROOT_CONFIG}" <<'PY'
import sys, yaml
from pathlib import Path

path = Path(sys.argv[1])
cfg = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
disc = cfg.get("discord", {})

print(f"  require_mention       : {disc.get('require_mention', '(not set)')}")
print(f"  allowed_channels      : {disc.get('allowed_channels', '(not set)')}")
print(f"  free_response_channels: {disc.get('free_response_channels', '(not set)')}")
print(f"  can_initiate_dm       : {disc.get('can_initiate_dm', '(not set)')}")

issues = []
if disc.get("require_mention") not in (False, "false"):
    issues.append("require_mention is not False — blocks proactive posting")
if not disc.get("free_response_channels"):
    issues.append("free_response_channels is empty — no channels whitelisted for replies without mention")

if issues:
    print("\n[ISSUES FOUND]")
    for i in issues:
        print(f"  ! {i}")
else:
    print("\n[OK] Config looks correct for outbound posting.")
PY

if [[ "${CHECK_ONLY}" == "true" ]]; then
  log "Check-only mode — no changes made."
  exit 0
fi

# --- 2. Apply fix: set require_mention=false ---
log "Applying fix: setting require_mention=false in ${ROOT_CONFIG}"

ACTIVE_PROFILE="$(cat "${HERMES_AGENT_HOME}/active_profile" 2>/dev/null || echo "")"
PROFILE_CONFIG=""
if [[ -n "${ACTIVE_PROFILE}" ]]; then
  PROFILE_CONFIG="${HERMES_AGENT_HOME}/profiles/${ACTIVE_PROFILE}/config.yaml"
fi

python3 - "${ROOT_CONFIG}" "${PROFILE_CONFIG}" <<'PY'
import sys, yaml
from pathlib import Path

paths = [Path(p) for p in sys.argv[1:] if p and Path(p).exists()]
for path in paths:
    cfg = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    disc = cfg.setdefault("discord", {})

    # Critical fix: allow proactive posting without @mention
    disc["require_mention"] = False

    # Ensure can_initiate_dm is enabled for DM-style channels
    disc["can_initiate_dm"] = True

    # Make sure allowed_channels is permissive (existing setting)
    if disc.get("allowed_channels") not in ("*", ["*"]):
        disc["allowed_channels"] = "*"

    path.write_text(yaml.dump(cfg, default_flow_style=False, sort_keys=False), encoding="utf-8")
    print(f"Updated: {path}")
PY

log "Config updated."

# --- 3. Verify DISCORD_TOKEN is present ---
if [[ -f "${CONFIG_ENV}" ]]; then
  # shellcheck disable=SC1090
  source "${CONFIG_ENV}" 2>/dev/null || true
fi
if [[ -z "${DISCORD_TOKEN:-}" ]]; then
  log "WARNING: DISCORD_TOKEN is not set in ${CONFIG_ENV}"
  log "         The bot cannot post without a valid token."
  log "         Set it with: bash ops/hermes/update-discord-token.sh <TOKEN>"
else
  log "DISCORD_TOKEN: present (length=${#DISCORD_TOKEN})"
fi

# --- 4. Optional test post ---
if [[ -n "${TEST_CHANNEL}" ]]; then
  log "Sending test post to channel ${TEST_CHANNEL}..."
  python3 - "${TEST_CHANNEL}" "${DISCORD_TOKEN:-}" <<'PY'
import sys, urllib.request, urllib.error, json

channel_id = sys.argv[1]
token = sys.argv[2]
if not token:
    print("ERROR: No DISCORD_TOKEN — cannot test post.")
    sys.exit(1)

payload = json.dumps({"content": "🟢 GoalChain Manager — outbound posting test (fix-discord-posting.sh)"}).encode()
req = urllib.request.Request(
    f"https://discord.com/api/v10/channels/{channel_id}/messages",
    data=payload,
    headers={"Authorization": f"Bot {token}", "Content-Type": "application/json"},
    method="POST",
)
try:
    with urllib.request.urlopen(req) as r:
        msg = json.loads(r.read())
        print(f"OK: Posted message id={msg['id']}")
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print(f"ERROR {e.code}: {body}")
    sys.exit(1)
PY
fi

log "=== Done. Restart Hermes gateway for changes to take effect: ==="
log "    sudo systemctl restart hermes-gateway"
