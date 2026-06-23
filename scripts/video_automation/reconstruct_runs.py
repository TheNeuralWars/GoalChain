#!/usr/bin/env python3
"""
reconstruct_runs.py — One-shot script to rebuild runs.json from files
that exist on the VPS filesystem but are missing from the database.

Run on VPS:
  python3 /data/apps/GoalChain/scripts/video_automation/reconstruct_runs.py
"""
import json
import os
import re
from pathlib import Path
from datetime import datetime

BASE_DIR = Path(__file__).resolve().parent.parent.parent
RUNS_FILE = BASE_DIR / "data" / "marketing_pipeline" / "runs.json"
OUTPUTS_DIR = Path("/home/ubuntu/scratch/grok_batches/batch_01/outputs")
PILOT_BASE_URL = "https://api.goalchain.fun/pilot"

# ── Topic inference from filename ──────────────────────────────────────────
TOPIC_MAP = {
    "maracana_1950_mystery": ("El Misterio del Maracanazo 1950", "GoalChainSol"),
    "goalchain_stadium_fallback": ("GoalChain en el Estadio: La Gran Jugada", "GoalChainSol"),
    "solana_financial_command_room": ("La Sala de Mando Financiero: Solana GoalChain", "GoalChainSol"),
    "developer_solana_split_scene": ("La División del Desarrollador: Build vs. Apostar", "NicoPezDorado"),
    "developer_split_scene": ("La División del Desarrollador: Build vs. Apostar", "NicoPezDorado"),
    "goalchainsol_football_vault": ("La Bóveda del Fútbol: GoalChain Vault", "GoalChainSol"),
    "nicopezdorado_productivity": ("Productividad Extrema: El Coste Real de Postergar", "NicoPezDorado"),
    "goalchain": ("GoalChain: El Protocolo del Fútbol Inteligente", "GoalChainSol"),
}

def infer_topic_and_account(filename: str):
    """Infer topic and account from video filename."""
    name_lower = filename.lower()
    for key, (topic, account) in TOPIC_MAP.items():
        if key in name_lower:
            return topic, account
    # Fallback: use filename-derived topic
    base = Path(filename).stem
    # Remove timestamp prefix (grok_vid_1234567890_)
    clean = re.sub(r'^grok_vid_\d+_', '', base)
    clean = re.sub(r'^grok_video_', '', clean)
    clean = re.sub(r'_\d{8}_\d{6}$', '', clean)  # Remove date suffix
    topic = clean.replace('_', ' ').title()
    # Infer account from name
    account = "NicoPezDorado" if "nicopezdorado" in name_lower or "productivity" in name_lower else "GoalChainSol"
    return topic, account

def extract_timestamp_from_filename(filename: str) -> int:
    """Extract unix timestamp from filename like grok_vid_1782217832_..."""
    m = re.search(r'grok_vid_(\d{10})', filename)
    if m:
        return int(m.group(1))
    # Try to get mtime
    path = OUTPUTS_DIR / filename
    if path.exists():
        return int(path.stat().st_mtime)
    return 0

def find_matching_image(video_filename: str) -> str:
    """Find a matching image file for a video (same topic slug)."""
    # Remove grok_vid_ prefix and timestamp to get the base name
    base = re.sub(r'^grok_vid_\d+_', '', video_filename)
    base_stem = Path(base).stem  # without .mp4

    # Look for image with same base
    for ext in ['.png', '.jpg']:
        # Exact match
        img_path = OUTPUTS_DIR / (base_stem + ext)
        if img_path.exists():
            return img_path.name
        # grok_img_ prefixed version
        for img_file in OUTPUTS_DIR.glob(f"*{base_stem}*{ext}"):
            return img_file.name
        # Try without timestamp in base
        slug = re.sub(r'^grok_video_', '', base_stem)
        slug = re.sub(r'_\d{8}_\d{6}$', '', slug)
        for img_file in OUTPUTS_DIR.glob(f"*{slug}*{ext}"):
            return img_file.name
    return ""

def get_unique_videos():
    """Get unique video files by deduplicating on file size (copies are identical)."""
    all_mp4 = sorted(OUTPUTS_DIR.glob("*.mp4"), key=lambda p: p.stat().st_mtime)
    
    seen_sizes = {}
    unique = []
    
    for path in all_mp4:
        size = path.stat().st_size
        # For duplicates (same size), prefer the one with grok_vid_ prefix (has timestamp)
        if size not in seen_sizes:
            seen_sizes[size] = path
        else:
            existing = seen_sizes[size]
            # Prefer the one with grok_vid_ prefix (more structured)
            if path.name.startswith('grok_vid_') and not existing.name.startswith('grok_vid_'):
                seen_sizes[size] = path
    
    return sorted(seen_sizes.values(), key=lambda p: p.stat().st_mtime, reverse=True)

def main():
    print(f"[{datetime.now()}] Reconstruyendo historial de runs desde el filesystem...")
    
    # Load existing runs
    existing_runs = []
    existing_video_urls = set()
    if RUNS_FILE.exists():
        with open(RUNS_FILE, 'r', encoding='utf-8') as f:
            existing_runs = json.load(f)
        existing_video_urls = {r.get('video_url', '') for r in existing_runs}
        print(f"  Found {len(existing_runs)} existing runs in DB")
    
    # Get unique videos
    unique_videos = get_unique_videos()
    print(f"  Found {len(unique_videos)} unique videos in filesystem")
    
    new_runs = []
    skipped = 0
    
    for vid_path in unique_videos:
        pilot_url = f"{PILOT_BASE_URL}/{vid_path.name}"
        
        # Skip if already in DB
        if pilot_url in existing_video_urls:
            skipped += 1
            continue
        
        topic, account = infer_topic_and_account(vid_path.name)
        ts_unix = extract_timestamp_from_filename(vid_path.name)
        if not ts_unix:
            ts_unix = int(vid_path.stat().st_mtime)
        
        ts_iso = datetime.utcfromtimestamp(ts_unix).isoformat() + "Z"
        run_id = f"run_{ts_unix}_{account.lower()}_reconstructed"
        
        # Find matching image
        img_name = find_matching_image(vid_path.name)
        img_url = f"{PILOT_BASE_URL}/{img_name}" if img_name else ""
        
        run = {
            "id": run_id,
            "timestamp": ts_iso,
            "account_name": account,
            "topic": topic,
            "narrative_angle": "",
            "status": "published",
            "image_url": img_url,
            "video_url": pilot_url,
            "post_text": "",
            "image_prompt": None,
            "video_prompt": None,
            "comments": [],
            "buffer_post_ids": [],
            "_reconstructed": True
        }
        new_runs.append(run)
        print(f"  + [{account}] {topic[:50]} → {vid_path.name[:50]}")
    
    if not new_runs:
        print("No hay nuevos videos para agregar al historial.")
        return
    
    # Merge: new reconstructed runs + existing runs, avoiding duplicates
    all_runs = new_runs + existing_runs
    
    # Write back
    RUNS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(RUNS_FILE, 'w', encoding='utf-8') as f:
        json.dump(all_runs, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Agregados {len(new_runs)} runs reconstruidos al historial.")
    print(f"   Skipped {skipped} (ya estaban en DB).")
    print(f"   Total en DB: {len(all_runs)} runs.")

if __name__ == '__main__':
    main()
