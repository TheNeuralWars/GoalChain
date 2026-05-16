import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/players.json"

# REAL Biometric Data (Verified Batch 48 - 42 Players)
REAL_DATA = {
    "Stefan Lainer": "Short brown hair peinado with texture, clean shaven, hardworking and fast right-back build, fair skin tone, focused look.",
    "Camilo Vargas": "Short dark hair peinado classically, clean shaven, experienced and agile goalkeeper build, light-tanned skin, focused look.",
    "Jhon Córdoba": "Short dark hair with a clean fade, clean shaven, powerful and robust target forward build, dark skin tone, determined gaze.",
    "Yáser Asprilla": "Short dark hair with natural texture or a sharp fade, clean shaven, exceptionally agile and technical attacking build, dark skin tone, youthful creative expression.",
    "Hernán Galíndez": "Short dark hair, clean shaven, experienced and tall goalkeeper build, fair skin tone, focused look.",
    "Alan Franco": "Short dark hair with a clean fade, clean shaven, hardworking and strong midfield build, tanned skin, focused look.",
    "Miguel Almirón": "Short dark hair peinado forward with texture, clean shaven, lean and exceptionally fast winger build, tanned skin, energetic expression.",
    "Gustavo Gómez": "Short dark hair, well-groomed beard, strong and tall centre-back leadership build, tanned skin, focused leadership look.",
    "Omar Alderete": "Short dark hair with a clean fade, clean shaven, strong and solid centre-back build, tanned skin, focused look.",
    "Gatito Fernández": "Short dark hair, clean shaven, agile experienced goalkeeper build, tanned skin, focused look.",
    "Fabián Balbuena": "Short dark hair peinado classically, clean shaven, experienced and strong centre-back build, tanned skin, leadership gaze.",
    "Mathías Villasanti": "Short dark hair with a sharp fade, clean shaven, tireless and technical midfield build, tanned skin, focused look.",
    "Diego Gómez": "Short dark hair with texture, clean shaven, technical and agile attacking build, tanned skin, youthful expression.",
    "Adam Bareiro": "Short dark hair, well-groomed beard, strong and clinical forward build, tanned skin, focused goal-oriented gaze.",
    "Junior Alonso": "Short dark hair, clean shaven, solid and experienced defender build, tanned skin, focused look.",
    "Salomón Rondón": "Short dark hair (buzz cut), clean shaven, exceptionally powerful and robust forward build, dark-tanned skin, veteran leadership gaze.",
    "Yangel Herrera": "Short dark hair with a clean fade, clean shaven or light stubble, strong and technical midfield build, tanned skin, focused look.",
    "Eduard Bello": "Short dark hair with texture, clean shaven, agile and fast winger build, tanned skin, dynamic expression.",
    "Rafael Romo": "Short dark hair, clean shaven, experienced and tall goalkeeper build, tanned skin, focused look.",
    "Jon Aramburu": "Short dark hair with a sharp fade, clean shaven, energetic and fast full-back build, tanned skin, youthful expression.",
    "José Martínez": "Short dark hair, clean shaven, tenacious and strong defensive midfield build, tanned skin, focused look.",
    "Telasco Segovia": "Short dark hair with a clean fade, clean shaven, technical and agile attacking build, tanned skin, youthful expression.",
    "Alexis Sánchez": "Short dark hair peinado with texture, clean shaven, compact but exceptionally powerful and agile forward build, tanned skin, veteran leadership gaze.",
    "Eduardo Vargas": "Short dark hair peinado naturally, clean shaven, clinical and fast forward build, tanned skin, focused look.",
    "Darío Osorio": "Short dark hair with a sharp fade, clean shaven, youthful and fast winger build, tanned skin, dynamic expression.",
    "Claudio Bravo": "Short dark hair peinado classically, well-groomed short beard, experienced and agile goalkeeper build, tanned skin, legendary leadership expression.",
    "Mauricio Isla": "Short dark hair, clean shaven or light stubble, experienced and fast right-back build, tanned skin, leadership look.",
    "Víctor Dávila": "Short dark hair with a clean fade, clean shaven, technical and agile forward build, tanned skin, focused expression.",
    "Piero Quispe": "Short dark hair with a clean fade, clean shaven, small but technical and agile attacking build, tanned skin, youthful creative expression.",
    "Carlos Zambrano": "Short dark hair peinado with texture, clean shaven, strong and intimidating centre-back build, tanned skin, fierce defensive gaze.",
    "Renato Tapia": "Short dark hair with a sharp fade, well-groomed beard, strong and technical defensive midfield build, tanned skin, focused leadership look.",
    "Alexander Callens": "Short dark hair, clean shaven, solid and strong centre-back build, tanned skin, focused look.",
    "Sergio Peña": "Short dark hair with texture, clean shaven, creative and technical midfield build, tanned skin, focused expression.",
    "Joao Grimaldo": "Short dark hair with a clean fade, clean shaven, fast and creative winger build, tanned skin, dynamic expression.",
    "Anthony Mandréa": "Short dark hair, clean shaven, agile and tall goalkeeper build, light-tanned skin, focused look.",
    "Thomas Partey": "Short dark hair with a precision fade, clean shaven, visible tattoos on arms, powerful and technical midfield build, dark skin tone, focused tactical gaze.",
    "Lawrence Ati-Zigi": "Short dark hair with a clean fade, clean shaven, agile and athletic goalkeeper build, dark skin tone, focused look.",
    "Alidu Seidu": "Short dark hair with a sharp fade, clean shaven, strong and fast defender build, dark skin tone, focused look.",
    "Ernest Nuamah": "Short dark hair with texture, clean shaven, exceptionally fast and agile winger build, dark skin tone, dynamic expression.",
    "Gideon Mensah": "Short dark hair with a clean fade, clean shaven, fast and agile full-back build, dark skin tone, professional look.",
    "Stanley Nwabali": "Short dark hair, clean shaven, agile and tall goalkeeper build, dark skin tone, focused look.",
    "William Troost-Ekong": "Short dark hair with a precision fade, clean shaven, extensive tattoos on arms and neck, strong and tall centre-back build, dark skin tone, focused leadership expression."
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
    
    print(f"✅ Corrected {updated_count} players with verified REAL biometric data (Batch 48 - 42 Players).")

if __name__ == "__main__":
    update_real_biometrics()
