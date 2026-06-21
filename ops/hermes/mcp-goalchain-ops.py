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
HEALTHCHECK_SCRIPT = Path(REPO) / "ops/hermes/healthcheck.sh"


def _run_healthcheck() -> str:
    """Fallback when the bash call fails: return a JSON 'unavailable' envelope."""
    import datetime as _dt
    return json.dumps({
        "status": "unavailable",
        "reason": "healthcheck_failed",
        "timestamp": _dt.datetime.now(_dt.timezone.utc).isoformat(),
    })


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


# === CENTRALIZED HEALTH CHECK RESOURCE (issue #815) ===
#
# Exposes the bash healthcheck output via the MCP resource protocol.
# Returns a JSON envelope from `ops/hermes/healthcheck.sh --json`.
# Falls back to a degraded "unavailable" envelope if the script fails
# (e.g. file not found, permission denied, MCP server source owned by
# another user). Issue #815 §4.


@mcp.resource("goalchain-ops://.health")
def goalchain_ops_health() -> str:
    """Latest centralized health envelope (PASS/WARN/FAIL + per-check detail)."""
    if not HEALTHCHECK_SCRIPT.exists():
        return _run_healthcheck()
    try:
        out = subprocess.check_output(
            [str(HEALTHCHECK_SCRIPT), "--json"],
            text=True,
            timeout=60,
        ).strip()
    except subprocess.CalledProcessError as e:
        # Script ran but exited non-zero (WARN/FAIL). Still return its output
        # so callers see the per-check detail rather than a black box.
        if e.output:
            return e.output.decode("utf-8", errors="replace") if isinstance(e.output, bytes) else e.output
        return _run_healthcheck()
    except Exception:
        return _run_healthcheck()
    return out or _run_healthcheck()


# === IMAGE & VIDEO GENERATION ORCHESTRATION TOOLS ===

