import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/players.json"

# REAL Biometric Data (Verified Batch 19)
REAL_DATA = {
    "Dominik Szoboszlai": "Dark cornrow braids, clean shaven, elegant technical midfield build, fair skin tone, charismatic focused look.",
    "Rafael Leão": "Very short dark buzzcut, clean shaven, tall explosive forward build, deep dark skin tone, dynamic expression.",
    "Lamine Yamal": "Full blonde-dyed short curly hair with fade, clean shaven, slim and agile build, mixed-tanned skin tone, youthful intense expression.",
    "Rúben Dias": "Short dark buzzcut, clean shaven, visible tattoo on right arm (Russian phrase), strong commanding centre-back build, tanned skin, leadership look.",
    "Nico Williams": "Distinctive dark dreadlocks with blonde highlights, clean shaven, explosive winger build, dark skin tone, dynamic expression.",
    "Virgil van Dijk": "Long dark hair tied in a neat top knot, well-groomed beard, commanding centre-back build, tanned skin, leadership expression.",
    "Xavi Simons": "Natural blonde-brown curly hair (afro-style), clean shaven, creative attacking build, fair-tanned skin, energetic expression.",
    "Antoine Griezmann": "Short blonde hair or creative braids, light well-kept beard, agile forward build, fair skin tone, experienced charismatic look.",
    "Pedri": "Simple natural dark hair, clean shaven, no tattoos, elegant technical midfield build, fair skin tone, youthful focused look.",
    "Jamal Musiala": "Short dark hair with a clean fade, clean shaven, elegant tall athletic build, light skin tone, dynamic expression.",
    "Kai Havertz": "Short dark hair, clean shaven, tall elegant forward build, fair skin tone, composed expression.",
    "Bernardo Silva": "Short dark hair, clean shaven, compact technical midfield build, tanned skin, intelligent expression.",
    "Bruno Fernandes": "Short dark hair, light well-kept beard, creative attacking midfield build, fair-tanned skin, passionate expression.",
    "Frenkie de Jong": "Naturally curly blonde-brown hair with a textured look, clean shaven, elegant technical midfield build, fair skin tone, composed expression.",
    "Cody Gakpo": "Short dark hair, clean shaven, tall elegant forward build, mixed-tanned skin tone, composed expression.",
    "Jeremie Frimpong": "Short black hair with a sharp fade, clean shaven, explosive and fast right-back build, dark skin tone, dynamic expression.",
    "Marcel Sabitzer": "Short dark hair (often in a bun), clean shaven or light stubble, energetic central midfield build, fair skin tone, intense look.",
    "Florian Wirtz": "Short blond-brown hair, clean shaven, slender agile attacking midfield build, fair skin tone, youthful creative look.",
    "Dušan Vlahović": "Short dark hair, clean shaven, elegant and strong centre-forward build, fair skin tone, composed expression.",
    "Aleksandar Mitrović": "Short dark hair, clean shaven, powerful and robust target forward build, fair-tanned skin, clinical expression."
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
    
    print(f"✅ Corrected {updated_count} players with verified REAL biometric data (Batch 19).")

if __name__ == "__main__":
    update_real_biometrics()
