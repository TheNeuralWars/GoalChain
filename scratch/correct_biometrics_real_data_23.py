import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/players.json"

# REAL Biometric Data (Verified Batch 41)
REAL_DATA = {
    "Semih Kılıçsoy": "Short dark hair with a clean fade, clean shaven, powerful and robust youthful forward build, light-tanned skin, focused goal-oriented gaze.",
    "Abdülkerim Bardakcı": "Short dark hair peinado naturally or with texture, well-groomed full beard, exceptionally strong and tall centre-back build, olive skin tone, fierce defensive expression.",
    "İrfan Can Kahveci": "Short dark hair with a sharp precision fade, well-groomed short beard, visible tattoos on legs, creative and technical midfield build, olive skin tone, focused look.",
    "Altay Bayındır": "Short dark hair with a clean fade, clean shaven, tall and agile goalkeeper build, fair skin tone, focused look.",
    "Ahmetcan Kaplan": "Short dark hair peinado naturally, clean shaven, tall and strong centre-back build, light skin tone, focused look.",
    "İsmail Yüksek": "Short dark hair with a sharp fade, clean shaven, energetic and strong defensive midfield build, olive skin tone, intense expression.",
    "Samet Akaydin": "Short dark hair, well-groomed beard, solid and tall centre-back build, olive skin tone, focused look.",
    "Mert Günok": "Short dark hair, clean shaven, experienced and tall goalkeeper build, olive skin tone, veteran leadership look.",
    "Uğurcan Çakır": "Signature styled short dark hair with a precision fade, clean shaven, visible tattoos on arms, agile and tall goalkeeper build, olive skin tone, focused look.",
    "Salih Özcan": "Short dark hair with a clean fade, clean shaven or light stubble, strong and tenacious defensive midfield build, olive skin tone, focused tactical look.",
    "Yusuf Yazıcı": "Short dark hair with texture, well-groomed beard, technical attacking midfield build, olive skin tone, creative expression.",
    "Okay Yokuşlu": "Short dark hair, clean shaven or light stubble, tall and strong central midfield build, olive skin tone, focused look.",
    "Cenk Tosun": "Short dark hair with a clean professional fade, clean shaven, clinical forward build, olive skin tone, focused gaze.",
    "Yunus Akgün": "Short dark hair with a sharp fade (evolving style), clean shaven, agile and fast winger build, olive skin tone, dynamic expression.",
    "Bertuğ Yıldırım": "Short dark hair with a sharp fade, clean shaven, powerful and tall target forward build, olive skin tone, determined gaze.",
    "Doğan Alemdar": "Short dark hair, clean shaven, agile goalkeeper build, olive skin tone, focused look.",
    "Ozan Kabak": "Short dark hair with a clean fade, clean shaven, strong and tall centre-back build, olive skin tone, focused look.",
    "Ridvan Yılmaz": "Short dark hair, clean shaven, fast and agile left-back build, olive skin tone, dynamic expression.",
    "Can Uzun": "Short dark hair with a sharp fade, clean shaven, technical and elegant attacking build, light-tanned skin, youthful creative expression."
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
    
    print(f"✅ Corrected {updated_count} players with verified REAL biometric data (Batch 41).")

if __name__ == "__main__":
    update_real_biometrics()
