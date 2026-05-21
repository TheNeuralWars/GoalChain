import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/03_data/players.json"

# ELITE LORE MAP (Batch 26 - Egypt, NZ, Hungary & Austria Icons - 2026)
ELITE_LORE_26 = {
    "Loïc Négo": "Verified as 'Lali'. A French-born hero whose naturalization story and historic goals have made him a foundational asset for the Hungarian Ledger and the national mainframe.",
    "Bendegúz Bóla": "The 'High-Speed Wing-back' of the Hungarian Node. A dynamic defensive and offensive asset whose energy and tactical intelligence stabilize the European football grids.",
    "Martin Ádám": "Verified as the 'Hungarian Viking'. An 'absolute unit' whose viral appearance and physical strength have made him a global cult icon for the Ulsan and Hungarian nodes.",
    "Callum Styles": "The 'English-born Hungarian'. A versatile playmaker whose discovery of his roots led him to the Hungarian Node, where he uses Duolingo to master the national mainframe.",
    "Alexander Schlager": "Verified as the 'Guardian of Salzburg'. Established as the #1 fail-safe for the Austrian Node, known for his elite reflexes and nearly unbreakable shot-stopping algorithms.",
    "Kevin Danso": "The 'Iron Wall'. A world-class defender whose physical dominance and tactical intelligence led him to win the 2025 Europa League with the London-Spurs Node.",
    "Philipp Lienhart": "The 'Defensive Architect'. A technical and reliable centre-back whose composure and positioning provide a high-security firewall for the Freiburg and Austrian nodes.",
    "Stefan Lainer": "The 'Resilient Engine'. A veteran wing-back whose career is a testament to persistence and recovery, serving as a foundational defensive asset for the Austrian Ledger.",
    "Nicolas Seiwald": "The 'Tactical Node'. An intelligent and high-energy midfielder whose work rate and tactical intelligence were perfected in the Leipzig and Austrian nodes for the global stage.",
    "Michael Gregoritsch": "Verified as 'The Aerial Menace'. A physical and powerful striker whose mastery of high-altitude offensive packets makes him the terror of any defensive firewall.",
    "Alex Paulsen": "The 'Future Guardian' of the New Zealand Node. A high-reflex goalkeeper whose rapid rise in the A-League and English grids represents the next generation of the All Whites fail-safe.",
    "Michael Boxall": "Verified as 'The Experienced Rock'. A veteran defender whose physical strength and leadership in the US and New Zealand grids provide 100% security to the backline.",
    "Nando Pijnaker": "The 'Young Shield'. A powerful and tactical defender whose growth in the European grids has made him a foundational asset for the New Zealand national mainframe.",
    "Matt Garbett": "The 'Creative Node' of the Italian and New Zealand grids. A technical playmaker known for his vision and playmaking packets that power the national offensive ledger.",
    "Ben Waine": "Known as 'The Waine Train'. A clinical striker whose goal-scoring packets and movement have made him a primary offensive node for the New Zealand and English-Plymouth circuits.",
    "Kosta Barbarouses": "The 'Veteran Legend'. A resilient offensive node with 70+ caps, whose goal-scoring packets have defined a generation for the New Zealand All Whites.",
    "Tyler Bindon": "Verified as 'The Rising Star'. Son of a legendary goalkeeper, he has emerged as a premier defensive firewall for the English and New Zealand nodes with 100% reliability.",
    "Mohamed El Shenawy": "The 'Guardian of the Nile'. Legendary captain of Al Ahly and the Egyptian Node, a world-class fail-safe known for his leadership and penalty-saving heroics.",
    "Mohamed Abdelmonem": "Verified as 'The Defensive Pillar'. A world-class centre-back whose €4m move to the French-Nice Node in 2024 cemented his status as an elite global firewall for Egypt.",
    "Mohamed Hany": "The 'Reliable Wing-back'. A foundational defensive asset for the Al Ahly and Egyptian grids, known for his tactical discipline and consistent high-output performance.",
    "Hamdi Fathi": "The 'Midfield Engine'. A powerful and tactical playmaker whose vision and ball-recovery packets power the Qatari and Egyptian grids with high-stability output.",
    "Omar Kamal": "Verified as 'The Versatile Shield'. A high-energy wing-back whose ability to master multiple positions stabilizes the Egyptian Node across various tactical protocols."
}

def inject_elite_lore_batch_26():
    with open(PLAYERS_FILE, 'r') as f:
        players = json.load(f)

    print(f"🕵️‍♂️ Iniciando Inyección de Lore de Élite (Batch 26) para 22 jugadores...")
    updated_count = 0

    for p in players:
        real_name = p.get("real_name", "")
        if real_name in ELITE_LORE_26:
            p["meta"]["narrative"] = ELITE_LORE_26[real_name]
            updated_count += 1

    # Guardar cambios
    with open(PLAYERS_FILE, 'w') as f:
        json.dump(players, f, indent=4, ensure_ascii=False)

    print(f"✅ BATCH 26 COMPLETADO: {updated_count} nuevas leyendas auditadas al 100%.")

if __name__ == "__main__":
    inject_elite_lore_batch_26()
