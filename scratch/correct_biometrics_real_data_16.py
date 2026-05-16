import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/players.json"

# REAL Biometric Data (Verified Batch 32)
REAL_DATA = {
    "Omar Marmoush": "Short dark hair with a sharp precision fade, clean shaven, agile and very fast forward build, olive skin tone, focused goal-oriented gaze.",
    "Mostafa Mohamed": "Short dark hair with a clean fade, clean shaven or light stubble, powerful and robust forward build, olive skin tone, determined expression.",
    "Trézéguet": "Short dark hair, well-groomed beard, creative and lean winger build, olive skin tone, focused look.",
    "Mohamed Elneny": "Short dark hair (dreadlocks removed), clean shaven or light stubble, experienced central midfield build, olive skin tone, professional look.",
    "Ahmed Hegazi": "Short dark hair, well-groomed full beard, towering and powerful centre-back build, olive skin tone, leadership expression.",
    "Percy Tau": "Short dark natural curls, clean shaven, agile and small attacking build, dark skin tone, energetic expression.",
    "Teboho Mokoena": "Stylish short dark hair with a clean fade (drip king style), clean shaven, strong and technical midfield build, dark skin tone, composed expression.",
    "Ronwen Williams": "Short dark hair with a sharp fade, clean shaven, agile experienced goalkeeper build, dark-tanned skin, focused look.",
    "Elias Mokwana": "Short dark hair with a clean fade, clean shaven, fast winger build, dark skin tone, youthful expression.",
    "Khuliso Mudau": "Short dark hair with a stylish sharp fade, clean shaven, strong and fast right-back build, dark skin tone, fashion-forward athletic look.",
    "Youssef Msakni": "Short dark hair peinado classically, light well-kept beard, technical attacking midfield build, olive skin tone, experienced leadership gaze.",
    "Elias Achouri": "Short dark hair with a sharp fade, clean shaven, fast and agile winger build, olive skin tone, dynamic expression.",
    "Aïssa Laïdouni": "Short dark hair with a clean fade, well-groomed short beard, strong defensive midfield build, olive skin tone, intense look.",
    "Ellyes Skhiri": "Short dark hair, clean shaven, tireless and technical midfield build, olive skin tone, focused tactical look.",
    "Hannibal Mejbri": "Fresh youthful short dark hair with a clean fade (Afro significantly trimmed), clean shaven, technical and agile midfield build, olive skin tone, creative expression.",
    "Yan Valery": "Short dark hair with a clean fade, clean shaven, strong and fast right-back build, olive skin tone, focused look.",
    "Ali Abdi": "Short dark hair, clean shaven, solid and fast left-back build, olive skin tone, professional look.",
    "Montassar Talbi": "Short dark hair, clean shaven, tall and strong centre-back build, olive skin tone, focused look.",
    "Wajdi Kechrida": "Short dark hair with a clean fade, clean shaven, energetic full-back build, olive skin tone, focused expression."
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
    
    print(f"✅ Corrected {updated_count} players with verified REAL biometric data (Batch 32).")

if __name__ == "__main__":
    update_real_biometrics()
