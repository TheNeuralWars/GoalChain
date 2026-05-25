#!/usr/bin/env python3
"""
MCP server: GoalChain on-chain + ops API for Hermes (native-mcp).

Tools: ops status, economy health/config, program config snapshot.
"""
from __future__ import annotations

import json
import os
import subprocess
from pathlib import Path

import requests

try:
    from mcp.server.fastmcp import FastMCP
except ImportError as e:  # pragma: no cover
    raise SystemExit("pip install mcp (Hermes venv should include it)") from e

mcp = FastMCP("goalchain-ops")

API_BASE = os.environ.get(
    "GOALCHAIN_API_BASE",
    "https://crm.goalchain.fun/goalchain-api",
).rstrip("/")
RPC_URL = os.environ.get("RPC_URL", "https://api.devnet.solana.com")
PROGRAM_ID = os.environ.get(
    "PROGRAM_ID",
    "FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg",
)
REPO = os.environ.get(
    "GOALCHAIN_REPO_PATH",
    str(Path.home() / "hermes/workspace/GoalChain"),
)


def _get(path: str) -> dict:
    r = requests.get(f"{API_BASE}{path}", timeout=25)
    r.raise_for_status()
    return r.json()


@mcp.tool()
def goalchain_ops_status() -> str:
    """Live GoalChain ops status (API health, worker, deploy hints)."""
    return json.dumps(_get("/api/ops/status"), indent=2)


@mcp.tool()
def goalchain_economy_health() -> str:
    """Economy health: canonical KPIs vs on-chain (healthy/warning/critical)."""
    return json.dumps(_get("/api/economy/health"), indent=2)


@mcp.tool()
def goalchain_economy_config() -> str:
    """Canonical economy config + on-chain protocol config snapshot."""
    return json.dumps(_get("/api/economy/config"), indent=2)


@mcp.tool()
def goalchain_onchain_program_info() -> str:
    """Solana devnet program id + RPC + recent repo commits (context for scans)."""
    commits = ""
    repo = Path(REPO)
    if (repo / ".git").exists():
        try:
            commits = subprocess.check_output(
                ["git", "-C", str(repo), "log", "-n", "5", "--oneline"],
                text=True,
                timeout=15,
            ).strip()
        except Exception as e:
            commits = f"(git log failed: {e})"
    payload = {
        "rpc_url": RPC_URL,
        "program_id": PROGRAM_ID,
        "api_base": API_BASE,
        "recent_commits": commits or "(none)",
    }
    return json.dumps(payload, indent=2)


if __name__ == "__main__":
    mcp.run()
