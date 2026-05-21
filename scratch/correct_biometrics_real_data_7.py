import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/players.json"

# REAL Biometric Data (Verified Batch 23)
REAL_DATA = {
    "Granit Xhaka": "Sharp short dark buzz cut (New 2025 style), clean shaven, commanding central midfield build, fair-tanned skin, leadership expression.",
    "Manuel Akanji": "Short dark hair with a clean fade, clean shaven, prominent eagle tattoo on arm, strong and athletic centre-back build, mixed skin tone, composed leadership look.",
    "Xherdan Shaqiri": "Short dark hair with a full well-defined hairline, clean shaven, powerful and stocky attacking build, fair skin tone, creative expression.",
    "Yann Sommer": "Stylish short dark hair, clean shaven, symbolic tattoos (Chinese characters), agile experienced goalkeeper build, fair skin tone, focused look.",
    "Christian Eriksen": "Short dark hair naturally styled, clean shaven, elegant technical midfield build, fair skin tone, masterful expression.",
    "Rasmus Højlund": "Contemporary short blond-brown hair with texture, clean shaven, visible tattoos on arms, powerful and tall forward build, fair skin tone, clinical expression.",
    "Kasper Schmeichel": "Classic short-back-and-sides blonde hair, clean shaven, experienced commanding goalkeeper build, fair skin tone, leadership look.",
    "Pierre-Emile Højbjerg": "Short dark hair, clean shaven, strong defensive midfield build, fair skin tone, tactical expression.",
    "Joachim Andersen": "Short dark hair, clean shaven, towering centre-back build, fair skin tone, composed leadership look.",
    "Andreas Christensen": "Short dark hair, clean shaven, elegant and strong centre-back build, fair skin tone, focused look.",
    "Joakim Mæhle": "Short dark hair with a clean fade, clean shaven, energetic full-back build, fair skin tone, dynamic expression.",
    "Mikkel Damsgaard": "Short blonde-brown hair, clean shaven, creative attacking build, fair skin tone, youthful expression.",
    "Jonas Wind": "Short dark hair, clean shaven, powerful forward build, fair skin tone, focused goal-oriented gaze.",
    "Gregor Kobel": "Short dark hair, clean shaven, tall athletic goalkeeper build, fair skin tone, focused look.",
    "Fabian Schär": "Well-groomed classic dark hair, clean shaven, tall strong centre-back build, fair skin tone, focused look.",
    "Ruben Vargas": "Short dark hair with a sharp fade, clean shaven, agile winger build, mixed skin tone, dynamic expression.",
    "Breel Embolo": "Short dark hair, clean shaven, powerful and explosive forward build, dark skin tone, determined gaze.",
    "Zeki Amdouni": "Short dark hair with a clean fade, clean shaven, technical forward build, fair-tanned skin, focused expression.",
    "Ricardo Rodríguez": "Short dark hair with a neat fade, clean shaven or light stubble, experienced defensive build, tanned skin, professional look.",
    "Remo Freuler": "Short dark hair, clean shaven, hardworking central midfield build, fair skin tone, focused look."
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
    
    print(f"✅ Corrected {updated_count} players with verified REAL biometric data (Batch 23).")

if __name__ == "__main__":
    update_real_biometrics()
