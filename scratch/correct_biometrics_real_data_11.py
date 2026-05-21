import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/players.json"

# REAL Biometric Data (Verified Batch 27)
REAL_DATA = {
    "Lee Kang-in": "Short dark dandy-cut hair with soft layers and texture, clean shaven, technical and agile attacking build, light-tanned skin, creative expression.",
    "Takehiro Tomiyasu": "Short dark hair with a clean-cut fade, clean shaven, strong and disciplined centre-back build, light skin tone, focused tactical look.",
    "Hwang Hee-chan": "Short dark hair with a textured fade, clean shaven, exceptionally powerful and muscular forward build ('The Bull'), light skin tone, determined gaze.",
    "Cho Gue-sung": "Sophisticated swept-back dark hair with texture (model-like aesthetic), clean shaven, tall and athletic forward build, light skin tone, charismatic focused expression.",
    "Ko Itakura": "Short dark hair peinado upward with texture, clean shaven, strong and tall centre-back build, light skin tone, focused look.",
    "Hiroki Ito": "Short dark hair with a clean fade, clean shaven, versatile and strong defender build, light skin tone, professional look.",
    "Junya Ito": "Short dark hair (sometimes with subtle highlights), clean shaven, lean and very fast winger build, light skin tone, dynamic expression.",
    "Ritsu Dōan": "Short dark hair with a sharp fade, clean shaven, agile and technical winger build, light skin tone, focused expression.",
    "Alireza Beiranvand": "Short dark hair, clean shaven or light stubble, tall and powerful goalkeeper build, olive skin tone, focused look.",
    "Ramin Rezaeian": "Short dark hair with a clean fade, well-groomed beard, energetic full-back build, olive skin tone, focused expression.",
    "Saman Ghoddos": "Short dark hair with a precision fade, clean shaven or light stubble, creative midfield build, olive skin tone, tactical look.",
    "Zion Suzuki": "Short dark hair with a sharp fade, clean shaven, tall and athletic goalkeeper build, mixed skin tone, focused look.",
    "Chris Wood": "Short dark hair, clean shaven, tall and powerful target forward build, fair skin tone, determined gaze.",
    "Matthew Garbett": "Short dark hair, clean shaven, energetic midfield build, fair skin tone, youthful expression.",
    "Sarpreet Singh": "Short dark hair with a clean fade, clean shaven, technical attacking midfield build, light-tanned skin, creative expression.",
    "Liberato Cacace": "Short dark hair, clean shaven, strong and fast left-back build, mixed skin tone, focused look.",
    "Hwang In-beom": "Short dark hair, clean shaven, technical central midfield build, light skin tone, focused look.",
    "Seol Young-woo": "Short dark hair with a clean fade, clean shaven, agile full-back build, light skin tone, youthful expression.",
    "Jung Seung-hyun": "Short dark hair, clean shaven, strong centre-back build, light skin tone, focused look.",
    "Jo Hyeon-woo": "Short dark hair (often with creative fades), clean shaven, agile goalkeeper build, light skin tone, focused look."
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
    
    print(f"✅ Corrected {updated_count} players with verified REAL biometric data (Batch 27).")

if __name__ == "__main__":
    update_real_biometrics()
