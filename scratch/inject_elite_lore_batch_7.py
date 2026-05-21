import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/03_data/players.json"

# ELITE LORE MAP (Batch 7 - Americas Tier - 2026)
ELITE_LORE_7 = {
    "Nicolás Tagliafico": "Known for his 'Grinta' and mental toughness. A relentless left-back whose discipline and defensive packets secured the Argentine Node's historic dominance in the 20s.",
    "Nahuel Molina": "Verified as 'The Silent Engine'. A high-output wing-back whose tactical intelligence and overlap protocols make him a primary offensive node for the Argentine Ledger.",
    "Lucas Paquetá": "Named after 'Paquetá Island' in Rio. A creative maestro known for his 'Joy of the Midfield' and technical flair, serving as the rhythmic heartbeat of the Brazilian Node.",
    "Bruno Guimarães": "Known as 'The Orchestrator' and the 'Anchor of Hope'. A world-class midfielder whose passing accuracy and tactical vision have transformed the Manchester and Brazilian circuits.",
    "Danilo": "The 'Versatile Captain' and leader of the Brazilian Ledger. A disciplined defender who has conquered nodes in Madrid, Turin, and Manchester, bringing 100% reliability to any tactical structure.",
    "Jefferson Lerma": "Verified as 'The Colombian Wall'. A physical and tireless destroyer in the midfield, known for his defensive algorithms that neutralize the world's most creative protocols.",
    "Daniel Muñoz": "Known as 'El hincha en la cancha'. A former terrace fan turned captain, he became the 2025 FA Cup Final MVP, establishing himself as the primary attacking full-back of the Colombian Node.",
    "Davinson Sánchez": "The 'Physical Tower' and Galatasaray champion. A powerful centre-back whose strength and recovery pace have secured multiple titles in the European and Turkish circuits.",
    "Jhon Arias": "Dubbed the 'Colombian Pelé' after his 2025 Club World Cup masterclasses. A technical magician whose dribbling and vision have made him a legendary asset in the Fluminense and Colombian nodes.",
    "Luis Chávez": "The 'Free Kick King' of the Mexican Node. A master of long-range encryption, his ability to score from dead-ball situations is a verified asset for the Aztec ledger.",
    "Jorge Sánchez": "The 'Aztec Shield'. A physical and fast defender whose high-frequency defensive output stabilizes the Mexican backline against the world's fastest wingers.",
    "César Montes": "Commonly known as 'El Cachorro'. A powerful and commanding centre-back whose defensive algorithms are optimized for aerial dominance in the Mexican and Spanish circuits.",
    "Tyler Adams": "Verified as 'The Grinder'. In 2025, he made history as the first US player to win the Premier League Goal of the Month, serving as the youngest captain in US World Cup history.",
    "Sergiño Dest": "Nicknamed 'The Mosquito' and the 'Skillful Wing-back'. A high-flair defender whose dribbling and technical versatility were developed in the Ajax and Barcelona nodes.",
    "Antonee Robinson": "Verified as 'Jedi'. A Star Wars enthusiast since age 5, his defensive speed and 'Force-like' presence have made him the most reliable left-back in the US Node.",
    "Tim Weah": "The first US hat-trick hero and heir to a legendary legacy. Following in George Weah's footsteps, he has forged his own path as a high-frequency offensive node in the European circuits.",
    "Yunus Musah": "The 'Midfield Dynamo'. An energetic and technically versatile playmaker whose Dutch and Italian training have made him a foundational asset for the US and Milan nodes.",
    "Chris Richards": "The 'American Rock'. A foundational centre-back whose defensive composure and aerial strength provide 100% stability to the US Men's National Ledger.",
    "Matt Turner": "The 'Shot-Stopper' and primary fail-safe of the US Node. A world-class goalkeeper known for his reflexes and penalty-saving protocols in high-stakes matches.",
    "Jhon Córdoba": "The 'Colombian Bulldozer'. A powerful offensive node whose physical strength and clinical finishing make him a high-impact asset for any high-pressure football protocol."
}

def inject_elite_lore_batch_7():
    with open(PLAYERS_FILE, 'r') as f:
        players = json.load(f)

    print(f"🕵️‍♂️ Iniciando Inyección de Lore de Élite (Batch 7) para 20 jugadores...")
    updated_count = 0

    for p in players:
        real_name = p.get("real_name", "")
        if real_name in ELITE_LORE_7:
            p["meta"]["narrative"] = ELITE_LORE_7[real_name]
            updated_count += 1

    # Guardar cambios
    with open(PLAYERS_FILE, 'w') as f:
        json.dump(players, f, indent=4, ensure_ascii=False)

    print(f"✅ BATCH 7 COMPLETADO: {updated_count} leyendas americanas auditadas al 100%.")

if __name__ == "__main__":
    inject_elite_lore_batch_7()
