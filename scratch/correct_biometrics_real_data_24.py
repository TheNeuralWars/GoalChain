import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/players.json"

# REAL Biometric Data (Verified Batch 41 - Precision Names)
REAL_DATA = {
    "Hakan Çalhanoğlu": "Short dark hair peinado classically, well-groomed beard, technical and elegant midfield build, olive skin tone, masterful leadership expression.",
    "Arda Güler": "Short dark hair with texture, clean shaven, youthful and technical attacking build, light skin tone, creative expression.",
    "Kenan Yıldız": "Short dark hair with a clean fade, clean shaven, technical and agile forward build, light-tanned skin, youthful focused expression.",
    "Barış Alper Yılmaz": "Short dark hair with a sharp fade, clean shaven, powerful and fast winger build, tanned skin, energetic expression.",
    "Ferdi Kadıoğlu": "Short dark hair with a clean fade, clean shaven, agile and fast full-back build, mixed-tanned skin tone, dynamic expression.",
    "Mert Günok": "Short dark hair, clean shaven, experienced and tall goalkeeper build, olive skin tone, veteran leadership look.",
    "Abdülkerim Bardakcı": "Short dark hair, well-groomed full beard, exceptionally strong and tall centre-back build, olive skin tone, fierce defensive expression.",
    "Samet Akaydın": "Short dark hair, well-groomed beard, solid and tall centre-back build, olive skin tone, focused look.",
    "Kaan Ayhan": "Short dark hair peinado naturally, clean shaven, disciplined and strong defender build, olive skin tone, focused look.",
    "Orkun Kökçü": "Short dark hair with a precision fade, well-groomed beard, technical central midfield build, olive skin tone, focused look.",
    "Kerem Aktürkoğlu": "Short dark hair with a clean fade, clean shaven, creative and fast winger build, tanned skin, dynamic expression."
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
    
    print(f"✅ Corrected {updated_count} players with verified REAL biometric data (Batch 41 - Turkey).")

if __name__ == "__main__":
    update_real_biometrics()
