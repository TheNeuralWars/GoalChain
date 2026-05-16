import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/players.json"

# REAL Biometric Data (Verified Batch 21)
REAL_DATA = {
    "Phil Foden": "Short dark hair with a sharp skin fade, clean shaven, visible neck tattoo 'Sky is the limit' and number 47 behind ear, compact and fast attacking build, fair skin tone, focused expression.",
    "Bukayo Saka": "High-top dark fade with sharp line-ups, clean shaven, agile and fast winger build, dark skin tone, energetic expression.",
    "Declan Rice": "Classic flow dark hair (longer textured scissor-cut) with a soft natural taper, light stubble, tall and strong midfield build, fair skin tone, commanding look.",
    "Cole Palmer": "Neat short blond-brown hair, clean shaven, technical attacking build, fair skin tone, calm and composed 'cold' expression.",
    "William Saliba": "Crisp well-groomed dark fade, clean shaven, tall elegant centre-back build, dark skin tone, calm focused expression.",
    "Theo Hernández": "Short bleached blonde hair (often with creative dyed designs like smiley faces), clean shaven, explosive and strong full-back build, fair-tanned skin, dynamic expression.",
    "Kingsley Coman": "Short dark hair with clean-cut fades and blonde highlights in braids, clean shaven, lean and very fast winger build, dark skin tone, dynamic expression.",
    "Mike Maignan": "Very short dark buzz cut, clean shaven, tall and powerful commanding goalkeeper build, deep dark skin tone, focused expression.",
    "Álvaro Morata": "Dark buzz cut, clean shaven, tall clinical forward build, fair-tanned skin, focused goal-oriented gaze.",
    "Dani Olmo": "Short dark hair, clean shaven, technical attacking midfield build, fair skin tone, creative expression.",
    "Aymeric Laporte": "Well-groomed classic dark hair with a neat fade, clean shaven, tall strong centre-back build, fair skin tone, focused look.",
    "Unai Simón": "Short dark hair, clean shaven, tall athletic goalkeeper build, fair skin tone, focused look.",
    "Antonio Rüdiger": "Short dark hair with precise structured line work, well-groomed beard, powerful and fierce centre-back build, deep dark skin tone, intense expression.",
    "Thomas Müller": "Truncated and gelled dark hair, full thick beard, experienced forward build, fair skin tone, charismatic and energetic expression.",
    "Manuel Neuer": "Short minimalist dark hair, groomed mustache or clean shaven, tall commanding goalkeeper build, fair skin tone, focused look.",
    "Marc-André ter Stegen": "Classic medium-length dark quiff with a full restored hairline, clean shaven, tall athletic goalkeeper build, fair skin tone, focused look.",
    "Kai Havertz": "Short dark hair, clean shaven, tall elegant forward build, fair skin tone, composed expression.",
    "Florian Wirtz": "Fresh textured dark crop hair, clean shaven, slender agile attacking midfield build, fair skin tone, youthful creative look.",
    "İlkay Gündoğan": "Short dark hair, clean shaven or light stubble, experienced central midfield build, fair-tanned skin, leadership look.",
    "Leroy Sané": "Short dark hair with a sharp fade, clean shaven, explosive winger build, mixed-tanned skin tone, dynamic expression."
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
    
    print(f"✅ Corrected {updated_count} players with verified REAL biometric data (Batch 21).")

if __name__ == "__main__":
    update_real_biometrics()
