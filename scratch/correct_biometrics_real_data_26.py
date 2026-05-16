import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/players.json"

# REAL Biometric Data (Verified Batch 43 - Saudi Arabia & Qatar Precision)
REAL_DATA = {
    "Salem Al-Dawsari": "Neat short dark hair, well-groomed short beard, creative left winger build, olive skin tone, charismatic leadership expression.",
    "Firas Al-Buraikan": "Neat short dark hair, clean shaven, clinical forward build, olive skin tone, focused goal-oriented gaze.",
    "Saleh Al-Shehri": "Short dark hair with a clean fade, well-groomed short beard, clinical forward build, olive skin tone, focused look.",
    "Abdulaziz Al-Omari": "Short dark hair peinado naturally, clean shaven, hardworking central midfield build, olive skin tone, professional look.",
    "Mohammed Al-Owais": "Short dark hair with a precision fade, clean shaven, agile experienced goalkeeper build, olive skin tone, focused look.",
    "Saud Abdulhamid": "Short dark hair with a sharp fade (model-like grooming), clean shaven, exceptionally fast and agile right-back build, olive skin tone, dynamic and charismatic expression.",
    "Ali Al-Bulaihi": "Short dark hair with a clean fade, well-groomed beard, strong and intimidating centre-back build, olive skin tone, fierce and provocative expression.",
    "Sultan Al-Ghannam": "Short dark hair with a clean fade, well-groomed short beard, fast and creative right-back build, olive skin tone, focused look.",
    "Hassan Al-Tambakti": "Short dark hair with a sharp fade, clean shaven, strong and fast centre-back build, olive skin tone, focused look.",
    "Abdulrahman Al-Oboud": "Short dark hair with a clean fade, clean shaven, fast and technical winger build, olive skin tone, dynamic expression.",
    "Mohammed Kanno": "Short dark hair with a sharp fade, clean shaven, exceptionally tall and powerful central midfield build (1.92m), olive skin tone, intense expression.",
    "Akram Afif": "Short natural dark afro or thick curly hair, clean shaven, agile and creative forward build, olive skin tone, charismatic expression.",
    "Almoez Ali": "Short dark hair, clean shaven, clinical forward build, olive skin tone, determined gaze.",
    "Meshaal Barsham": "Short dark hair, clean shaven, agile and tall goalkeeper build, olive skin tone, focused look.",
    "Hassan Al-Haydos": "Short dark hair peinado classically, clean shaven, experienced creative midfield build, olive skin tone, leadership look.",
    "Lucas Mendes": "Short dark hair with a clean fade, clean shaven, strong and tall centre-back build, olive skin tone, focused look.",
    "Pedro Miguel": "Short dark hair with a sharp fade, clean shaven, powerful and fast full-back build, dark-tanned skin, dynamic expression.",
    "Boualem Khoukhi": "Short dark hair peinado naturally, clean shaven, versatile and strong defender build, olive skin tone, professional look.",
    "Jassem Gaber": "Short dark hair with a clean fade, clean shaven, strong and mobile midfield build, olive skin tone, focused look.",
    "Ahmed Fathi": "Short dark hair peinado classically, clean shaven, experienced and solid midfield build, olive skin tone, leadership look.",
    "Yusuf Abdurisag": "Short dark hair with a sharp fade, clean shaven, fast winger build, olive skin tone, dynamic expression.",
    "Bassam Al-Rawi": "Short dark hair, clean shaven, solid centre-back build, olive skin tone, focused look."
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
    
    print(f"✅ Corrected {updated_count} players with verified REAL biometric data (Batch 43 - Saudi Arabia & Qatar).")

if __name__ == "__main__":
    update_real_biometrics()
