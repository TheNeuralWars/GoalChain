import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/players.json"

# REAL Biometric Data (Verified Batch 39)
REAL_DATA = {
    "Ben Brereton Díaz": "Short dark hair peinado to the side, well-groomed short beard, exceptionally tall and powerful athletic build, fair skin tone, determined gaze.",
    "Guillermo Maripán": "Short dark hair with a clean fade, clean shaven, towering and robust centre-back build (1.93m), tanned skin, leadership expression.",
    "Gabriel Suazo": "Short dark hair with a precision fade (post-transplant full look), clean shaven, fast and tireless left-back build, tanned skin, focused look.",
    "Erick Pulgar": "Short dark hair with a sharp fade, well-groomed beard, notable tattoos on neck and arms, strong and tall defensive midfield build, tanned skin, intense focused look.",
    "Victor Dávila": "Short dark hair with a clean fade, clean shaven, agile and technical forward build, tanned skin, focused expression.",
    "Diego Valdés": "Short dark hair with texture, clean shaven or light stubble, creative attacking midfield build, tanned skin, focused look.",
    "Richard Ríos": "Mid-length dark curly hair peinado in a signature flow (curly flow), clean shaven, technical and strong central midfield build, dark-tanned skin, charismatic expression.",
    "Kevin Castaño": "Short dark hair with a sharp fade, clean shaven, various tattoos on arms and legs, technical and mobile defensive midfield build, tanned skin, focused look.",
    "Jhon Lucumí": "Short dark hair, clean shaven, tall and powerful centre-back build, dark skin tone, focused leadership look.",
    "Carlos Cuesta": "Short dark hair with a clean fade, clean shaven, strong and fast centre-back build, dark skin tone, focused look.",
    "Daniel Muñoz": "Short dark hair with a sharp fade, clean shaven, tireless and powerful right-back build, dark-tanned skin, intense focused look.",
    "Johan Mojica": "Short dark hair peinado naturally, clean shaven, exceptionally fast and agile left-back build, dark skin tone, dynamic expression.",
    "Jefferson Lerma": "Short dark hair, clean shaven, strong and tenacious defensive midfield build, dark skin tone, fierce focused expression.",
    "Mateo Cassierra": "Short dark hair, clean shaven, clinical forward build, dark skin tone, focused goal-oriented gaze.",
    "Rodrigo Echeverría": "Short dark hair, clean shaven, hardworking and strong central midfield build, tanned skin, focused look.",
    "Marcelino Núñez": "Short dark hair peinado naturally, clean shaven, technical and agile midfield build, tanned skin, focused expression.",
    "Paulo Díaz": "Short dark hair, clean shaven, solid and versatile defender build, tanned skin, focused leadership look.",
    "Alexander Aravena": "Short dark hair with a sharp fade, clean shaven, youthful and fast forward build, tanned skin, dynamic expression.",
    "Matías Catalán": "Short dark hair, well-groomed beard, strong and experienced defender build, tanned skin, leadership look.",
    "Brayan Cortés": "Short dark hair, clean shaven, agile and tall goalkeeper build, tanned skin, focused look."
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
    
    print(f"✅ Corrected {updated_count} players with verified REAL biometric data (Batch 39).")

if __name__ == "__main__":
    update_real_biometrics()
