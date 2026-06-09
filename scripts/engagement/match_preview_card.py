#!/usr/bin/env python3
"""
Match Preview Visual Card Generator
Creates branded GC images for daily Match Preview posts.

Uses Fal.ai (FLUX) via existing FAL_KEY in Hermes vault.
Output: 9:16 (Story/Reel) + 1:1 (Feed) PNGs.
"""

import os
import sys
import json
import argparse
import hashlib
from pathlib import Path
from datetime import datetime

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
WHITE = "#f8fafc"
GRAY = "#94a3b8"

def build_flux_prompt(match_data, tactical_keys, player_watch, betting_angle, haiku):
    """Build FLUX prompt for Match Preview card"""
    
    home = match_data.get("home", "HOME")
    away = match_data.get("away", "AWAY")
    league = match_data.get("league", "LEAGUE")
    kickoff = match_data.get("kickoff_local", "TBD")
    stadium = match_data.get("stadium", "Stadium")
    date = match_data.get("date", datetime.now().strftime("%d/%m"))
    
    # Tactical keys as bullet points
    tactical_text = " | ".join(tactical_keys[:3]) if tactical_keys else "Tactical analysis pending"
    
    prompt = (
        f"Professional football match preview card, 9:16 aspect ratio. "
        f"Dark futuristic background ({DARK_BG}) with subtle pitch grid texture. "
        f"TOP HEADER: '{league}' badge in neon green ({NEON_GREEN}), "
        f"'{home} vs {away}' in large bold white font with neon purple ({NEON_PURPLE}) glow outline. "
        f"SUB-HEADER: '📅 {date} | ⏰ {kickoff} | 🏟️ {stadium}' in gray ({GRAY}) font. "
        f"MIDDLE SECTION: 'TACTICAL KEYS' label in neon green, "
        f"three bullet points: {tactical_text} — clean typography, high readability. "
        f"PLAYER SPOTLIGHT BOX: '{player_watch}' highlighted with neon purple accent border, "
        f"football icon, subtle glow. "
        f"BETTING ANGLE BANNER: '{betting_angle}' in neon green on dark card, "
        f"Kelly stake badge, odds prominent. "
        f"HAIKU FOOTER: '{haiku}' in elegant serif font, white with subtle glow, centered. "
        f"DESIGN ELEMENTS: Team crest placeholders (abstract geometric, not real logos), "
        f"pitch lines, tactical arrows, xG sparkline mini-chart. "
        f"Overall style: Sky Sports/BT Sport broadcast graphics meet cyberpunk Bloomberg terminal. "
        f"High contrast, crisp vectors, 8k quality, professional broadcast graphics aesthetic. "
        f"Color palette STRICTLY: {DARK_BG}, {NEON_GREEN}, {NEON_PURPLE}, {WHITE}, {GRAY}. "
        f"No photorealistic people, no real player faces, abstract/stylized only."
    )
    return prompt

def generate_via_fal(prompt, aspect_ratio="9:16", steps=28):
    """Call Fal.ai FLUX API"""
    if not FAL_KEY:
        raise Exception("FAL_KEY not configured")
    
    import requests
    headers = {
        "Authorization": f"Key {FAL_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "prompt": prompt,
        "image_size": aspect_ratio,
        "num_inference_steps": steps,
        "enable_safety_checker": True,
        "sync_mode": True
    }
    url = "https://queue.fal.run/fal-ai/flux/dev"
    resp = requests.post(url, headers=headers, json=data, timeout=90)
    resp.raise_for_status()
    return resp.json()["images"][0]["url"]

def download_image(url, output_path):
    import urllib.request
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response, open(output_path, 'wb') as out_file:
        import shutil
        shutil.copyfileobj(response, out_file)

def main():
    parser = argparse.ArgumentParser(description="Generate Match Preview visual cards")
    parser.add_argument("--home", required=True, help="Home team name")
    parser.add_argument("--away", required=True, help="Away team name")
    parser.add_argument("--league", required=True, help="League/Competition name")
    parser.add_argument("--date", required=True, help="Match date DD/MM")
    parser.add_argument("--kickoff", required=True, help="Kickoff local time HH:MM")
    parser.add_argument("--stadium", default="Stadium", help="Stadium name")
    parser.add_argument("--tactical-keys", required=True, help="JSON array of 3 tactical keys")
    parser.add_argument("--player-watch", required=True, help="Player to watch string")
    parser.add_argument("--betting-angle", required=True, help="Betting angle string")
    parser.add_argument("--haiku", required=True, help="5-7-5 haiku text")
    parser.add_argument("--output-dir", default="assets/engagement/match_previews", help="Output directory")
    parser.add_argument("--dry-run", action="store_true", help="Print prompt only")
    
    args = parser.parse_args()
    
    match_data = {
        "home": args.home,
        "away": args.away,
        "league": args.league,
        "date": args.date,
        "kickoff_local": args.kickoff,
        "stadium": args.stadium
    }
    
    tactical_keys = json.loads(args.tactical_keys)
    
    prompt = build_flux_prompt(match_data, tactical_keys, args.player_watch, args.betting_angle, args.haiku)
    
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
    
    date_str = args.date.replace("/", "")
    hash_short = hashlib.md5(args.haiku.encode()).hexdigest()[:8]
    
    path_916 = output_dir / f"match_preview_{date_str}_{hash_short}_916.png"
    path_11 = output_dir / f"match_preview_{date_str}_{hash_short}_11.png"
    
    download_image(url_916, path_916)
    download_image(url_11, path_11)
    
    print(f"Saved: {path_916}")
    print(f"Saved: {path_11}")
    
    # Log visual hash for tracking
    log_entry = {
        "date": date_str,
        "match": f"{args.home}_{args.away}",
        "haiku_hash": hash_short,
        "paths": {"9:16": str(path_916), "1:1": str(path_11)},
        "prompt_hash": hashlib.md5(prompt.encode()).hexdigest()[:16]
    }
    
    log_file = output_dir / "generation_log.jsonl"
    with open(log_file, "a") as f:
        f.write(json.dumps(log_entry) + "\n")

if __name__ == "__main__":
    main()