import os
import json

BASE_DIR = "/Users/NicoPez/GoalChain"
MASTER_MATCHING_JSON = os.path.join(BASE_DIR, "ai_context/goalchain_master_matching_v6_full.json")

def backup():
    if not os.path.exists(MASTER_MATCHING_JSON):
        print("❌ master JSON does not exist!")
        return
        
    with open(MASTER_MATCHING_JSON, "r", encoding="utf-8") as f:
        master = json.load(f)
        
    batch_51_100_mappings = {}
    for fn, entry in master.get("mappings", {}).items():
        entry_id = entry.get("id")
        if entry_id is not None and 51 <= entry_id <= 100:
            batch_51_100_mappings[fn] = entry
            
    print(f"📦 Extracted {len(batch_51_100_mappings)} entries for batch 51-100.")
    for fn, entry in list(batch_51_100_mappings.items())[:10]:
        print(f"  {fn} -> ID {entry['id']} ({entry['nft_name']})")
        
    # Write backup file
    backup_path = os.path.join(BASE_DIR, "scratch/batch_51_100_backup.json")
    with open(backup_path, "w", encoding="utf-8") as f:
        json.dump(batch_51_100_mappings, f, indent=2, ensure_ascii=False)
    print(f"✅ Saved backup to {backup_path}")

if __name__ == "__main__":
    backup()
