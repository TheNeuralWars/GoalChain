import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/players.json"

# REAL Biometric Data (Verified Batch 20)
REAL_DATA = {
    "Emiliano Martínez": "Short dark hair (often with creative graphics/stars on the side), clean shaven, visible World Cup tattoo on left leg, tall commanding goalkeeper build, fair skin tone, alert expression.",
    "Julián Álvarez": "Short dark hair with a classic fade and textured top, clean shaven, compact and strong athletic build, fair skin tone, youthful but focused look.",
    "Enzo Fernández": "Mid-skin burst fade with a sharp lineup, clean shaven, extensive tattoos including a prominent lion, strong midfield build, fair-tanned skin, intense competitive gaze.",
    "Rodrigo De Paul": "Short dark hair with textured top styled back, clean shaven or light stubble, many tattoos, elegant but strong midfield build, fair-tanned skin, passionate expression.",
    "Alexis Mac Allister": "Very short dark buzz cut, distinctive reddish well-kept beard, technical central midfield build, fair skin tone, intelligent expression.",
    "Cristian Romero": "Short dark hair with a clean fade, clean shaven, intimidating defensive expression, strong and robust athletic build, fair-tanned skin.",
    "Lisandro Martínez": "Shaggier and looser dark hairstyle, clean shaven, aggressive warrior expression, compact and strong centre-back build, fair skin tone.",
    "Nahuel Molina": "Short dark hair with a clean professional fade, clean shaven, agile and fast right-back build, fair skin tone, focused look.",
    "Nicolás Tagliafico": "Short dark hair, clean shaven, versatile and strong left-back build, fair skin tone, professional look.",
    "Rodrygo Goes": "Slickback burst fade dark hair, clean shaven, agile and lean forward build, tanned skin, youthful focused expression.",
    "Bruno Guimarães": "Slickback burst fade dark hair, clean shaven, strong box-to-box midfield build, tanned skin, energetic expression.",
    "Casemiro": "Short dark hair with a clean fade, clean shaven, powerful and commanding defensive midfield build, tanned skin, leadership look.",
    "Marquinhos": "Short dark hair with a precision fade, clean shaven or light stubble, elegant centre-back build, tanned skin, leadership look.",
    "Éder Militão": "Short dark hair with a sharp fade or short braids, clean shaven, athletic and strong centre-back build, dark skin tone, determined expression.",
    "Endrick": "Styled natural dark curls with a sharp mid-skin fade, clean shaven, exceptionally powerful muscular build (strong legs), dark skin tone, determined prodigy look.",
    "Alisson Becker": "Short dark hair, thick well-groomed beard, tall commanding goalkeeper build, fair-tanned skin, calm focused look.",
    "Lucas Paquetá": "Textured dark crop hair with a clean fade, clean shaven, technical attacking midfield build, tanned skin, creative expression.",
    "Gabriel Magalhães": "Thick well-defined dark hairline (short hair), clean shaven, strong and tall centre-back build, dark skin tone, focused leadership look.",
    "Gabriel Martinelli": "Short dark hair with a sharp fade, clean shaven, lean and very fast winger build, tanned skin, dynamic expression.",
    "Douglas Luiz": "Short dark curly hair with a clean fade, clean shaven, strong central midfield build, tanned skin, focused look."
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
    
    print(f"✅ Corrected {updated_count} players with verified REAL biometric data (Batch 20).")

if __name__ == "__main__":
    update_real_biometrics()
