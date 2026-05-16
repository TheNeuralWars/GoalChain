import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/players.json"

# Detailed Biometric Descriptions for Batch 1 (Mythics)
BIOMETRICS = {
    "Lionel Messi": "Short brown hair, thick well-groomed beard, intense competitive gaze, lean muscular athletic build, light-tanned skin.",
    "Kylian Mbappé": "Buzz cut black hair, clean shaven, focused speed-oriented expression, lean athletic build, dark-tanned skin.",
    "Cristiano Ronaldo": "Short black styled hair with sharp fade, clean shaven, hyper-muscular physique, tanned skin, confident intense expression.",
    "Neymar Jr.": "Short dark hair with side fade, light stubble beard, agile and lean athletic build, bronze skin tone, creative charismatic expression.",
    "Mohamed Salah": "Thick curly black hair, full well-maintained beard, strong muscular forward build, olive skin tone, determined gaze.",
    "Vinícius Júnior": "Short black curly hair with high fade, clean shaven, very athletic and explosive build, deep dark skin tone, energetic focused look.",
    "Jude Bellingham": "Short black afro fade, clean shaven, elegant tall athletic build, youthful but intense competitive expression, deep-tanned skin.",
    "Harry Kane": "Short blonde-brown hair, well-kept light beard, fair skin tone, powerful classic striker build, focused leadership expression.",
    "Robert Lewandowski": "Short dark hair, clean shaven, clinical and strong forward build, fair-tanned skin, composed goal-oriented gaze.",
    "Rodri": "Short dark hair, clean shaven, tall and dominant powerful midfield build, olive skin tone, calm and strategic expression."
}

def update_biometrics():
    with open(PLAYERS_FILE, 'r') as f:
        players = json.load(f)
    
    updated_count = 0
    for p in players:
        name = p.get("real_name")
        if name in BIOMETRICS:
            # Update the Trait (t) field
            p["physical"]["t"] = BIOMETRICS[name]
            
            # Ensure they are Mythic for consistency in this batch
            p["rarity"] = "mythic"
            p["bg_type"] = "BG-MYT"
            p["match_salary_gch"] = 5000
            
            updated_count += 1
            
    with open(PLAYERS_FILE, 'w') as f:
        json.dump(players, f, indent=4, ensure_ascii=False)
    
    print(f"✅ Updated biometrics for {updated_count} Icons.")

if __name__ == "__main__":
    update_biometrics()
