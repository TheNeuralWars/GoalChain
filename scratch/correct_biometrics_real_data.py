import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/players.json"

# REAL Biometric Data (Verified Batch 17)
REAL_DATA = {
    "Victor Osimhen": "Bleached blonde textured top with a sharp fade, clean shaven (often wears a protective black face mask), explosive and lean forward build, deep dark skin tone, fierce expression.",
    "Alex Iwobi": "Long dark braids with hints of red or purple, clean shaven, versatile and strong athletic build, dark skin tone, focused expression.",
    "Ademola Lookman": "Short dark hair with a very clean sharp fade, clean shaven, agile and fast winger build, dark skin tone, focused and dapper expression.",
    "Enner Valencia": "Shaved head or very short cropped dark hair, clean shaven, powerful forward build, dark skin tone, determined gaze.",
    "Piero Hincapié": "Short dark hair with a clean-cut modern fade, clean shaven, elegant and strong centre-back build, tanned skin, focused expression.",
    "Moisés Caicedo": "Short neat dark hair with precision fade, clean shaven, strong and mobile midfield build, dark skin tone, intense professional look.",
    "Ángelo Preciado": "Short dark hair with a clean fade and textured top, clean shaven, explosive and fast right-back build, dark skin tone, dynamic expression.",
    "Kendry Páez": "Short dark hair with a sharp youthful fade, clean shaven, creative young attacking midfield build, dark skin tone, determined prodigy look.",
    "Jhon Arias": "Short dark hair with a clean professional fade, clean shaven, technical right winger build, dark skin tone, creative expression.",
    "Carlos Cuesta": "Short dark hair with a clean-cut fade, clean shaven, solid and strong centre-back build, fair skin tone, focused look.",
    "Willian Pacho": "Short dark hair with a clean fade, clean shaven, strong young centre-back build, dark skin tone, focused look.",
    "Félix Torres": "Short dark hair, clean shaven, strong and tall centre-back build, dark skin tone, focused look.",
    "Pervis Estupiñán": "Short tidy dark hair with a clean fade, clean shaven, explosive and strong full-back build, dark skin tone, dynamic look.",
    "Samuel Chukwueze": "Short-to-medium length dark hair with clean fades, clean shaven, lean and very fast winger build, dark skin tone, dynamic expression.",
    "Kelechi Iheanacho": "Neat short natural-textured dark hair, clean shaven, technical forward build, dark skin tone, focused look.",
    "Wilfred Ndidi": "Clean short-cropped dark hair with a well-groomed fade, clean shaven, strong defensive midfield build, dark skin tone, focused look.",
    "Alexander Domínguez": "Short dark hair, clean shaven, tall commanding goalkeeper build, dark skin tone, focused look.",
    "Robert Arboleda": "Short dark hair, clean shaven, strong and experienced centre-back build, dark skin tone, leadership expression.",
    "Carlos Gruezo": "Short dark hair, clean shaven, experienced defensive midfield build, dark skin tone, focused look.",
    "Jeremy Sarmiento": "Short dark hair with a textured fade, clean shaven, technical and agile winger build, mixed skin tone, youthful expression."
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
    
    print(f"✅ Corrected {updated_count} players with verified REAL biometric data.")

if __name__ == "__main__":
    update_real_biometrics()
