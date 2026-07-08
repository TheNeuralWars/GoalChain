import sys
import json
from pathlib import Path
import time
import re

# Append video_automation to path
BASE_DIR = Path('/data/apps/GoalChain')
sys.path.append(str(BASE_DIR / "scripts" / "video_automation"))

from grok_super_pipeline import run_grok_with_prompt_file, ssh_run
import captions_burnin as captions_burnin_module

runs_file = BASE_DIR / "data" / "marketing_pipeline" / "runs.json"

print(f"Reading from {runs_file}")
with open(runs_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Select runs from today (2026-07-02) that still have the mock goalkeeper video
target_runs = []
for r in data:
    timestamp = r.get('timestamp', '')
    video_url = r.get('video_url', '')
    run_id = r.get('id', '')
    if timestamp.startswith('2026-07-02') and 'austrian_goalkeeper' in video_url:
        target_runs.append(r)

print(f"Found {len(target_runs)} runs to process.")

# Process them one by one sequentially
for idx, target_run in enumerate(target_runs):
    run_id = target_run['id']
    account_name = target_run['account_name']
    image_url = target_run.get('image_url', '')
    
    print(f"\n==========================================")
    print(f"[{idx+1}/{len(target_runs)}] Processing Run: {run_id}")
    print(f"Account: {account_name}")
    print(f"Topic: {target_run.get('topic')}")
    print(f"Image URL: {image_url}")
    print(f"==========================================")
    
    # Extract image filename from url
    # e.g., https://api.goalchain.fun/pilot/grok_img_1782972663_1.jpg -> grok_img_1782972663_1.jpg
    if not image_url:
        print("ERROR: No image found for this run, skipping.")
        continue
        
    img_name = Path(image_url).name
    image_path = f"/home/ubuntu/scratch/grok_batches/batch_01/outputs/{img_name}"
    
    # Verify image exists on disk
    if not Path(image_path).exists():
        # Fallback to copy from assets if it exists there
        assets_img = Path("/data/hermes-home/assets/goalworld-images/grok_batches/batch_01/outputs") / img_name
        if assets_img.exists():
            print(f"Symlink/file resolved: found {img_name} in assets, copy to output...")
            import shutil
            shutil.copy(assets_img, image_path)
        else:
            print(f"ERROR: Source image {image_path} does not exist. Skipping.")
            continue
            
    video_prompt = target_run.get("video_prompt")
    if not video_prompt:
        print("ERROR: No video_prompt found, skipping.")
        continue
        
    orient = "vertical en formato 9:16"
    grok_prompt = f"Genera un video {orient} (grok-imagine-video) a partir de la imagen '{image_path}' usando este prompt de animación: {video_prompt}"

    print("Step 1: Running Grok CLI to generate raw video...")
    t0 = time.time()
    try:
        grok_output = run_grok_with_prompt_file(grok_prompt)
        print(f"Grok task execution finished. Took {time.time()-t0:.2f} seconds.")
    except Exception as e:
        print("Grok video generation failed:", e)
        continue

    print("Step 2: Locating generated video in sessions...")
    copy_cmd = (
        "vid_path=$(find /home/ubuntu/.grok/sessions/ /home/ubuntu/scratch/generated_images/ /data/apps/GoalChain/scratch/generated_images/ -maxdepth 8 -name '*.mp4' -printf '%T@ %p\\n' 2>/dev/null | sort -n | tail -1 | cut -f2- -d' ') && "
        "if [ -f \"$vid_path\" ]; then "
        "  fname=$(basename \"$vid_path\"); "
        "  ts=$(date +%s); "
        "  target_name=\"grok_vid_${ts}_${fname}\"; "
        "  cp \"$vid_path\" \"/home/ubuntu/scratch/grok_batches/batch_01/outputs/${target_name}\" && "
        "  echo \"SUCCESS:${target_name}\"; "
        "else "
        "  echo \"ERROR: No video found\"; "
        "fi"
    )
    res = ssh_run(copy_cmd)
    if "SUCCESS:" not in res:
        print("ERROR copying raw video file:", res)
        continue

    vid_name = res.split("SUCCESS:")[1].strip()
    print(f"Copied successfully to pilot: {vid_name}")

    # Subtitles rendering
    print("Step 3: Rendering captions...")
    in_path = Path("/home/ubuntu/scratch/grok_batches/batch_01/outputs") / vid_name
    out_path = Path("/home/ubuntu/scratch/grok_batches/batch_01/outputs") / f"grok_video_{Path(vid_name).stem}_9x16_{int(time.time())}.mp4"

    try:
        cap = captions_burnin_module.render(in_path, target_run["post_text"], out_path)
        print(f"Captions burn results: {cap}")
        if cap.get("status") == "ok" and cap.get("out_path"):
            final_video_name = Path(cap["out_path"]).name
        else:
            final_video_name = vid_name
    except Exception as e:
        print(f"Captions render failed, fallback to raw animation: {e}")
        final_video_name = vid_name

    # Update runs.json
    print("Step 4: Updating runs.json database record...")
    new_video_url = f"https://api.goalchain.fun/pilot/{final_video_name}"
    
    # Reload data to prevent race condition write overwrites
    with open(runs_file, 'r', encoding='utf-8') as f:
        current_data = json.load(f)
        
    for r in current_data:
        if r.get('id') == run_id:
            r["video_url"] = new_video_url
            break
            
    with open(runs_file, 'w', encoding='utf-8') as f:
        json.dump(current_data, f, indent=2, ensure_ascii=False)
        
    print(f"SUCCESS: Run {run_id} updated. Video URL: {new_video_url}")
    
    # Small cooldown sleep between sequential Grok API tasks
    time.sleep(5)

print("\nAll target runs processed!")
