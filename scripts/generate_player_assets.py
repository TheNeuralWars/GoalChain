#!/usr/bin/env python3
"""
GoalChain Premium Player Assets Generator
Generates premium 3D parodied caricature player images based on biometrics.
Supports OpenAI (DALL-E 3), Fal.ai (FLUX), and Replicate (FLUX).
Saves checkpoint state in assets/players/download_state.json.
Stores outputs categorized by country.
"""

import os
import sys
import json
import re
import time
import argparse
import urllib.request
import shutil
from pathlib import Path

# Load env file if available
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Helper to normalize filenames and folder names
def sanitize_filename(name):
    return re.sub(r'[^a-z0-9_\-]', '', name.lower().replace(' ', '_'))

def normalize_country(country):
    return re.sub(r'[^A-Z0-9_\-]', '', country.strip().upper().replace(' ', '_'))

# --- Image Generation Providers ---

def generate_openai(prompt, api_key):
    """Generate image using OpenAI DALL-E 3."""
    import openai
    client = openai.OpenAI(api_key=api_key)
    response = client.images.generate(
        model="dall-e-3",
        prompt=prompt,
        n=1,
        size="1024x1792",  # 9:16 portrait aspect ratio
        quality="standard",
        response_format="url"
    )
    return response.data[0].url

def generate_fal(prompt, api_key):
    """Generate image using Fal.ai (FLUX.1-dev or FLUX.1-schnell via direct HTTP fallback)."""
    # Try using package if available
    try:
        import fal_client
        os.environ["FAL_KEY"] = api_key
        # Submit task
        handler = fal_client.submit(
            "fal-ai/flux/dev",
            arguments={
                "prompt": prompt,
                "image_size": "9:16",
                "enable_safety_checker": True,
                "num_inference_steps": 28,
            }
        )
        result = handler.get()
        return result["images"][0]["url"]
    except Exception:
        # Direct HTTP POST Request fallback
        import requests
        headers = {
            "Authorization": f"Key {api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "prompt": prompt,
            "image_size": "9:16",
            "num_inference_steps": 28,
            "enable_safety_checker": True,
            "sync_mode": True
        }
        url = "https://queue.fal.run/fal-ai/flux/dev"
        response = requests.post(url, headers=headers, json=data, timeout=60)
        response.raise_for_status()
        res_json = response.json()
        return res_json["images"][0]["url"]

def generate_replicate(prompt, api_key):
    """Generate image using Replicate (FLUX.1-dev)."""
    try:
        import replicate
        os.environ["REPLICATE_API_TOKEN"] = api_key
        output = replicate.run(
            "black-forest-labs/flux-dev",
            input={
                "prompt": prompt,
                "aspect_ratio": "9:16",
            }
        )
        return output[0]
    except Exception:
        # Direct HTTP Polling Request fallback
        import requests
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        # Step 1: Create prediction
        create_url = "https://api.replicate.com/v1/models/black-forest-labs/flux-dev/predictions"
        data = {
            "input": {
                "prompt": prompt,
                "aspect_ratio": "9:16"
            }
        }
        response = requests.post(create_url, headers=headers, json=data, timeout=30)
        response.raise_for_status()
        pred = response.json()
        pred_id = pred["id"]
        
        # Step 2: Poll prediction status
        poll_url = f"https://api.replicate.com/v1/predictions/{pred_id}"
        max_attempts = 30
        for _ in range(max_attempts):
            time.sleep(3)
            poll_resp = requests.get(poll_url, headers=headers, timeout=20)
            poll_resp.raise_for_status()
            status_data = poll_resp.json()
            status = status_data["status"]
            if status == "succeeded":
                return status_data["output"][0]
            elif status in ("failed", "canceled"):
                raise Exception(f"Replicate generation failed: {status_data.get('error')}")
        raise Exception("Replicate prediction timed out.")

# --- Background Removal ---

def remove_background(input_path, output_path):
    """Remove background from image using rembg, with graceful fallback to copying."""
    try:
        from rembg import remove
        with open(input_path, 'rb') as i_file:
            input_data = i_file.read()
        # Remove background (Alpha Matting activated for softer hair/outline edges)
        output_data = remove(input_data, alpha_matting=True, alpha_matting_foreground_threshold=240)
        with open(output_path, 'wb') as o_file:
            o_file.write(output_data)
        return True
    except Exception as e:
        print(f"  [Warning] Background removal failed or rembg not installed. copying raw file. Reason: {e}")
        try:
            shutil.copy2(input_path, output_path)
            return False
        except Exception as copy_err:
            print(f"  [Error] Copy fallback failed: {copy_err}")
            return False

# --- Prompt Builder ---

