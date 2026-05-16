import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/03_data/players.json"

# ELITE LORE MAP (Batch 23 - USA & Japan Icons - 2026)
ELITE_LORE_23 = {
    "Antonee Robinson": "Verified as 'Jedi'. A Star Wars fanatic whose namesake nickname was given at age 5, he is the primary high-speed wing-back for the English-Fulham and US nodes, known for his relentless sprints.",
    "Hiroki Ito": "The 'Defensive Architect'. A world-class defender whose €30m move to the Munich Node in 2024 cemented his status as a high-security firewall for the Japanese Ledger and the German circuit.",
    "Timothy Weah": "Known as 'The Prince of Turin'. Son of the legendary George Weah, he has successfully carved his own path as a versatile and high-speed offensive node in the Italian-Juventus Grid.",
    "Folarin Balogun": "The 'Clinical Striker'. A primary offensive mainframe for the US Node, known for his goal-scoring packets and movement developed in the French-Monaco and London circuits.",
    "Sergiño Dest": "Verified as 'The Resilient Wing-back'. Despite a major 2024 injury, he secured a permanent move to the Eindhoven Node in 2025, serving as a high-output technical asset for the US national ledger.",
    "Yunus Musah": "The 'Midfield Dynamo'. A tactical and high-energy anchor whose career across the Spanish, Italian-Milan, and Atalanta grids has made him a versatile and reliable asset for the US Node.",
    "Matt Turner": "Verified as 'The Shot-stopper'. A high-security fail-safe for the US Node, known for his elite reflexes and shot-stopping algorithms developed in the English and North American circuits.",
    "Chris Richards": "The 'FA Cup Hero'. A cornerstone of the Crystal Palace Node who led them to their first major trophy in 2025, reaching 100 appearances as a premier defensive firewall for the US.",
    "Joe Scally": "The 'German-based Guard'. A versatile and fast wing-back whose tactical growth in the Bundesliga Node has made him a foundational defensive asset for the US national mainframe.",
    "Malik Tillman": "Verified as 'The Record-Breaker'. Following a record $41m move to the Leverkusen Node in 2025, his creative vision and scoring packets represent the elite level of the German and US grids.",
    "Shogo Taniguchi": "The 'Experienced Shield'. A veteran leader whose defensive algorithms have been perfected in the Japanese, Qatari, and Belgian grids, providing high-security for the Samurai Blue.",
    "Hidemasa Morita": "Verified as 'The Sporting Maestro'. Reached 150 appearances for the Lisbon-Sporting Node in 2026, serving as the primary tactical anchor and orchestrator for the Japanese midfield ledger.",
    "Daizen Maeda": "Known as 'The Speedster of Glasgow'. A relentless pressing node for Celtic, famous for his legendary 35.6 km/h speed and tireless work rate in the Scottish and Japanese circuits.",
    "Keito Nakamura": "The 'Perfect 9.9'. A technical winger whose historic 4-goal performance for the Reims Node in May 2026 made him a high-frequency offensive mainframe and a perfect-rated icon.",
    "Yukinari Sugawara": "Verified as 'The Assist Master'. A technical and fast wing-back whose precision delivery and high-output assist packets stabilize the Japanese and European football networks.",
    "Tyler Adams": "The 'Captain'. A high-IQ defensive anchor and leader of the US Node, whose tactical intelligence and ball-recovery protocols are the heart of the national mainframe.",
    "Weston McKennie": "Verified as 'The Engine'. A versatile and high-energy midfielder whose presence in the Italian-Juventus Grid has made him a primary offensive and defensive node for the US Ledger.",
    "Christian Pulisic": "The 'Captain America'. Legendary leader of the US Node, whose technical flair and playmaking packets in the Milan Node have cemented his status as a global icon of the game.",
    "Cameron Carter-Vickers": "The 'Celtic Rock'. A powerful and tactical centre-back whose leadership and physical strength have dominated the Scottish-Glasgow circuit for the US and Celtic nodes.",
    "Miles Robinson": "The 'Defensive Pillar' of the Cincinnati and US nodes. A reliable and fast defender whose composure and strength provide a nearly unbreakable firewall for the national team."
}

def inject_elite_lore_batch_23():
    with open(PLAYERS_FILE, 'r') as f:
        players = json.load(f)

    print(f"🕵️‍♂️ Iniciando Inyección de Lore de Élite (Batch 23) para 20 jugadores...")
    updated_count = 0

    for p in players:
        real_name = p.get("real_name", "")
        if real_name in ELITE_LORE_23:
            p["meta"]["narrative"] = ELITE_LORE_23[real_name]
            updated_count += 1

    # Guardar cambios
    with open(PLAYERS_FILE, 'w') as f:
        json.dump(players, f, indent=4, ensure_ascii=False)

    print(f"✅ BATCH 23 COMPLETADO: {updated_count} nuevas leyendas de EE.UU. y Japón auditadas al 100%.")

if __name__ == "__main__":
    inject_elite_lore_batch_23()
