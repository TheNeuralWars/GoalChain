#!/usr/bin/env python3
"""
GoalChain Grok Autonomous Browser Generator
Attaches to Chrome on port 9222, retrieves players 1-by-1,
prompts Grok Imagine, downloads the generated image from the DOM,
optimizes it, and registers it to the VPS.
"""
import sys
import os
import time
import requests
import json
import re
import subprocess
from pathlib import Path

# Auto-install dependencies
try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print("[INFO] Playwright not found. Installing...")
    subprocess.run([sys.executable, "-m", "pip", "install", "playwright"], check=True)
    subprocess.run([sys.executable, "-m", "playwright", "install", "chromium"], check=True)
    from playwright.sync_api import sync_playwright

PRIMARY_ROOT = Path("/Users/NicoPez/GoalChain")
HELPER_SKILL = PRIMARY_ROOT / "docs/grok_helper_skill.py"

# Import VPS Ops details
API_BASE = "https://crm.goalchain.fun/goalchain-api"

def get_next_player():
    """Fetches the single next pending player from the VPS MCP logic."""
    # We call the HTTP endpoint of the API or call our local/VPS state to find the next ID
    # To be perfectly synced, we can make a request to the crm endpoint or read players.json and the status on VPS
    # Let's read the local players.json and fetch the status from VPS via SSH to know who is next.
    try:
        players_path = PRIMARY_ROOT / "docs/assets/data/players.json"
        with open(players_path, "r", encoding="utf-8") as f:
            players = json.load(f)
            
        # Get VPS generation status
        cmd = ["ssh", "-o", "BatchMode=yes", "ubuntu@89.168.20.135", "cat /data/apps/GoalChain/assets/players/generation_status.json 2>/dev/null"]
        res = subprocess.run(cmd, capture_output=True, text=True)
        if res.returncode == 0 and res.stdout.strip():
            state = json.loads(res.stdout)
        else:
            state = {"generated": {}}
            
        generated_ids = set(state.get("generated", {}).keys())
        
        for p in players:
            pid = str(p.get("id"))
            if pid not in generated_ids:
                return p
    except Exception as e:
        print(f"[ERROR] Failed to fetch next player status: {e}")
    return None

def build_prompt_for_player(player):
    """Builds the exact visual prompt for the player."""
    player_id = player.get("id")
    player_name = player.get("name")
    real_name = player.get("real_name", "Verified Athlete")
    country = player.get("country")
    
    import random
    random.seed(player_id)
    jersey_gradients = ["purple and neon-blue", "neon-green and emerald", "golden-yellow and black", "crimson-red and white", "orange and cyan"]
    cleat_colors = ["metallic purple", "chrome silver", "electric lime", "glowing gold"]
    
    jersey_colors = random.choice(jersey_gradients)
    cleat_color = random.choice(cleat_colors)
    
    physical_data = player.get("physical", {})
    raw_physical_desc = physical_data.get("t", "Athletic build, short dark hair, clean shaven, fair skin tone.")
    
    # Simple sanitization
    physical_desc = re.sub(r"\([^)]*\)", "", raw_physical_desc)
    physical_desc = re.sub(r"\byouthful\b|\byoung\b|\bjuvenile\b|\bboyish\b|\bteen\b", "", physical_desc, flags=re.IGNORECASE)
    
    player_number = player.get("jersey_number", (player_id % 99) + 1)
    
    prompt = (
        f"Full-body 3D digital render of an adult male professional soccer player aged 21-35, "
        f"NOT a child, NOT a teenager, NOT a young boy — a grown adult man with a mature face and fully-developed adult physique. "
        f"Normal realistic athletic proportions: standard human height and build, no exaggerated size differences between players. "
        f"Mature athletic anime style, highly detailed, elegant proportions, beautiful anime key visual aesthetic. "
        f"Likeness features inspired by {real_name}: {physical_desc} "
        f"Style: high-end 2.5D/3D anime game art, smooth detailed shading, volumetric lighting, deep soft shadows, high contrast, well-defined shadows and highlights, not photorealistic, no real-life photography, no realistic skin texture. "
        f"He is looking directly at the camera with a confident, smirk expression. "
        f"He is wearing a modern custom football kit: a jersey with a {jersey_colors} gradient pattern, black sleeves, "
        f"and absolutely NO logos, NO badges, and NO text on the chest (completely plain blank chest). "
        f"He is wearing matching soccer shorts with the jersey number \"{player_number}\" clearly printed, highly visible, and perfectly legible in high-contrast solid color on the front leg of the shorts. "
        f"Matching socks with stripes, and shiny metallic {cleat_color} soccer cleats. "
        f"Pose: standing confidently with one foot resting on top of a soccer ball. "
        f"Background: Solid, completely clean, flat, uniform white background. No shadows, no floor textures, no gradients, no stadium, no distractions. Perfect for easy background removal."
    )
    return prompt

