import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/players.json"

# Detailed Biometric Descriptions for Batch 7 & 8 (40 Players)
BIOMETRICS = {
    "Dušan Tadić": "Short dark hair, clean shaven, creative right winger build, masterful expression, fair-tanned skin.",
    "Aleksandar Mitrović": "Short dark hair, clean shaven, powerful target forward build, clinical expression, fair-tanned skin.",
    "Dušan Vlahović": "Short dark hair, clean shaven, elegant centre-forward build, composed expression, fair skin tone.",
    "Sergej Milinković-Savić": "Short dark hair, clean shaven, powerful central midfield build, dynamic expression, fair skin tone.",
    "Filip Kostić": "Short dark hair, clean shaven, explosive left winger build, energetic expression, fair skin tone.",
    "Vanja Milinković-Savić": "Short dark hair, clean shaven, towering goalkeeper build, commanding look, fair skin tone.",
    "Nikola Milenković": "Short dark hair, clean shaven, strong centre-back build, leadership expression, fair skin tone.",
    "Robert Lewandowski": "Short dark hair, clean shaven, clinical forward build, iconic focused expression, fair skin tone.",
    "Wojciech Szczęsny": "Short dark hair, clean shaven, tall experienced goalkeeper build, commanding look, fair skin tone.",
    "Piotr Zieliński": "Short dark hair, clean shaven, elegant central midfield build, creative expression, fair skin tone.",
    "Matty Cash": "Short dark hair, clean shaven, explosive right-back build, energetic expression, fair skin tone.",
    "Jakub Kiwior": "Short dark hair, clean shaven, strong centre-back build, composed look, fair skin tone.",
    "Oleksandr Zinchenko": "Short dark hair, clean shaven, versatile left-back build, technical expression, fair skin tone.",
    "Mykhailo Mudryk": "Short dark hair with fade, clean shaven, explosive left winger build, dynamic expression, fair skin tone.",
    "Artem Dovbyk": "Short dark hair, clean shaven, powerful target forward build, clinical expression, fair skin tone.",
    "Viktor Tsygankov": "Short dark hair, clean shaven, technical right winger build, creative expression, fair skin tone.",
    "Andriy Lunin": "Short dark hair, clean shaven, tall athletic goalkeeper build, focused look, fair skin tone.",
    "Hakan Çalhanoğlu": "Short dark hair, clean shaven, elegant attacking midfield build, masterful expression, olive skin tone.",
    "Arda Güler": "Short dark hair, clean shaven, technical attacking midfield build, prodigy expression, fair skin tone.",
    "Kenan Yıldız": "Short dark hair, clean shaven, powerful forward build, youthful clinical expression, fair skin tone.",
    "Barış Alper Yılmaz": "Short dark hair, clean shaven, explosive right winger build, dynamic expression, fair-tanned skin.",
    "Ferdi Kadıoğlu": "Short dark hair, clean shaven, versatile left-back build, energetic expression, fair skin tone.",
    "Andrew Robertson": "Short dark hair, clean shaven, explosive left-back build, leadership expression, fair skin tone.",
    "Scott McTominay": "Short dark hair, clean shaven, powerful box-to-box midfield build, intense expression, fair skin tone.",
    "John McGinn": "Short dark hair, clean shaven, strong central midfield build, leadership expression, fair skin tone.",
    "Billy Gilmour": "Short dark hair, clean shaven, technical central midfield build, composed expression, fair skin tone.",
    "Che Adams": "Short dark hair, clean shaven, clinical forward build, focused expression, mixed skin tone.",
    "Angus Gunn": "Short dark hair, clean shaven, athletic goalkeeper build, focused look, fair skin tone.",
    "Grant Hanley": "Short dark hair, clean shaven, strong centre-back build, leadership expression, fair skin tone.",
    "Kieran Tierney": "Short dark hair, clean shaven, versatile left-back build, energetic expression, fair skin tone.",
    "Callum McGregor": "Short dark hair, clean shaven, experienced central midfield build, leadership look, fair skin tone.",
    "Ryan Christie": "Short dark hair, clean shaven, creative attacking midfield build, energetic expression, fair skin tone.",
    "Lyndon Dykes": "Short dark hair, clean shaven, powerful target forward build, intense expression, fair skin tone.",
    "Sebastian Szymański": "Short dark hair, clean shaven, technical attacking midfield build, creative expression, fair skin tone.",
    "Nicola Zalewski": "Short dark hair with fade, clean shaven, agile left winger build, dynamic expression, fair skin tone.",
    "Karol Świderski": "Short dark hair, clean shaven, clinical forward build, focused expression, fair skin tone.",
    "Jan Bednarek": "Short dark hair, clean shaven, strong centre-back build, leadership expression, fair skin tone.",
    "Przemysław Frankowski": "Short dark hair, clean shaven, versatile right winger build, energetic expression, fair skin tone.",
    "Paweł Dawidowicz": "Short dark hair, clean shaven, solid centre-back build, focused look, fair skin tone.",
    "Vitaliy Mykolenko": "Short dark hair, clean shaven, solid left-back build, energetic expression, fair skin tone."
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
