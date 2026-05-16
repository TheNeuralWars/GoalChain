import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/players.json"

# Detailed Biometric Descriptions for Batches 17-20 (80 Players)
BIOMETRICS = {
    "Chris Wood": "Short blonde-brown hair, clean shaven, tall and powerful target forward build, fair skin tone, focused expression.",
    "Liberato Cacace": "Short dark hair, clean shaven, agile left-back build, fair-tanned skin, energetic look.",
    "Tyler Bindon": "Short dark hair, clean shaven, strong young centre-back build, fair skin tone, focused expression.",
    "Kosta Barbarouses": "Short dark hair, clean shaven, experienced winger build, tanned skin, focused look.",
    "Sarpreet Singh": "Short dark hair, clean shaven, technical attacking midfield build, tanned skin, creative expression.",
    "Akram Afif": "Short dark curly hair, clean shaven, agile and creative forward build, olive skin tone, charismatic expression.",
    "Almoez Ali": "Short dark hair, clean shaven, clinical forward build, olive skin tone, determined gaze.",
    "Hassan Al-Haydos": "Short dark hair, clean shaven, experienced creative midfield build, olive skin tone, leadership look.",
    "Meshaal Barsham": "Short dark hair, clean shaven, agile goalkeeper build, olive skin tone, focused look.",
    "Sardar Azmoun": "Short dark hair, clean shaven, clinical forward build, olive skin tone, focused goal-oriented gaze.",
    "Mehdi Taremi": "Short dark hair, light beard, powerful and technical forward build, olive skin tone, determined expression.",
    "Alireza Jahanbakhsh": "Short dark hair, well-kept beard, powerful winger build, olive skin tone, charismatic expression.",
    "Saman Ghoddos": "Short dark hair, clean shaven, technical attacking midfield build, olive skin tone, focused expression.",
    "Salem Al-Dawsari": "Short dark hair, clean shaven, creative left winger build, magical expression, olive skin tone.",
    "Mohamed Kanno": "Short dark hair, clean shaven, strong central midfield build, olive skin tone, intense expression.",
    "Saud Abdulhamid": "Short dark hair, clean shaven, versatile right-back build, olive skin tone, energetic expression.",
    "Hassan Al-Tambakti": "Short dark hair, clean shaven, tall centre-back build, olive skin tone, calm focused look.",
    "Mohammed Al-Owais": "Short dark hair, clean shaven, athletic goalkeeper build, olive skin tone, focused look.",
    "Son Heung-min": "Short dark hair, clean shaven, explosive left winger build, iconic determined expression, light skin tone.",
    "Hwang Hee-chan": "Short dark hair, clean shaven, powerful forward build, light skin tone, energetic expression.",
    "Lee Kang-in": "Short dark hair, clean shaven, creative attacking midfield build, light skin tone, magical expression.",
    "Kim Min-jae": "Short dark hair, clean shaven, commanding centre-back build, light skin tone, intense leadership look.",
    "Takefusa Kubo": "Short dark hair, clean shaven, technical right winger build, light skin tone, creative expression.",
    "Kaoru Mitoma": "Short dark hair, clean shaven, explosive left winger build, light skin tone, dynamic expression.",
    "Wataru Endō": "Short dark hair, clean shaven, strong defensive midfield build, light-tanned skin, composed look.",
    "Junyo Ito": "Short dark hair, clean shaven, versatile right winger build, light skin tone, energetic expression.",
    "Hidemasa Morita": "Short dark hair, clean shaven, strong central midfield build, light skin tone, intense expression.",
    "Takehiro Tomiyasu": "Short dark hair, clean shaven, solid right-back build, light skin tone, composed expression.",
    "Zion Suzuki": "Short dark hair, clean shaven, tall athletic goalkeeper build, mixed skin tone, youthful focused look.",
    "Ko Itakura": "Short dark hair, clean shaven, tall centre-back build, light skin tone, focused look.",
    "Ritsu Doan": "Short dark hair, clean shaven, technical right winger build, light skin tone, creative expression.",
    "Kyogo Furuhashi": "Short dark hair, clean shaven, clinical forward build, light skin tone, focused expression.",
    "Ayase Ueda": "Short dark hair, clean shaven, powerful forward build, light skin tone, intense expression.",
    "Takumi Minamino": "Short dark hair, clean shaven, technical attacking midfield build, light skin tone, creative look.",
    "Hiroki Ito": "Short dark hair, clean shaven, versatile left-back build, light skin tone, focused look.",
    "Daichi Kamada": "Short dark hair, clean shaven, creative attacking midfield build, light skin tone, composed expression.",
    "Kyogo Furuhashi": "Short dark hair, clean shaven, clinical forward build, light skin tone, focused expression.",
    "Hwang In-beom": "Short dark hair, clean shaven, technical central midfield build, light skin tone, composed expression.",
    "Jo Hyeon-woo": "Short dark hair, clean shaven, tall athletic goalkeeper build, light skin tone, focused look.",
    "Seol Young-woo": "Short dark hair, clean shaven, versatile left-back build, light skin tone, energetic expression."
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
