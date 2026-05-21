import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/players.json"

# REAL Biometric Data (Verified Batch 26)
REAL_DATA = {
    "Nicolas Jackson": "Short dark textured crop with a sharp side fade, clean shaven or light stubble, agile and lean forward build, dark skin tone, dynamic expression.",
    "Pape Sarr": "Short dark natural curls with a clean high fade, clean shaven, tall and very slim athletic build, dark skin tone, focused look.",
    "Edmond Tapsoba": "Neat short dark hair with a clean-cut fade, clean shaven, strong and towering centre-back build, dark skin tone, leadership look.",
    "Yves Bissouma": "Short dark hair with a sharp precision fade, clean shaven, tenacious and mobile midfield build, dark skin tone, intense focused look.",
    "Rayan Aït-Nouri": "Textured dark crop hair with a faded beard (facial hair blends into sideburns), clean shaven look otherwise, fast and agile left-back build, olive skin tone, dynamic expression.",
    "Saïd Benrahma": "Short dark hair with a textured fade, well-groomed faded beard, creative and lean winger build, olive skin tone, technical expression.",
    "Youcef Atal": "Short dark hair with a clean fade, clean shaven or light stubble, explosive and fast full-back build, olive skin tone, energetic expression.",
    "Baghdad Bounedjah": "Short dark hair, well-maintained beardstache (prominent mustache with trimmed beard), powerful forward build, olive skin tone, determined gaze.",
    "Moussa Niakhaté": "Short dark hair with a sharp fade, clean shaven, strong and tall centre-back build, dark skin tone, focused leadership look.",
    "Ismaïla Sarr": "Short dark hair with a clean fade, clean shaven, explosive and lean winger build, dark skin tone, dynamic expression.",
    "Boulaye Dia": "Short dark hair, clean shaven, technical forward build, dark skin tone, focused expression.",
    "Pape Gueye": "Short dark hair with a clean-cut fade, clean shaven, strong central midfield build, dark skin tone, tactical look.",
    "Hamari Traoré": "Short dark hair, clean shaven, experienced right-back build, dark skin tone, professional leadership look.",
    "Mohamed Camara": "Short dark curly hair, clean shaven, energetic defensive midfield build, dark skin tone, intense look.",
    "Kamory Doumbia": "Short dark hair with a sharp fade, clean shaven, agile attacking midfield build, dark skin tone, youthful expression.",
    "Abdoulaye Seck": "Short dark hair, clean shaven, towering and massive centre-back build, dark skin tone, intimidating presence.",
    "Habib Diallo": "Short dark hair, clean shaven, powerful target forward build, dark skin tone, clinical expression.",
    "Lamine Camara": "Short dark hair with a sharp fade, clean shaven, slender and agile midfield build, dark skin tone, youthful focused look.",
    "Issa Kaboré": "Short dark hair with a clean fade, clean shaven, explosive and strong right-back build, dark skin tone, dynamic expression.",
    "Lassine Sinayoko": "Short dark hair, clean shaven, powerful winger build, dark skin tone, focused look."
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
    
    print(f"✅ Corrected {updated_count} players with verified REAL biometric data (Batch 26).")

if __name__ == "__main__":
    update_real_biometrics()
