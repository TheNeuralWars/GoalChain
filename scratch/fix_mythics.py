import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/players.json"

# The Absolute Icons
MYTHIC_REAL_NAMES = [
    "Lionel Messi", "Cristiano Ronaldo", "Kylian Mbappé", "Erling Haaland", 
    "Jude Bellingham", "Vinícius Júnior", "Kevin De Bruyne", "Mohamed Salah", 
    "Harry Kane", "Neymar Jr"
]

def fix_mythics():
    with open(PLAYERS_FILE, 'r') as f:
        players = json.load(f)
    
    # 1. Reset all to Rare first to avoid double mythics
    for p in players:
        if p.get("rarity") == "mythic":
            p["rarity"] = "rare"
            p["bg_type"] = "BG-RAR"
            p["match_salary_gch"] = 50

    # 2. Assign True Mythics
    count = 0
    for p in players:
        if p.get("real_name") in MYTHIC_REAL_NAMES:
            p["rarity"] = "mythic"
            p["bg_type"] = "BG-MYT"
            p["match_salary_gch"] = 5000
            count += 1
            
    # 3. Save
    with open(PLAYERS_FILE, 'w') as f:
        json.dump(players, f, indent=4, ensure_ascii=False)
    
    print(f"✅ Fixed {count} Mythic Icons.")

if __name__ == "__main__":
    fix_mythics()
