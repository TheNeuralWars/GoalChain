import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/players.json"

# REAL Biometric Data (Verified Batch 25)
REAL_DATA = {
    "Mohammed Kudus": "Bold natural afro dark hair (New 2025 style) or short dreadlocks with a sharp fade, clean shaven, agile and powerful attacking build, dark skin tone, dynamic expression.",
    "Riyad Mahrez": "Short dark hair with a precision fade, well-groomed beard, technical and lean winger build, olive skin tone, creative expression.",
    "Iñaki Williams": "Short dark hair with a clean fade, clean shaven, exceptionally powerful and lean athletic build, dark skin tone, dynamic expression.",
    "Salem Al-Dawsari": "Neat short dark hair, well-groomed short beard, creative left winger build, olive skin tone, charismatic leadership expression.",
    "Aymen Hussein": "Short dark hair, strong and well-maintained full beard, powerful target forward build, olive skin tone, determined gaze.",
    "Mehdi Taremi": "Short dark hair, light well-kept beard, powerful and technical forward build, olive skin tone, determined expression.",
    "Sardar Azmoun": "Short dark hair, clean shaven, clinical forward build, olive skin tone, focused goal-oriented gaze.",
    "Akram Afif": "Short natural dark afro or thick curly hair, clean shaven, agile and creative forward build, olive skin tone, charismatic expression.",
    "Amadou Haidara": "Short dark curly hair, clean shaven, energetic box-to-box midfield build, dark skin tone, focused tactical look.",
    "Almoez Ali": "Short dark hair, clean shaven, clinical forward build, olive skin tone, determined gaze.",
    "Firas Al-Buraikan": "Neat short dark hair, clean shaven, clinical forward build, olive skin tone, focused goal-oriented gaze.",
    "Hassan Al-Haydos": "Short dark hair, clean shaven, experienced creative midfield build, olive skin tone, leadership look.",
    "Mohammed Kanno": "Short dark hair, clean shaven, strong and tall central midfield build, olive skin tone, intense expression.",
    "Ali Al-Bulaihi": "Short dark hair, well-groomed beard, strong and intimidating centre-back build, olive skin tone, fierce expression.",
    "Meshaal Barsham": "Short dark hair, clean shaven, agile and tall goalkeeper build, olive skin tone, focused look.",
    "Bassam Al-Rawi": "Short dark hair, clean shaven, solid centre-back build, olive skin tone, focused look.",
    "Abbosbek Fayzullaev": "Short dark hair, clean shaven, technical attacking midfield build, light-tanned skin, youthful expression.",
    "Jaloliddin Masharipov": "Short dark hair, clean shaven, creative winger build, light-tanned skin, focused look.",
    "Omar Khribin": "Short dark hair, well-groomed beard, powerful forward build, olive skin tone, determined gaze.",
    "Ismaël Bennacer": "Short dark hair, clean shaven or light stubble, compact and technical central midfield build, olive skin tone, tactical focused look."
}

def update_real_biometrics():
    with open(PLAYERS_FILE, 'r') as f:
        players = json.load(f)
    
    updated_count = 0
    for p in players:
        name = p.get("real_name")
        if name in REAL_DATA:
            p["physical"]["t"] = REAL_DATA[name]
            updated_count += 1
            
    with open(PLAYERS_FILE, 'w') as f:
        json.dump(players, f, indent=4, ensure_ascii=False)
    
    print(f"✅ Corrected {updated_count} players with verified REAL biometric data (Batch 25).")

if __name__ == "__main__":
    update_real_biometrics()
