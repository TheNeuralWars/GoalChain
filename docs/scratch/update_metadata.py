import json

path = '/Users/NicoPez/GoalChain/goalchain_web/assets/data/players.json'

with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)

for player in data:
    player['is_mutable'] = True
    player['oracle_sync'] = {
        "status": "active",
        "source": "GCH-OFFICIAL-ORACLE",
        "last_sync": "2026-05-12T18:43:24Z",
        "performance_index": 1.0
    }
    # Add a unique mint address placeholder if not exists
    if 'mint_address' not in player:
        player['mint_address'] = f"GCH{str(player['id']).zfill(4)}X..."

with open(path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=4, ensure_ascii=False)

print(f"Updated {len(data)} players with mutable metadata fields.")