def register_on_vps(player_id, base64_data):
    """Calls the VPS upload_generated_asset tool via SSH or curl."""
    # We can invoke the tool directly using our VPS endpoint
    payload = {
        "jsonrpc": "2.0",
        "method": "tools/call",
        "params": {
            "name": "upload_generated_asset",
            "arguments": {
                "player_id": player_id,
                "image_base64": base64_data,
                "style": "v6.4"
            }
        },
        "id": 1
    }
    try:
        # We can POST to the SSE server or run a local ssh command to invoke the python function
        # Since we have SSH key access, running it via ssh is 100% reliable and bypasses HTTP routing/tunnels!
        import base64
        # Write temporary base64 file to VPS
        tmp_file = f"/tmp/upload_{player_id}.b64"
        
        # Write base64 locally first
        local_tmp = PRIMARY_ROOT / f"scratch/upload_{player_id}.b64"
        local_tmp.parent.mkdir(parents=True, exist_ok=True)
        local_tmp.write_text(base64_data)
        
        # Copy to VPS
        subprocess.run(["scp", "-o", "BatchMode=yes", str(local_tmp), f"ubuntu@89.168.20.135:{tmp_file}"], check=True)
        local_tmp.unlink(missing_ok=True)
        
        # Execute registration on VPS
        ssh_cmd = (
            f"/home/ubuntu/.hermes/hermes-agent/venv/bin/python3 -c \""
            f"import sys; sys.path.append('/home/ubuntu/.hermes/profiles/hermes-ceo/scripts'); "
            f"import mcp_ops; "
            f"with open('{tmp_file}', 'r') as f: data = f.read(); "
            f"print(mcp_ops.upload_generated_asset({player_id}, image_base64=data))\""
        )
        res = subprocess.run(["ssh", "-o", "BatchMode=yes", "ubuntu@89.168.20.135", ssh_cmd], capture_output=True, text=True)
        
        # Cleanup VPS temp file
        subprocess.run(["ssh", "-o", "BatchMode=yes", "ubuntu@89.168.20.135", f"rm -f {tmp_file}"])
        
        if res.returncode == 0:
            print(f"[VPS] {res.stdout.strip()}")
            return True
        else:
            print(f"[ERROR] VPS registration failed: {res.stderr}")
            return False
    except Exception as e:
        print(f"[ERROR] Registration exception: {e}")
        return False

