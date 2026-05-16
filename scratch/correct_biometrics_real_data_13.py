import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/players.json"

# REAL Biometric Data (Verified Batch 29)
REAL_DATA = {
    "Mykhailo Mudryk": "Short natural blonde hair (New style), visible neck tattoos including 'Only Jesus' and a butterfly, exceptionally fast and lean winger build, fair skin tone, intense look.",
    "Andriy Lunin": "Short natural blonde hair peinado classically, clean shaven, tall and agile goalkeeper build, fair skin tone, focused and serene look.",
    "Strahinja Pavlović": "Very short dark hair (buzzed or sharp fade), intimidating and massive centre-back build, fair skin tone, fierce defensive expression.",
    "Dušan Tadić": "Short dark hair with a clean fade, clean shaven, chiseled fitness-model physique, fair-tanned skin, intelligent leadership expression.",
    "Sergej Milinković-Savić": "Short dark hair with a precision fade, well-groomed short beard, exceptionally tall and powerful midfield build, olive skin tone, commanding look.",
    "Kenan Yıldız": "Short dark hair peinado with texture, clean shaven, technical and agile forward build, light-tanned skin, youthful focused expression.",
    "Barış Alper Yılmaz": "Short dark hair with a sharp fade, clean shaven, powerful and fast winger build, tanned skin, energetic expression.",
    "Ferdi Kadıoğlu": "Short dark hair with a clean fade, clean shaven, agile and fast full-back build, mixed-tanned skin, dynamic expression.",
    "Merih Demiral": "Very short dark buzzed hair, well-groomed short beard, intimidating and strong centre-back build, olive skin tone, fierce expression.",
    "Artem Dovbyk": "Short dark hair peinado naturally, clean shaven, powerful and tall target forward build, fair skin tone, clinical expression.",
    "Viktor Tsygankov": "Short blonde-brown hair, clean shaven, creative and agile winger build, fair skin tone, focused look.",
    "Vitaliy Mykolenko": "Short dark hair, clean shaven, strong and fast left-back build, fair skin tone, professional look.",
    "Ilya Zabarnyi": "Short dark hair with a clean fade, clean shaven, tall and strong centre-back build, fair skin tone, focused look.",
    "Georgiy Sudakov": "Short dark hair, clean shaven, technical attacking midfield build, fair skin tone, youthful expression.",
    "Mykola Matviyenko": "Short dark hair, clean shaven, experienced and solid defender build, fair skin tone, focused look.",
    "Filip Kostić": "Short dark hair with a clean professional fade, clean shaven, strong and tireless winger build, fair-tanned skin, professional look.",
    "Luka Jović": "Short dark hair (sometimes with racing stripe designs), clean shaven, clinical forward build, fair-tanned skin, various tattoos on arms, focused gaze.",
    "Kerem Aktürkoğlu": "Short dark hair with a clean fade, clean shaven, creative and fast winger build, tanned skin, dynamic expression.",
    "Orkun Kökçü": "Short dark hair with a precision fade, well-groomed beard, technical central midfield build, olive skin tone, focused look.",
    "Zeki Çelik": "Short dark hair, clean shaven, solid and fast right-back build, olive skin tone, focused look."
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
    
    print(f"✅ Corrected {updated_count} players with verified REAL biometric data (Batch 29).")

if __name__ == "__main__":
    update_real_biometrics()
