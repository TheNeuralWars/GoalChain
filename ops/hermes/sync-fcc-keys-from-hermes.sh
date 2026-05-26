#!/usr/bin/env bash
# Copy working API keys from Hermes canonical env into fcc.secrets.env + ~/.fcc/.env.
# Hermes keys in ~/.hermes/.env and ~/hermes/config.env are NOT removed.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HERMES_AGENT_HOME="${HERMES_AGENT_HOME:-$HOME/.hermes}"
HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
SECRETS="${FCC_SECRETS_FILE:-$HERMES_HOME/fcc.secrets.env}"

python3 - "${HERMES_AGENT_HOME}" "${HERMES_HOME}" "${SECRETS}" <<'PY'
import re
import sys
from pathlib import Path

hermes_home = Path(sys.argv[1])
hermes_cfg = Path(sys.argv[2]) / "config.env"
secrets = Path(sys.argv[3])

def parse(p: Path) -> dict[str, str]:
    out: dict[str, str] = {}
    if not p.exists():
        return out
    for ln in p.read_text(encoding="utf-8").splitlines():
        s = ln.strip()
        if not s or s.startswith("#") or "=" not in s:
            continue
        k, v = s.split("=", 1)
        out[k.strip()] = v.strip().strip('"').strip("'")
    return out

merged = {**parse(hermes_cfg), **parse(hermes_home / ".env")}
keys = ["OPENROUTER_API_KEY", "DEEPSEEK_API_KEY", "GROQ_API_KEY", "NVIDIA_NIM_API_KEY"]
updates = {k: merged[k] for k in keys if merged.get(k)}
if not updates:
    raise SystemExit("No API keys found in Hermes env")

lines = secrets.read_text(encoding="utf-8").splitlines() if secrets.exists() else []
seen: set[str] = set()
out: list[str] = []
for ln in lines:
    k = ln.split("=", 1)[0].strip() if "=" in ln and not ln.strip().startswith("#") else None
    if k in updates:
        v = updates[k]
        out.append(f"{k}={v!r}" if re.search(r'[\s#"]', v) else f"{k}={v}")
        seen.add(k)
    else:
        out.append(ln)
for k, v in updates.items():
    if k not in seen:
        out.append(f"{k}={v!r}" if re.search(r'[\s#"]', v) else f"{k}={v}")
secrets.parent.mkdir(parents=True, exist_ok=True)
secrets.write_text("\n".join(out).rstrip() + "\n", encoding="utf-8")
secrets.chmod(0o600)
print("synced to fcc.secrets.env:", ", ".join(sorted(updates)))
PY

bash "${SCRIPT_DIR}/configure-fcc-env.sh"
bash "${SCRIPT_DIR}/ensure-fcc-server.sh"
