import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/players.json"

# REAL Biometric Data (Verified Batch 36)
REAL_DATA = {
    "Mauro Icardi": "Bright blonde hair styled upright (New 2026 look), exceptionally extensive tattoos covering torso (wolf head/forest/Archangel), well-groomed beard, powerful forward build, fair skin tone, intense look.",
    "Piero Hincapié": "Short dark hair with a clean fade, clean shaven, visible faith-based tattoos including a cross behind the ear and 'God is Love', strong and fast centre-back build, tanned skin, focused look.",
    "Lucas Torreira": "Short dark hair with a sharp fade, well-groomed beard, prominent tattoos on neck and arms, compact and tenacious defensive midfield build, olive skin tone, intense focused expression.",
    "Edin Džeko": "Short dark hair styled classically, clean shaven, tall and powerful target forward build, fair skin tone, experienced leadership expression.",
    "Willian Pacho": "Short dark hair with a clean fade, clean shaven, strong and tall athletic centre-back build, dark skin tone, professional focused look.",
    "Kendry Páez": "Short dark hair with a clean fade, clean shaven, lean and very agile attacking build, tanned skin, youthful creative expression.",
    "Angelo Preciado": "Short dark hair with braids or defined natural curls, clean shaven, exceptionally fast and agile right-back build, dark skin tone, dynamic expression.",
    "Félix Torres": "Short dark hair, clean shaven, strong and tall centre-back build, dark skin tone, focused look.",
    "Jhoanner Chávez": "Short dark hair with a sharp fade, clean shaven, fast and energetic left-back build, dark skin tone, dynamic expression.",
    "Jeremy Sarmiento": "Short dark hair with a textured fade, clean shaven, technical and fast winger build, tanned skin, creative expression.",
    "Moisés Caicedo": "Short dark hair with a clean fade, clean shaven, tireless and strong central midfield build, dark skin tone, intense focused look.",
    "Pervis Estupiñán": "Short dark hair with a sharp fade, clean shaven, explosive and fast left-back build, dark skin tone, dynamic expression.",
    "Enner Valencia": "Short dark hair, clean shaven, experienced and agile forward build, dark skin tone, veteran leadership gaze.",
    "Victor Nelsson": "Very short natural blonde hair, well-groomed short blonde beard, solid and strong centre-back build, fair skin tone, focused look.",
    "Davinson Sánchez": "Short dark hair with a clean fade, clean shaven, tall and powerful centre-back build, dark skin tone, focused look.",
    "Gedson Fernandes": "Short dark natural curls with a sharp fade, clean shaven, energetic and technical midfield build, dark skin tone, dynamic expression.",
    "Ernest Muçi": "Short dark hair with a clean fade, clean shaven, technical attacking midfield build, light skin tone, focused look.",
    "Milot Rashica": "Short dark hair with a precision fade, well-groomed beard, fast and creative winger build, fair skin tone, focused expression.",
    "Ante Rebić": "Short dark hair, clean shaven or light stubble, powerful and fast winger build, fair skin tone, intense expression.",
    "Carlos Gruezo": "Short dark hair, clean shaven, experienced and strong defensive midfield build, dark skin tone, professional look."
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
    
    print(f"✅ Corrected {updated_count} players with verified REAL biometric data (Batch 36).")

if __name__ == "__main__":
    update_real_biometrics()
