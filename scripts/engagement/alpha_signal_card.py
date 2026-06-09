#!/usr/bin/env python3
"""
Alpha Signal Visual Card Generator
Creates branded GC images for daily Alpha Signal posts.

Uses Fal.ai (FLUX) via existing FAL_KEY in Hermes vault.
Output: 9:16 (Story/Reel) + 1:1 (Feed) PNGs.
"""

import os
import sys
import json
import argparse
import hashlib
from pathlib import Path

# Load env
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

FAL_KEY = os.getenv("FAL_KEY") or os.getenv("FAL_API_KEY")

# GC Brand Colors
NEON_GREEN = "#14f195"
NEON_PURPLE = "#9945ff"
DARK_BG = "#0a0a14"
CARD_BG = "rgba(20, 20, 35, 0.95)"
WHITE = "#f8fafc"
GRAY = "#94a3b8"

def build_flux_prompt(defi_signal, football_signal, haiku):
    """Build FLUX prompt for Alpha Signal card"""
    
    # Extract key visual elements
    protocol = defi_signal.get("protocol", "DeFi")
    vault = defi_signal.get("vault", "Vault")
    apy = defi_signal.get("apy", "?")
    league = football_signal.get("league", "Football")
    team = football_signal.get("team", "Team")
    player = football_signal.get("player", "")
    stat = football_signal.get("stat", "")
    
    prompt = (
        f"Professional financial-sports hybrid visualization card, 9:16 aspect ratio. "
        f"Dark futuristic background ({DARK_BG}) with subtle grid lines. "
        f"TOP SECTION: '{protocol} {vault}' in bold neon green ({NEON_GREEN}) font, "
        f"APY {apy}% in large neon purple ({NEON_PURPLE}) numbers with glow effect. "
        f"Small DeFi icons: staking, yield, blockchain nodes. "
        f"MIDDLE DIVIDER: Diagonal slash with 'FUSION' text, neon green-to-purple gradient. "
        f"BOTTOM SECTION: '{league}' badge, '{team}' crest silhouette, "
        f"'{player}' name if present, key stat '{stat}' in clean typography. "
        f"Football icons: ball, goal, xG chart sparkline. "
        f"HAIKU BANNER at bottom: '{haiku}' in elegant serif font, white with subtle glow. "
        f"Overall style: Cyberpunk meets Bloomberg terminal meets football broadcast graphics. "
        f"High contrast, crisp vectors, 8k quality, professional broadcast graphics aesthetic. "
        f"Color palette STRICTLY: {DARK_BG}, {NEON_GREEN}, {NEON_PURPLE}, {WHITE}, {GRAY}. "
        f"No photorealistic people, no real player faces, abstract/stylized only."
    )
    return prompt

def generate_via_fal(prompt, aspect_ratio="9:16", steps=28):
    """Call Fal.ai FLUX API"""
    if not FAL_KEY:
        raise Exception("FAL_KEY not configured")
    
    # Map aspect ratios to Fal.ai FLUX valid sizes
    size_map = {
        "9:16": "portrait_16_9",
        "1:1": "square",
        "16:9": "landscape_16_9",
        "4:3": "landscape_4_3",
        "3:4": "portrait_4_3"
    }
    fal_size = size_map.get(aspect_ratio, "portrait_16_9")
    
    import requests
    headers = {
        "Authorization": f"Key {FAL_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "prompt": prompt,
        "image_size": fal_size,
        "num_inference_steps": steps,
        "enable_safety_checker": True,
        "sync_mode": True
    }
    url = "https://queue.fal.run/fal-ai/flux/dev"
    resp = requests.post(url, headers=headers, json=data, timeout=120)
    resp.raise_for_status()
    
    result = resp.json()
    # Handle both sync and async response formats
    if "images" in result:
        return result["images"][0]["url"]
    elif "request_id" in result:
        # Poll for completion (sync_mode=True should prevent this, but just in case)
        import time
        status_url = f"https://queue.fal.run/fal-ai/flux/requests/{result['request_id']}/status"
        for _ in range(30):
            time.sleep(2)
            status_resp = requests.get(status_url, headers=headers, timeout=30)
            if status_resp.status_code == 200:
                status_data = status_resp.json()
                if status_data.get("status") == "COMPLETED":
                    result_url = f"https://queue.fal.run/fal-ai/flux/requests/{result['request_id']}"
                    result_resp = requests.get(result_url, headers=headers, timeout=30)
                    if result_resp.status_code == 200:
                        result_data = result_resp.json()
                        if "images" in result_data:
                            return result_data["images"][0]["url"]
        raise Exception("Generation timed out")
    else:
        raise Exception(f"Unexpected response format: {result}")

