#!/usr/bin/env bash
# Update Discord bot token in canonical Hermes sources + all agent profiles.
# Never commit tokens to git. Pass token via env (not argv).
#
# Usage:
#   DISCORD_BOT_TOKEN_NEW='MTxxx.yyy.zzz' bash ops/hermes/update-discord-token.sh
#   DISCORD_BOT_TOKEN_NEW='...' bash ops/hermes/update-discord-token.sh --restart-gateway
set -euo pipefail

TOKEN="${DISCORD_BOT_TOKEN_NEW:-}"
APP_ID="${DISCORD_APPLICATION_ID:-1504204778102722750}"
RESTART=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --restart-gateway) RESTART=true; shift ;;
    -h|--help)
      echo "Set DISCORD_BOT_TOKEN_NEW to the full Bot Token (Bot → Reset Token in Discord Developer Portal)."
      exit 0
      ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

[[ -n "${TOKEN}" ]] || { echo "ERROR: set DISCORD_BOT_TOKEN_NEW"; exit 1; }
if [[ "${TOKEN}" != *.*.* ]]; then
  echo "WARN: Bot tokens are usually three segments separated by dots (MTxxx.yyy.zzz)."
  echo "      If you pasted Client Secret or Application ID only, gateway will fail."
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HERMES_AGENT_HOME="${HERMES_AGENT_HOME:-$HOME/.hermes}"
HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
GOALCHAIN_ENV="${GOALCHAIN_ENV:-$HERMES_HOME/config.env}"
REPO_ENV="${REPO_ENV:-$(cd "${SCRIPT_DIR}/../.." && pwd)/.env}"

log() { printf '[update-discord] %s\n' "$*"; }

upsert_env() {
  local file="$1"
  local key="$2"
  local val="$3"
  [[ -f "${file}" ]] || touch "${file}"
  chmod 600 "${file}" 2>/dev/null || true
  python3 - "${file}" "${key}" "${val}" <<'PY'
import sys
from pathlib import Path

path = Path(sys.argv[1])
key = sys.argv[2]
val = sys.argv[3]
lines = path.read_text(encoding="utf-8").splitlines() if path.exists() else []
out, found = [], False
for line in lines:
    if line.strip().startswith(f"{key}="):
        out.append(f'{key}="{val}"')
        found = True
    else:
        out.append(line)
if not found:
    if out and out[-1].strip():
        out.append("")
    out.append(f"# --- update-discord-token.sh ---")
    out.append(f'{key}="{val}"')
path.write_text("\n".join(out).rstrip() + "\n", encoding="utf-8")
path.chmod(0o600)
PY
}

log "Updating canonical env files"
upsert_env "${HERMES_AGENT_HOME}/.env" "DISCORD_BOT_TOKEN" "${TOKEN}"
upsert_env "${GOALCHAIN_ENV}" "DISCORD_TOKEN" "${TOKEN}"
upsert_env "${GOALCHAIN_ENV}" "DISCORD_APPLICATION_ID" "${APP_ID}"

if [[ -f "${REPO_ENV}" ]]; then
  upsert_env "${REPO_ENV}" "DISCORD_TOKEN" "${TOKEN}"
  log "Updated ${REPO_ENV} (local GoalChain .env)"
fi

COMMUNITY_ENV="${HERMES_HOME}/discord-community-bot/.env"
if [[ -f "${COMMUNITY_ENV}" ]] || [[ -d "$(dirname "${COMMUNITY_ENV}")" ]]; then
  mkdir -p "$(dirname "${COMMUNITY_ENV}")"
  upsert_env "${COMMUNITY_ENV}" "DISCORD_COMMUNITY_BOT_TOKEN" "${TOKEN}"
  log "Updated community bot .env if present"
fi

bash "${SCRIPT_DIR}/sync-goalchain-agent-profiles.sh"
log "Synced agent profiles"

log "Validating token against Discord API"
python3 - <<'PY'
import json, os, sys, urllib.request, urllib.error

token = os.environ["DISCORD_BOT_TOKEN_NEW"]
req = urllib.request.Request(
    "https://discord.com/api/v10/users/@me",
    headers={
        "Authorization": f"Bot {token}",
        "User-Agent": "DiscordBot (https://goalchain.fun, 1.0)",
    },
)
try:
    with urllib.request.urlopen(req, timeout=20) as r:
        data = json.loads(r.read().decode())
    print(f"OK bot=@{data.get('username')} id={data.get('id')}")
except urllib.error.HTTPError as e:
    print(f"FAIL HTTP {e.code}: {e.read().decode()[:200]}", file=sys.stderr)
    sys.exit(1)
PY

if [[ "${RESTART}" == true ]] && command -v systemctl >/dev/null 2>&1; then
  systemctl --user restart hermes-gateway.service 2>/dev/null && log "Restarted hermes-gateway" || log "WARN: gateway restart skipped"
fi

log "done"
