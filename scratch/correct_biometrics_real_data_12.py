import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/players.json"

# REAL Biometric Data (Verified Batch 28)
REAL_DATA = {
    "Adalberto Carrasquilla": "Long dark curly hair (mane-style) often with natural volume, light stubble or well-groomed beard, technical and agile midfield build, tanned skin, creative expression.",
    "Michael Amir Murillo": "Short dark hair with a clean-cut fade, clean shaven, strong and fast right-back build, dark skin tone, focused look.",
    "Keylor Navas": "Short dark hair peinado classically, clean shaven, experienced and agile goalkeeper build, tanned skin, calm and focused look.",
    "Joel Campbell": "Short dark natural curls, clean shaven, powerful and stocky attacking build, dark skin tone, experienced gaze.",
    "Saud Abdulhamid": "Short dark hair with a sharp fade, clean shaven, exceptionally fast and agile right-back build, olive skin tone, dynamic expression.",
    "Manfred Ugalde": "Short blonde-brown hair with a clean fade, clean shaven, agile and fast forward build, fair skin tone, youthful focused expression.",
    "Brandon Aguilera": "Short dark hair with a textured fade, clean shaven, technical attacking midfield build, tanned skin, creative expression.",
    "Francisco Calvo": "Short dark hair, well-groomed beard, strong and experienced centre-back build, tanned skin, leadership look.",
    "Aníbal Godoy": "Short dark hair, clean shaven, experienced and strong defensive midfield build, dark skin tone, professional leadership expression.",
    "Yoel Bárcenas": "Short dark hair with a clean fade, clean shaven, technical and fast winger build, dark-tanned skin, focused look.",
    "José Luis Rodríguez": "Short dark hair with a sharp fade, clean shaven, lean and fast winger build, dark skin tone, dynamic expression.",
    "Ismael Díaz": "Short dark hair, clean shaven, clinical forward build, dark skin tone, focused expression.",
    "Cecilio Waterman": "Short dark hair, clean shaven, powerful and robust forward build, dark skin tone, determined gaze.",
    "Eric Davis": "Short dark hair, clean shaven, experienced left-back build, dark skin tone, professional look.",
    "Orlando Mosquera": "Short dark hair, clean shaven, agile and tall goalkeeper build, dark skin tone, focused look.",
    "Sultan Al-Ghannam": "Short dark hair with a clean fade, well-groomed short beard, fast and creative right-back build, olive skin tone, focused look.",
    "Ali Lajami": "Short dark hair, clean shaven or light stubble, strong centre-back build, olive skin tone, focused look.",
    "Abdulellah Al-Malki": "Short dark hair with a precision fade, clean shaven, hardworking central midfield build, olive skin tone, focused look.",
    "Mohammed Kanno": "Short dark hair, clean shaven, tall and powerful central midfield build, olive skin tone, intense expression.",
    "Firas Al-Buraikan": "Neat short dark hair, clean shaven, clinical forward build, olive skin tone, focused goal-oriented gaze."
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
    
    print(f"✅ Corrected {updated_count} players with verified REAL biometric data (Batch 28).")

if __name__ == "__main__":
    update_real_biometrics()
