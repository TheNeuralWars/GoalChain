import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/players.json"

# Detailed Biometric Descriptions for Batches 13-16 (80 Players)
BIOMETRICS = {
    "Ben Brereton Díaz": "Short brown hair, clean shaven or light stubble, tall and powerful forward build, fair skin tone, intense look.",
    "Gabriel Suazo": "Short dark hair, clean shaven, agile and fast left-back build, tanned skin, energetic expression.",
    "Guillermo Maripán": "Short dark hair, clean shaven, towering and strong centre-back build, tanned skin, composed leadership look.",
    "Davinson Sánchez": "Short dark hair, clean shaven, powerful and tall centre-back build, dark skin tone, focused gaze.",
    "Mateus Uribe": "Short dark hair, clean shaven, experienced central midfield build, tanned skin, intense tactical look.",
    "Luis Sinisterra": "Short dark hair with fade, clean shaven, lean and fast winger build, dark skin tone, dynamic expression.",
    "Jhon Lucumí": "Short dark hair, clean shaven, strong and tall centre-back build, dark skin tone, focused look.",
    "Wilmar Barrios": "Short dark hair, clean shaven, tenacious defensive midfield build, dark skin tone, intense expression.",
    "Willian Pacho": "Short dark hair, clean shaven, strong young centre-back build, dark skin tone, focused look.",
    "Ademola Lookman": "Short dark hair with fade, clean shaven, agile and fast winger build, dark skin tone, dynamic expression.",
    "Taiwo Awoniyi": "Short dark hair, clean shaven, massive powerful target forward build, dark skin tone, intimidating presence.",
    "Alex Iwobi": "Short dark hair (often in braids), clean shaven, versatile technical midfield build, dark skin tone, focused expression.",
    "Simon Adingra": "Short dark hair with fade, clean shaven, very fast and lean winger build, dark skin tone, youthful energetic look.",
    "Ibrahim Sangaré": "Short dark hair, clean shaven, towering and strong midfield build, dark skin tone, focused look.",
    "Seko Fofana": "Short dark hair, clean shaven, powerful box-to-box midfield build, dark skin tone, imposable presence.",
    "Keylor Navas": "Short dark hair, clean shaven, agile and experienced goalkeeper build, tanned skin, calm focused look.",
    "Chris Wood": "Short blonde-brown hair, clean shaven, tall and powerful target forward build, fair skin tone, focused expression.",
    "Adalberto Carrasquilla": "Short dark hair with fade, clean shaven, technical and agile midfield build, tanned skin, energetic expression.",
    "Akram Afif": "Short dark curly hair, clean shaven, agile and creative forward build, olive skin tone, charismatic expression.",
    "Sardar Azmoun": "Short dark hair, clean shaven, clinical forward build, olive skin tone, focused goal-oriented gaze.",
    "Mehdi Taremi": "Short dark hair, light beard, powerful and technical forward build, olive skin tone, determined expression.",
    "David Alaba": "Short dark hair with fade, clean shaven, versatile and strong athletic build, mixed skin tone, leadership expression.",
    "Dominik Szoboszlai": "Short dark hair, clean shaven, elegant technical midfield build, fair skin tone, charismatic focused look.",
    "Marcel Sabitzer": "Short dark hair (often in a bun or styled), clean shaven or light stubble, energetic central midfield build, fair skin tone, intense look.",
    "Konrad Laimer": "Short blond-brown hair, clean shaven, tenacious box-to-box midfield build, fair skin tone, focused expression.",
    "Willi Orbán": "Short dark hair, clean shaven, strong commanding centre-back build, fair skin tone, leadership look.",
    "Péter Gulácsi": "Short dark hair, clean shaven, tall experienced goalkeeper build, fair skin tone, focused expression.",
    "Almoez Ali": "Short dark hair, clean shaven, clinical forward build, olive skin tone, determined gaze.",
    "Hassan Al-Haydos": "Short dark hair, clean shaven, experienced creative midfield build, olive skin tone, leadership look.",
    "Saman Ghoddos": "Short dark hair, clean shaven, technical attacking midfield build, olive skin tone, focused expression.",
    "Alireza Jahanbakhsh": "Short dark hair, well-kept beard, powerful winger build, olive skin tone, charismatic expression.",
    "Joel Campbell": "Short dark hair, clean shaven, versatile forward build, dark skin tone, experienced look.",
    "Francisco Calvo": "Short dark hair, clean shaven, solid centre-back build, tanned skin, focused look.",
    "Michael Murillo": "Short dark hair with fade, clean shaven, explosive right-back build, tanned skin, energetic expression.",
    "José Córdoba": "Short dark hair, clean shaven, strong young centre-back build, dark skin tone, focused look.",
    "Elias Cobbaut": "Short blond-brown hair, clean shaven, solid defensive build, fair skin tone, focused expression.",
    "Kevin Danso": "Short dark hair, clean shaven, powerful muscular centre-back build, dark skin tone, intimidating presence.",
    "Xaver Schlager": "Short blond hair, clean shaven, energetic central midfield build, fair skin tone, intense look.",
    "Christoph Baumgartner": "Short dark hair, clean shaven, creative attacking midfield build, fair skin tone, focused expression.",
    "Milot Rashica": "Short dark hair with fade, clean shaven, explosive winger build, fair-tanned skin, dynamic expression.",
    "Amir Rrahmani": "Short dark hair, clean shaven, commanding centre-back build, fair-tanned skin, leadership look.",
    "Vedat Muriqi": "Short dark hair, thick beard, massive powerful target forward build, fair-tanned skin, fierce expression.",
    "Edon Zhegrova": "Short dark hair with fade, clean shaven, agile technical winger build, fair skin tone, creative look.",
    "Ezgjan Alioski": "Short blond-dyed or dark hair, clean shaven, energetic left-back build, fair skin tone, charismatic expression.",
    "Enis Bardhi": "Short dark hair, clean shaven, technical midfield build, fair skin tone, focused look.",
    "Eljif Elmas": "Short dark hair, clean shaven, creative attacking midfield build, fair skin tone, youthful expression.",
    "Stole Dimitrievski": "Short dark hair, clean shaven, athletic goalkeeper build, fair skin tone, focused look.",
    "Stefan Savić": "Short dark hair, clean shaven, experienced commanding centre-back build, fair-tanned skin, leadership expression.",
    "Stevan Jovetić": "Short dark hair, clean shaven, technical forward build, fair-tanned skin, experienced charismatic look.",
    "Adam Marušić": "Short dark hair, clean shaven, versatile full-back build, fair skin tone, focused expression.",
    "Jan Oblak": "Short dark hair, clean shaven, world-class commanding goalkeeper build, fair skin tone, calm focused look.",
    "Benjamin Šeško": "Short blonde-brown hair, clean shaven, tall explosive forward build, fair skin tone, determined gaze.",
    "Josip Iličić": "Short dark hair, light stubble, technical creative forward build, fair skin tone, experienced look.",
    "Jaka Bijol": "Short dark hair, clean shaven, strong centre-back build, fair skin tone, focused look.",
    "Andraž Šporar": "Short dark hair, clean shaven, clinical forward build, fair skin tone, determined gaze.",
    "Sandi Lovrić": "Short dark hair, clean shaven, technical central midfield build, fair skin tone, focused expression.",
    "Ben Brereton Díaz": "Short brown hair, clean shaven or light stubble, tall and powerful forward build, fair skin tone, intense look.",
    "Guillermo Maripán": "Short dark hair, clean shaven, towering and strong centre-back build, tanned skin, composed leadership look.",
    "Gabriel Suazo": "Short dark hair, clean shaven, agile and fast left-back build, tanned skin, energetic expression.",
    "Paulo Díaz": "Short dark hair, clean shaven, strong and versatile defender build, tanned skin, focused look.",
    "Víctor Dávila": "Short dark hair, clean shaven, technical attacking build, tanned skin, energetic expression.",
    "Marcelino Núñez": "Short dark hair, clean shaven, technical midfield build, tanned skin, youthful focused look.",
    "Erick Pulgar": "Short dark hair, clean shaven, strong defensive midfield build, tanned skin, intense tactical look.",
    "Claudio Bravo": "Short dark hair, clean shaven, experienced commanding goalkeeper build, tanned skin, veteran leadership look.",
    "Yerry Mina": "Short dark hair, clean shaven, towering and powerful centre-back build, dark skin tone, charismatic expression.",
    "Daniel Muñoz": "Short dark hair, clean shaven, explosive and strong right-back build, tanned skin, dynamic expression.",
    "Richard Ríos": "Short dark hair, clean shaven, technical and strong midfield build, tanned skin, energetic look.",
    "Kevin Castaño": "Short dark hair, clean shaven, technical central midfield build, tanned skin, focused expression.",
    "Jhon Durán": "Short dark hair, clean shaven, powerful young forward build, dark skin tone, determined gaze.",
    "Mateo Cassierra": "Short dark hair, clean shaven, clinical forward build, dark skin tone, focused goal-oriented gaze.",
    "Jhon Arias": "Short dark hair, clean shaven, technical right winger build, dark skin tone, creative expression.",
    "Camilo Vargas": "Short dark hair, clean shaven, agile experienced goalkeeper build, tanned skin, focused look.",
    "Félix Torres": "Short dark hair, clean shaven, strong and tall centre-back build, dark skin tone, focused look.",
    "Willian Pacho": "Short dark hair, clean shaven, strong young centre-back build, dark skin tone, focused look.",
    "Ángelo Preciado": "Short dark hair, clean shaven, explosive and fast right-back build, dark skin tone, dynamic expression.",
    "Carlos Gruezo": "Short dark hair, clean shaven, experienced defensive midfield build, dark skin tone, focused look.",
    "Jeremy Sarmiento": "Short dark hair with fade, clean shaven, technical and agile winger build, mixed skin tone, youthful expression.",
    "Kendry Páez": "Short dark hair, clean shaven, creative young attacking midfield build, dark skin tone, determined prodigy look.",
    "Alexander Domínguez": "Short dark hair, clean shaven, tall commanding goalkeeper build, dark skin tone, focused look.",
    "Robert Arboleda": "Short dark hair, clean shaven, strong and experienced centre-back build, dark skin tone, leadership expression."
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
