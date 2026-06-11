#!/usr/bin/env bash
# Copy shared API secrets into Hermes profile(s) from canonical sources.
# Hermes does NOT auto-inherit .env across profiles — run this after creating a profile
# or when keys change in ~/.hermes/.env / ~/hermes/config.env.
#
# Usage:
#   bash ops/hermes/bootstrap-profile-secrets.sh --profile my-agent
#   bash ops/hermes/bootstrap-profile-secrets.sh --agent-profiles
#   bash ops/hermes/bootstrap-profile-secrets.sh --all-profiles
#   bash ops/hermes/bootstrap-profile-secrets.sh --profile newbot --also-auth
set -euo pipefail

HERMES_AGENT_HOME="${HERMES_AGENT_HOME:-$HOME/.hermes}"
HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
GOALCHAIN_ENV="${GOALCHAIN_ENV:-$HERMES_HOME/config.env}"
TEMPLATE_PROFILE="${HERMES_TEMPLATE_PROFILE:-default}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AGENT_PROFILES_LIST="${GOALCHAIN_AGENT_PROFILES_LIST:-$SCRIPT_DIR/goalchain-agent-profiles.list}"

PROFILE=""
ALL_PROFILES=false
AGENT_PROFILES=false
COPY_AUTH=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --profile) PROFILE="$2"; shift 2 ;;
    --all-profiles) ALL_PROFILES=true; shift ;;
    --agent-profiles) AGENT_PROFILES=true; shift ;;
    --also-auth) COPY_AUTH=true; shift ;;
    --template) TEMPLATE_PROFILE="$2"; shift 2 ;;
    -h|--help)
      cat <<'EOF'
Merge Discord, X, xAI, and GoalChain API keys into Hermes profile .env files.

Sources (in order, later wins):
  1. ~/.hermes/.env
  2. ~/hermes/config.env

Examples:
  bash ops/hermes/bootstrap-profile-secrets.sh --profile my-new-agent
  bash ops/hermes/bootstrap-profile-secrets.sh --agent-profiles
  bash ops/hermes/bootstrap-profile-secrets.sh --all-profiles
  bash ops/hermes/bootstrap-profile-secrets.sh --profile scout --also-auth

After creating a profile, prefer:
  hermes profile create scout --clone --clone-from default
  bash ops/hermes/on-profile-created.sh scout
EOF
      exit 0
      ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

[[ "${ALL_PROFILES}" == true || "${AGENT_PROFILES}" == true || -n "${PROFILE}" ]] || {
  echo "ERROR: use --profile NAME, --agent-profiles, or --all-profiles"
  exit 1
}

log() { printf '[profile-secrets] %s\n' "$*"; }

export HERMES_AGENT_HOME HERMES_HOME GOALCHAIN_ENV TEMPLATE_PROFILE PROFILE ALL_PROFILES AGENT_PROFILES COPY_AUTH AGENT_PROFILES_LIST

python3 <<'PY'
import os
import re
from pathlib import Path

home = Path(os.environ["HERMES_AGENT_HOME"]).expanduser()
hermes_home = Path(os.environ["HERMES_HOME"]).expanduser()
goalchain_env = Path(os.environ["GOALCHAIN_ENV"]).expanduser()
profile = os.environ.get("PROFILE", "").strip()
all_profiles = os.environ.get("ALL_PROFILES") == "true"
agent_profiles = os.environ.get("AGENT_PROFILES") == "true"
agent_list = Path(os.environ.get("AGENT_PROFILES_LIST", "")).expanduser()
copy_auth = os.environ.get("COPY_AUTH") == "true"

# Keys shared across GoalChain agents (Discord gateway + X-Scout + xAI).
SHARED_KEYS = [
    "DISCORD_BOT_TOKEN",
    "DISCORD_TOKEN",
    "DISCORD_ALLOWED_USERS",
    "DISCORD_ALLOW_ALL_USERS",
    "DISCORD_HOME_CHANNEL",
    "DISCORD_HOME_CHANNEL_THREAD_ID",
    "DISCORD_RESEARCH_CHANNEL_ID",
    "DISCORD_OPENCLAW_CHAT_ID",
    "DISCORD_RESEARCH_WEBHOOK_URL",
    "DISCORD_MESSAGE_LANG",
    "XAI_API_KEY",
    "OA_X_PUBLISH_ENABLED",
    "OPENROUTER_API_KEY",
    "GROQ_API_KEY",
    "DEEPSEEK_API_KEY",
    "WEBHOOK_ENABLED",
    "WEBHOOK_PORT",
    "WEBHOOK_SECRET",
    "HERMES_GATEWAY_TOKEN",
    "GITHUB_TOKEN",
    "GH_TOKEN",
    "FIRECRAWL_API_KEY",
    "X_API_KEY",
    "X_API_SECRET",
    "X_ACCESS_TOKEN",
    "X_ACCESS_SECRET",
    "X_BEARER_TOKEN",
    "NOTION_API_KEY",
    "NOTION_DATABASE_ID",
    "NOTION_MILESTONES_DATABASE_ID",
]

# Map DISCORD_TOKEN (config.env) → DISCORD_BOT_TOKEN (Hermes gateway) if bot token missing.
ALIASES = {
    "DISCORD_BOT_TOKEN": ["DISCORD_TOKEN"],
}


