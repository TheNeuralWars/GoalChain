import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/players.json"

# REAL Biometric Data (Verified Batch 30)
REAL_DATA = {
    "Piotr Zieliński": "Short dark hair peinado naturally, clean shaven, technical and elegant midfield build, fair skin tone, masterful expression.",
    "Matty Cash": "Short dark hair with a sharp angular fade, clean shaven, athletic and fast right-back build, fair-tanned skin, focused look.",
    "Nicola Zalewski": "Short dark hair with texture, clean shaven, large tattoo on back, youthful and agile attacking build, fair skin tone, creative expression.",
    "Miloš Kerkez": "Angular dark mullet with shaved sides (New 2025 style), clean shaven, explosive and aggressive full-back build, fair skin tone, intense look.",
    "John McGinn": "Short dark hair, clean shaven, no tattoos, exceptionally robust physique (very strong legs and glutes), fair-tanned skin, determined expression.",
    "Billy Gilmour": "Short dark hair, well-groomed beard (New 2026 mature look), technical and agile central midfield build, fair skin tone, composed expression.",
    "Kieran Tierney": "Short dark hair, clean shaven, tenacious and strong left-back build, fair skin tone, intense focused gaze.",
    "Che Adams": "Short dark controlled haircut, clean shaven or light stubble, powerful and robust forward build, tanned skin, focused goal-oriented gaze.",
    "Sebastian Szymański": "Short dark hair with a clean fade, clean shaven, creative and fast attacking build, fair skin tone, focused look.",
    "Jakub Kiwior": "Short dark hair with a clean-cut fade, clean shaven, strong and tall centre-back build, fair skin tone, professional look.",
    "Przemysław Frankowski": "Short dark hair, clean shaven, tireless and fast winger build, fair skin tone, focused expression.",
    "Karol Świderski": "Short dark hair, clean shaven, hardworking forward build, fair skin tone, determined look.",
    "Willi Orbán": "Well-groomed classic dark hair, clean shaven, commanding and powerful centre-back build, fair skin tone, leadership look.",
    "Barnabás Varga": "Short dark hair, clean shaven, clinical forward build, fair skin tone, focused goal-oriented gaze.",
    "Roland Sallai": "Short dark hair with a clean fade, clean shaven, technical and fast winger build, fair skin tone, focused look.",
    "Ádám Nagy": "Short dark hair, clean shaven, hardworking central midfield build, fair skin tone, professional look.",
    "Callum McGregor": "Short dark hair, clean shaven, experienced and technical central midfield build, fair skin tone, leadership expression.",
    "Ryan Christie": "Short dark hair, clean shaven, numerous arm tattoos including a prominent cherry design, creative and agile attacking build, fair skin tone, focused look.",
    "Anthony Ralston": "Short practical dark haircut, clean shaven, strong and dependable defender build, fair skin tone, focused look.",
    "Loïc Négo": "Short dark hair with a sharp fade, clean shaven, fast and agile full-back build, dark skin tone, dynamic expression."
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
    
    print(f"✅ Corrected {updated_count} players with verified REAL biometric data (Batch 30).")

if __name__ == "__main__":
    update_real_biometrics()
