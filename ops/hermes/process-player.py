#!/usr/bin/env python3
import os
import sys
import base64
import argparse
import requests
from pathlib import Path

# Load FAL_KEY from env or config.env
FAL_KEY = os.getenv("FAL_KEY", "").strip()

# Configuration
DEFAULT_FACES_DIR = Path("/home/ubuntu/hermes/original_faces")
DEFAULT_OUTPUT_DIR = Path("/home/ubuntu/hermes/workspace/GoalChain/goalchain_webapp/public/assets/players")

def log(msg):
    print(f"[PROCESS-PLAYER] {msg}")

def load_config():
    global FAL_KEY
    config_path = Path("/home/ubuntu/hermes/config.env")
    if config_path.exists():
        for line in config_path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, val = line.split("=", 1)
                if key.strip() == "FAL_KEY":
                    FAL_KEY = val.strip().strip('"').strip("'")
                    break

def file_to_data_url(file_path: Path) -> str:
    ext = file_path.suffix.lower()
    mime_type = "image/jpeg"
    if ext == ".png":
        mime_type = "image/png"
    elif ext == ".webp":
        mime_type = "image/webp"
        
    with open(file_path, "rb") as f:
        b64_data = base64.b64encode(f.read()).decode("utf-8")
    return f"data:{mime_type};base64,{b64_data}"

def find_original_face(faces_dir: Path, player_id: str):
    """Find face file with any common image extension."""
    for ext in [".jpg", ".jpeg", ".png", ".webp"]:
        path = faces_dir / f"player_{player_id}{ext}"
        if path.exists():
            return path
    return None

def main():
    parser = argparse.ArgumentParser(description="Automate player face swap using Fal.ai")
    parser.add_argument("--player-id", required=True, help="Player ID (e.g., 1 to 528)")
    parser.add_argument("--body-path", required=True, help="Path to the generated body image")
    parser.add_argument("--faces-dir", default=str(DEFAULT_FACES_DIR), help="Directory of original faces")
    parser.add_argument("--output-dir", default=str(DEFAULT_OUTPUT_DIR), help="Directory for final player cards")
    args = parser.parse_args()

    load_config()

    if not FAL_KEY:
        log("ERROR: FAL_KEY not found in environment or config.env")
        sys.exit(1)

    faces_dir = Path(args.faces_dir)
    body_path = Path(args.body_path)
    output_dir = Path(args.output_dir)

    # 1. Verify body path exists
    if not body_path.exists():
        log(f"ERROR: Body image path does not exist: {body_path}")
        sys.exit(1)

    # 2. Find original face
    face_path = find_original_face(faces_dir, args.player_id)
    if not face_path:
        log(f"ERROR: Original face image for player {args.player_id} not found in {faces_dir}")
        sys.exit(1)

    log(f"Original face found: {face_path}")
    log(f"Body template: {body_path}")

    # 3. Prepare Base64 data URLs
    try:
        face_url = file_to_data_url(face_path)
        body_url = file_to_data_url(body_path)
    except Exception as e:
        log(f"ERROR preparing image data URLs: {e}")
        sys.exit(1)

    # 4. Invoke Fal.ai Face Swap API (Synchronous)
    headers = {
        "Authorization": f"Key {FAL_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "base_image_url": body_url,
        "swap_image_url": face_url
    }

    log("Sending swap request to Fal.ai...")
    response = requests.post(
        "https://fal.run/fal-ai/face-swap",
        headers=headers,
        json=payload,
        timeout=120
    )

    if response.status_code != 200:
        log(f"ERROR: Fal.ai API returned status {response.status_code}: {response.text}")
        sys.exit(1)

    res_data = response.json()
    image_data = res_data.get("image", {})
    image_url = image_data.get("url")

    if not image_url:
        log(f"ERROR: No image URL returned in Fal.ai response: {res_data}")
        sys.exit(1)

    # 5. Save the resulting image
    output_dir.mkdir(parents=True, exist_ok=True)
    out_path = output_dir / f"player_{args.player_id}.png"

    log(f"Downloading final player card from {image_url}...")
    img_resp = requests.get(image_url, timeout=60)
    if img_resp.status_code != 200:
        log(f"ERROR downloading image: {img_resp.status_code}")
        sys.exit(1)

    out_path.write_bytes(img_resp.content)
    log(f"SUCCESS: Saved final player card to {out_path}")

if __name__ == "__main__":
    main()
