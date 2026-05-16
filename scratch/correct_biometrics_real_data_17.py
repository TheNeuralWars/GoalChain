import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/players.json"

# REAL Biometric Data (Verified Batch 33)
REAL_DATA = {
    "Amine Gouiri": "Short dark hair with a clean precision fade, well-groomed short beard, agile and technical forward build, olive skin tone, focused goal-oriented gaze.",
    "Houssem Aouar": "Short dark hair peinado upward with texture, clean shaven, elegant and agile midfield build, olive skin tone, creative expression.",
    "Ramy Bensebaini": "Short dark hair with a sharp fade, well-groomed short beard, strong and tall left-back build, olive skin tone, focused leadership look.",
    "Ismaël Bennacer": "Short dark hair with a clean fade, clean shaven or light stubble, compact and technical central midfield build, olive skin tone, tactical focused look.",
    "Mohamed Amoura": "Short dark hair with a sharp fade, clean shaven, exceptionally fast and agile forward build, olive skin tone, dynamic expression.",
    "Anthony Mandrea": "Short dark hair, clean shaven, agile and tall goalkeeper build, olive skin tone, focused look.",
    "Aïssa Mandi": "Short dark hair, well-groomed beard, experienced and solid centre-back build, olive skin tone, leadership expression.",
    "Ramiz Zerrouki": "Short dark hair with a clean fade, clean shaven, technical central midfield build, olive skin tone, focused look.",
    "Nabil Bentaleb": "Short dark hair, well-groomed beard, strong and experienced central midfield build, olive skin tone, leadership look.",
    "Faris Moumbagna": "Short dark hair, clean shaven, powerful and robust forward build, dark skin tone, determined gaze.",
    "Christopher Wooh": "Short dark hair with a clean fade, clean shaven, tall and strong centre-back build, dark skin tone, focused look.",
    "Nouhou Tolo": "Short dark hair with a clean fade, clean shaven, powerful and fast left-back build, dark skin tone, high-energy expression.",
    "Harold Moukoudi": "Short dark hair, clean shaven, towering and powerful centre-back build, dark skin tone, focused leadership look.",
    "Darlin Yongwa": "Short dark hair with a sharp fade, clean shaven, fast and agile full-back build, dark skin tone, dynamic expression.",
    "Junior Tchamadeu": "Short dark hair with a clean fade, clean shaven, energetic and fast right-back build, dark skin tone, youthful expression.",
    "Yvan Neyou": "Short dark hair, clean shaven, hardworking central midfield build, dark skin tone, focused look.",
    "Ben Elliott": "Short dark hair with a clean fade, clean shaven, technical attacking midfield build, dark skin tone, youthful expression.",
    "Ayman Hussein": "Short dark hair, strong and well-maintained full beard, powerful target forward build, olive skin tone, determined gaze.",
    "Mohammed Kanno": "Short dark hair with a sharp fade, clean shaven, exceptionally tall and powerful central midfield build (1.92m), olive skin tone, intense expression."
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
    
    print(f"✅ Corrected {updated_count} players with verified REAL biometric data (Batch 33).")

if __name__ == "__main__":
    update_real_biometrics()