def download_image(url, output_path):
    import urllib.request
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response, open(output_path, 'wb') as out_file:
        import shutil
        shutil.copyfileobj(response, out_file)

def main():
    parser = argparse.ArgumentParser(description="Generate Alpha Signal visual cards")
    parser.add_argument("--defi-protocol", required=True, help="Protocol name (Jito, Kamino, etc.)")
    parser.add_argument("--defi-vault", required=True, help="Vault/strategy name")
    parser.add_argument("--defi-apy", required=True, help="APY percentage")
    parser.add_argument("--defi-tvl", default="?", help="TVL in millions")
    parser.add_argument("--defi-risk", default="MED", help="Risk level")
    parser.add_argument("--football-league", required=True, help="League name")
    parser.add_argument("--football-team", required=True, help="Team name")
    parser.add_argument("--football-player", default="", help="Player name (optional)")
    parser.add_argument("--football-stat", required=True, help="Key stat (xG, form, etc.)")
    parser.add_argument("--haiku", required=True, help="5-7-5 haiku text")
    parser.add_argument("--output-dir", default="assets/engagement/alpha_signals", help="Output directory")
    parser.add_argument("--dry-run", action="store_true", help="Print prompt only")
    
    args = parser.parse_args()
    
    defi_signal = {
        "protocol": args.defi_protocol,
        "vault": args.defi_vault,
        "apy": args.defi_apy,
        "tvl": args.defi_tvl,
        "risk": args.defi_risk
    }
    football_signal = {
        "league": args.football_league,
        "team": args.football_team,
        "player": args.football_player,
        "stat": args.football_stat
    }
    
    prompt = build_flux_prompt(defi_signal, football_signal, args.haiku)
    
    if args.dry_run:
        print("FLUX PROMPT:")
        print(prompt)
        return
    
    # Generate 9:16 (Story)
    print("Generating 9:16 (Story/Reel)...")
    url_916 = generate_via_fal(prompt, "9:16")
    
    # Generate 1:1 (Feed)
    print("Generating 1:1 (Feed)...")
    prompt_11 = prompt.replace("9:16 aspect ratio", "1:1 square aspect ratio")
    url_11 = generate_via_fal(prompt_11, "1:1")
    
    # Save
    output_dir = Path(__file__).resolve().parent.parent / args.output_dir
    output_dir.mkdir(parents=True, exist_ok=True)
    
    date_str = datetime.now().strftime("%Y%m%d")
    hash_short = hashlib.md5(args.haiku.encode()).hexdigest()[:8]
    
    path_916 = output_dir / f"alpha_signal_{date_str}_{hash_short}_916.png"
    path_11 = output_dir / f"alpha_signal_{date_str}_{hash_short}_11.png"
    
    download_image(url_916, path_916)
    download_image(url_11, path_11)
    
    print(f"Saved: {path_916}")
    print(f"Saved: {path_11}")
    
    # Log visual hash for tracking
    log_entry = {
        "date": date_str,
        "haiku_hash": hash_short,
        "paths": {"9:16": str(path_916), "1:1": str(path_11)},
        "prompt_hash": hashlib.md5(prompt.encode()).hexdigest()[:16]
    }
    
    log_file = output_dir / "generation_log.jsonl"
    with open(log_file, "a") as f:
        f.write(json.dumps(log_entry) + "\n")

if __name__ == "__main__":
    from datetime import datetime
    main()