def parse_env(path: Path) -> dict[str, str]:
    out: dict[str, str] = {}
    if not path.exists():
        return out
    for line in path.read_text(encoding="utf-8").splitlines():
        s = line.strip()
        if not s or s.startswith("#") or "=" not in s:
            continue
        k, _, v = s.partition("=")
        out[k.strip()] = v.strip().strip('"').strip("'")
    return out


def merge_sources() -> dict[str, str]:
    merged: dict[str, str] = {}
    for src in (home / ".env", goalchain_env):
        merged.update(parse_env(src))
    for target, sources in ALIASES.items():
        if merged.get(target):
            continue
        for alt in sources:
            if merged.get(alt):
                merged[target] = merged[alt]
                break
    return merged


def update_env_file(path: Path, secrets: dict[str, str], profile_name: str) -> list[str]:
    lines = path.read_text(encoding="utf-8").splitlines() if path.exists() else []
    
    # Identify keys to exclude/disable for this profile
    keys_to_exclude = []
    if profile_name != "hermes-ceo":
        keys_to_exclude = ["DISCORD_BOT_TOKEN", "DISCORD_TOKEN", "WEBHOOK_PORT"]
        if profile_name != "lucas":
            keys_to_exclude.extend(["TELEGRAM_BOT_TOKEN", "TELEGRAM_TOKEN"])

    # Comment out or remove excluded keys from existing lines
    new_lines = []
    keys_present = set()
    for line in lines:
        s = line.strip()
        if not s:
            new_lines.append(line)
            continue
        if s.startswith("#"):
            # Avoid duplicating disabled comments
            if "Disabled to avoid gateway conflicts" in s:
                continue
            new_lines.append(line)
            continue
        if "=" in s:
            k, v = s.split("=", 1)
            k = k.strip()
            if k in keys_to_exclude:
                new_lines.append(f"# {line} # Disabled to avoid gateway conflicts")
            elif k == "WEBHOOK_ENABLED" and profile_name != "hermes-ceo":
                new_lines.append('WEBHOOK_ENABLED="false"')
                keys_present.add(k)
            else:
                new_lines.append(line)
                keys_present.add(k)
        else:
            new_lines.append(line)

    updated = []
    for key in SHARED_KEYS:
        if key in keys_to_exclude:
            continue
        val = secrets.get(key, "")
        if key == "WEBHOOK_ENABLED" and profile_name != "hermes-ceo":
            val = "false"
        if not val:
            continue
        entry = f'{key}="{val}"' if re.search(r'[\s#"]', val) else f"{key}={val}"
        if key in keys_present:
            for i, line in enumerate(new_lines):
                if line.strip().startswith(f"{key}="):
                    new_lines[i] = entry
                    updated.append(key)
                    break
        else:
            if new_lines and new_lines[-1].strip():
                new_lines.append("")
            new_lines.append(f"# --- bootstrap-profile-secrets.sh ---")
            new_lines.append(entry)
            updated.append(key)
            keys_present.add(key)

    # Also explicitly add WEBHOOK_ENABLED="false" for worker profiles if not already present
    if profile_name != "hermes-ceo":
        if "WEBHOOK_ENABLED" not in keys_present:
            new_lines.append('WEBHOOK_ENABLED="false"')
            updated.append("WEBHOOK_ENABLED")

    if updated or len(new_lines) != len(lines):
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text("\n".join(new_lines).rstrip() + "\n", encoding="utf-8")
        path.chmod(0o600)
    return updated


def load_agent_profile_names() -> list[str]:
    if not agent_list.is_file():
        raise SystemExit(f"Agent profiles list not found: {agent_list}")
    names: list[str] = []
    for line in agent_list.read_text(encoding="utf-8").splitlines():
        s = line.strip()
        if not s or s.startswith("#"):
            continue
        names.append(s)
    if not names:
        raise SystemExit(f"No profiles listed in {agent_list}")
    return names


def profile_dirs() -> list[Path]:
    if profile:
        return [home / "profiles" / profile]
    if agent_profiles:
        return [home / "profiles" / name for name in load_agent_profile_names()]
    if all_profiles:
        root = home / "profiles"
        if not root.is_dir():
            return []
        return sorted(p for p in root.iterdir() if p.is_dir())
    return []


secrets = merge_sources()
if not secrets:
    raise SystemExit("No secrets found in ~/.hermes/.env or ~/hermes/config.env")

targets = profile_dirs()
if not targets:
    raise SystemExit("No profile directories to update")

for pdir in targets:
    env_path = pdir / ".env"
    changed = update_env_file(env_path, secrets, pdir.name)
    print(f"{pdir.name}: updated {len(changed)} keys in .env")
    if copy_auth:
        src_auth = home / "auth.json"
        dst_auth = pdir / "auth.json"
        if src_auth.exists():
            dst_auth.write_bytes(src_auth.read_bytes())
            dst_auth.chmod(0o600)
            print(f"{pdir.name}: copied auth.json (xai-oauth pool)")

missing = [k for k in SHARED_KEYS if k == "DISCORD_BOT_TOKEN" and not secrets.get(k)]
if missing:
    print("WARN: still empty in sources:", ", ".join(missing))
PY

log "done"
