#!/usr/bin/env bash
# Hermes language policy: English default + public channels; Spanish only with Nico (private).
# Safe to re-run. Patches ~/.hermes/config.yaml and ~/hermes/config.env.
set -euo pipefail

HERMES_CONFIG="${HERMES_CONFIG:-$HOME/.hermes/config.yaml}"
CONFIG_ENV="${HERMES_HOME:-$HOME/hermes}/config.env"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

PUBLIC_PROMPT='Reply in English only. This is a public GoalChain channel — professional and concise. Do not use Spanish unless quoting the user.'
WHATSAPP_PROMPT='Private chat with Nico (owner). Reply in Spanish by default; switch to English only if Nico writes in English.'

log() { printf '[hermes-lang] %s\n' "$*"; }

patch_config_yaml() {
  export HERMES_CONFIG PUBLIC_PROMPT WHATSAPP_PROMPT
  python3 - <<'PY'
import os
from pathlib import Path

try:
    import yaml
except ImportError:
    raise SystemExit("PyYAML required")

path = Path(os.environ["HERMES_CONFIG"])
cfg = yaml.safe_load(path.read_text(encoding="utf-8")) if path.exists() else {}

public = os.environ["PUBLIC_PROMPT"]
wa_private = os.environ["WHATSAPP_PROMPT"]

display = cfg.setdefault("display", {})
display["language"] = "en"

def channel_ids(platform_cfg: dict) -> list[str]:
    raw = platform_cfg.get("free_response_channels") or platform_cfg.get("allowed_channels") or ""
    if isinstance(raw, list):
        return [str(x).strip() for x in raw if str(x).strip() and str(x) != "*"]
    return [p.strip() for p in str(raw).split(",") if p.strip() and p.strip() != "*"]

for name in ("discord", "slack", "mattermost", "telegram"):
    plat = cfg.get(name)
    if not isinstance(plat, dict):
        continue
    ids = channel_ids(plat)
    if not ids:
        continue
    prompts = plat.setdefault("channel_prompts", {})
    if not isinstance(prompts, dict):
        prompts = {}
        plat["channel_prompts"] = prompts
    for cid in ids:
        prompts[str(cid)] = public

wa = cfg.setdefault("whatsapp", {})
if not isinstance(wa, dict):
    wa = {}
    cfg["whatsapp"] = wa
extra = wa.setdefault("extra", {})
if not isinstance(extra, dict):
    extra = {}
    wa["extra"] = extra
extra["owner_language_prompt"] = wa_private

platforms = cfg.setdefault("platforms", {})
pwa = platforms.setdefault("whatsapp", wa if isinstance(wa, dict) else {})

path.parent.mkdir(parents=True, exist_ok=True)
path.write_text(yaml.dump(cfg, default_flow_style=False, sort_keys=False), encoding="utf-8")
print(f"patched {path}: display.language=en, channel_prompts on public platforms, whatsapp private=es")
PY
}

patch_config_env() {
  touch "${CONFIG_ENV}"
  python3 - "${CONFIG_ENV}" <<'PY'
import sys
from pathlib import Path

cfg = Path(sys.argv[1])
updates = {
    "DISCORD_MESSAGE_LANG": "en",
    "HERMES_DEFAULT_LANG": "en",
    "HERMES_PRIVATE_LANG": "es",
}
lines = cfg.read_text(encoding="utf-8").splitlines() if cfg.exists() else []
out, seen = [], set()
for line in lines:
    key = line.split("=", 1)[0].strip() if "=" in line and not line.strip().startswith("#") else ""
    if key in updates:
        out.append(f'{key}="{updates[key]}"')
        seen.add(key)
    else:
        out.append(line)
for k, v in updates.items():
    if k not in seen:
        out.append(f'{k}="{v}"')
cfg.write_text("\n".join(out).rstrip() + "\n", encoding="utf-8")
print("patched", cfg)
PY
}

main() {
  log "configuring Hermes language policy"
  patch_config_yaml
  patch_config_env
  log "done — restart hermes-gateway: systemctl --user restart hermes-gateway"
}

main "$@"
