import os
import json

BASE_DIR = "/Users/NicoPez/GoalChain"
PLAYERS_JSON = os.path.join(BASE_DIR, "docs/assets/data/players.json")

def inspect():
    with open(PLAYERS_JSON, "r", encoding="utf-8") as f:
        players = json.load(f)
    
    print("📝 PLAYER ENTRIES 11 TO 50:")
    for p in players:
        p_id = p["id"]
        if 11 <= p_id <= 50:
            print(f"ID {p_id:03d} | {p['name']} ({p.get('real_name', '')}) | Country: {p.get('country')}")

if __name__ == "__main__":
    inspect()
