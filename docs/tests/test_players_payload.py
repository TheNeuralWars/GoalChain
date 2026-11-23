#!/usr/bin/env python3
"""GW-PLAYERS-PAYLOAD-001: served players.json stays runtime-only.

players.json is fetched at runtime by every gallery/marketplace consumer on
both public surfaces. Generation-pipeline fields (tm_url, tm_data) live in
players.pipeline.json and must never come back into the served payload —
see scripts/players_payload_split.py for the split and re-run instructions.

This test enforces the tool's --check invariants so a future wholesale
regeneration of players.json fails CI/ QA until the split tool is re-run.
"""
from __future__ import annotations

import subprocess
import sys
import unittest
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
TOOL = REPO / "scripts" / "players_payload_split.py"


class PlayersPayloadSplit(unittest.TestCase):
    def test_split_tool_exists(self) -> None:
        self.assertTrue(TOOL.is_file(), "scripts/players_payload_split.py")

    def test_check_invariants(self) -> None:
        res = subprocess.run(
            [sys.executable, str(TOOL), "--check"],
            capture_output=True, text=True, cwd=str(REPO),
        )
        self.assertEqual(
            res.returncode, 0,
            f"players_payload_split.py --check failed:\n{res.stdout}\n{res.stderr}",
        )


if __name__ == "__main__":
    unittest.main()
