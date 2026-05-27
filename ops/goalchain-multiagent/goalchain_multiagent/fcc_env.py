"""Read API keys from FCC ~/.fcc/.env (same pool as oa-worker / fcc-claude)."""

from __future__ import annotations

import os
from pathlib import Path


def fcc_env_path() -> Path:
    raw = os.environ.get("FCC_ENV_PATH") or os.environ.get(
        "GOALCHAIN_MA_FCC_ENV", "~/.fcc/.env"
    )
    return Path(raw).expanduser()


def load_fcc_env() -> dict[str, str]:
    path = fcc_env_path()
    if not path.is_file():
        return {}
    out: dict[str, str] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        s = line.strip()
        if not s or s.startswith("#") or "=" not in s:
            continue
        key, val = s.split("=", 1)
        out[key.strip()] = val.strip().strip('"').strip("'")
    return out
