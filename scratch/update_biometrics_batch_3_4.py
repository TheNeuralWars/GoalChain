import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/players.json"

# Detailed Biometric Descriptions for Batch 3 & 4 (40 Players)
BIOMETRICS = {
    "Pedri": "Short dark hair, clean shaven, elegant technical midfield build, youthful focused look, fair skin tone.",
    "Gavi": "Short dark hair, clean shaven, energetic box-to-box build, intense youthful look, fair skin tone.",
    "Joshua Kimmich": "Short dark hair, clean shaven, versatile midfield build, intense tactical look, fair skin tone.",
    "Bruno Fernandes": "Short dark hair, light well-kept beard, creative attacking midfield build, passionate expression, fair-tanned skin.",
    "Bernardo Silva": "Short dark hair, clean shaven, compact technical midfield build, intelligent expression, tanned skin.",
    "Rafael Leão": "Short dark hair with sharp fade, clean shaven, tall explosive forward build, dynamic expression, deep dark skin tone.",
    "Rúben Dias": "Short dark hair, clean shaven, strong commanding centre-back build, leadership look, tanned skin.",
    "Virgil van Dijk": "Short dark hair tied back or neatly styled, well-groomed beard, commanding centre-back build, leadership expression, tanned skin.",
    "Frenkie de Jong": "Short blonde-brown hair, clean shaven, elegant technical midfield build, composed expression, fair skin tone.",
    "Matthijs de Ligt": "Short blonde-brown hair, clean shaven, commanding centre-back build, intense leadership look, fair skin tone.",
    "Christian Pulisic": "Short dark hair, clean shaven, agile winger build, intense focused look, fair skin tone.",
    "Achraf Hakimi": "Short dark hair, clean shaven, explosive right-back build, dynamic expression, olive skin tone.",
    "Son Heung-min": "Short dark hair, clean shaven, explosive left winger build, iconic determined expression, light skin tone.",
    "Leroy Sané": "Short dark hair with fade, clean shaven, explosive winger build, dynamic expression, mixed-tanned skin tone.",
    "Jamal Musiala": "Short dark hair with fade, clean shaven, elegant tall athletic build, dynamic expression, mixed skin tone.",
    "Kai Havertz": "Short dark hair, clean shaven, tall elegant forward build, composed expression, fair skin tone.",
    "İlkay Gündoğan": "Short dark hair, light beard, experienced central midfield build, leadership look, olive skin tone.",
    "Antonio Rüdiger": "Short dark hair, clean shaven, powerful centre-back build, intense and fierce expression, deep dark skin tone.",
    "Marc-André ter Stegen": "Short dark hair, clean shaven, tall commanding goalkeeper build, focused look, fair skin tone.",
    "Florian Wirtz": "Short blond hair, clean shaven, slender agile attacking midfield build, youthful creative look, fair skin tone.",
    "Alisson Becker": "Short dark hair, thick well-kept beard, tall commanding goalkeeper build, fair-tanned skin, calm focused look.",
    "Casemiro": "Short dark hair, clean shaven, powerful defensive midfield build, commanding expression, tanned skin.",
    "Marquinhos": "Short dark hair, clean shaven, elegant centre-back build, leadership look, tanned skin.",
    "Éder Militão": "Short dark hair, clean shaven, athletic centre-back build, determined expression, dark skin tone.",
    "Danilo": "Short dark hair, clean shaven, experienced defensive build, tanned skin, professional look.",
    "Lucas Paquetá": "Short dark hair, clean shaven, technical attacking midfield build, creative expression, tanned skin.",
    "Endrick": "Short black curly hair, clean shaven, very powerful youthful muscular build, dark skin tone, determined prodigy look.",
    "Lamine Yamal": "Short black curly hair with fade, clean shaven, slim and elastic agile build, mixed-tanned skin tone, very youthful expression.",
    "Nico Williams": "Short dark hair with fade, clean shaven, explosive winger build, dark skin tone, dynamic expression.",
    "Unai Simón": "Short dark hair, clean shaven, tall athletic goalkeeper build, focused look, fair skin tone.",
    "Dani Carvajal": "Short dark hair, well-kept beard, athletic right-back build, intense expression, fair-tanned skin.",
    "Aymeric Laporte": "Short dark hair, clean shaven, tall strong centre-back build, calm focused look, fair skin tone.",
    "Alejandro Balde": "Short dark curly hair, clean shaven, agile athletic left-back build, youthful look, dark skin tone.",
    "Dani Olmo": "Short dark hair, clean shaven, technical attacking midfield build, creative expression, fair skin tone.",
    "Xavi Simons": "Short blonde-brown curly hair (often in braids or afro), clean shaven, creative attacking build, fair-tanned skin.",
    "Memphis Depay": "Short dark hair with fade, light beard, athletic forward build, confident expression, mixed skin tone.",
    "Cody Gakpo": "Short dark hair, clean shaven, tall elegant forward build, composed expression, mixed-tanned skin tone.",
    "Nathan Aké": "Short dark dreadlocks, clean shaven, versatile centre-back build, dark skin tone, focused look.",
    "Denzel Dumfries": "Short dark hair, clean shaven, explosive right-back build, powerful expression, dark skin tone.",
    "Matthijs de Ligt": "Short blonde-brown hair, clean shaven, commanding centre-back build, intense leadership look, fair skin tone."
}

def update_biometrics():
    with open(PLAYERS_FILE, 'r') as f:
        players = json.load(f)
    
    updated_count = 0
    for p in players:
        name = p.get("real_name")
        if name in BIOMETRICS:
            p["physical"]["t"] = BIOMETRICS[name]
            updated_count += 1
            
    with open(PLAYERS_FILE, 'w') as f:
        json.dump(players, f, indent=4, ensure_ascii=False)
    
    print(f"✅ Updated biometrics for {updated_count} players.")

if __name__ == "__main__":
    update_biometrics()
