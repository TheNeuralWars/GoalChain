#!/usr/bin/env python3
"""Apply mint_setup/wallets.json addresses to config.json and all asset metadata."""

from __future__ import annotations

import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent
WALLETS_FILE = ROOT / "wallets.json"
CONFIG_FILE = ROOT / "config.json"
ASSETS_DIR = ROOT / "assets"

PLACEHOLDERS = {
    "Fndrxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx": "founder",
    "BldrFundxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx": "builder_fund",
    "CmntyTreasuryxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx": "community_treasury",
}


def load_wallets() -> dict:
    data = json.loads(WALLETS_FILE.read_text(encoding="utf-8"))
    for key in ("founder", "builder_fund", "community_treasury"):
        if key not in data or not data[key]:
            raise SystemExit(f"missing wallet key: {key}")
    return data


def replace_in_obj(obj, mapping: dict[str, str]):
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k == "address" and isinstance(v, str) and v in PLACEHOLDERS:
                obj[k] = mapping[PLACEHOLDERS[v]]
            elif k == "destination" and isinstance(v, str) and v in PLACEHOLDERS:
                obj[k] = mapping[PLACEHOLDERS[v]]
            else:
                replace_in_obj(v, mapping)
    elif isinstance(obj, list):
        for item in obj:
            replace_in_obj(item, mapping)


def main() -> int:
    wallets = load_wallets()
    mapping = {
        "founder": wallets["founder"],
        "builder_fund": wallets["builder_fund"],
        "community_treasury": wallets["community_treasury"],
    }

    config = json.loads(CONFIG_FILE.read_text(encoding="utf-8"))
    replace_in_obj(config, mapping)
    CONFIG_FILE.write_text(json.dumps(config, indent=2) + "\n", encoding="utf-8")

    updated = 0
    for path in sorted(ASSETS_DIR.glob("*.json")):
        payload = json.loads(path.read_text(encoding="utf-8"))
        replace_in_obj(payload, mapping)
        path.write_text(json.dumps(payload, indent=4) + "\n", encoding="utf-8")
        updated += 1

    print(f"Updated {CONFIG_FILE.name} and {updated} asset files.")
    print(f"Founder: {mapping['founder']}")
    print(f"Builder Fund: {mapping['builder_fund']}")
    print(f"Community Treasury: {mapping['community_treasury']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
