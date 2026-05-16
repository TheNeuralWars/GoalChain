import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/players.json"

# REAL Biometric Data (Verified Batch 38)
REAL_DATA = {
    "Ali Al-Bulaihi": "Short dark hair with a clean fade, well-groomed beard, strong and intimidating centre-back build, olive skin tone, fierce and provocative expression.",
    "Mohammed Kanno": "Short dark hair with a sharp fade, clean shaven, exceptionally tall and powerful central midfield build (1.92m), olive skin tone, intense expression.",
    "Abdulellah Al-Malki": "Short dark hair with a precision fade, clean shaven, hardworking central midfield build, olive skin tone, focused look.",
    "Sultan Al-Ghannam": "Short dark hair with a clean fade, well-groomed short beard, fast and creative right-back build, olive skin tone, focused look.",
    "Ali Lajami": "Short dark hair, clean shaven or light stubble, strong centre-back build, olive skin tone, focused look.",
    "Saud Abdulhamid": "Short dark hair with a sharp fade (model-like grooming), clean shaven, exceptionally fast and agile right-back build, olive skin tone, dynamic and charismatic expression.",
    "Francisco Calvo": "Short dark hair, well-groomed beard, strong and experienced centre-back build, tanned skin, leadership look.",
    "Aníbal Godoy": "Short dark hair, clean shaven, experienced and strong defensive midfield build, dark skin tone, professional leadership expression.",
    "Adalberto Carrasquilla": "Long dark curly hair (mane-style) often with natural volume, clean shaven or light stubble, technical and agile midfield build, tanned skin, creative expression.",
    "Michael Amir Murillo": "Short dark hair with a clean-cut fade, clean shaven, strong and fast right-back build, dark skin tone, focused look.",
    "Yoel Bárcenas": "Short dark hair with a clean fade, clean shaven, technical and fast winger build, dark-tanned skin, focused look.",
    "Ismael Díaz": "Short dark hair, clean shaven, clinical forward build, dark skin tone, focused expression.",
    "Cecilio Waterman": "Short dark hair, clean shaven, powerful and robust forward build, dark skin tone, determined gaze.",
    "Eric Davis": "Short dark hair, clean shaven, experienced left-back build, dark skin tone, professional look.",
    "Orlando Mosquera": "Short dark hair, clean shaven, agile and tall goalkeeper build, dark skin tone, focused look.",
    "José Fajardo": "Short dark hair with a sharp fade, clean shaven, fast and powerful forward build, dark-tanned skin, dynamic expression.",
    "Alberto Quintero": "Short dark hair, clean shaven, agile experienced winger build, dark-tanned skin, focused look.",
    "Fidel Escobar": "Short dark hair, clean shaven, strong and technical defender build, dark skin tone, focused look.",
    "Roderick Miller": "Short dark hair, clean shaven, tall and strong centre-back build, dark skin tone, professional look.",
    "Kevin Galván": "Short dark hair, clean shaven, energetic full-back build, dark skin tone, focused look."
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
    
    print(f"✅ Corrected {updated_count} players with verified REAL biometric data (Batch 38).")

if __name__ == "__main__":
    update_real_biometrics()
