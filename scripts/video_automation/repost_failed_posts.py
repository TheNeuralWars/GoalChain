import sys
import json
from pathlib import Path

# Append video_automation to path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(BASE_DIR / "scripts" / "video_automation"))

from grok_super_pipeline import post_to_buffer, CHANNEL_IDS
from schedule_optimizer import CHANNEL_SERVICES

runs_file = BASE_DIR / "data" / "marketing_pipeline" / "runs.json"

print(f"Reading from {runs_file}")
with open(runs_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Filter 2026-07-02 runs with empty buffer_post_ids
target_runs = [
    r for r in data 
    if r.get('timestamp', '').startswith('2026-07-02') 
    and not r.get('buffer_post_ids')
]

print(f"Found {len(target_runs)} runs to repost:")
for r in target_runs:
    print(f"- ID: {r.get('id')} | Account: {r.get('account_name')} | Topic: {r.get('topic')}")

print("\nStarting reposting to Buffer...")

for r in target_runs:
    run_id = r.get('id')
    account_name = r.get('account_name')
    text = r.get('post_text')
    video_url = r.get('video_url')
    channels = CHANNEL_IDS.get(account_name, [])
    
    print(f"\nProcessing Run: {run_id} ({account_name})")
    print(f"  Channels: {channels}")
    
    buffer_post_ids = []
    platform_slots = {}
    earliest_scheduled_at = None
    
    for channel_id in channels:
        try:
            print(f"  Sending to Buffer channel {channel_id}...")
            buffer_res = post_to_buffer(channel_id, text, video_url, all_channels=channels)
            print(f"  ✅ Reposted in Buffer: {buffer_res}")
            
            # Extract post id
            p_id = buffer_res.get("data", {}).get("createPost", {}).get("post", {}).get("id")
            if p_id:
                buffer_post_ids.append(p_id)
            
            # Track scheduled time
            sched = buffer_res.get("_scheduled_at")
            if not sched:
                sched = buffer_res.get("data", {}).get("createPost", {}).get("post", {}).get("scheduledAt")
            
            svc = CHANNEL_SERVICES.get(channel_id, channel_id)
            if sched:
                platform_slots[svc] = sched
                if earliest_scheduled_at is None or sched < earliest_scheduled_at:
                    earliest_scheduled_at = sched
                    
        except Exception as err:
            print(f"  ❌ Error for channel {channel_id}: {err}")
            
    # Update local entry
    r["buffer_post_ids"] = buffer_post_ids
    r["scheduled_at"] = earliest_scheduled_at
    r["platform_slots"] = platform_slots
    
    print(f"  Updated run state: buffer_post_ids={buffer_post_ids}, scheduled_at={earliest_scheduled_at}")

# Save runs.json back
with open(runs_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("\nFinished reposting and updating runs.json!")
