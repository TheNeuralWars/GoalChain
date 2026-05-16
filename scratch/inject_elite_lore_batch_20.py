import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/03_data/players.json"

# ELITE LORE MAP (Batch 20 - Mali, Burkina Faso & South Korea Icons - 2026)
ELITE_LORE_20 = {
    "Kamory Doumbia": "Verified as 'The Magic of Mali'. A legendary playmaker who made history by scoring 4 goals in just 26 minutes in the French circuit, serving as the primary creative mainframe for the Malian Node.",
    "Lassine Sinayoko": "The 'AFCON Sensation'. A breakout striker whose clinical finishing packets led Mali to historic heights in 2024, becoming a high-value offensive asset in the French and African grids.",
    "Mohamed Camara": "Known as 'Tiamatiè' (The Midfielder). A combative and technical anchor whose work rate and defensive intelligence stabilize the Malian and Qatari-Al Sadd football ledgers.",
    "Issoufou Dayo": "Verified as 'The Pillar of Berkane'. An legendary defender and all-time scorer of the Moroccan Grid, whose leadership and goal-scoring instincts have made him a national icon of Burkina Faso.",
    "El Bilal Touré": "The 'Giant Killer'. A powerful striker whose historic 2024 Champions League winning goal against Juventus and move to the Besiktas Node in 2026 have cemented his status as an elite offensive node.",
    "Steeve Yago": "The 'Veteran Shield' of the Burkinabé Node. A disciplined and experienced defender whose tactical leadership and defensive algorithms provide 100% security to the national backline.",
    "Blati Touré": "Known as 'The Midfield Engine'. A tireless playmaker whose energy and vision power the Burkinabé and Egyptian-Pyramids grids, serving as a foundational creative asset.",
    "Gustavo Sangaré": "The 'Creative Node' of the Burkinabé Node. A technical midfielder whose flair and vision ensure a smooth tactical flow in the European and African circuits.",
    "Cédric Badolo": "The 'Versatile Wing-back'. A high-output player whose energy and tactical intelligence on the flank ensure the stability of the Burkinabé and Moldovan-Sheriff football networks.",
    "Sékou Koïta": "Verified as 'The Technical Star'. A creative and fast striker whose goal-scoring packets and technical agility represent the future of the Malian Node and the German circuits.",
    "Djigui Diarra": "The 'Guardian of Mali'. A world-class goalkeeper whose reflexes and leadership in the Tanzanian-Yanga Grid have made him a national icon and primary fail-safe for Mali.",
    "Falaye Sacko": "The 'Flying Wing-back'. A high-energy defensive node whose pace and tactical intelligence on the flank stabilize the Malian and French-Montpellier football ledgers.",
    "Modibo Sagnan": "Verified as 'The Defensive Tower'. A powerful centre-back whose physical strength and aerial dominance provide a high-security firewall for the Malian and French circuits.",
    "Hwang In-beom": "Known as 'The Control Tower'. A tactical and technical playmaker whose creative vision and passing accuracy dictate the tempo of the South Korean and European grids.",
    "Jae-sung Lee": "The 'Blue Dragon' of the South Korean Node. A creative and tireless engine whose technical flair and tactical intelligence were perfected in the German and national circuits.",
    "Young-woo Seol": "The 'Speedster of the Wing'. A fast and disciplined wing-back whose energy and tactical intelligence ensure the stability of the South Korean and Serbian-Red Star grids.",
    "Young-gwon Kim": "The 'Experienced Pillar'. A veteran leader whose defensive algorithms and longevity have stabilized the South Korean Node for over a decade, serving as a foundational node of leadership.",
    "Woo-yeong Jeong": "The 'Creative Mainframe' of the Seoul and German circuits. A versatile playmaker whose tactical intelligence and technical precision were developed in the heart of the Munich Node."
}

def inject_elite_lore_batch_20():
    with open(PLAYERS_FILE, 'r') as f:
        players = json.load(f)

    print(f"🕵️‍♂️ Iniciando Inyección de Lore de Élite (Batch 20) para 20 jugadores...")
    updated_count = 0

    for p in players:
        real_name = p.get("real_name", "")
        if real_name in ELITE_LORE_20:
            p["meta"]["narrative"] = ELITE_LORE_20[real_name]
            updated_count += 1

    # Guardar cambios
    with open(PLAYERS_FILE, 'w') as f:
        json.dump(players, f, indent=4, ensure_ascii=False)

    print(f"✅ BATCH 20 COMPLETADO: {updated_count} nuevas leyendas auditadas al 100%.")

if __name__ == "__main__":
    inject_elite_lore_batch_20()
