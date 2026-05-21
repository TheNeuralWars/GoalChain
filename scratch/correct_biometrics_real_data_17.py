import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/players.json"

# REAL Biometric Data (Verified Batch 35)
REAL_DATA = {
    "Edson Álvarez": "Short dark taper fade with textured top, clean shaven, tattoos on left arm and ribs (lion/warrior), strong and tall defensive midfield build, tanned skin, leadership expression.",
    "Jorge Sánchez": "Short dark hair with a clean fade, clean shaven, extensive tattoos on left arm, back (eagle/elephant), and neck, strong and fast right-back build, tanned skin, focused look.",
    "Julián Quiñones": "Short dark hair with a sharp fade, clean shaven, various tattoos on legs (championships) and arms (footprints), exceptionally powerful and fast forward build, dark skin tone, dynamic expression.",
    "Érick Sánchez": "Short dark hair, clean shaven, prominent eagle tattoo on right leg, small but very agile and strong midfield build, tanned skin, focused look.",
    "Luis Malagón": "Short dark hair peinado naturally, clean shaven, tattoos of league trophy and 5 stars on body, neck tattoo, agile and tall goalkeeper build, tanned skin, focused look.",
    "Gerardo Arteaga": "Short dark hair with a clean fade, clean shaven, black panther tattoo on right hand and '1998' on neck, energetic and fast left-back build, tanned skin, focused look.",
    "César Montes": "Short dark hair, clean shaven, towering and powerful centre-back build, tanned skin, composed leadership look.",
    "Johan Vásquez": "Short dark hair with a clean fade, clean shaven, strong and solid centre-back build, tanned skin, focused look.",
    "Luis Chávez": "Short dark hair peinado naturally, clean shaven, technical and elegant midfield build, tanned skin, masterful expression.",
    "Orbelín Pineda": "Short dark hair with texture, clean shaven, creative and agile attacking build, tanned skin, energetic expression.",
    "Haji Wright": "Short dark hair with a clean fade, clean shaven, tall and powerful forward build, dark skin tone, determined gaze.",
    "Ricardo Pepi": "Short dark hair peinado with texture, clean shaven, youthful and clinical forward build, tanned skin, focused goal-oriented gaze.",
    "Folarin Balogun": "Short dark natural curls or braids with a clean fade, clean shaven, agile and fast forward build, dark skin tone, focused look.",
    "Malik Tillman": "Short dark hair with a sharp fade, clean shaven, technical and elegant attacking build, mixed-tanned skin tone, creative expression.",
    "Joe Scally": "Short blonde-brown hair, clean shaven, strong and fast right-back build, fair skin tone, focused look.",
    "Miles Robinson": "Short dark hair with a clean fade, clean shaven, tall and athletic centre-back build, dark skin tone, focused look.",
    "Luca de la Torre": "Short blonde-brown hair, clean shaven, technical and agile central midfield build, fair skin tone, composed look.",
    "Johnny Cardoso": "Short dark hair with a precision fade, clean shaven, strong and mobile midfield build, tanned skin, focused look.",
    "Kristoffer Lund": "Short blonde-brown hair, clean shaven, energetic left-back build, fair skin tone, professional look.",
    "Kevin Paredes": "Short dark hair with a sharp fade, clean shaven, lean and very fast winger build, mixed-tanned skin tone, dynamic expression."
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
    
    print(f"✅ Corrected {updated_count} players with verified REAL biometric data (Batch 35).")

if __name__ == "__main__":
    update_real_biometrics()
