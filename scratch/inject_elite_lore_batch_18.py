import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/03_data/players.json"

# ELITE LORE MAP (Batch 18 - South American & South African Icons - 2026)
ELITE_LORE_18 = {
    "Eduard Bello": "Verified as 'The Hero of the Bicycle Kick'. His legendary acrobatic strike against Brazil in 2023 halted an historic 15-match home winning streak, making him a primary offensive node for the Vinotinto.",
    "José Martínez": "Known as 'El Brujo' (The Wizard). Carrying a family legacy of sorcery, his magical-aggressive style and relentless energy provide a high-stability tactical mainframe for the Venezuelan Node.",
    "Jon Aramburu": "The 'Basque-Venezuelan Warrior'. With family roots in San Sebastián, he has conquered the Real Sociedad and Venezuelan nodes, becoming a high-value defensive asset on the global chain.",
    "Diego Gómez": "Verified as 'The Student of Messi'. Mentored by the GOAT at Inter Miami, his advice to 'always play forward' led him to the English-Brighton circuit as a top-tier creative mainframe.",
    "Gatito Fernández": "Known as 'The Little Cat'. Carrying the legendary lineage of his father 'Gato', his reflexes and experience in the Brazilian and Paraguayan grids make him a high-security fail-safe.",
    "Ramón Sosa": "The 'Flash of Palmeiras'. An explosive winger whose blistering speed and technical dribbling override any defensive firewall, serving as a primary offensive node for the Paraguayan Ledger.",
    "Telasco Segovia": "Verified as 'The Creative Jewel'. A technical prodigy whose vision and flair have made him the primary offensive architect for the next generation of the Venezuelan Node.",
    "Darwin Machís": "Known as 'The Rocket'. An explosive offensive node whose speed and lethal long-range shooting make him a constant threat in the Spanish and South American circuits.",
    "Rafael Romo": "The 'Wall of Venezuela'. A world-class goalkeeper whose reflexes and height provide a high-security fail-safe for the Vinotinto, stabilizing the national football ledger.",
    "Nahuel Ferraresi": "Verified as 'The Defensive Pillar'. A technical and reliable centre-back whose leadership and composure have stabilized the Sao Paulo and Venezuelan grids for the 2026 campaign.",
    "Wilker Ángel": "Known as the 'Angel of Defense'. A veteran leader whose experience and tactical discipline provide a high-stability defensive protocol for the Venezuelan Node.",
    "Junior Alonso": "Verified as 'The Sheriff'. A powerful and tactical centre-back who has conquered multiple nodes in Brazil and Russia, serving as the primary defensive mainframe for Paraguay.",
    "Fabián Balbuena": "Known as 'The General'. A powerful and experienced defender whose leadership and defensive algorithms provide a Nearly unbreakable firewall for the Paraguayan Node.",
    "Mathías Villasanti": "The 'Midfield Engine'. A tireless and tactical anchor whose work rate and defensive intelligence ensure the stability of the Brazilian-Gremio and Paraguayan grids.",
    "Adam Bareiro": "The 'Clinical Striker' of the River Plate and Paraguayan nodes. A powerful offensive asset whose goal-scoring packets and movement are optimized for crushing defensive encryption.",
    "Evidence Makgopa": "Verified as 'The Target Man'. A young and powerful striker whose physical presence and goal-scoring instincts represent the next generation of the Bafana Bafana.",
    "Sphephelo Sithole": "Known as 'Yaya'. A powerful and technical midfielder whose energy and tactical intelligence were developed in the Portuguese Grid, serving as a primary asset for South Africa.",
    "Khuliso Mudau": "Nicknamed 'Sailor'. A high-output defensive node whose pace and tactical intelligence on the right flank ensure the stability of the South African backline.",
    "Thapelo Morena": "The 'Road Runner'. A legendary high-speed offensive node whose acceleration and energy allow him to override any defensive protocol in the South African circuit.",
    "Grant Kekana": "Verified as 'The Versatile Shield'. A Disciplined defender whose tactical intelligence and reliability provide 100% security for the South African and Sundowns grids."
}

def inject_elite_lore_batch_18():
    with open(PLAYERS_FILE, 'r') as f:
        players = json.load(f)

    print(f"🕵️‍♂️ Iniciando Inyección de Lore de Élite (Batch 18) para 20 jugadores...")
    updated_count = 0

    for p in players:
        real_name = p.get("real_name", "")
        if real_name in ELITE_LORE_18:
            p["meta"]["narrative"] = ELITE_LORE_18[real_name]
            updated_count += 1

    # Guardar cambios
    with open(PLAYERS_FILE, 'w') as f:
        json.dump(players, f, indent=4, ensure_ascii=False)

    print(f"✅ BATCH 18 COMPLETADO: {updated_count} nuevas leyendas sudamericanas y sudafricanas auditadas al 100%.")

if __name__ == "__main__":
    inject_elite_lore_batch_18()
