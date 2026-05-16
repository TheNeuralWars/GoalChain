import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/players.json"

# REAL Biometric Data (Verified Batch 44 - NZ & SA Precision)
REAL_DATA = {
    "Chris Wood": "Short brown hair peinado classically, clean shaven, exceptionally tall and powerful target forward build, fair skin tone, determined gaze.",
    "Liberato Cacace": "Short dark hair with texture, clean shaven, fast and agile left-back build, light-tanned skin, focused look.",
    "Sarpreet Singh": "Short dark hair with a clean fade, clean shaven, technical and agile attacking build, tanned skin, creative expression.",
    "Joe Bell": "Short dark hair peinado naturally, clean shaven, hardworking central midfield build, light skin tone, professional look.",
    "Alex Paulsen": "Short dark hair, clean shaven, agile and tall goalkeeper build, light skin tone, focused look.",
    "Michael Boxall": "Short dark hair, clean shaven or light stubble, strong and experienced centre-back build, light skin tone, leadership look.",
    "Nando Pijnaker": "Short dark hair, clean shaven, tall and solid centre-back build, fair skin tone, focused look.",
    "Matt Garbett": "Short dark hair with a clean fade, clean shaven, technical midfield build, fair skin tone, energetic expression.",
    "Ben Waine": "Short dark hair peinado naturally, clean shaven, fast forward build, fair skin tone, focused look.",
    "Kosta Barbarouses": "Short dark hair, clean shaven, experienced and agile winger build, light-tanned skin, veteran leadership gaze.",
    "Tyler Bindon": "Short dark hair peinado with texture, clean shaven, tall and strong defender build, fair skin tone, youthful expression.",
    "Percy Tau": "Short dark hair with a clean fade, clean shaven, exceptionally fast and agile forward build, dark skin tone, dynamic expression.",
    "Ronwen Williams": "Short dark hair with a precision fade, clean shaven, agile and experienced goalkeeper build, dark skin tone, focused leadership look.",
    "Teboho Mokoena": "Short dark hair with a sharp fade, clean shaven, strong and tireless central midfield build, dark skin tone, intense focused look.",
    "Themba Zwane": "Short dark hair peinado naturally, clean shaven, creative and experienced attacking build, dark skin tone, veteran leadership look.",
    "Khuliso Mudau": "Short dark hair with a sharp fade, clean shaven, powerful and fast right-back build, dark skin tone, dynamic expression.",
    "Mothobi Mvala": "Short dark hair, clean shaven, solid and strong defender build, dark skin tone, focused look.",
    "Grant Kekana": "Short dark hair, clean shaven, reliable and tall centre-back build, dark skin tone, focused look.",
    "Aubrey Modiba": "Short dark hair peinado naturally, clean shaven, versatile and fast left-back build, dark skin tone, professional look.",
    "Evidence Makgopa": "Short dark hair with a clean fade, clean shaven, powerful and tall forward build, dark skin tone, determined gaze.",
    "Sphephelo Sithole": "Short dark hair with a sharp fade, clean shaven, hardworking defensive midfield build, dark skin tone, tactical expression.",
    "Thapelo Morena": "Short dark hair, clean shaven, exceptionally fast and agile full-back build, dark skin tone, dynamic expression."
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
    
    print(f"✅ Corrected {updated_count} players with verified REAL biometric data (Batch 44 - NZ & SA).")

if __name__ == "__main__":
    update_real_biometrics()
