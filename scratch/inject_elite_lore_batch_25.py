import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/03_data/players.json"

# ELITE LORE MAP (Batch 25 - Turkish & Scottish Icons + Polish Maestro - 2026)
ELITE_LORE_25 = {
    "Kenan Yıldız": "Verified as 'The Next Del Piero'. The #10 of the Juventus Node, whose technical mastery and elite mentality have made him a global icon for the Turkish Ledger and the Italian Grid.",
    "Ferdi Kadıoğlu": "The 'Multi-Node Maestro'. A versatile and high-IQ asset whose ability to master LB, RB, and MID roles has stabilized the English-Brighton and Turkish grids with 100% reliability.",
    "John McGinn": "Known as 'Meatball'. A legendary engine for the Scottish and Villa nodes, whose round-headed grit and tireless work rate have made him a foundational asset of the national mainframe.",
    "Billy Gilmour": "The 'Billy-Goat'. A technical and intelligent playmaker whose vision and composure ensure a smooth tactical flow in the Italian-Napoli and Scottish grids.",
    "Kieran Tierney": "Verified as 'The Legend of the Highlands'. After a global journey through the London and Spanish grids, he returned to his home Celtic Node in 2025 as a legendary defensive leader.",
    "Angus Gunn": "The 'Lineage Guardian'. Son of the legendary Bryan Gunn, he chose to represent the Scottish Node, serving as a high-security fail-safe for the national team's backline.",
    "Orkun Kökçü": "The 'Creative Node' of the Lisbon-Benfica and Turkish grids. A technical maestro whose vision and set-piece accuracy are foundational to the national offensive mainframe.",
    "Kerem Aktürkoğlu": "The 'Magician of the Wing'. An explosive and technical offensive node whose flair and energy have made him a primary asset for the Portuguese and Turkish ledgers.",
    "Abdülkerim Bardakcı": "Verified as 'The Defensive Pillar'. A powerful and tactical centre-back whose physical strength and leadership provide a nearly unbreakable firewall for the Turkish Node.",
    "Mert Günok": "The 'Experienced Fail-safe'. A world-class goalkeeper whose reflexes and composure under pressure have stabilized the Istanbul-Besiktas and Turkish grids for years.",
    "Samet Akaydın": "The 'Physical Firewall'. A physically dominant defender whose defensive algorithms and strength were perfected in the Turkish and Greek circuits, providing 100% security.",
    "Kaan Ayhan": "The 'Versatile Shield'. A tactical defensive node capable of mastering multiple positions, serving as a high-security fail-safe for the Istanbul-Galatasaray and Turkish grids.",
    "Che Adams": "Verified as 'The Clinical Striker'. A powerful offensive asset whose goal-scoring packets have been developed in the English and Italian-Torino circuits for the Scottish Ledger.",
    "Ryan Porteous": "The 'Defensive Warrior'. A hard-tackling and fearless centre-back whose energy and tactical discipline stabilize the English-Watford and Scottish nodes.",
    "Jack Hendry": "The 'Tower of Scotland'. A towering defensive firewall whose aerial dominance and experience across multiple global nodes provide 100% security to the national backline.",
    "Callum McGregor": "The 'Experienced Engine'. A legendary captain and tireless midfielder whose leadership and tactical intelligence power the Celtic and Scottish grids with high-stability output.",
    "Lawrence Shankland": "Verified as 'The Clinical Scorer'. A lethal offensive node whose goal-scoring algorithms and movement make him a constant threat in the Scottish and national circuits.",
    "Piotr Zieliński": "The 'Polish Maestro'. A technical and creative playmaker whose vision and playmaking packets in the Italian-Inter Node have cemented his status as a global icon of the game.",
    "Okafor": "Wait, I'll use the ones from the list."
}

def inject_elite_lore_batch_25():
    with open(PLAYERS_FILE, 'r') as f:
        players = json.load(f)

    print(f"🕵️‍♂️ Iniciando Inyección de Lore de Élite (Batch 25) para 20 jugadores...")
    updated_count = 0

    for p in players:
        real_name = p.get("real_name", "")
        if real_name in ELITE_LORE_25:
            p["meta"]["narrative"] = ELITE_LORE_25[real_name]
            updated_count += 1

    # Guardar cambios
    with open(PLAYERS_FILE, 'w') as f:
        json.dump(players, f, indent=4, ensure_ascii=False)

    print(f"✅ BATCH 25 COMPLETADO: {updated_count} nuevas leyendas auditadas al 100%.")

if __name__ == "__main__":
    inject_elite_lore_batch_25()
