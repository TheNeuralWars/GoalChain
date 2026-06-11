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

import sys
is_sse = len(sys.argv) > 1 and sys.argv[1] == "sse"

mcp = FastMCP(
    "goalchain-ops",
    host="0.0.0.0" if is_sse else "127.0.0.1",
    port=8646 if is_sse else 8000,
    mount_path="/mcp-ops" if is_sse else "/"
)


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


# === IMAGE & VIDEO GENERATION ORCHESTRATION TOOLS ===

def _load_players() -> list:
    repo = Path(REPO)
    for p in ["docs/assets/data/players.json", "ai_context/03_data/players.json"]:
        path = repo / p
        if path.exists():
            try:
                with open(path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass
    return []


def _load_generation_state() -> dict:
    repo = Path(REPO)
    state_file = repo / "assets/players/generation_status.json"
    if state_file.exists():
        try:
            with open(state_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {"generated": {}, "pending": [], "last_updated": None}


def _save_generation_state(state: dict):
    repo = Path(REPO)
    state_file = repo / "assets/players/generation_status.json"
    state_file.parent.mkdir(parents=True, exist_ok=True)
    from datetime import datetime
    state["last_updated"] = datetime.now().isoformat()
    with open(state_file, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2)


@mcp.tool()
def get_next_visual_batch(style: str = "anime-stadium", count: int = 5) -> str:
    """
    Hermes decides which players should be generated next.
    Returns a JSON with the player details and specific prompts for Grok to execute.
    """
    players = _load_players()
    state = _load_generation_state()
    
    if not players:
        return json.dumps({"status": "error", "message": "players.json not found or empty."})
        
    generated_ids = set(state.get("generated", {}).keys())
    
    pending_players = []
    for p in players:
        pid = str(p.get("id"))
        if pid not in generated_ids:
            pending_players.append(p)
            
    if not pending_players:
        return json.dumps({
            "status": "completed",
            "message": "All 528 players have already been generated!"
        })
        
    batch = pending_players[:count]
    batch_prompts = []
    
    import random
    
    jersey_gradients = ["purple and neon-blue", "neon-green and emerald", "golden-yellow and black", "crimson-red and white", "orange and cyan"]
    cleat_colors = ["metallic purple", "chrome silver", "electric lime", "glowing gold"]
    
    for player in batch:
        player_id = player.get("id")
        player_name = player.get("name")
        real_name = player.get("real_name", "Verified Athlete")
        country = player.get("country")
        
        # Deterministic generation mapping based on player id/properties for consistency
        random.seed(player_id)
        
        jersey_colors = random.choice(jersey_gradients)
        cleat_color = random.choice(cleat_colors)
        
        # Physical description from JSON
        physical_data = player.get("physical", {})
        physical_desc = physical_data.get("t", "Athletic build, short dark hair, clean shaven, fair skin tone.")
        
        # Read populated jersey number from players.json
        player_number = player.get("jersey_number")
        if not player_number:
            player_number = (player_id % 99) + 1

        
        # Inject details for solid white background, no logos, and exact physical features
        prompt = (
            f"Full-body 3D digital render of a young athletic male soccer player, stylized modern anime game character style, highly detailed. "
            f"Likeness inspired by {real_name}. Physical appearance and details: {physical_desc} "
            f"He is looking directly at the camera with a confident, smirk expression. "
            f"He is wearing a modern custom football kit: a jersey with a {jersey_colors} gradient pattern, black sleeves, "
            f"and absolutely NO logos, NO badges, and NO text on the chest (completely plain blank chest). "
            f"Matching soccer shorts with the number \"{player_number}\" on the leg, matching high socks with stripes, and shiny metallic {cleat_color} soccer cleats. "
            f"Pose: standing confidently with one foot resting on top of a soccer ball. "
            f"Background: Solid, completely clean, flat, uniform white background. No shadows, no floor textures, no gradients, no stadium, no distractions. Perfect for easy background removal."
        )

        
        batch_prompts.append({
            "id": player_id,
            "name": player_name,
            "country": country,
            "prompt": prompt
        })
        
    return json.dumps({
        "status": "ready",
        "style": style,
        "count": len(batch_prompts),
        "players": batch_prompts,
        "instructions": "Execute these generation prompts in Grok Imagine, then call upload_generated_asset for each player to register them."
    }, indent=2)


@mcp.tool()
def upload_generated_asset(player_id: int, image_url: str, style: str = "v6.4") -> str:
    """
    Called by Grok to download the generated image directly to the Hermes server assets.
    """
    state = _load_generation_state()
    players = _load_players()
    
    player = next((p for p in players if p.get("id") == player_id), None)
    if not player:
        return f"Error: Player with ID {player_id} not found."
        
    import re
    def sanitize_filename(name):
        return re.sub(r'[^a-z0-9_\-]', '', name.lower().replace(' ', '_'))
        
    def normalize_country(c):
        return re.sub(r'[^A-Z0-9_\-]', '', c.strip().upper().replace(' ', '_'))

    padded_id = str(player_id).zfill(3)
    normalized_name = sanitize_filename(player.get("name"))
    country_folder = normalize_country(player.get("country"))
    
    repo = Path(REPO)
    raw_dir = repo / "assets/players/raw" / country_folder
    raw_dir.mkdir(parents=True, exist_ok=True)
    
    file_path = raw_dir / f"{padded_id}_{normalized_name}.png"
    
    # Download image url
    try:
        req = requests.get(image_url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=30)
        req.raise_for_status()
        with open(file_path, "wb") as f:
            f.write(req.content)
    except Exception as e:
        return f"Error: Failed to download asset from {image_url}. Reason: {str(e)}"
        
    # Register in state
    state["generated"][str(player_id)] = {
        "name": player.get("name"),
        "country": player.get("country"),
        "style": style,
        "raw_path": str(file_path.relative_to(repo)),
        "downloaded_at": requests.utils.time.time() if hasattr(requests.utils, 'time') else None
    }
    _save_generation_state(state)
    
    # Trigger face swap script process-player.py automatically in the background
    try:
        script_path = Path(__file__).parent / "process-player.py"
        if script_path.exists():
            subprocess.Popen([
                "python3",
                str(script_path),
                "--player-id",
                str(player_id),
                "--body-path",
                str(file_path)
            ])
            swap_msg = " Face-swap triggered in background."
        else:
            swap_msg = " Warning: process-player.py not found next to MCP server script."
    except Exception as eswap:
        swap_msg = f" Warning: Failed to launch face-swap background process: {eswap}"
    
    return f"Successfully saved asset to {file_path} and registered in Hermes state.{swap_msg}"


@mcp.tool()
def get_generation_progress() -> str:
    """
    Returns the current generation progress percentage of the 528 players collection.
    """
    state = _load_generation_state()
    generated = len(state.get("generated", {}))
    total = 528
    return json.dumps({
        "generated": generated,
        "total": total,
        "progress_percent": round((generated / total) * 100, 2) if total > 0 else 0,
        "last_updated": state.get("last_updated")
    }, indent=2)


if __name__ == "__main__":
    if is_sse:
        mcp.run(transport="sse")
    else:
        mcp.run()