def build_enhanced_appearance(physical):
    """Build a rich appearance description from enhanced physical fields."""
    parts = []
    
    # Hair details
    hair_color = physical.get("hair_color", "")
    hairstyle = physical.get("hairstyle", "")
    if hair_color and hairstyle:
        parts.append(f"{hairstyle} {hair_color} hair")
    elif hair_color:
        parts.append(f"{hair_color} hair")
    elif hairstyle:
        parts.append(f"{hairstyle} hair")
    
    # Facial hair
    facial_hair = physical.get("facial_hair", "")
    if facial_hair and facial_hair != "clean shaven":
        parts.append(f"{facial_hair}")
    elif facial_hair == "clean shaven":
        parts.append("clean shaven")
    
    # Face structure
    face_structure = physical.get("face_structure", "")
    if face_structure:
        parts.append(face_structure)
    
    # Eye color
    eye_color = physical.get("eye_color", "")
    if eye_color:
        parts.append(f"{eye_color} eyes")
    
    # Skin tone
    skin_tone = physical.get("skin_tone", "")
    if skin_tone:
        parts.append(f"{skin_tone} skin")
    
    # Distinctive features (pick top 2)
    distinctive = physical.get("distinctive_features", [])
    if distinctive:
        parts.append(", ".join(distinctive[:2]))
    
    # Build type
    build_type = physical.get("build_type", "")
    if build_type:
        parts.append(build_type)
    
    # Visible tattoos
    tattoos = physical.get("tattoos", [])
    if tattoos:
        visible_tattoos = [t for t in tattoos if any(kw in t.lower() for kw in ['neck', 'hand', 'face', 'calf', 'forearm', 'wrist', 'behind ear'])]
        if visible_tattoos:
            parts.append(f"visible tattoos: {', '.join(visible_tattoos[:2])}")
        elif len(tattoos) > 0:
            parts.append(f"heavily tattooed ({len(tattoos)} pieces)")
    
    # Fallback to original 't' field if enhanced fields are empty
    if not parts:
        physical_t = physical.get("t", "")
        if physical_t:
            return physical_t
        h = physical.get("h", "1.80m")
        w = physical.get("w", "75kg")
        return f"An athletic football player, height {h}, weight {w}."
    
    return ", ".join(parts) + "."


