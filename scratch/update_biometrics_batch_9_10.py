import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/players.json"

# Detailed Biometric Descriptions for Batch 9 & 10 (40 Players)
BIOMETRICS = {
    "Alexis Sánchez": "Short dark hair, clean shaven, agile and muscular forward build, tanned skin, intense competitive expression.",
    "Arturo Vidal": "Short dark hair with iconic mohawk and side patterns, thick beard, hyper-muscular and tattooed build, tanned skin, fierce expression.",
    "Luis Díaz": "Short dark hair with fade, clean shaven, lean and very fast athletic build, tanned skin, focused dynamic look.",
    "James Rodríguez": "Short dark hair styled, clean shaven, elegant technical midfield build, fair-tanned skin, charismatic expression.",
    "Enner Valencia": "Short dark hair, clean shaven, powerful forward build, dark skin tone, determined gaze.",
    "Moisés Caicedo": "Short dark hair, clean shaven, strong and mobile midfield build, dark skin tone, intense focused look.",
    "Miguel Almirón": "Short dark hair, clean shaven, lean and very fast winger build, fair skin tone, energetic expression.",
    "Paolo Guerrero": "Short dark hair, well-kept beard, experienced powerful striker build, tanned skin, veteran leadership expression.",
    "Salomón Rondón": "Short dark hair, clean shaven, massive powerful target forward build, tanned skin, intimidating presence.",
    "Riyad Mahrez": "Short dark hair with sharp fade, clean shaven or light stubble, technical and lean winger build, olive skin tone, creative expression.",
    "Ismaël Bennacer": "Short dark hair, clean shaven, compact central midfield build, olive skin tone, focused tactical look.",
    "Franck Kessié": "Short dark hair, clean shaven, powerful muscular midfield build, dark skin tone, commanding presence.",
    "Sébastien Haller": "Short dark hair, clean shaven, tall and strong target forward build, mixed skin tone, composed expression.",
    "Victor Osimhen": "Short dark hair (often with protective mask), clean shaven, explosive and lean forward build, deep dark skin tone, fierce expression.",
    "Wilfred Ndidi": "Short dark hair, clean shaven, strong defensive midfield build, dark skin tone, focused look.",
    "Mohammed Kudus": "Short dark hair with fade, clean shaven, agile and powerful attacking build, dark skin tone, dynamic expression.",
    "Thomas Partey": "Short dark hair, clean shaven, dominant muscular midfield build, dark skin tone, composed leadership look.",
    "André Onana": "Short dark hair, clean shaven, tall athletic goalkeeper build, dark skin tone, confident and focused expression.",
    "Bryan Mbeumo": "Short dark hair, thick beard, powerful winger build, mixed skin tone, energetic expression.",
    "Pervis Estupiñán": "Short dark hair with fade, clean shaven, explosive and strong full-back build, dark skin tone, dynamic look.",
    "Piero Hincapié": "Short dark hair, clean shaven, elegant and strong centre-back build, tanned skin, focused expression.",
    "Rafael Santos Borré": "Short dark hair, clean shaven, hardworking forward build, tanned skin, intense competitive look.",
    "Davinson Sánchez": "Short dark hair, clean shaven, powerful and tall centre-back build, dark skin tone, focused gaze.",
    "Jefferson Lerma": "Short dark hair, clean shaven, strong defensive midfield build, dark skin tone, intense look.",
    "Antonio Sanabria": "Short dark hair, clean shaven, technical forward build, tanned skin, focused expression.",
    "Gustavo Gómez": "Short dark hair, clean shaven, strong commanding centre-back build, tanned skin, leadership look.",
    "Renato Tapia": "Short dark hair, clean shaven, solid defensive midfield build, tanned skin, focused tactical look.",
    "Pedro Gallese": "Short dark hair, clean shaven, agile athletic goalkeeper build, tanned skin, focused expression.",
    "Darwin Machís": "Short dark hair with fade, clean shaven, explosive winger build, tanned skin, energetic expression.",
    "Yangel Herrera": "Short dark hair, clean shaven, strong central midfield build, tanned skin, focused look.",
    "Seko Fofana": "Short dark hair, clean shaven, powerful box-to-box midfield build, dark skin tone, imposable presence.",
    "Ibrahim Sangaré": "Short dark hair, clean shaven, towering and strong midfield build, dark skin tone, focused look.",
    "Samuel Chukwueze": "Short dark hair with fade, clean shaven, lean and very fast winger build, dark skin tone, dynamic expression.",
    "Kelechi Iheanacho": "Short dark hair, clean shaven, technical forward build, dark skin tone, focused look.",
    "Inaki Williams": "Short dark hair with fade, clean shaven, explosive and lean athletic build, dark skin tone, dynamic expression.",
    "Jordan Ayew": "Short dark hair, clean shaven, versatile forward build, dark skin tone, experienced look.",
    "Eric Maxim Choupo-Moting": "Short dark hair, well-kept beard, tall and technical forward build, mixed skin tone, charismatic expression.",
    "Karl Toko Ekambi": "Short dark hair, clean shaven, agile forward build, dark skin tone, focused expression.",
    "Vincent Aboubakar": "Short dark hair, clean shaven, powerful striker build, dark skin tone, determined gaze.",
    "Joel Matip": "Short dark hair, clean shaven, tall elegant centre-back build, mixed skin tone, composed look."
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