def run_generator():
    print("=== GoalChain Grok Autonomous Browser Generator ===")
    print("Connecting to local Chrome at http://127.0.0.1:9222...")
    
    with sync_playwright() as p:
        try:
            browser = p.chromium.connect_over_cdp("http://127.0.0.1:9222")
        except Exception as e:
            print(f"[ERROR] Could not connect to Chrome. Make sure Chrome is open on port 9222: {e}")
            sys.exit(1)
            
        # Find the Grok tab
        grok_page = None
        for context in browser.contexts:
            for page in context.pages:
                if "grok.com" in page.url:
                    grok_page = page
                    break
            if grok_page:
                break
                
        if not grok_page:
            print("[ERROR] Grok tab not found. Please open grok.com/chat or grok.com/imagine in Chrome.")
            sys.exit(1)
            
        print(f"[SUCCESS] Attached to Grok: {grok_page.url}")
        
        # Focus/bring page to front
        grok_page.bring_to_front()
        
        while True:
            player = get_next_player()
            if not player:
                print("[INFO] No more pending players found. All done!")
                break
                
            pid = player["id"]
            name = player["name"]
            country = player["country"]
            print(f"\n🚀 Starting Generation for #{pid} - {name} ({country})...")
            
            prompt = build_prompt_for_player(player)
            
            # Locate input box
            textarea = grok_page.locator("textarea").first
            textarea.click()
            textarea.fill(prompt)
            
            # Record number of images currently on the page to detect the new one
            img_count_before = grok_page.locator("img").count()
            
            # Submit prompt
            textarea.press("Enter")
            print("  Prompt submitted. Waiting for image generation to complete...")
            
            # Wait for generation:
            # We wait until the stop button disappears (meaning textarea is active again)
            # AND a new image is rendered in the page.
            time.sleep(10)  # Initial wait
            
            new_img_found = False
            img_src = None
            
            # Poll for 90 seconds max
            for attempt in range(18):
                time.sleep(5)
                # Check if submit button is visible and active again
                textarea_enabled = textarea.is_enabled()
                
                # Check for new image
                images = grok_page.locator("img").all()
                if len(images) > img_count_before:
                    # The new image is typically the last one or near the bottom
                    # Let's inspect the last few images
                    for img in reversed(images):
                        src = img.get_attribute("src") or ""
                        # Exclude icons, avatars, etc. (we want large generated images)
                        if "grok.com" in src or "x.ai" in src or "blob:" in src or "akamaized" in src or len(src) > 500:
                            img_src = src
                            new_img_found = True
                            break
                            
                if textarea_enabled and new_img_found:
                    break
                    
            if not new_img_found or not img_src:
                print(f"[WARN] Image generation timed out or could not find new image in DOM for #{pid}.")
                input("Press ENTER to retry this player, or Ctrl+C to stop...")
                continue
                
            print(f"  [SUCCESS] Found generated image source!")
            
            # Download the image. If it's a blob, we must extract it via page JS context
            temp_local = PRIMARY_ROOT / f"scratch/temp_{pid}.png"
            temp_local.parent.mkdir(parents=True, exist_ok=True)
            
            try:
                if img_src.startswith("blob:"):
                    print("  Extracting image from blob URL...")
                    # Read the blob as base64 in the page context
                    js_code = f"""
                    async () => {{
                        const response = await fetch('{img_src}');
                        const blob = await response.blob();
                        return new Promise((resolve) => {{
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result);
                            reader.readAsDataURL(blob);
                        }});
                    }}
                    """
                    data_url = grok_page.evaluate(js_code)
                    base64_img = data_url.split(",", 1)[1]
                    import base64
                    with open(temp_local, "wb") as f:
                        f.write(base64.b64decode(base64_img))
                else:
                    print(f"  Downloading image from URL: {img_src[:60]}...")
                    # Download normally using browser cookies/headers if possible, or via playwright
                    # Playwright page.goto or download
                    r = requests.get(img_src, headers={"User-Agent": "Mozilla/5.0"}, timeout=30)
                    with open(temp_local, "wb") as f:
                        f.write(r.content)
            except Exception as e:
                print(f"[ERROR] Failed to download generated image: {e}")
                input("Press ENTER to retry, or Ctrl+C to stop...")
                continue
                
            # Optimize image locally
            optimized_local = PRIMARY_ROOT / f"scratch/opt_{pid}.png"
            opt_cmd = ["python3", str(HELPER_SKILL), str(temp_local), str(optimized_local)]
            res_opt = subprocess.run(opt_cmd, capture_output=True, text=True)
            
            # Clean up temp raw image
            temp_local.unlink(missing_ok=True)
            
            if res_opt.returncode != 0:
                print(f"[ERROR] Image optimization failed: {res_opt.stderr}")
                optimized_local.unlink(missing_ok=True)
                input("Press ENTER to retry, or Ctrl+C to stop...")
                continue
                
            # Convert optimized image to base64
            import base64
            with open(optimized_local, "rb") as f:
                b64_data = base64.b64encode(f.read()).decode("utf-8")
                
            # Register on VPS
            print("  Registering optimized asset on VPS...")
            if register_on_vps(pid, b64_data):
                print(f"✅ Player #{pid} successfully registered and saved!")
                # Copy optimized image to local raw path as backup/sync
                country_folder = re.sub(r'[^A-Z0-9_\-]', '', country.strip().upper().replace(' ', '_'))
                sanitized_name = re.sub(r'[^a-z0-9_\-]', '', name.lower().replace(' ', '_'))
                local_dest = PRIMARY_ROOT / f"assets/players/raw/{country_folder}/{str(pid).zfill(3)}_{sanitized_name}.png"
                local_dest.parent.mkdir(parents=True, exist_ok=True)
                import shutil
                shutil.copy2(optimized_local, local_dest)
                optimized_local.unlink(missing_ok=True)
            else:
                print(f"[ERROR] Failed to register player #{pid} on VPS.")
                optimized_local.unlink(missing_ok=True)
                input("Press ENTER to retry, or Ctrl+C to stop...")
                continue
                
            # Politeness sleep between players
            time.sleep(5)

if __name__ == "__main__":
    run_generator()