def build_player_prompt(player):
    """Build a premium 3D caricature prompt based on player metadata with enhanced physical details."""
    player_name = player["name"]
    real_name = player.get("real_name", "Verified Athlete")
    country = player["country"]
    position = player.get("position", "FWD")
    rarity = player.get("rarity", "common")
    
    physical = player.get("physical", {})
    
    # Build rich appearance from enhanced fields
    appearance = build_enhanced_appearance(physical)
        
    # National Kit Color Mapping (World Cup countries)
    kit_colors = {
        "Argentina": "light blue and white vertical stripes",
        "Francia": "deep navy blue",
        "France": "deep navy blue",
        "Inglaterra": "white with navy blue details",
        "England": "white with navy blue details",
        "Brasil": "vibrant yellow with green collar and trim",
        "Brazil": "vibrant yellow with green collar and trim",
        "España": "vibrant red with golden yellow trim",
        "Spain": "vibrant red with golden yellow trim",
        "Portugal": "deep red with dark green trim",
        "Países Bajos": "vibrant orange",
        "Netherlands": "vibrant orange",
        "Alemania": "white with classic black details",
        "Germany": "white with classic black details",
        "Croacia": "red and white checkerboard pattern",
        "Croatia": "red and white checkerboard pattern",
        "Bélgica": "red with black and yellow accent lines",
        "Belgium": "red with black and yellow accent lines",
        "Italia": "classic azure blue",
        "Italy": "classic azure blue",
        "EE.UU.": "white with navy blue and red trim",
        "USA": "white with navy blue and red trim",
        "México": "green with white and red accents",
        "Mexico": "green with white and red accents",
        "Uruguay": "sky blue",
        "Colombia": "yellow with blue and red details",
        "Marruecos": "red with green trim",
        "Morocco": "red with green trim",
        "Senegal": "white with green and yellow accents",
        "Egipto": "red with white details",
        "Egypt": "red with white details",
        "Nigeria": "vibrant green with white abstract eagle patterns",
        "Japón": "samurai blue with white details",
        "Japan": "samurai blue with white details",
        "Corea del Sur": "vibrant red with blue trim",
        "South Korea": "vibrant red with blue trim",
        "Australia": "gold yellow with green accents",
        "Dinamarca": "red with white details",
        "Denmark": "red with white details",
        "Suiza": "red with white details",
        "Switzerland": "red with white details",
        "Serbia": "deep red",
        "Polonia": "white with red trim",
        "Poland": "white with red trim",
        "Ucrania": "yellow with blue details",
        "Ukraine": "yellow with blue details",
        "Turquía": "red with white chest stripe",
        "Turkey": "red with white chest stripe",
        "Noruega": "red with blue and white accents",
        "Norway": "red with blue and white accents",
        "Ecuador": "yellow with blue details",
        "Venezuela": "vinotinto deep burgundy",
        "Perú": "white with a diagonal red sash",
        "Peru": "white with a diagonal red sash",
        "Costa Rica": "red with blue collar",
    }
    
    country_key = country.strip()
    kit_color = kit_colors.get(country_key, f"national team colors of {country}")
    
    # Position-based pose mapping
    if position == "GK":
        pose = "an alert, crouched goalkeeper stance, ready to dive, wearing professional goalkeeper gloves"
    elif position == "FWD":
        pose = "a dynamic, high-energy forward running, arms wide in celebration"
    elif position == "MID":
        pose = "a refined midfield stance, controlling the ball on the pitch, focused posture"
    elif position == "DEF":
        pose = "a strong defensive posture, standing firm, muscular stance, protective body position"
    else:
        pose = "a confident athletic standing stance"

    # Rarity-based visual flair
    rarity_effects = {
        "mythic": "cosmic mythic aura with golden supernova particles and ethereal glow",
        "legendary": "holographic glitch effect with silver spark trails",
        "epic": "electric neon pulse with vibrant energy waves",
        "rare": "subtle cyber outline with clean tech aesthetic",
        "common": "clean studio render"
    }
    rarity_effect = rarity_effects.get(rarity, "clean studio render")

    prompt = (
        f"A premium 3D stylized character render of a professional soccer player parody "
        f"named '{player_name}' (inspired by the looks of {real_name}). "
        f"Subject: A full-body 3D digital figurine card character. "
        f"Appearance: {appearance}. "
        f"Pose: {pose}. "
        f"Kit: Wearing a clean, modern generic national kit for {country} (colors: {kit_color}). "
        f"The kit must be completely generic: NO brand logos, NO commercial sponsor prints. "
        f"Rarity Effect: {rarity_effect}. "
        f"Lighting: High-contrast studio lighting with strong, vibrant neon green (#14f195) and neon purple (#9945ff) rim lights outlining the figure. "
        f"Technical: 3D model, octane render style, Unreal Engine 5 aesthetic, crisp details, smooth 3D caricature collectible look, 8k resolution. "
        f"Background: SOLID PURE FLAT WHITE BACKGROUND."
    )
    return prompt

# --- Pipeline Executor ---

