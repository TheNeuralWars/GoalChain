#!/usr/bin/env python3
import os
import sys
import json
import time
import requests
from pathlib import Path

# Load XAI_API_KEY
XAI_API_KEY = os.getenv("XAI_API_KEY", "").strip()
if not XAI_API_KEY:
    config_path = Path("/home/ubuntu/hermes/config.env")
    if config_path.exists():
        for line in config_path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, val = line.split("=", 1)
                if key.strip() == "XAI_API_KEY":
                    XAI_API_KEY = val.strip().strip('"').strip("'")
                    break

API_URL = "https://api.x.ai/v1/chat/completions"

# Paths
PRIMARY_ROOT = Path("/Users/NicoPez/GoalChain")
if not PRIMARY_ROOT.exists():
    if Path("/data/apps/GoalChain").exists():
        PRIMARY_ROOT = Path("/data/apps/GoalChain")
    else:
        PRIMARY_ROOT = Path(os.getcwd())

PLAYERS_JSON_DOCS = PRIMARY_ROOT / "docs/assets/data/players.json"
PLAYERS_JSON_AI = PRIMARY_ROOT / "ai_context/03_data/players.json"
CACHE_FILE = PRIMARY_ROOT / "grok_batches/enriched_physical_cache.json"

def call_grok(prompt: str) -> str:
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {XAI_API_KEY}"
    }
    payload = {
        "model": "grok-4.3",
        "messages": [
            {"role": "system", "content": "You are a precise physical database parser that outputs ONLY raw JSON mapping string IDs to string descriptions, with no markdown tags or conversational filler."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.1
    }
    try:
        resp = requests.post(API_URL, headers=headers, json=payload, timeout=60)
        if resp.status_code != 200:
            print(f"Error calling Grok API: {resp.status_code} - {resp.text}")
            return ""
        return resp.json()["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"Connection error: {e}")
        return ""

def main():
    if not PLAYERS_JSON_DOCS.exists():
        print(f"Error: {PLAYERS_JSON_DOCS} not found.")
        sys.exit(1)

    print(f"Loading players from {PLAYERS_JSON_DOCS}")
    with open(PLAYERS_JSON_DOCS, "r", encoding="utf-8") as f:
        players = json.load(f)

    # Load cache
    cache = {}
    if CACHE_FILE.exists():
        try:
            cache = json.loads(CACHE_FILE.read_text(encoding="utf-8"))
            print(f"Loaded {len(cache)} cached player descriptions.")
        except Exception as e:
            print(f"Failed to read cache: {e}")

    # Determine which players still need enrichment
    todo = [p for p in players if str(p["id"]) not in cache]
    print(f"Players remaining to enrich: {len(todo)} / {len(players)}")

    if not todo:
        print("All players are already enriched in cache.")
    else:
        # Batch size
        batch_size = 15
        for idx in range(0, len(todo), batch_size):
            batch = todo[idx:idx+batch_size]
            print(f"\nProcessing batch {idx//batch_size + 1} / {(len(todo)-1)//batch_size + 1}...")

            # Format batch details
            batch_list = []
            for p in batch:
                batch_list.append({
                    "id": p["id"],
                    "real_name": p.get("real_name") or p.get("name"),
                    "position": p.get("position"),
                    "country": p.get("country"),
                    "current_desc": p.get("physical", {}).get("t", "")
                })

            prompt = f"""You are a soccer player physical appearance registry database enricher for GoalChain.
We need to generate full-body 3D anime soccer player images using Grok.
Here is a list of {len(batch)} players with their real-world names, positions, countries, and current description.
For each player in this list, look up their actual real-world physical look (e.g. hair style, beard, build, tattoos, skin tone) and write a highly detailed, clean, precise English description of their physical appearance.

Crucial formatting rules:
- Description MUST NOT exceed 220 characters.
- DO NOT include the player name, position, or team in the description.
- DO NOT use parentheses.
- DO NOT mention youth, age, or "child/teenager" words.
- Describe physical characteristics only (e.g. "Long voluminous curly black hair in an afro style, clean-shaven, tall athletic build, olive skin tone, focused expression.")
- Keep it concise, descriptive, and separate each detail with a comma.

Your output MUST be a JSON object mapping the player's id (as string) to their new "t" description.
No extra text, no markdown tags. Just raw JSON.

Players list:
{json.dumps(batch_list, indent=2)}
"""
            # Call API
            response_text = call_grok(prompt)
            if not response_text:
                print("Skipping batch due to API error.")
                time.sleep(2)
                continue

            # Parse JSON
            try:
                # Clean markdown code block if present
                clean_json = response_text.strip()
                if clean_json.startswith("```"):
                    clean_json = clean_json.split("\n", 1)[1]
                if clean_json.endswith("```"):
                    clean_json = clean_json.rsplit("\n", 1)[0]
                clean_json = clean_json.strip()
                if clean_json.startswith("json"):
                    clean_json = clean_json[4:].strip()

                batch_results = json.loads(clean_json)
                for pid, desc in batch_results.items():
                    cache[str(pid)] = desc.strip()
                
                # Write cache in-progress
                CACHE_FILE.write_text(json.dumps(cache, indent=2, ensure_ascii=False), encoding="utf-8")
                print(f"Saved {len(batch_results)} player descriptions to cache.")
            except Exception as pe:
                print(f"Error parsing JSON output: {pe}")
                print(f"Raw output: {response_text[:300]}")

            # Sleep between requests to be nice to API rate limits
            time.sleep(1.5)

    # Apply cache to players.json
    print("\nApplying enriched descriptions to players.json...")
    updated_count = 0
    for p in players:
        pid_str = str(p["id"])
        if pid_str in cache:
            p["physical"]["t"] = cache[pid_str]
            updated_count += 1

    # Save to both target paths
    for target in [PLAYERS_JSON_DOCS, PLAYERS_JSON_AI]:
        try:
            with open(target, "w", encoding="utf-8") as f:
                json.dump(players, f, indent=2, ensure_ascii=False)
            print(f"Successfully saved {updated_count} players to {target}")
        except Exception as e:
            print(f"Error saving to {target}: {e}")

    print("Done! Physical prompts enrichment complete.")

if __name__ == "__main__":
    main()
