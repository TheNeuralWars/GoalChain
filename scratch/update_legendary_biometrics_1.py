import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/players.json"

# Detailed Biometric Descriptions for Batch 2 (Legendaries 1-20)
BIOMETRICS = {
    "Julián Álvarez": "Short dark brown hair, clean shaven, youthful but focused expression, compact athletic build, light skin tone.",
    "Enzo Fernández": "Short dark hair, clean shaven, intense competitive gaze, strong midfield athletic build, fair-tanned skin.",
    "Ángel Di María": "Short dark hair, clean shaven, angular facial features, very lean and agile athletic build, tanned skin.",
    "Cristian Romero": "Short dark hair, clean shaven, intimidating defensive expression, strong and robust athletic build, light skin tone.",
    "Ousmane Dembélé": "Short black hair with side fade, clean shaven, lean and elastic athletic build, deep dark skin tone, dynamic expression.",
    "Eduardo Camavinga": "Short black dreadlocks, clean shaven, versatile and strong athletic build, dark skin tone, youthful intense look.",
    "Mike Maignan": "Very short black hair, clean shaven, tall and powerful commanding goalkeeper build, deep dark skin tone, focused expression.",
    "Aurélien Tchouaméni": "Short black hair with fade, clean shaven, imposing muscular midfield build, dark skin tone, determined look.",
    "William Saliba": "Short black hair, clean shaven, tall elegant centre-back build, dark skin tone, calm focused expression.",
    "Jules Koundé": "Short black braids or creative fade style, well-groomed light beard, agile and stylish athletic build, dark-tanned skin.",
    "Phil Foden": "Very short blond-brown hair with straight fringe, clean shaven, compact and fast attacking build, fair skin tone.",
    "Bukayo Saka": "Short black hair with natural curls fade, clean shaven, agile winger build, dark skin tone, energetic expression.",
    "Declan Rice": "Short dark brown hair styled upwards, clean shaven, tall and strong midfield build, fair skin tone, commanding look.",
    "John Stones": "Short brown hair styled, clean shaven, elegant lean centre-back build, fair skin tone, composed expression.",
    "Luke Shaw": "Short brown hair, clean shaven, robust and powerful full-back build, fair skin tone, intense expression.",
    "Rodrygo Goes": "Short black hair with fade, clean shaven, agile and lean forward build, tanned skin, youthful focused expression.",
    "Danilo": "Short black hair, clean shaven or light stubble, experienced defensive build, tanned skin, professional look.",
    "Endrick": "Short black curly hair, clean shaven, very powerful youthful muscular build, dark skin tone, determined prodigy look.",
    "Lamine Yamal": "Short black curly hair with fade, clean shaven, slim and elastic agile build, mixed-tanned skin tone, very youthful expression.",
    "Antoine Griezmann": "Short platinum blonde or natural hair, light well-kept beard, agile forward build, fair skin tone, experienced charismatic look."
}

def update_biometrics():
    with open(PLAYERS_FILE, 'r') as f:
        players = json.load(f)
    
    updated_count = 0
    for p in players:
        name = p.get("real_name")
        if name in BIOMETRICS:
            # Update the Trait (t) field
            p["physical"]["t"] = BIOMETRICS[name]
            updated_count += 1
            
    with open(PLAYERS_FILE, 'w') as f:
        json.dump(players, f, indent=4, ensure_ascii=False)
    
    print(f"✅ Updated biometrics for {updated_count} Legendaries.")

if __name__ == "__main__":
    update_biometrics()
