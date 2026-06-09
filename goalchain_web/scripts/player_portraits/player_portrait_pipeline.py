#!/usr/bin/env python3
"""
GoalChain Player Portrait Pipeline
Generates clean 2:3 player portraits with pure white background.

Strategy:
- Optimized prompts for isolated subjects
- rembg for background removal
- PIL for forcing pure white background
- Strict 2:3 aspect ratio enforcement
"""

import json
import os
import time
import base64
import io
from pathlib import Path
from typing import Dict, Any, Optional
import logging
import requests

from rembg import remove
from PIL import Image
try:
    from rembg import remove
    from PIL import Image
except ImportError:
    print("Missing dependencies. Run: pip install rembg pillow requests")
    exit(1)

# Configuration
PLAYERS_JSON = "/data/apps/GoalChain/ai_context/03_data/players.json"
OUTPUT_DIR = "/data/apps/GoalChain/goalchain_web/scripts/player_portraits/output"
LOG_FILE = "/data/apps/GoalChain/goalchain_web/scripts/player_portraits/pipeline.log"

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("player_portrait_pipeline")


def load_players() -> list[Dict[str, Any]]:
    with open(PLAYERS_JSON, "r", encoding="utf-8") as f:
        return json.load(f)


def build_prompt(player: Dict[str, Any]) -> str:
    """Optimized prompt for clean white background portraits."""
    name = player.get("name", "Unknown Player")
    position = player.get("position", "FWD")
    country = player.get("country", "")
    physical = player.get("physical", {})
    traits = player.get("traits", [])

    physical_desc = physical.get("t", f"Professional {position.lower()} from {country}")

    trait_str = ", ".join(traits[:3]) if traits else "world-class athlete"

    prompt = (
        f"Professional studio portrait of {name}, {position} from {country}, "
        f"{physical_desc}. {trait_str}. "
        f"Clean isolated subject on pure white background, no shadows, no environment, "
        f"high detail, realistic sports photography, sharp focus, neutral expression, "
        f"professional lighting, 8k, ultra clean edges, product photography style"
    )
    return prompt


def force_white_background(img: Image.Image) -> Image.Image:
    """Remove background and composite onto pure white."""
    # Remove background
    img_no_bg = remove(img)

    # Create white background
    white_bg = Image.new("RGB", img_no_bg.size, (255, 255, 255))

    # Paste with alpha mask
    if img_no_bg.mode == "RGBA":
        white_bg.paste(img_no_bg, (0, 0), img_no_bg)
    else:
        white_bg.paste(img_no_bg)

    return white_bg


def enforce_aspect_ratio(img: Image.Image, target_ratio: float = 2/3) -> Image.Image:
    """Crop/resize to exact target aspect ratio (width/height)."""
    width, height = img.size
    current_ratio = width / height

    if abs(current_ratio - target_ratio) < 0.01:
        return img

    if current_ratio > target_ratio:
        # Too wide → crop width
        new_width = int(height * target_ratio)
        left = (width - new_width) // 2
        img = img.crop((left, 0, left + new_width, height))
    else:
        # Too tall → crop height
        new_height = int(width / target_ratio)
        top = (height - new_height) // 2
        img = img.crop((0, top, width, top + new_height))

    return img


import requests
import io

XAI_API_KEY = os.getenv("XAI_API_KEY")


def generate_image_with_grok(prompt: str) -> Optional[bytes]:
    """Generate image using Grok (xAI). Returns raw image bytes or None."""
    if not XAI_API_KEY:
        logger.error("XAI_API_KEY not set in environment")
        return None

    url = "https://api.x.ai/v1/images/generations"
    headers = {
        "Authorization": f"Bearer {XAI_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "prompt": prompt,
        "n": 1,
        "size": "1024x1536",  # Close to 2:3
        "response_format": "b64_json"
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=120)
        response.raise_for_status()
        data = response.json()
        image_b64 = data["data"][0]["b64_json"]
        return base64.b64decode(image_b64)
    except Exception as e:
        logger.error(f"Grok image generation failed: {e}")
        return None


def process_image(raw_bytes: bytes) -> Optional[Image.Image]:
    """Full post-processing pipeline: remove bg + white background + 2:3 ratio."""
    try:
        img = Image.open(io.BytesIO(raw_bytes)).convert("RGBA")

        # 1. Remove background
        img_no_bg = remove(img)

        # 2. Force pure white background
        white_bg = Image.new("RGB", img_no_bg.size, (255, 255, 255))
        white_bg.paste(img_no_bg, (0, 0), img_no_bg)

        # 3. Enforce 2:3 aspect ratio
        final_img = enforce_aspect_ratio(white_bg, target_ratio=2/3)

        return final_img
    except Exception as e:
        logger.error(f"Post-processing failed: {e}")
        return None


def generate_portrait(player: Dict[str, Any]) -> Optional[str]:
    """Main generation function for one player."""
    player_id = player["id"]
    output_path = os.path.join(OUTPUT_DIR, f"{player_id:03d}_portrait.png")

    if os.path.exists(output_path):
        logger.info(f"[{player_id}] Already exists, skipping.")
        return output_path

    prompt = build_prompt(player)
    logger.info(f"[{player_id}] Generating: {player['name']}")

    # 1. Generate base image
    raw_bytes = generate_image_with_grok(prompt)
    if not raw_bytes:
        return None

    # 2. Post-process
    final_img = process_image(raw_bytes)
    if not final_img:
        return None

    # 3. Save
    final_img.save(output_path, "PNG", optimize=True)
    logger.info(f"[{player_id}] Saved: {output_path}")
    return output_path


def main():
    players = load_players()
    logger.info(f"Loaded {len(players)} players from players.json")

    success = 0
    failed = 0

    for i, player in enumerate(players):
        try:
            result = generate_portrait(player)
            if result:
                success += 1
            else:
                failed += 1
        except Exception as e:
            logger.error(f"Error processing player {player['id']}: {e}")
            failed += 1

        if (i + 1) % 50 == 0:
            logger.info(f"Progress: {i+1}/{len(players)} processed")

    logger.info(f"Pipeline finished. Success: {success} | Failed: {failed}")


if __name__ == "__main__":
    main()
