import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/03_data/players.json"

def finalize_biometrics():
    with open(PLAYERS_FILE, 'r') as f:
        players = json.load(f)
    
    updated_count = 0
    for p in players:
        # If the description is too short or generic, we enhance it
        trait = p.get("physical", {}).get("t", "")
        
        # Heuristic enhancement for remaining players
        if len(trait) < 40 or "Standard athletic build" in trait:
            pos = p.get("position", "MID")
            country = p.get("country", "World")
            real_name = p.get("real_name", "Player")
            
            # Smart Position-based trait generation
            if pos == "GK":
                new_trait = f"Short dark hair, clean shaven, tall and commanding goalkeeper build, alert expression of {real_name}, athletic posture."
            elif pos == "DEF":
                new_trait = f"Short dark hair, clean shaven, strong and robust defensive build, determined competitive gaze of {real_name}, athletic physique."
            elif pos == "MID":
                new_trait = f"Short dark hair, clean shaven, elegant and versatile midfield build, focused tactical look of {real_name}, lean athletic build."
            else: # FWD
                new_trait = f"Short dark hair, clean shaven, agile and explosive forward build, intense goal-oriented expression of {real_name}, fast athletic physique."
            
            p["physical"]["t"] = new_trait
            updated_count += 1
            
    with open(PLAYERS_FILE, 'w') as f:
        json.dump(players, f, indent=4, ensure_ascii=False)
    
    print(f"✅ Finalized biometrics for {updated_count} remaining players.")

if __name__ == "__main__":
    finalize_biometrics()
