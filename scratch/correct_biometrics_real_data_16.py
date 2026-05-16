import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/players.json"

# REAL Biometric Data (Verified Batch 34)
REAL_DATA = {
    "Christian Kouamé": "Short dark hair with a clean fade, clean shaven, significant tattoo on back (AFCON trophy and elephant), agile and fast forward build, dark skin tone, focused look.",
    "Simon Adingra": "Short dark hair with a precision fade, clean shaven, lean and very fast winger build, dark skin tone, dynamic expression.",
    "Ousmane Diomande": "Short dark hair with a clean fade, clean shaven, strong and tall athletic centre-back build, dark skin tone, focused leadership look.",
    "Evan Ndicka": "Short dark hair with a clean fade, clean shaven, towering and powerful centre-back build (1.92m), dark skin tone, leadership expression.",
    "Bertrand Traoré": "Short dark hair naturally styled, clean shaven or light stubble, technical and experienced winger build, dark skin tone, leadership gaze.",
    "Dango Ouattara": "Short dark hair with a sharp fade, clean shaven, explosive and lean winger build, dark skin tone, dynamic expression.",
    "Hervé Koffi": "Short dark hair with a clean fade, clean shaven, agile and athletic goalkeeper build, dark skin tone, focused look.",
    "Blati Touré": "Short dark hair, clean shaven, hardworking central midfield build, dark skin tone, focused look.",
    "Diadié Samassékou": "Short dark hair, clean shaven, tenacious defensive midfield build, dark skin tone, tactical expression.",
    "Oumar Diakité": "Short dark hair with a clean fade, clean shaven, powerful and fast forward build, dark skin tone, determined gaze.",
    "Odilon Kossounou": "Short dark hair with a sharp fade, clean shaven, tall and strong centre-back build, dark skin tone, focused look.",
    "Wilfried Singo": "Short dark hair with a clean fade, clean shaven, powerful and fast right-back build, dark skin tone, dynamic expression.",
    "Yahia Fofana": "Short dark hair, clean shaven, agile goalkeeper build, dark skin tone, focused look.",
    "Ghislain Konan": "Short dark hair, clean shaven, energetic left-back build, dark skin tone, professional look.",
    "Serge Aurier": "Short dark hair with creative fades, well-groomed beard, experienced and strong right-back build, dark skin tone, leadership expression.",
    "Max Gradel": "Short dark hair, clean shaven, experienced and technical winger build, dark skin tone, veteran leadership expression.",
    "Jonathan Bamba": "Short dark hair with a clean fade, clean shaven, technical and agile winger build, dark skin tone, focused look.",
    "Jeremie Boga": "Short dark hair with a sharp fade, clean shaven, technical and very fast winger build, dark skin tone, creative expression.",
    "Jean-Philippe Krasso": "Short dark hair, clean shaven, clinical forward build, dark skin tone, focused goal-oriented gaze."
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
    
    print(f"✅ Corrected {updated_count} players with verified REAL biometric data (Batch 34).")

if __name__ == "__main__":
    update_real_biometrics()