def _load_players() -> list:
    # First check safe persistent copy outside git workspace
    safe_path = Path("/home/ubuntu/hermes/players.json")
    if safe_path.exists():
        try:
            with open(safe_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass

    # Fallback to repo paths
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
        raw_physical_desc = physical_data.get("t", "Athletic build, short dark hair, clean shaven, fair skin tone.")

        import re as _re

        # ─────────────────────────────────────────────────────────────────────────
        # PROMPT SANITIZER — keeps Grok on-style for the full 528-player collection
        # ─────────────────────────────────────────────────────────────────────────
        physical_desc = raw_physical_desc

        # FILTER 1: Strip all parenthetical content.
        # Parentheses contain nicknames ('El Fideo'), heights (1.94m), style notes
        # "(often with creative graphics)", anime refs "(Naruto/Dragon Ball)", and
        # mask notes "(often wears a protective black face mask)".
        # Grok may render these literally — strip them all.
        physical_desc = _re.sub(r"\([^)]*\)", "", physical_desc)

        # FILTER 2: Age-related adjectives — Grok exaggerates these into child renders.
        _age_words = [
            r"\byouthful\b", r"\byoung\b", r"\bjuvenile\b", r"\bboyish\b",
            r"\bbaby[- ]?faced\b", r"\bteen\b", r"\badolescent\b", r"\bkid[- ]?like\b",
            r"\bchild[- ]?like\b", r"\byouthful[-\s]?appearance\b", r"\byoung[-\s]?face\b",
            r"\bimmature\b",
        ]
        for _pat in _age_words:
            physical_desc = _re.sub(_pat, "", physical_desc, flags=_re.IGNORECASE)

        # FILTER 3: Normalize extreme body-size intensifiers.
        # "Towering" or "exceptionally tall" makes Grok render cartoon giants.
        # Replace with proportional equivalents that read normally in anime style.
        _body_normalizations = [
            (r"\bcolossal(?:ly)?\b",                "tall"),
            (r"\btowering\b",                        "tall"),
            (r"\bexceptionally\s+tall\b",            "tall"),
            (r"\bexceptionally\s+(?:strong|powerful)\b", "powerful"),
            (r"\bexceptionally\s+fast\b",            "fast"),
            (r"\bexceptionally\s+agile\b",           "agile"),
            (r"\bexceptionally\s+wide\b",            "broad-shouldered"),
            (r"\bexceptionally\s+tenacious\b",       "tenacious"),
            (r"\bmassive\b",                         "strong"),
            (r"\bimposing\b",                        "commanding"),
            (r"\bvery\s+small\b",                    "compact"),
            (r"\bvery\s+agile\b",                    "agile"),
            (r"\bvery\s+fast\b",                     "fast"),
            (r"\bvery\s+athletic\b",                 "athletic"),
        ]
        for _pat, _repl in _body_normalizations:
            physical_desc = _re.sub(_pat, _repl, physical_desc, flags=_re.IGNORECASE)

        # FILTER 4: Fix dangling conjunctions left after word removal
        # e.g. ", but focused look" → ", focused look"
        physical_desc = _re.sub(r",\s*(but|yet)\s+", ", ", physical_desc, flags=_re.IGNORECASE)

        # FILTER 5: Final cleanup — double spaces, trailing punctuation
        physical_desc = _re.sub(r"  +", " ", physical_desc).strip(", .")
        # ─────────────────────────────────────────────────────────────────────────

        # Read populated jersey number from players.json
        player_number = player.get("jersey_number")
        if not player_number:
            player_number = (player_id % 99) + 1

        
        # Inject details for solid white background, no logos, and exact physical features
        prompt = (
            f"Full-body 3D digital render of an adult male professional soccer player aged 21-35, "
            f"NOT a child, NOT a teenager, NOT a young boy — a grown adult man with a mature face and fully-developed adult physique. "
            f"Normal realistic athletic proportions: standard human height and build, no exaggerated size differences between players. "
            f"Mature athletic anime style, highly detailed, elegant proportions, beautiful anime key visual aesthetic. "
            f"Likeness features inspired by {real_name}: {physical_desc} "
            f"Style: high-end 2.5D/3D anime game art, smooth detailed shading, volumetric lighting, deep soft shadows, high contrast, well-defined shadows and highlights, not photorealistic, no real-life photography, no realistic skin texture. "
            f"He is looking directly at the camera with a confident, smirk expression. No face masks, no accessories covering the face. "
            f"He is wearing a modern custom football kit: a jersey with a {jersey_colors} gradient pattern, black sleeves, "
            f"and absolutely NO logos, NO badges, and NO text on the chest (completely plain blank chest). "
            f"He is wearing matching soccer shorts with the jersey number \"{player_number}\" clearly printed, highly visible, and perfectly legible in high-contrast solid color on the front leg of the shorts. No other numbers or letters should appear on the uniform. "
            f"Matching socks with stripes, and shiny metallic {cleat_color} soccer cleats. "
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
def upload_generated_asset(player_id: int, image_url: str = "", image_base64: str = "", style: str = "v6.4") -> str:
    """
    Called by Grok to download or save the generated image directly to the Hermes server assets.
    Supports download via image_url or direct write via image_base64.
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
    
    # Save image content
    if image_base64:
        import base64
        try:
            # Strip data URL prefix if present (e.g., "data:image/png;base64,")
            if "," in image_base64:
                image_base64 = image_base64.split(",", 1)[1]
            img_data = base64.b64decode(image_base64)
            with open(file_path, "wb") as f:
                f.write(img_data)
        except Exception as e:
            return f"Error: Failed to decode and save base64 image data. Reason: {str(e)}"
    elif image_url:
        if image_url.startswith("data:"):
            import base64
            try:
                # Format: "data:image/png;base64,iVBORw0KG..."
                if "," in image_url:
                    base64_data = image_url.split(",", 1)[1]
                else:
                    base64_data = image_url
                img_data = base64.b64decode(base64_data)
                with open(file_path, "wb") as f:
                    f.write(img_data)
            except Exception as e:
                return f"Error: Failed to decode and save data URL. Reason: {str(e)}"
        else:
            # Download image url
            try:
                # Translate GitHub URLs to instant raw download links to avoid raw.githubusercontent.com CDN caching delay
                if "github.com" in image_url and "/blob/" in image_url:
                    image_url = image_url.replace("/blob/", "/raw/")
                elif "raw.githubusercontent.com" in image_url:
                    # Reconstruct instant github.com/raw link from raw.githubusercontent.com
                    parts = image_url.replace("https://raw.githubusercontent.com/", "").split("/", 3)
                    if len(parts) >= 4:
                        owner, repo_name, branch, path = parts
                        image_url = f"https://github.com/{owner}/{repo_name}/raw/{branch}/{path}"
                    
                req = requests.get(image_url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=30)
                req.raise_for_status()
                with open(file_path, "wb") as f:
                    f.write(req.content)
            except Exception as e:
                return f"Error: Failed to download asset from {image_url}. Reason: {str(e)}"
    else:
        return "Error: Either image_url or image_base64 must be provided."
        
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


