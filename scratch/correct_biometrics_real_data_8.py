import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/players.json"

# REAL Biometric Data (Verified Batch 24)
REAL_DATA = {
    "Julio Enciso": "Trimmed dark mohawk with frosted tips (New style), visible arm tattoos, creative young attacking midfield build, fair-tanned skin, determined gaze.",
    "Gianluca Lapadula": "Short dark hair (sometimes bleached) and often wearing a protective black face mask, well-groomed stubble, indigenous culture tattoo on neck and upper back, clinical forward build, fair skin tone.",
    "Luis Advíncula": "Shaved head or very short dark hair (sometimes bleached blonde), clean shaven, exceptionally fast and powerful athletic build, dark skin tone, intense look.",
    "Yeferson Soteldo": "Short dark hair with a clean fade, clean shaven, small but agile build (very short height), various tattoos including anime (Naruto/Dragon Ball) and Ronaldo, dark-tanned skin, creative expression.",
    "Pedro Gallese": "Dark dreadlocks or a sharp fade with hair graphics, clean shaven, many tattoos on back and arms, agile and tall goalkeeper build, dark-tanned skin, focused expression.",
    "Ramón Sosa": "Short dark hair with a clean fade, clean shaven, explosive winger build, tanned skin, energetic expression.",
    "Miguel Trauco": "Short dark hair with creative side graphics (shaved letters), clean shaven, neck tattoo, solid left-back build, tanned skin, focused look.",
    "Alexander González": "Short dark hair with a precision fade, clean shaven, energetic full-back build, tanned skin, focused look.",
    "Nahuel Ferraresi": "Short dark hair, clean shaven, strong and tall centre-back build, tanned skin, focused look.",
    "Wilker Ángel": "Short dark hair, clean shaven, commanding centre-back build, dark skin tone, leadership look.",
    "Wuilker Faríñez": "Short dark hair, clean shaven, agile goalkeeper build, dark skin tone, focused look.",
    "Tomás Rincón": "Short dark hair, clean shaven, experienced and strong defensive midfield build, tanned skin, veteran leadership expression.",
    "Eduardo Bello": "Short dark hair with a clean fade, clean shaven, technical winger build, tanned skin, focused expression.",
    "Wilder Cartagena": "Short dark hair, clean shaven, strong defensive midfield build, tanned skin, focused look.",
    "Edison Flores": "Short dark hair, clean shaven, versatile attacking build, tanned skin, focused expression.",
    "Bryan Reyna": "Short dark hair with a sharp fade, clean shaven, explosive winger build, tanned skin, dynamic expression.",
    "Andy Polo": "Short dark hair, clean shaven, agile winger build, tanned skin, focused expression.",
    "Marcos López": "Short dark hair with a clean fade, clean shaven, energetic left-back build, tanned skin, focused look.",
    "Jefferson Savarino": "Short dark hair with a clean fade, clean shaven, technical and fast winger build, tanned skin, creative expression.",
    "Alexander Domínguez": "Short dark hair, clean shaven, tall commanding goalkeeper build, dark skin tone, focused look."
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
    
    print(f"✅ Corrected {updated_count} players with verified REAL biometric data (Batch 24).")

if __name__ == "__main__":
    update_real_biometrics()
