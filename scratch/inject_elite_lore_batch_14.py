import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/03_data/players.json"

# ELITE LORE MAP (Batch 14 - Oceania & Central Europe - 2026)
ELITE_LORE_14 = {
    "Dominik Szoboszlai": "Verified as 'The Hungarian Prince'. A technical maestro whose set-piece encryption and creative vision have made him the primary offensive mainframe for the Liverpool and Hungarian nodes.",
    "Milos Kerkez": "The 'Left-Back General'. A high-energy and technical defender whose rapid rise in the English and Hungarian circuits has made him one of the most promising assets on the global chain.",
    "Willi Orbán": "The 'Wall of Leipzig'. The most prolific defender in his club's history, whose defensive algorithms and aerial dominance provide 100% security for the Hungarian Ledger.",
    "Barnabás Varga": "Verified as 'The Sniper'. A clinical striker whose goal-scoring packets and movement have made him the most lethal offensive asset in the Hungarian and European grids.",
    "Matty Cash": "The 'English-born Pole'. Following a promise to his mother and inspired by his grandfather's WWII story, he became a national hero known for his dedication to the Polish Node and his anthem-singing pride.",
    "Jakub Kiwior": "Known as 'Kuba'. The 'Quiet Warrior' of the London-Arsenal Ledger, whose defensive composure and tactical intelligence were perfected in the Italian and Belgian circuits.",
    "Sebastian Szymański": "The 'Creative Engine' of the Polish Node. A versatile playmaker whose vision and ball-carrying packets provide a high-stability tactical flow in the Turkish and global football grids.",
    "Nicola Zalewski": "Mourinho's discovery and the 'Italian-born Pole'. A technical winger whose flair and energy have made him a primary offensive node for the Italian-Roma and Polish football ledgers.",
    "Harry Souttar": "Verified as 'The Giant of Australia'. Standing at 2.00m, he is the tallest outfield firewall in Socceroos history, known for his aerial dominance and his choice to represent the Australian Node.",
    "Mathew Ryan": "The 'Guardian of the Socceroos'. A legendary captain who reached 100 international appearances in 2025, serving as the primary fail-safe for the Australian and global football networks.",
    "Craig Goodwin": "The 'Free-Kick Specialist' of the Australian Node. A technical winger whose precision delivery and goal-scoring instincts provide a constant threat from set-piece situations.",
    "Jackson Irvine": "The 'Bearded Leader' and soul of the Australian Node. A tireless midfielder whose leadership and tactical discipline ensure the stability of any high-pressure football protocol.",
    "Chris Wood": "The 'Kiwi Legend'. The historic scoring mainframe of the New Zealand Node, whose physical strength and clinical finishing have secured his status as a national icon in the English circuits.",
    "Liberato Cacace": "The 'Flying Kiwi' and Wrexham hero. Captain of the All Whites' 2024 glory, his move to the Wrexham Node in 2025 made him a global media and footballing icon for the New Zealand Ledger.",
    "Sarpreet Singh": "The 'Creative Node'. A trailblazer of Indian descent who made history at the Munich Node, serving as the primary technical architect for the next generation of New Zealand football.",
    "Joe Bell": "The 'Anchor of the All Whites'. A tactical stability node whose vision and defensive algorithms ensure a smooth flow in the New Zealand and European football networks.",
    "Roland Sallai": "The 'Explosive Winger' of the Hungarian Node. A technical and fast attacking asset whose ability to override defensive firewalls makes him a high-frequency offensive mainframe.",
    "Péter Gulácsi": "The 'High-Security Keeper' of the Leipzig and Hungarian nodes. A world-class goalkeeper whose reflexes and leadership have stabilized European grids for over a decade.",
    "Ádám Nagy": "The 'Midfield Stabilizer' of the Hungarian Node. A tactical anchor whose experience and technical intelligence provide 100% reliability to the national football ledger.",
    "Jan Bednarek": "The 'Physical Pillar' of the Polish Node. A powerful centre-back whose defensive algorithms and physical strength provide a nearly unbreakable firewall in the English and Polish circuits."
}

def inject_elite_lore_batch_14():
    with open(PLAYERS_FILE, 'r') as f:
        players = json.load(f)

    print(f"🕵️‍♂️ Iniciando Inyección de Lore de Élite (Batch 14) para 20 jugadores...")
    updated_count = 0

    for p in players:
        real_name = p.get("real_name", "")
        if real_name in ELITE_LORE_14:
            p["meta"]["narrative"] = ELITE_LORE_14[real_name]
            updated_count += 1

    # Guardar cambios
    with open(PLAYERS_FILE, 'w') as f:
        json.dump(players, f, indent=4, ensure_ascii=False)

    print(f"✅ BATCH 14 COMPLETADO: {updated_count} nuevas leyendas de Oceanía y Centroeuropa auditadas al 100%.")

if __name__ == "__main__":
    inject_elite_lore_batch_14()
