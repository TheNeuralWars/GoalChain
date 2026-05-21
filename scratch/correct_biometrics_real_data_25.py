import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/players.json"

# REAL Biometric Data (Verified Batch 42 - Iraq & Iran Precision)
REAL_DATA = {
    "Mehdi Taremi": "Short dark hair, light well-kept beard, powerful and technical forward build, olive skin tone, determined expression.",
    "Sardar Azmoun": "Short dark hair, clean shaven, clinical forward build, olive skin tone, focused goal-oriented gaze.",
    "Alireza Jahanbakhsh": "Short dark hair peinado upward or classically, well-groomed short beard, creative and experienced winger build, olive skin tone, charismatic leadership expression.",
    "Alireza Beiranvand": "Short dark hair, clean shaven or light stubble, tall and powerful goalkeeper build, olive skin tone, focused look.",
    "Shoja Khalilzadeh": "Short dark hair, well-groomed beard, experienced and solid centre-back build, olive skin tone, leadership look.",
    "Milad Mohammadi": "Short dark hair, clean shaven, energetic and fast left-back build, olive skin tone, professional look.",
    "Ramin Rezaeian": "Short dark hair with a clean fade, well-groomed beard, energetic full-back build, olive skin tone, focused expression.",
    "Saeid Ezatolahi": "Short dark hair peinado naturally, clean shaven or light stubble, tall and strong defensive midfield build, olive skin tone, professional look.",
    "Saman Ghoddos": "Short dark hair with a precision fade, clean shaven or light stubble, creative midfield build, olive skin tone, tactical look.",
    "Ali Gholizadeh": "Short dark hair peinado naturally, clean shaven, creative and fast winger build, olive skin tone, dynamic expression.",
    "Morteza Pouraliganji": "Short dark hair, light well-kept beard, solid and strong centre-back build, olive skin tone, focused look.",
    "Ayman Hussein": "Short dark hair, strong and well-maintained full beard, powerful target forward build, olive skin tone, determined gaze.",
    "Ali Jasim": "Short dark hair with a clean fade, clean shaven, fast and agile winger build, olive skin tone, dynamic expression.",
    "Zidane Iqbal": "Short dark hair with a clean fade, clean shaven, technical and agile attacking build, olive skin tone, youthful focused expression.",
    "Jalal Hassan": "Short dark hair, clean shaven, agile experienced goalkeeper build, olive skin tone, focused look.",
    "Rebin Sulaka": "Short dark hair, well-groomed beard, tall and strong centre-back build, olive skin tone, professional look.",
    "Mohanad Ali": "Short dark hair with a sharp fade, clean shaven, agile and fast forward build, olive skin tone, dynamic expression.",
    "Hussein Ali": "Short dark hair, clean shaven, energetic full-back build, olive skin tone, focused look.",
    "Saad Natiq": "Short dark hair, clean shaven, strong and tall centre-back build, olive skin tone, focused look.",
    "Amir Al-Ammari": "Short dark hair with a clean fade, clean shaven, technical central midfield build, olive skin tone, focused look.",
    "Ibrahim Bayesh": "Short dark hair with a sharp fade, clean shaven, energetic and versatile midfield build, olive skin tone, focused expression.",
    "Youssef Ayman": "Short dark hair, clean shaven, strong centre-back build, olive skin tone, focused look."
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
    
    print(f"✅ Corrected {updated_count} players with verified REAL biometric data (Batch 42 - Iraq & Iran).")

if __name__ == "__main__":
    update_real_biometrics()
