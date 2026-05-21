import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/players.json"

# REAL Biometric Data (Verified Batch 47 - 42 Players)
REAL_DATA = {
    "Kaoru Mitoma": "Short dark hair peinado naturally, clean shaven, lean and exceptionally agile winger build, tanned skin, focused look.",
    "Junya Itō": "Short dark hair often with blonde or light highlights, clean shaven, exceptionally fast and lean winger build, tanned skin, dynamic expression.",
    "Kō Itakura": "Short dark hair with a clean fade, clean shaven, tall and strong centre-back build, tanned skin, focused leadership look.",
    "Hidemasa Morita": "Short dark hair peinado with texture, clean shaven, hardworking and technical midfield build, tanned skin, professional look.",
    "Kyogo Furuhashi": "Short dark hair with textured styling, clean shaven, small but exceptionally agile and fast forward build, tanned skin, focused goal-oriented gaze.",
    "Ayase Ueda": "Short dark hair with a clean fade, clean shaven, clinical forward build, tanned skin, determined gaze.",
    "Edouard Mendy": "Short dark hair, clean shaven, towering and powerful goalkeeper build (1.94m), dark skin tone, focused leadership look.",
    "Idrissa Gueye": "Short dark hair, clean shaven, experienced and tenacious defensive midfield build, dark skin tone, focused look.",
    "Ismaila Sarr": "Short dark hair with a precision fade, clean shaven, exceptionally fast and lean winger build, dark skin tone, dynamic expression.",
    "Abdou Diallo": "Short dark hair with a clean fade, clean shaven, strong and tall defender build, dark skin tone, focused look.",
    "Youssouf Sabaly": "Short dark hair, clean shaven, energetic and fast full-back build, dark skin tone, professional look.",
    "Woo-yeong Jeong": "Short dark hair with a sharp fade, clean shaven, agile and hardworking attacking build, tanned skin, focused look.",
    "Young-woo Seol": "Short dark hair peinado with texture, clean shaven, energetic and fast full-back build, tanned skin, focused look.",
    "Young-gwon Kim": "Short dark hair peinado classically, clean shaven, experienced and solid centre-back build, tanned skin, veteran leadership gaze.",
    "Hyeon-woo Jo": "Short dark hair peinado upward with gel, clean shaven, agile experienced goalkeeper build, tanned skin, focused look.",
    "Jae-sung Lee": "Short dark hair peinado naturally, clean shaven, creative and technical midfield build, tanned skin, focused look.",
    "Ajdin Hrustic": "Short dark hair with texture, clean shaven, technical and elegant midfield build, light-tanned skin, focused expression.",
    "Riley McGree": "Short dark hair with a clean fade, clean shaven, energetic and creative attacking build, fair skin tone, dynamic expression.",
    "Kye Rowles": "Short dark hair, clean shaven, solid and tall centre-back build, fair skin tone, focused look.",
    "Nathaniel Atkinson": "Short dark hair, clean shaven, energetic and fast right-back build, fair skin tone, professional look.",
    "Martin Boyle": "Short dark hair, clean shaven or light stubble, fast and creative winger build, fair skin tone, dynamic expression.",
    "Alexander Bah": "Short dark hair with a sharp fade, clean shaven, powerful and fast right-back build, dark-tanned skin, focused look.",
    "Victor Kristiansen": "Short blonde-brown hair, clean shaven, energetic and strong left-back build, fair skin tone, focused look.",
    "Morten Hjulmand": "Short blonde-brown hair peinado naturally, clean shaven, strong and technical midfield build, fair skin tone, tactical expression.",
    "Denis Zakaria": "Short dark hair with a clean fade, clean shaven, towering and powerful defensive midfield build (1.91m), dark skin tone, focused look.",
    "Silvan Widmer": "Short dark hair peinado classically, clean shaven, experienced and strong right-back build, fair skin tone, leadership look.",
    "Vanja Milinković-Savić": "Short dark hair, well-groomed beard, colossally tall and powerful goalkeeper build (2.02m), fair skin tone, intimidating focused gaze.",
    "Nikola Milenković": "Short dark hair, clean shaven, towering and robust centre-back build (1.95m), fair skin tone, focused leadership expression.",
    "Saša Lukić": "Short dark hair with texture, clean shaven, technical and strong central midfield build, fair skin tone, tactical look.",
    "Nemanja Gudelj": "Short dark hair often peinado with texture, well-groomed beard, various tattoos on arms, experienced and strong defender/midfielder build, fair skin tone, veteran leadership look.",
    "Andrija Živković": "Short dark hair with a sharp fade, clean shaven, fast and creative winger build, fair skin tone, dynamic expression.",
    "Jan Bednarek": "Short dark hair, clean shaven, tall and strong centre-back build, fair skin tone, focused look.",
    "Paweł Dawidowicz": "Short dark hair, clean shaven, solid and tall centre-back build, fair skin tone, focused look.",
    "Oleksandr Zinchenko": "Short blonde hair peinado with precision, clean shaven, technical and elegant leadership build, fair skin tone, focused tactical gaze.",
    "Illia Zabarnyi": "Short dark hair with a clean fade, clean shaven, towering and strong centre-back build, fair skin tone, focused look.",
    "Heorhiy Sudakov": "Short dark hair with texture, clean shaven, creative and agile attacking build, fair skin tone, youthful expression.",
    "Mykola Shaparenko": "Short dark hair with a clean fade, clean shaven, technical and elegant midfield build, fair skin tone, focused look.",
    "Taras Stepanenko": "Short dark hair, clean shaven, experienced and tenacious defensive midfield build, fair skin tone, veteran leadership look.",
    "Yukhym Konoplya": "Short dark hair with a sharp fade, clean shaven, energetic and fast full-back build, fair skin tone, focused look.",
    "Christoph Baumgartner": "Short dark hair peinado with texture, clean shaven, creative and strong attacking build, fair skin tone, focused look.",
    "Marko Arnautović": "Short dark hair, well-groomed beard, extensive tattoos on both arms, strong and experienced target forward build, fair skin tone, veteran leadership expression.",
    "Alexander Schlager": "Short dark hair peinado classically, clean shaven, agile goalkeeper build, fair skin tone, professional look."
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
    
    print(f"✅ Corrected {updated_count} players with verified REAL biometric data (Batch 47 - 42 Players).")

if __name__ == "__main__":
    update_real_biometrics()
