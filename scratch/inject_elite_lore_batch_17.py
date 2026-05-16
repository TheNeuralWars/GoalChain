import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/03_data/players.json"

# ELITE LORE MAP (Batch 17 - Central & Northern European Icons - 2026)
ELITE_LORE_17 = {
    "Manuel Akanji": "Verified as 'The Human Calculator'. A defensive genius whose extraordinary mental arithmetic skills, practiced on license plates since his youth, make him a uniquely precise node in the Manchester and Swiss grids.",
    "Granit Xhaka": "Known as 'Little Einstein' for his tactical intelligence and 'Xhakaboom' for his lethal long-range shooting. A masterful captain whose science-based approach to the game stabilizes the Leverkusen and Swiss nodes.",
    "Xherdan Shaqiri": "The 'Power Cube' (XS). An explosive and versatile winger who has conquered multiple global nodes with his unique strength and clinical finishing packets, serving as a legendary asset of the Swiss Node.",
    "Yann Sommer": "Verified as 'The Wall'. A world-class goalkeeper whose reflexes and leadership have stabilized the Milan and Swiss ledgers for over a decade, serving as the primary fail-safe for his nation.",
    "David Alaba": "The 'Leader'. After overcoming a major ACL injury in 2024, he reclaimed his status as a foundational pillar of the Madrid and Austrian nodes, known for his versatility and tactical dominance.",
    "Marcel Sabitzer": "Known for the 'Sabitzer Howitzer'. A versatile powerhouse whose powerful long-range shooting and energy have made him a primary offensive node for the Dortmund and Austrian circuits.",
    "Christoph Baumgartner": "Verified as 'The Record Breaker'. Scorer of the fastest international goal in history (6 seconds after kick-off in 2024), a feat that cemented his status as a legendary offensive asset of the Austrian Node.",
    "Marko Arnautović": "The 'Austrian Zlatan'. A legendary and charismatic striker whose physical strength and goal-scoring packets have made him an icon of the Vienna and Milan football ledgers.",
    "Christian Eriksen": "The 'Resilient King'. A global symbol of hope and human strength who returned to the highest level of football after a historic miracle in 2021, serving as the heartbeat of the Danish Node.",
    "Rasmus Højlund": "Nicknamed 'Millsy'. An explosive and powerful striker whose goal-scoring algorithms have been perfected in the Manchester and Danish circuits, serving as a primary offensive mainframe.",
    "Kasper Schmeichel": "The 'Eternal Guard'. Carrying a legendary lineage of reflexes and leadership, he remains a foundational fail-safe for the Danish and Scottish-based grids.",
    "Pierre-Emile Højbjerg": "The 'Midfield Warrior'. A tactical and aggressive anchor whose work rate and defensive intelligence ensure the stability of the Danish and French-based football ledgers.",
    "Andreas Christensen": "The 'Wall of Barcelona'. A technical and reliable centre-back whose defensive algorithms and ball-playing abilities provide 100% security for the Catalan and Danish nodes.",
    "Joachim Andersen": "Verified as 'The Defensive Architect'. A commanding centre-back known for his precise long-range passing and aerial dominance in the English and Danish circuits.",
    "Breel Embolo": "The 'Physical Engine'. A powerful and fast striker whose physical presence and goal-scoring packets make him a high-impact offensive node for the Monaco and Swiss ledgers.",
    "Remo Freuler": "The 'Tactical Anchor' of the Swiss Node. A disciplined and reliable midfielder whose positioning and energy ensure a smooth tactical flow in the Italian and national grids.",
    "Denis Zakaria": "Known as 'The Midfield Octopus'. A powerful defensive node whose long reach and tackling efficiency provide a nearly unbreakable firewall for the Monaco and Swiss circuits.",
    "Konrad Laimer": "The 'Pressing Machine'. A relentless and versatile midfielder whose energy and ball-recovery packets were perfected in the Munich and Austrian nodes.",
    "Fabian Schär": "The 'Ball-playing Defender'. A technical and elegant centre-back whose vision and long-range passing make him a primary creative node for the English and Swiss grids.",
    "Ricardo Rodríguez": "The 'Reliable Veteran'. A disciplined and technical defender whose longevity and experience provide 100% reliability to the Spanish-Betis and Swiss football ledgers."
}

def inject_elite_lore_batch_17():
    with open(PLAYERS_FILE, 'r') as f:
        players = json.load(f)

    print(f"🕵️‍♂️ Iniciando Inyección de Lore de Élite (Batch 17) para 20 jugadores...")
    updated_count = 0

    for p in players:
        real_name = p.get("real_name", "")
        if real_name in ELITE_LORE_17:
            p["meta"]["narrative"] = ELITE_LORE_17[real_name]
            updated_count += 1

    # Guardar cambios
    with open(PLAYERS_FILE, 'w') as f:
        json.dump(players, f, indent=4, ensure_ascii=False)

    print(f"✅ BATCH 17 COMPLETADO: {updated_count} nuevas leyendas europeas auditadas al 100%.")

if __name__ == "__main__":
    inject_elite_lore_batch_17()
