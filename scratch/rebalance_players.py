import json
import random

# Path to the files
PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/players.json"

# Rarity Caps
CAPS = {
    "mythic": 10,
    "legendary": 50,
    "epic": 150,
    "rare": 318
}

# Salaries
SALARIES = {
    "mythic": 5000,
    "legendary": 1000,
    "epic": 250,
    "rare": 50
}

# Top players for Mythic/Legendary priority
MYTHIC_NAMES = ["Lionel Messi", "Cristiano Ronaldo", "Kylian Mbappé", "Erling Haaland", "Jude Bellingham", "Vinícius Júnior", "Kevin De Bruyne", "Mohamed Salah", "Harry Kane", "Neymar Jr"]

def get_stats(position, rarity):
    # Base ranges based on rarity
    ranges = {
        "mythic": (90, 99),
        "legendary": (85, 92),
        "epic": (75, 86),
        "rare": (60, 78)
    }
    low, high = ranges[rarity]
    
    atk = random.randint(low, high)
    def_ = random.randint(low, high)
    hype = random.randint(low, high)
    
    if position == "FWD":
        def_ = random.randint(10, 40)
    elif position in ["DEF", "GK"]:
        atk = random.randint(10, 45)
    else: # MID
        # Keep balanced as generated
        pass
        
    return {"atk": atk, "def": def_, "hype": hype}

def rebalance():
    with open(PLAYERS_FILE, 'r') as f:
        players = json.load(f)
    
    # 1. Sort players by a "Prestige Score" (Mythic names first, then existing rarity)
    def prestige_score(p):
        if p.get("real_name") in MYTHIC_NAMES:
            return 1000
        # Priority to existing high rarities
        rarity_val = {"mythic": 100, "legendary": 50, "epic": 20, "rare": 10}
        return rarity_val.get(p.get("rarity", "rare"), 0) + random.random()

    players.sort(key=prestige_score, reverse=True)
    
    # 2. Assign Rarities based on sorted order and caps
    assigned_players = []
    cursor = 0
    
    for rarity, cap in CAPS.items():
        for _ in range(cap):
            if cursor < len(players):
                p = players[cursor]
                p["rarity"] = rarity
                p["match_salary_gch"] = SALARIES[rarity]
                
                # Fix bg_type
                bg_map = {"mythic": "BG-MYT", "legendary": "BG-LEG", "epic": "BG-EPI", "rare": "BG-RAR"}
                p["bg_type"] = bg_map[rarity]
                
                # Fix position heuristic if wrong (e.g. Dibu)
                if "Martínez" in p.get("real_name", "") or "Alisson" in p.get("real_name", "") or "Courtois" in p.get("real_name", ""):
                    p["position"] = "GK"
                
                # Assign Stats
                p["stats"] = get_stats(p["position"], rarity)
                
                assigned_players.append(p)
                cursor += 1
    
    # 3. Sort back by ID
    assigned_players.sort(key=lambda x: x["id"])
    
    # 4. Save
    with open(PLAYERS_FILE, 'w') as f:
        json.dump(assigned_players, f, indent=4, ensure_ascii=False)
    
    print(f"✅ Rebalanced {len(assigned_players)} players successfully.")

if __name__ == "__main__":
    rebalance()
