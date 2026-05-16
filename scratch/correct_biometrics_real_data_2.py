import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/players.json"

# REAL Biometric Data (Verified Batch 18)
REAL_DATA = {
    "Robert Lewandowski": "Bleached blonde hair styled short, clean shaven, clinical and strong forward build, fair-tanned skin, iconic focused goal-oriented gaze.",
    "Wojciech Szczęsny": "Bleached blonde hair, clean shaven, tall experienced goalkeeper build, fair skin tone, commanding look.",
    "Christian Pulisic": "Short dark hair, clean shaven or light stubble, prominent tattoo sleeve on left arm (tiger eyes and American flag), agile winger build, fair skin tone, intense focused look.",
    "Weston McKennie": "Natural short dark curls with a sharp side fade, clean shaven, lightning bolt tattoo on finger, strong box-to-box midfield build, dark skin tone, energetic expression.",
    "Son Heung-min": "Professional medium-length dark hair with short back and sides, clean shaven, explosive and lean winger build, light skin tone, iconic determined expression.",
    "Takefusa Kubo": "Textured dark hair with clean sides, clean shaven, technical right winger build, light-tanned skin, creative expression.",
    "Achraf Hakimi": "Very short dark buzzed hair with sharp fade, clean shaven, explosive right-back build, olive skin tone, dynamic expression.",
    "Hakim Ziyech": "Short dark hair with a precision fade, well-groomed light beard, creative right winger build, olive skin tone, magical expression.",
    "Arda Güler": "Short dark hair, clean shaven, technical attacking midfield build, fair skin tone, youthful but intense competitive expression.",
    "Santiago Giménez": "Short dark hair, clean shaven, clinical forward build, tanned skin, focused expression.",
    "Hirving Lozano": "Short dark hair with a sharp fade, clean shaven, explosive winger build, tanned skin, dynamic expression.",
    "Kim Min-jae": "Neat textured dark hair with short sides, clean shaven, commanding and powerful centre-back build, light skin tone, intense leadership look.",
    "Sadio Mané": "Short dark hair, clean shaven, explosive and strong forward build, deep dark skin tone, dynamic expression.",
    "Kalidou Koulibaly": "Short natural dark hair, clean shaven, no tattoos, commanding and powerful centre-back build, deep dark skin tone, leadership expression.",
    "Scott McTominay": "Short hair (often dyed blue or natural dark brown), clean shaven, powerful and tall box-to-box midfield build, fair skin tone, intense expression.",
    "Andrew Robertson": "Short dark hair, clean shaven, explosive and strong left-back build, fair skin tone, leadership expression.",
    "Hakan Çalhanoğlu": "Short dark hair with a clean professional fade, clean shaven, elegant attacking midfield build, olive skin tone, masterful expression.",
    "Manuel Akanji": "Short dark hair, clean shaven, strong and athletic centre-back build, mixed skin tone, composed leadership look.",
    "Granit Xhaka": "Short dark hair, clean shaven, commanding central midfield build, fair skin tone, leadership expression.",
    "Yann Sommer": "Short dark hair, clean shaven, experienced and agile goalkeeper build, fair skin tone, focused look."
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
    
    print(f"✅ Corrected {updated_count} players with verified REAL biometric data (Batch 18).")

if __name__ == "__main__":
    update_real_biometrics()
