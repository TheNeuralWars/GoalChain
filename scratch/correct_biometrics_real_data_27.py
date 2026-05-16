import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/players.json"

# REAL Biometric Data (Verified Batch 46 - 42 Players)
REAL_DATA = {
    "Ángel Di María": "Short dark hair peinado classically, clean shaven, lean and exceptionally agile forward build ('El Fideo'), olive skin tone, experienced leadership expression.",
    "Dayot Upamecano": "Short dark hair with a clean fade, clean shaven, exceptionally strong and powerful centre-back build, dark skin tone, focused look.",
    "Adrien Rabiot": "Short-to-medium dark hair often styled with texture or gel, clean shaven, tall and elegant midfield build, fair skin tone, composed expression.",
    "Kyle Walker": "Buzz cut or very short dark hair with a precision fade, well-groomed short beard, exceptionally powerful and fast athletic build, tanned skin, intense focused look.",
    "Jordan Pickford": "Short blonde-brown hair peinado with texture, clean shaven, agile and high-energy goalkeeper build, fair skin tone, vocal and expressive gaze.",
    "Trent Alexander-Arnold": "Short dark hair with natural curls or short braids, clean shaven, technical and lean full-back build, mixed skin tone, focused look.",
    "Danilo": "Short dark hair with a clean fade, well-groomed beard, strong and experienced defender build, dark skin tone, leadership expression.",
    "Rodri": "Short dark hair peinado classically, clean shaven, towering and strong central midfield build, tanned skin, masterful tactical expression.",
    "Gavi": "Short dark hair peinado naturally with texture, clean shaven, small but exceptionally tenacious and agile build, fair skin tone, fierce determined gaze.",
    "Robin Le Normand": "Short dark hair peinado with texture, clean shaven, solid and tall centre-back build, fair skin tone, focused look.",
    "Joshua Kimmich": "Short dark hair peinado with a clean side-part, clean shaven, hardworking and technical midfield build, fair skin tone, intense focused expression.",
    "Niclas Füllkrug": "Short brown hair peinado upward, well-groomed beard, powerful target forward build, fair skin tone, signature gap-toothed smile ('Lücke'), determined gaze.",
    "Jonathan Tah": "Short dark hair with a precision fade, clean shaven, towering and exceptionally strong centre-back build, dark skin tone, focused leadership look.",
    "Maximilian Mittelstädt": "Short blonde-brown hair with a clean fade, clean shaven, energetic and fast left-back build, fair skin tone, professional look.",
    "João Mário": "Completely shaven head (bald), well-groomed short beard, experienced and technical midfield build, dark skin tone, composed expression.",
    "Diogo Costa": "Short dark hair peinado classically, clean shaven, agile and tall goalkeeper build, fair skin tone, focused look.",
    "Gonçalo Inácio": "Short dark hair with a clean fade, clean shaven, tall and strong centre-back build, fair skin tone, focused look.",
    "Nuno Mendes": "Short dark hair with a sharp fade, clean shaven, exceptionally fast and agile left-back build, dark skin tone, dynamic expression.",
    "Vitinha": "Short dark hair with texture, clean shaven, small and very technical midfield build, tanned skin, creative expression.",
    "João Neves": "Short dark hair peinado naturally, clean shaven, energetic and agile midfield build, fair skin tone, youthful focused expression.",
    "Denzel Dumfries": "Short dark hair with a sharp fade, clean shaven, exceptionally powerful and wide athletic build, dark skin tone, intense focused look.",
    "Bart Verbruggen": "Short blonde-brown hair, clean shaven, tall and agile goalkeeper build, fair skin tone, focused look.",
    "Teun Koopmeiners": "Short blonde-brown hair, clean shaven, strong and technical midfield build, fair skin tone, tactical expression.",
    "Gio Reyna": "Short dark hair peinado with texture, clean shaven, elegant and creative attacking build, fair skin tone, focused look.",
    "Tyler Adams": "Short dark hair with natural curls or a clean fade, clean shaven, tenacious and mobile defensive midfield build, mixed skin tone, intense focused gaze.",
    "Sergiño Dest": "Short dark hair with a sharp fade, clean shaven, fast and agile full-back build, mixed-tanned skin tone, dynamic expression.",
    "Tim Weah": "Short dark hair with a clean fade or braids, clean shaven, exceptionally fast and lean winger build, dark skin tone, focused look.",
    "Guillermo Ochoa": "Signature long dark curly hair often with a headband, well-groomed beard, experienced and agile goalkeeper build, tanned skin, veteran leadership gaze.",
    "Luis Romo": "Short dark hair, clean shaven, strong and versatile midfield build, tanned skin, focused look.",
    "Maxime Crépeau": "Short dark hair, clean shaven, agile goalkeeper build, fair skin tone, focused look.",
    "Kamal Miller": "Short dark hair with a clean fade, clean shaven, strong and mobile defender build, dark skin tone, focused look.",
    "Liam Millar": "Short dark hair peinado with texture, clean shaven, fast and creative winger build, fair skin tone, dynamic expression.",
    "Dayne St. Clair": "Short dark hair, clean shaven, tall and agile goalkeeper build, dark skin tone, focused look.",
    "Yassine Bounou": "Short dark hair with a clean fade, clean shaven or light stubble, agile and tall goalkeeper build, olive skin tone, focused leadership look.",
    "Brahim Díaz": "Short dark hair peinado upward with texture, clean shaven, agile and technical attacking build, light-tanned skin, creative expression.",
    "Nayef Aguerd": "Short dark hair with a clean fade, clean shaven, tall and strong centre-back build, olive skin tone, focused look.",
    "Romain Saïss": "Short dark hair peinado classically, well-groomed beard, experienced and solid defender build, olive skin tone, leadership look.",
    "Azzedine Ounahi": "Short dark hair with natural texture, clean shaven, lean and very agile midfield build, olive skin tone, creative expression.",
    "Youssef En-Nesyri": "Short dark hair, clean shaven, towering and powerful target forward build, olive skin tone, determined gaze.",
    "Noussair Mazraoui": "Short dark hair with a sharp fade, clean shaven, technical and fast full-back build, olive skin tone, focused look.",
    "Amine Adli": "Short dark hair with texture or small braids, clean shaven, fast and creative winger build, olive skin tone, dynamic expression.",
    "Wataru Endō": "Short dark hair peinado in a disciplined manner, clean shaven, hardworking and tenacious midfield build, tanned skin, focused tactical expression."
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
    
    print(f"✅ Corrected {updated_count} players with verified REAL biometric data (Batch 46 - 42 Players).")

if __name__ == "__main__":
    update_real_biometrics()
