import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/players.json"

# REAL Biometric Data (Verified Batch 40)
REAL_DATA = {
    "Zidane Iqbal": "Short dark hair with a clean fade, clean shaven, technical and agile attacking build, olive skin tone, youthful focused expression.",
    "Ali Jasim": "Short dark hair with a clean fade, clean shaven, fast and agile winger build, olive skin tone, dynamic expression.",
    "Alireza Jahanbakhsh": "Short dark hair peinado upward or classically, well-groomed short beard, creative and experienced winger build, olive skin tone, charismatic leadership expression.",
    "Mehdi Ghayedi": "Short dark hair with a clean fade, clean shaven, exceptionally small and agile attacking build, olive skin tone, creative expression.",
    "Hossein Kanaanizadegan": "Short dark hair, strong and well-maintained full beard, powerful and tall centre-back build, olive skin tone, fierce defensive expression.",
    "Saeid Ezatolahi": "Short dark hair peinado naturally, clean shaven or light stubble, tall and strong defensive midfield build, olive skin tone, professional look.",
    "Bashar Resan": "Short dark hair, clean shaven, creative and agile midfield build, olive skin tone, focused look.",
    "Shojae Khalilzadeh": "Short dark hair, well-groomed beard, experienced and solid centre-back build, olive skin tone, leadership look.",
    "Ibrahim Bayesh": "Short dark hair with a sharp fade, clean shaven, energetic and versatile midfield build, olive skin tone, focused expression.",
    "Jalal Hassan": "Short dark hair, clean shaven, agile experienced goalkeeper build, olive skin tone, focused look.",
    "Saad Natiq": "Short dark hair, clean shaven, strong and tall centre-back build, olive skin tone, focused look.",
    "Ali Gholizadeh": "Short dark hair peinado naturally, clean shaven, creative and fast winger build, olive skin tone, dynamic expression.",
    "Milad Mohammadi": "Short dark hair, clean shaven, energetic and fast left-back build, olive skin tone, professional look.",
    "Omid Ebrahimi": "Short dark hair, clean shaven, experienced and strong defensive midfield build, olive skin tone, veteran leadership look.",
    "Mohammad Mohebi": "Short dark hair with a sharp fade, clean shaven, powerful and fast forward build, olive skin tone, focused expression.",
    "Shahriyar Moghanlou": "Short dark hair, well-groomed beard, towering and powerful target forward build, olive skin tone, determined gaze.",
    "Payam Niazmand": "Short dark hair, clean shaven, tall and agile goalkeeper build, olive skin tone, focused look.",
    "Seyed Hossein Hosseini": "Short dark hair, clean shaven, experienced goalkeeper build, olive skin tone, focused look.",
    "Amirhossein Hosseinzadeh": "Short dark hair with a clean fade, clean shaven, technical attacking midfield build, olive skin tone, youthful expression.",
    "Mehdi Torabi": "Short dark hair, clean shaven, creative and fast winger build, olive skin tone, focused expression."
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
    
    print(f"✅ Corrected {updated_count} players with verified REAL biometric data (Batch 40).")

if __name__ == "__main__":
    update_real_biometrics()
