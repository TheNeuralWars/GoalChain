import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/players.json"

# Detailed Biometric Descriptions for Batch 5 & 6 (40 Players)
BIOMETRICS = {
    "Christian Pulisic": "Short dark hair, clean shaven, agile winger build, intense focused look, fair skin tone.",
    "Weston McKennie": "Short dark hair (often with a streak), clean shaven, strong box-to-box midfield build, energetic expression, dark skin tone.",
    "Gio Reyna": "Short dark hair, clean shaven, creative attacking build, youthful expression, fair skin tone.",
    "Folarin Balogun": "Short dark hair, clean shaven, clinical forward build, sharp expression, dark skin tone.",
    "Tyler Adams": "Short dark hair, clean shaven, tenacious defensive midfield build, intense look, dark skin tone.",
    "Santiago Giménez": "Short dark hair, clean shaven, clinical forward build, focused expression, fair-tanned skin.",
    "Hirving Lozano": "Short dark hair with fade, clean shaven, explosive winger build, dynamic expression, tanned skin.",
    "Edson Álvarez": "Short dark hair, clean shaven, strong defensive midfield build, intense look, tanned skin.",
    "Achraf Hakimi": "Short dark hair, clean shaven, explosive right-back build, dynamic expression, olive skin tone.",
    "Hakim Ziyech": "Short dark hair, light beard, creative right winger build, magical expression, olive skin tone.",
    "Sofyan Amrabat": "Short dark hair or shaved head, clean shaven, strong defensive midfield build, intense look, olive skin tone.",
    "Takefusa Kubo": "Short dark hair, clean shaven, technical right winger build, creative expression, light-tanned skin.",
    "Kaoru Mitoma": "Short dark hair, clean shaven, explosive left winger build, dynamic expression, light skin tone.",
    "Wataru Endō": "Short dark hair, clean shaven, strong defensive midfield build, composed look, light-tanned skin.",
    "Son Heung-min": "Short dark hair, clean shaven, explosive left winger build, iconic determined expression, light skin tone.",
    "Lee Kang-in": "Short dark hair, clean shaven, creative attacking midfield build, magical expression, light skin tone.",
    "Kim Min-jae": "Short dark hair, clean shaven, commanding centre-back build, intense leadership look, light skin tone.",
    "Sadio Mané": "Short dark hair, clean shaven, explosive forward build, dynamic expression, deep dark skin tone.",
    "Kalidou Koulibaly": "Short dark hair, clean shaven, commanding centre-back build, leadership expression, deep dark skin tone.",
    "Edouard Mendy": "Short dark hair, clean shaven, tall commanding goalkeeper build, focused look, deep dark skin tone.",
    "Idrissa Gueye": "Short dark hair, clean shaven, tenacious defensive midfield build, intense expression, dark skin tone.",
    "Nicolas Jackson": "Short dark hair, clean shaven, powerful forward build, clinical expression, dark skin tone.",
    "Pape Sarr": "Short dark hair, clean shaven, box-to-box midfield build, energetic expression, dark skin tone.",
    "Mathew Ryan": "Short dark hair, clean shaven, athletic goalkeeper build, focused look, fair skin tone.",
    "Harry Souttar": "Short dark hair, clean shaven, towering centre-back build, composed expression, fair skin tone.",
    "Jackson Irvine": "Short dark hair, clean shaven, strong box-to-box midfield build, leadership expression, fair skin tone.",
    "Craig Goodwin": "Short dark hair, clean shaven, versatile winger build, energetic expression, fair skin tone.",
    "Mitchell Duke": "Short dark hair, clean shaven, powerful target forward build, clinical expression, fair skin tone.",
    "Salem Al-Dawsari": "Short dark hair, clean shaven, creative left winger build, magical expression, olive skin tone.",
    "Firas Al-Buraikan": "Short dark hair, clean shaven, clinical forward build, focused expression, olive skin tone.",
    "Saleh Al-Shehri": "Short dark hair, clean shaven, versatile forward build, energetic expression, olive skin tone.",
    "Christian Eriksen": "Short dark hair, clean shaven, elegant attacking midfield build, masterful expression, fair skin tone.",
    "Rasmus Højlund": "Short dark hair, clean shaven, powerful forward build, clinical expression, fair skin tone.",
    "Kasper Schmeichel": "Short dark hair, clean shaven, experienced goalkeeper build, commanding look, fair skin tone.",
    "Pierre-Emile Højbjerg": "Short dark hair, clean shaven, strong defensive midfield build, tactical expression, fair skin tone.",
    "Joachim Andersen": "Short dark hair, clean shaven, towering centre-back build, composed leadership look, fair skin tone.",
    "Granit Xhaka": "Short dark hair, clean shaven, commanding central midfield build, leadership expression, fair skin tone.",
    "Yann Sommer": "Short dark hair, clean shaven, experienced goalkeeper build, focused look, fair skin tone.",
    "Manuel Akanji": "Short dark hair, clean shaven, strong centre-back build, composed leadership look, mixed skin tone.",
    "Xherdan Shaqiri": "Short dark hair, clean shaven, creative attacking midfield build, magical expression, fair skin tone."
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