def main():
    parser = argparse.ArgumentParser(description="GoalChain Player Asset Generator")
    parser.add_argument("--limit", type=int, default=None, help="Limit the number of players to process.")
    parser.add_argument("--provider", type=str, choices=["openai", "fal", "replicate"], default="openai",
                        help="API provider to generate images. (default: openai)")
    parser.add_argument("--openai-key", type=str, default=None, help="OpenAI API Key.")
    parser.add_argument("--fal-key", type=str, default=None, help="Fal.ai API Key.")
    parser.add_argument("--replicate-key", type=str, default=None, help="Replicate API Token.")
    parser.add_argument("--dry-run", action="store_true", help="Print prompts and check folders without calling APIs.")
    parser.add_argument("--force", action="store_true", help="Re-generate and overwrite existing files.")
    
    args = parser.parse_args()
    
    # Resolve API Key
    api_key = None
    if args.provider == "openai":
        api_key = args.openai_key or os.getenv("OPENAI_API_KEY")
    elif args.provider == "fal":
        api_key = args.fal_key or os.getenv("FAL_KEY") or os.getenv("FAL_API_KEY")
    elif args.provider == "replicate":
        api_key = args.replicate_key or os.getenv("REPLICATE_API_TOKEN")
        
    if not api_key and not args.dry_run:
        print(f"❌ Error: API Key for provider '{args.provider}' is missing. Pass it via CLI or set it in .env.")
        sys.exit(1)
        
    # Resolve Paths
    base_dir = Path(__file__).resolve().parent.parent
    players_json_path = base_dir / "docs" / "assets" / "data" / "players.json"
    
    if not players_json_path.exists():
        print(f"❌ Error: players.json not found at {players_json_path}")
        sys.exit(1)
        
    # Load player data
    with open(players_json_path, "r", encoding="utf-8") as f:
        players = json.load(f)
        
    print(f"Loaded {len(players)} players from database.")
    
    # Setup directories
    assets_dir = base_dir / "assets" / "players"
    raw_dir = assets_dir / "raw"
    transparent_dir = assets_dir / "transparent"
    state_file = assets_dir / "download_state.json"
    
    assets_dir.mkdir(parents=True, exist_ok=True)
    raw_dir.mkdir(exist_ok=True)
    transparent_dir.mkdir(exist_ok=True)
    
    # Load state
    state = {}
    if state_file.exists() and not args.force:
        try:
            with open(state_file, "r", encoding="utf-8") as sf:
                state = json.load(sf)
            print(f"Loaded existing checkpoint state. {len(state)} players logged.")
        except Exception as e:
            print(f"Could not load state: {e}. Starting fresh.")
            
    # Process
    processed_count = 0
    limit_reached = False
    
    for player in players:
        if args.limit and processed_count >= args.limit:
            break
            
        player_id = player["id"]
        player_name = player["name"]
        country = player["country"]
        
        # Check if already processed
        player_key = str(player_id)
        if player_key in state and state[player_key].get("transparent_processed") and not args.force:
            continue
            
        padded_id = str(player_id).zfill(3)
        normalized_name = sanitize_filename(player_name)
        country_folder_name = normalize_country(country)
        
        # Paths
        p_raw_dir = raw_dir / country_folder_name
        p_trans_dir = transparent_dir / country_folder_name
        
        p_raw_dir.mkdir(parents=True, exist_ok=True)
        p_trans_dir.mkdir(parents=True, exist_ok=True)
        
        raw_path = p_raw_dir / f"{padded_id}_{normalized_name}.png"
        trans_path = p_trans_dir / f"{padded_id}_{normalized_name}.png"
        
        prompt = build_player_prompt(player)
        
        print(f"\n[{processed_count + 1}] Processing Player #{padded_id}: {player_name} ({country})")
        print(f"  Prompt: {prompt}")
        
        if args.dry_run:
            print(f"  [Dry-run] Would save raw to: {raw_path}")
            print(f"  [Dry-run] Would save transparent to: {trans_path}")
            processed_count += 1
            continue
            
        # Generation with retries
        url = None
        max_retries = 3
        retry_delay = 5
        
        for attempt in range(1, max_retries + 1):
            try:
                print(f"  Calling {args.provider} API (Attempt {attempt}/{max_retries})...")
                if args.provider == "openai":
                    url = generate_openai(prompt, api_key)
                elif args.provider == "fal":
                    url = generate_fal(prompt, api_key)
                elif args.provider == "replicate":
                    url = generate_replicate(prompt, api_key)
                break
            except Exception as e:
                print(f"  [Error] Generation failed: {e}")
                if attempt == max_retries:
                    state[player_key] = {"error": str(e), "timestamp": time.time()}
                    break
                print(f"  Waiting {retry_delay}s before retry...")
                time.sleep(retry_delay)
                retry_delay *= 2
                
        if not url:
            # Save error state and write immediately
            with open(state_file, "w", encoding="utf-8") as sf:
                json.dump(state, sf, indent=4)
            continue
            
        # Download raw image
        try:
            print(f"  Downloading generated image from: {url}")
            # Ensure headers to mimic browser if needed, but urllib.request is usually fine for these URLs
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response, open(raw_path, 'wb') as out_file:
                shutil.copyfileobj(response, out_file)
            print(f"  Saved raw image to: {raw_path}")
            
            # Update state with raw
            state[player_key] = {
                "name": player_name,
                "country": country,
                "raw_downloaded": True,
                "url": url,
                "raw_path": str(raw_path.relative_to(base_dir)),
                "timestamp": time.time()
            }
        except Exception as e:
            print(f"  [Error] Failed to download image: {e}")
            state[player_key] = {"error": f"Download failed: {e}", "timestamp": time.time()}
            with open(state_file, "w", encoding="utf-8") as sf:
                json.dump(state, sf, indent=4)
            continue
            
        # Remove background
        print("  Removing background...")
        bg_removed = remove_background(str(raw_path), str(trans_path))
        
        if bg_removed:
            print(f"  Successfully saved background-removed image to: {trans_path}")
            state[player_key]["transparent_processed"] = True
            state[player_key]["transparent_path"] = str(trans_path.relative_to(base_dir))
        else:
            print(f"  Saved image without background removal to transparent dir: {trans_path}")
            state[player_key]["transparent_processed"] = True  # marked true because we copied the file as a fallback
            state[player_key]["transparent_path"] = str(trans_path.relative_to(base_dir))
            state[player_key]["bg_removal_skipped"] = True
            
        # Save state after each success
        with open(state_file, "w", encoding="utf-8") as sf:
            json.dump(state, sf, indent=4)
            
        processed_count += 1
        time.sleep(1) # Small rate-limit courtesy sleep
        
    print(f"\n🏁 Finished. Processed {processed_count} players.")

if __name__ == "__main__":
    main()
