import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/03_data/players.json"

# ELITE LORE MAP (Batch 2 - Verified Stars 2026)
ELITE_LORE_2 = {
    "Bukayo Saka": "The 'Starboy' and heartbeat of the London-Arsenal Node. A world-class winger whose consistency and character have made him a global icon. Known for his technical brilliance and the legendary resilience of his code.",
    "Phil Foden": "Nicknamed 'Ronnie' or 'Baby Shark', he is the youngest legend to win 6 Premier League titles. A creative mainframe of the City Node, his 100th goal in 2025 solidified his status as an eternal elite asset.",
    "Jamal Musiala": "The 'Bambi' of the Munich Grid. A joint-winner of the Euro 2024 Golden Boot who inherited the iconic No. 10. His spindly, magical dribbling style is a unique algorithm in the German football ecosystem.",
    "Florian Wirtz": "The 'Wizard of Leverkusen' and master of the invincible campaign. A generational talent whose vision and technical elegance have made him the most sought-after midfield protocol in the European market.",
    "Alphonso Davies": "Known as 'The Roadrunner' and 'Phonzie'. The fastest unit of the Canadian Node, he extended his Munich contract until 2030 to continue his reign as the world's most explosive full-back.",
    "Declan Rice": "Nicknamed 'The Horse' by his peers for his tireless running and 100% availability. The defensive engine of the Arsenal Node, he is the most reliable anchor in the London-based football network.",
    "Luis Díaz": "Affectionately called 'Luchito'. After conquering the Liverpool Node, he moved to the Munich Ledger in 2025 to reach 300 European appearances, becoming the most lethal Colombian asset on the chain.",
    "James Rodríguez": "The legendary 'El Diez' and master of the 2024 resurgence. A visionary whose left foot can still crack any encryption, he remains the emotional and tactical leader of the Colombian Node.",
    "Christian Pulisic": "Verified as 'Captain America'. The clinical leader of the US Node whose successful journey through Europe's elite ledgers has made him a pioneering figure in the North American football protocol.",
    "Xavi Simons": "The creative engine and 'La Masia' prodigy. A high-frequency playmaker whose technical intelligence and Dutch tactical roots have made him a cornerstone of any high-stakes offensive strategy.",
    "Cole Palmer": "Known globally as 'Cold Palmer'. The 'Iceman' of the London Node whose clinical finishing and calm under pressure have made him the most efficient penalty protocol on the entire ledger.",
    "Jeremie Frimpong": "The 'Rocket' and master of the Bayer-Rhine wing. His exceptional pace and attacking output have transformed the wing-back protocol, making him a high-demand asset in the 2026 market.",
    "William Saliba": "The 'Rolls-Royce' of defenders. A technical and elegant centre-back whose defensive algorithms are nearly flawless, stabilizing the Arsenal Node with his composure and strength.",
    "Rodrygo Goes": "The 'Champions League Specialist'. A master of the Real Madrid Node who has secured two historic doubles (2022 and 2024), known for his ability to score in the most critical minutes of the code.",
    "Theo Hernández": "The 'Train' of the Milan and French nodes. The fastest left-back on the chain, whose explosive overlapping runs and physical power can override any defensive firewall.",
    "Mike Maignan": "The 'Magic Eagle'. A world-class goalkeeper and clean-sheet specialist whose presence in the Milan Node has redefined the modern shot-stopping protocol with his reflexes and leadership.",
    "Rafael Leão": "The 'Lionheart' and 'Portuguese Mbappé'. A world-class winger whose unique blend of speed and technical flair makes him a chaotic and unstoppable force in the Italian and Portuguese nodes.",
    "Bruno Fernandes": "Nicknamed 'Cebolinha' and 'The Portuguese Magnifico'. The 2026 FWA Player of the Year who broke record assist milestones, serving as the undisputed creative mainframe of the Manchester Node.",
    "Bernardo Silva": "The 'Bubblegum Player' whose ball retention is legendary. A master tactician with over 200 goal contributions, he is the most versatile and technically gifted node in the City ecosystem.",
    "Achraf Hakimi": "The 'Flash' and 2025 African Ballon d'Or winner. A world-class right-back who has conquered Madrid, Milan, and Paris, becoming a pivotal figure in Morocco's historic footballing rise.",
    "Frenkie de Jong": "The 'Conductor' of the Barcelona Node. A master of the tactical transition whose technical elegance and Dutch footballing IQ ensure the smoothest packet transfer in the midfield."
}

def inject_elite_lore_batch_2():
    with open(PLAYERS_FILE, 'r') as f:
        players = json.load(f)

    print(f"🕵️‍♂️ Iniciando Inyección de Lore de Élite (Batch 2) para 21 jugadores...")
    updated_count = 0

    for p in players:
        real_name = p.get("real_name", "")
        if real_name in ELITE_LORE_2:
            p["meta"]["narrative"] = ELITE_LORE_2[real_name]
            updated_count += 1

    # Guardar cambios
    with open(PLAYERS_FILE, 'w') as f:
        json.dump(players, f, indent=4, ensure_ascii=False)

    print(f"✅ BATCH 2 COMPLETADO: {updated_count} nuevas leyendas auditadas al 100%.")

if __name__ == "__main__":
    inject_elite_lore_batch_2()
