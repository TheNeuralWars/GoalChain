import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/players.json"

# REAL Biometric Data (Verified Batch 37)
REAL_DATA = {
    "Kostas Tsimikas": "Short dark hair with texture or occasionally braids, clean shaven, notable tattoos on hands and arms including a tribute piece, agile and fast left-back build, olive skin tone, dynamic expression.",
    "Vangelis Pavlidis": "Short dark hair with a clean fade, well-groomed short beard, strong and powerful forward build, olive skin tone, focused goal-oriented gaze.",
    "Konstantinos Mavropanos": "Short dark practical haircut, clean shaven or light stubble, towering and intimidating centre-back build, olive skin tone, fierce defensive expression.",
    "Anastasios Bakasetas": "Short dark hair peinado upward with texture, well-groomed short beard, creative and strong midfield build, olive skin tone, leadership look.",
    "Odysseas Vlachodimos": "Short dark hair peinado classically, clean shaven, agile and tall goalkeeper build, olive skin tone, focused look.",
    "Tomáš Souček": "Short dark hair peinado naturally, clean shaven, exceptionally tall and robust midfield build (1.92m), fair skin tone, professional look.",
    "Adam Hložek": "Short castaño hair peinado with texture, clean shaven, lion tattoo on left thigh and '2022' on right leg, youthful and strong attacking build, fair skin tone, focused look.",
    "Ladislav Krejčí": "Short dark hair, clean shaven, versatile and strong defender/midfielder build, fair skin tone, leadership expression.",
    "Vladimír Coufal": "Short dark disciplined haircut, clean shaven, hardworking and fast right-back build, fair skin tone, determined gaze.",
    "David Jurásek": "Short dark hair with a clean fade, clean shaven, energetic left-back build, fair skin tone, focused look.",
    "Kevin Danso": "Short dark hair with a sharp precision fade, clean shaven, strong and tall centre-back build, dark skin tone, focused look.",
    "Philipp Lienhart": "Short dark hair peinado naturally, clean shaven, solid centre-back build, fair skin tone, focused look.",
    "Nicolas Seiwald": "Short dark practical hair, clean shaven, energetic and hardworking midfield build, fair skin tone, professional look.",
    "Xaver Schlager": "Short blonde hair peinado with gel (ponytail removed in 2024), clean shaven, intense and strong central midfield build, fair skin tone, energetic expression.",
    "Michael Gregoritsch": "Short dark hair, clean shaven, tall and powerful target forward build, fair skin tone, focused gaze.",
    "Stefan Posch": "Short dark hair with a clean fade, clean shaven, solid and fast defender build, fair skin tone, focused look.",
    "Patrick Wimmer": "Short dark hair with a textured fade, clean shaven, creative and agile winger build, fair skin tone, dynamic expression.",
    "Romano Schmid": "Short dark hair, clean shaven, agile and technical attacking build, fair skin tone, focused expression.",
    "Florian Grillitsch": "Short dark hair peinado naturally, clean shaven, elegant and strong central midfield build, fair skin tone, professional look.",
    "Phillipp Mwene": "Short dark hair with a clean fade, clean shaven, energetic and fast full-back build, mixed skin tone, focused look."
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
    
    print(f"✅ Corrected {updated_count} players with verified REAL biometric data (Batch 37).")

if __name__ == "__main__":
    update_real_biometrics()
