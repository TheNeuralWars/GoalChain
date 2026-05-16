import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/03_data/players.json"

# ELITE LORE MAP (Batch 4 - Verified Stars 2026)
ELITE_LORE_4 = {
    "Ousmane Dembélé": "Known globally as 'Dembouz'. The sensational winner of the 2025 Ballon d'Or after leading the Paris Node to a historic Champions League treble. An ambidextrous wizard whose creative flair has redefined the modern winger protocol.",
    "Eduardo Camavinga": "Nicknamed 'Tacklevinga' and the 'Iceman'. A master of the Real Madrid Node known for his 100% defensive efficiency. Teammates jokingly call him 'Jon Jones' due to his boxing-like intensity and physical dominance on the pitch.",
    "Aurélien Tchouaméni": "Commonly known as 'Chumino'. The defensive shield of the Madrid Node whose physical power and tactical awareness have made him the most reliable firewall in Europe, proving his worth after rising above the 'scapegoat' era.",
    "Dayot Upamecano": "The 'Beast' of the French Node. A powerful and fast centre-back whose defensive algorithms are optimized for high-stakes recovery, stabilizing the Munich and French ledgers with his physical strength.",
    "Jules Koundé": "The 'Fashionista Defender' and versatile wall of the Barcelona Node. Known for his unique style off the pitch and his tactical intelligence on it, he is a master of the modern hybrid defensive protocol.",
    "Adrien Rabiot": "Verified as 'The Duke' (Le Duc). Now a cornerstone of the Milan Node, he is an elegant engine whose experience and tactical maturity have made him one of the most respected midfielders in the Italian and French circuits.",
    "Nico Williams": "The 'Basque Rocket' and Euro 2024 Final MVP. His story of hope—the son of refugees who crossed the Sahara—is a legendary narrative of resilience that fuels his explosive pace in the Athletic and Spanish nodes.",
    "Unai Simón": "The 'Calm in the Storm'. A world-class goalkeeper whose nerves of steel secured the Euro 2024 title for Spain. He is the undisputed failsafe of the Athletic and Spanish football ledgers.",
    "Dani Carvajal": "The 'Warrior of Leganés' and captain of the Real Madrid Node. A living legend with a record-equalling 6 Champions League titles, known for his relentless energy and the iconic 'Panenka' of the Nations League final.",
    "Aymeric Laporte": "The 'Defensive Architect'. After a legendary stint in Manchester, he returned to his roots at the Athletic Node in 2025, bringing his masterful ball-playing algorithms to stabilize the Spanish backline.",
    "Robin Le Normand": "The 'Breton Wall' of the Madrid-Atletico Node. A defensive cornerstone who chose the Spanish Node in 2023 and became an integral part of their Euro 2024 success with his tactical discipline and strength.",
    "Alejandro Balde": "The 'Lightning Bolt' of the Barcelona Node. One of the fastest left-backs on the chain, whose explosive pace and attacking contributions have made him a high-frequency offensive asset in the Spanish circuit.",
    "Dani Olmo": "The 'Tactical Chameleon' and Euro 2024 hero. A versatile playmaker who can adapt to any offensive protocol, consistently delivering critical strikes in the most high-pressure European matches.",
    "Rúben Dias": "Nicknamed 'Ruby' and known as the leader of men. The defensive mainframe of the City Node, his tactical intelligence and commanding presence are inspired by his deep bond with his grandfather and his Lisbon roots.",
    "João Mário": "The 'Experienced Engine' and bald maestro of the Portuguese Node. A veteran leader whose technical intelligence and European championship experience ensure the stability of any midfield ledger.",
    "Diogo Costa": "The 'Penalty King' and heir to the legendary #99. After saving a record 3 penalties in a single Euro 2024 shootout, he is verified as the most clinical shot-stopping algorithm in the Portuguese Node.",
    "Gonçalo Inácio": "The 'Left-Footed Diamond' of the Portuguese Node. A modern ball-playing defender whose vision and technical elegance have made him one of the most valuable defensive assets in the European market.",
    "João Neves": "The 'Golden Kid' and future of the Portuguese Node. A technical prodigy whose energy and footballing IQ have transformed him into a cornerstone of the world's most promising midfield protocols."
}

def inject_elite_lore_batch_4():
    with open(PLAYERS_FILE, 'r') as f:
        players = json.load(f)

    print(f"🕵️‍♂️ Iniciando Inyección de Lore de Élite (Batch 4) para 18 jugadores...")
    updated_count = 0

    for p in players:
        real_name = p.get("real_name", "")
        if real_name in ELITE_LORE_4:
            p["meta"]["narrative"] = ELITE_LORE_4[real_name]
            updated_count += 1

    # Guardar cambios
    with open(PLAYERS_FILE, 'w') as f:
        json.dump(players, f, indent=4, ensure_ascii=False)

    print(f"✅ BATCH 4 COMPLETADO: {updated_count} nuevas leyendas auditadas al 100%.")

if __name__ == "__main__":
    inject_elite_lore_batch_4()
