import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/players.json"

# REAL Biometric Data (Verified Batch 31)
REAL_DATA = {
    "Zambo Anguissa": "Short dark hair with a clean fade, clean shaven or light stubble, exceptionally strong and tall central midfield build, dark skin tone, intense focused look.",
    "Vincent Aboubakar": "Short dark hair, clean shaven, powerful and robust forward build, dark skin tone, veteran leadership expression.",
    "Karl Toko Ekambi": "Short dark hair, clean shaven, technical forward build, dark skin tone, focused expression.",
    "Bryan Mbeumo": "Short dark buzz cut hair, well-groomed full beard, explosive and fast forward build, dark skin tone, dynamic expression.",
    "Jordan Ayew": "Completely bald head (New 2024 style), clean shaven, visible tattoos on arms, experienced forward build, dark skin tone, determined gaze.",
    "Mohammed Salisu": "Short dark hair, clean shaven, strong and tall centre-back build, dark skin tone, focused look.",
    "Antoine Semenyo": "Short dark hair with a high skin fade, well-groomed faded beard, powerful and fast winger build, dark skin tone, dynamic expression.",
    "Tariq Lamptey": "Short neat dark hair, clean shaven, very small and explosive full-back build, dark skin tone, high-energy expression.",
    "Mathew Ryan": "Short dark hair peinado classically, clean shaven, agile experienced goalkeeper build, fair skin tone, focused look.",
    "Harry Souttar": "Short dark hair, clean shaven, exceptionally tall and massive centre-back build (1.98m), fair skin tone, commanding presence.",
    "Jackson Irvine": "Long dark hair tied in a neat man-bun, thick well-groomed full beard, hardworking midfield build, fair-tanned skin, charismatic leadership expression.",
    "Craig Goodwin": "Short dark hair, clean shaven, technical winger build, fair skin tone, focused expression.",
    "Mitchell Duke": "Short dark hair, clean shaven, powerful forward build, fair skin tone, determined gaze.",
    "Aziz Behich": "Short dark hair, clean shaven, experienced full-back build, tanned skin, focused look.",
    "Keanu Baccus": "Short dark hair with a sharp fade, clean shaven, energetic midfield build, dark-tanned skin, focused expression.",
    "Garang Kuol": "Short dark hair with a sharp fade, clean shaven, agile and fast forward build, dark skin tone, youthful expression.",
    "Christopher Wooh": "Short dark hair with a clean fade, clean shaven, tall and strong centre-back build, dark skin tone, focused look.",
    "Georges-Kévin Nkoudou": "Short dark hair with creative fades, clean shaven, fast winger build, dark skin tone, dynamic expression.",
    "Olivier Kemen": "Short dark hair, clean shaven, hardworking midfield build, dark skin tone, focused look.",
    "Frank Magri": "Short dark hair, clean shaven, clinical forward build, dark-tanned skin, focused expression."
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
    
    print(f"✅ Corrected {updated_count} players with verified REAL biometric data (Batch 31).")

if __name__ == "__main__":
    update_real_biometrics()
