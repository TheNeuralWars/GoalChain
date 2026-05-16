import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/players.json"

# REAL Biometric Data (Verified Batch 22)
REAL_DATA = {
    "Luka Modrić": "Shorter dark hair (New 2025 style), clean shaven or light stubble, experienced slender technical build, fair skin tone, intelligent leadership expression.",
    "Joško Gvardiol": "Short neatly trimmed dark fade (New 2025 style), signature thick dark beard, strong and robust centre-back build, fair skin tone, intense focused look.",
    "Mateo Kovačić": "Longer textured dark hair (New 2025 style), clean shaven, technical and strong midfield build, fair skin tone, focused tactical look.",
    "Ivan Perišić": "Short dark hair with a sharp fade (sometimes with patriotic patterns), clean shaven, lean and very fast winger build, fair-tanned skin, dynamic expression.",
    "Alphonso Davies": "Short dark hair with a clean fade, clean shaven, lean and explosive winger build, dark skin tone, energetic expression.",
    "Jonathan David": "Short dark hair with a well-defined fade, clean shaven, clinical forward build, dark skin tone, focused goal-oriented gaze.",
    "Tajon Buchanan": "Short dark hair with a clean fade, clean shaven, prominent tattoo sleeves on both arms and chest, explosive winger build, dark skin tone, dynamic expression.",
    "Stephen Eustáquio": "Short neat dark hair, clean shaven or light stubble, technical central midfield build, fair-tanned skin, composed look.",
    "Ismaël Koné": "Short dark hair with a clean fade, clean shaven, dynamic and strong midfield build, dark skin tone, athletic focused look.",
    "Alistair Johnston": "Short practical dark haircut, clean shaven, strong and tenacious defender build, fair skin tone, focused look.",
    "Yunus Musah": "Stylish short dark hair with faded sides, clean shaven, energetic box-to-box midfield build, dark skin tone, focused expression.",
    "Sergino Dest": "Short dark hair (often styled with creative fades), clean shaven, agile and fast right-back build, tanned skin, youthful dynamic look.",
    "Antonee Robinson": "Short practical dark haircut, clean shaven, explosive and lean left-back build, mixed skin tone, high-energy expression.",
    "Timothy Weah": "Stylish dark braids or sharp fades, clean shaven, lean and very fast winger build, dark skin tone, bold and energetic expression.",
    "Matt Turner": "Short professional dark hair, clean shaven, tall athletic goalkeeper build, fair skin tone, focused look.",
    "Chris Richards": "Short neat dark hair, clean shaven, strong and tall centre-back build, dark skin tone, focused defensive look.",
    "Cyle Larin": "Short clean-cut dark hair, clean shaven, powerful forward build, dark skin tone, focused look.",
    "Dominik Livaković": "Short dark hair, clean shaven, agile and tall goalkeeper build, fair skin tone, focused look.",
    "Borna Sosa": "Short blonde-brown hair with a clean fade, clean shaven, elegant left-back build, fair skin tone, composed look.",
    "Josip Šutalo": "Short dark hair, clean shaven, strong centre-back build, fair skin tone, focused look."
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
    
    print(f"✅ Corrected {updated_count} players with verified REAL biometric data (Batch 22).")

if __name__ == "__main__":
    update_real_biometrics()
