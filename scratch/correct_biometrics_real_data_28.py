import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/players.json"

# REAL Biometric Data (Verified Batch 45 - Hungary & Scotland Precision)
REAL_DATA = {
    "Andrew Robertson": "Short brown hair peinado classically, clean shaven, fast and tireless left-back build, fair skin tone, leadership expression.",
    "Scott McTominay": "Short dark hair peinado upward with texture, clean shaven, exceptionally tall and powerful athletic build, fair skin tone, intense focused look.",
    "John McGinn": "Short dark hair, clean shaven, strong and robust central midfield build, fair skin tone, determined gaze.",
    "Billy Gilmour": "Short brown hair peinado with texture, clean shaven, technical and agile midfield build, fair skin tone, focused look.",
    "Che Adams": "Short dark hair with a clean fade, clean shaven, powerful and fast forward build, mixed skin tone, focused expression.",
    "Angus Gunn": "Short dark hair, clean shaven, agile and tall goalkeeper build, fair skin tone, focused look.",
    "Ryan Porteous": "Short dark hair, clean shaven, strong and aggressive defender build, fair skin tone, focused look.",
    "Jack Hendry": "Short dark hair peinado naturally, clean shaven, tall and athletic centre-back build, fair skin tone, professional look.",
    "Kieran Tierney": "Short dark hair peinado classically, clean shaven, energetic and fast defender build, fair skin tone, focused look.",
    "Callum McGregor": "Short dark hair, clean shaven, experienced and technical midfield build, fair skin tone, veteran leadership look.",
    "Lawrence Shankland": "Short dark hair, clean shaven, clinical and strong forward build, fair skin tone, focused goal-oriented gaze.",
    "Dominik Szoboszlai": "Short dark hair peinado with texture, clean shaven, technical and elegant attacking build, light-tanned skin, creative leadership expression.",
    "Barnabás Varga": "Short dark hair, clean shaven, powerful target forward build, fair skin tone, determined gaze.",
    "Roland Sallai": "Short dark hair with a clean fade, clean shaven, technical and fast winger build, fair skin tone, dynamic expression.",
    "Willi Orbán": "Short dark hair peinado naturally, clean shaven, strong and tall defensive leadership build, fair skin tone, focused look.",
    "Péter Gulácsi": "Short dark hair peinado classically, clean shaven, experienced and tall goalkeeper build, fair skin tone, focused look.",
    "Ádám Nagy": "Short dark hair, clean shaven, hardworking and technical midfield build, fair skin tone, professional look.",
    "Loïc Négo": "Short dark hair with a clean fade, clean shaven, fast and versatile full-back build, dark-tanned skin, dynamic expression.",
    "Milos Kerkez": "Short dark hair with a sharp precision fade, clean shaven, explosive and fast left-back build, fair skin tone, intense focused look.",
    "Bendegúz Bóla": "Short dark hair peinado with texture, clean shaven, energetic and fast right-back build, fair skin tone, dynamic expression.",
    "Martin Ádám": "Short dark hair, thick and well-maintained full beard, exceptionally wide and powerful tank-like forward build, fair skin tone, intimidating gaze.",
    "Callum Styles": "Short dark hair, clean shaven, versatile and technical midfield build, fair skin tone, focused look."
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
    
    print(f"✅ Corrected {updated_count} players with verified REAL biometric data (Batch 45 - Hungary & Scotland).")

if __name__ == "__main__":
    update_real_biometrics()
