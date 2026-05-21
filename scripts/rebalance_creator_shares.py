#!/usr/bin/env python3
"""
Rebalance creator shares and royalties to founder<=1% policy.

Updates JSON metadata files in:
  - mint_setup/assets/*.json
  - docs/assets/data/metadata/*.json
"""

from __future__ import annotations

import glob
import json
from pathlib import Path

FOUNDER_ADDR = "Fndrxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
BUILDER_FUND_ADDR = "BldrFundxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
COMMUNITY_TREASURY_ADDR = "CmntyTreasuryxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

CREATORS = [
    {"address": FOUNDER_ADDR, "share": 1},
    {"address": BUILDER_FUND_ADDR, "share": 10},
    {"address": COMMUNITY_TREASURY_ADDR, "share": 89},
]

TARGET_ROYALTY_BPS = 100  # 1%


def update_file(path: Path) -> bool:
    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)

    changed = False
    if data.get("seller_fee_basis_points") != TARGET_ROYALTY_BPS:
        data["seller_fee_basis_points"] = TARGET_ROYALTY_BPS
        changed = True

    props = data.setdefault("properties", {})
    if props.get("creators") != CREATORS:
        props["creators"] = CREATORS
        changed = True

    if changed:
        with path.open("w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
            f.write("\n")
    return changed


def main() -> None:
    patterns = [
        "/home/nicopez/Projects/GoalChain/GoalChain-main/mint_setup/assets/*.json",
        "/home/nicopez/Projects/GoalChain/GoalChain-main/docs/assets/data/metadata/*.json",
    ]
    files: list[Path] = []
    for pattern in patterns:
        files.extend(Path(p) for p in glob.glob(pattern))

    updated = 0
    for file_path in files:
        if update_file(file_path):
            updated += 1

    print(f"Scanned: {len(files)} files")
    print(f"Updated: {updated} files")


if __name__ == "__main__":
    main()
