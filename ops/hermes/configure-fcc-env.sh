#!/usr/bin/env bash
# Merge ~/hermes/fcc.secrets.env into ~/.fcc/.env (FCC proxy for free Claude Code).
# Never commit fcc.secrets.env.
set -euo pipefail

SECRETS="${FCC_SECRETS_FILE:-$HOME/hermes/fcc.secrets.env}"
FCC_ENV="${FCC_ENV_FILE:-$HOME/.fcc/.env}"

if [[ ! -f "${SECRETS}" ]]; then
  echo "ERROR: missing ${SECRETS}"
  echo "  cp ops/hermes/fcc.secrets.env.example ~/hermes/fcc.secrets.env"
  echo "  nano ~/hermes/fcc.secrets.env"
  exit 1
fi

chmod 600 "${SECRETS}" 2>/dev/null || true
mkdir -p "$(dirname "${FCC_ENV}")"
touch "${FCC_ENV}"
chmod 600 "${FCC_ENV}" 2>/dev/null || true

python3 - "${SECRETS}" "${FCC_ENV}" <<'PY'
import sys
from pathlib import Path

secrets = Path(sys.argv[1])
fcc = Path(sys.argv[2])

def parse_env(path: Path) -> dict[str, str]:
    out: dict[str, str] = {}
    if not path.exists():
        return out
    for line in path.read_text(encoding="utf-8").splitlines():
        s = line.strip()
        if not s or s.startswith("#"):
            continue
        if "=" not in s:
            continue
        k, v = s.split("=", 1)
        out[k.strip()] = v.strip().strip('"').strip("'")
    return out

def quote(val: str) -> str:
    if not val:
        return '""'
    if any(c in val for c in ' \t#'):
        return '"' + val.replace('"', '\\"') + '"'
    return val

incoming = parse_env(secrets)
current = parse_env(fcc)

# Map secrets file → FCC .env keys
if key := incoming.get("OPENROUTER_API_KEY"):
    current["OPENROUTER_API_KEY"] = key

extra = incoming.get("FCC_OPENROUTER_EXTRA_MODELS", "")
if extra:
    models = []
    for part in extra.split(","):
        part = part.strip()
        if not part:
            continue
        if "/" not in part:
            part = f"open_router/{part}"
        elif not part.startswith("open_router/"):
            part = f"open_router/{part}"
        models.append(part)
    current["FCC_SMOKE_OPENROUTER_FREE_EXTRA_MODELS"] = ",".join(models)

for tier, env_key in (
    ("FCC_MODEL", "MODEL"),
    ("FCC_MODEL_OPUS", "MODEL_OPUS"),
    ("FCC_MODEL_SONNET", "MODEL_SONNET"),
    ("FCC_MODEL_HAIKU", "MODEL_HAIKU"),
    ("FCC_MODEL_LMSTUDIO", "FCC_SMOKE_MODEL_LMSTUDIO"),
):
    if incoming.get(tier):
        current[env_key] = incoming[tier]

if incoming.get("LM_STUDIO_BASE_URL"):
    current["LM_STUDIO_BASE_URL"] = incoming["LM_STUDIO_BASE_URL"]

# Preserve order: update keys in place, append new keys from current not in file
lines = fcc.read_text(encoding="utf-8").splitlines() if fcc.exists() else []
out_lines: list[str] = []
seen: set[str] = set()
for line in lines:
    s = line.strip()
    if not s or s.startswith("#") or "=" not in s:
        out_lines.append(line)
        continue
    k = s.split("=", 1)[0].strip()
    if k in current:
        out_lines.append(f"{k}={quote(current[k])}")
        seen.add(k)
    else:
        out_lines.append(line)

for k, v in sorted(current.items()):
    if k not in seen:
        out_lines.append(f"{k}={quote(v)}")

fcc.write_text("\n".join(out_lines).rstrip() + "\n", encoding="utf-8")
print(f"Updated {fcc} ({len(current)} keys touched)")
PY

echo "Restarting fcc-server (if running)..."
if pgrep -f "fcc-server" >/dev/null 2>&1; then
  pkill -f "fcc-server" 2>/dev/null || true
  sleep 2
  export PATH="${HOME}/.local/bin:${PATH}"
  nohup fcc-server >> "${HOME}/.fcc/logs/fcc-server.log" 2>&1 &
  sleep 2
  echo "fcc-server: $(pgrep -c -f fcc-server || echo 0) process(es)"
else
  echo "fcc-server not running — start with: fcc-server"
fi

echo "Done. Admin UI: http://127.0.0.1:8082/admin (via SSH tunnel)"
