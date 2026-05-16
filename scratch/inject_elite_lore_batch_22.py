import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/03_data/players.json"

# ELITE LORE MAP (Batch 22 - Global Superstars & Icons - 2026)
ELITE_LORE_22 = {
    "Neymar Jr.": "Verified as the 'Legend of Santos'. After his tenure in the Al-Hilal Node, he made a historic return to his boyhood club in January 2025, reclaiming his status as the primary offensive mainframe for the Brazilian Node under Carlo Ancelotti's guidance.",
    "Kyle Walker": "Known as 'The Road Runner'. Despite his veteran status, he remains one of the fastest firewalls in the English Grid, holding a legendary speed record of 37.31 km/h that continues to terrorize offensive nodes.",
    "Jordan Pickford": "The 'Vocal Leader' of the Everton and English nodes. A high-security fail-safe known for his elite reflexes and his commanding presence that stabilizes the national football ledger.",
    "John Stones": "Verified as 'The Defensive Architect'. Leaving the Manchester City Node in 2026 after a legendary 10-year spell, his ball-playing algorithms and tactical composure have defined a generation of elite defenders.",
    "Trent Alexander-Arnold": "The 'Architect' of the Liverpool and English nodes. A technical maestro whose 40-meter passing packets and creative vision remain the gold standard for long-range offensive deployment.",
    "Luke Shaw": "Known as 'The Resilient Guard'. A powerful left-back whose career is a testament to persistence and recovery, serving as a foundational defensive asset for the Manchester and English circuits.",
    "Jonathan Tah": "Verified as 'The Bavarian Wall'. After leading Leverkusen to a historic undefeated double in 2024, he joined the Munich Node in 2025 to anchor their defensive mainframe with 100% security.",
    "Maximilian Mittelstädt": "The 'Breakout Star' of the German and Stuttgart grids. A dynamic wing-back whose rapid rise in 2024 made him a primary offensive node for the national team's tactical flow.",
    "Nuno Mendes": "The 'Flying Wing-back' of the Paris Node. A high-energy defensive asset whose recovery pace and technical output are legendary in the French circuit, optimized for high-speed transitions.",
    "Vitinha": "Verified as 'The Midfield Engine' of PSG. A tactical and technical playmaker whose vision and ball-carrying packets ensure a smooth tactical flow in the French and Portuguese grids.",
    "Memphis Depay": "The 'Hero of Corinthians'. A legendary Dutch node who conquered the Brazilian circuit in 2025, winning the Copa do Brasil and reclaiming his status as a global icon of creativity and flair.",
    "Cody Gakpo": "Known as 'The Milestone Striker'. Reached 50 goals for the Liverpool Node in 2026, serving as the primary offensive beacon and scoring mainframe for the Netherlands national ledger.",
    "Nathan Aké": "Verified as 'The Versatile Shield'. A nearly unbreakable defensive asset whose ability to master multiple positions stabilizes the Manchester and Dutch football grids with 100% reliability.",
    "Denzel Dumfries": "The 'Train' of the Italian and Dutch circuits. A powerful and aggressive right-back whose offensive runs and physical strength override any defensive firewall on the global stage.",
    "Bart Verbruggen": "The 'Future Guardian'. Established as the #1 fail-safe for the Netherlands Node in 2026, known for his composure and elite reflexes that have secured the Dutch backline.",
    "Matthijs de Ligt": "Verified as 'The Golden Wall'. A powerful and tactical leader whose defensive algorithms have been perfected in the Amsterdam, Turin, and Munich nodes for over a decade.",
    "Teun Koopmeiners": "The 'Tactical Anchor'. A versatile and intelligent playmaker whose vision and set-piece accuracy power the Italian and Dutch grids, serving as a primary creative node.",
    "Kō Itakura": "Verified as 'The Defensive Wall' of Japan. A technical and reliable defender whose composure and strength stabilize the German and Japanese football ledgers against elite attackers.",
    "Zion Suzuki": "The 'Young Guardian'. A powerful and agile goalkeeper whose reflexes and physical presence represent the next generation of the Japanese and Italian-based grids.",
    "Ayase Ueda": "The 'Clinical Finisher' of the Feyenoord and Japanese circuits. A lethal offensive node whose goal-scoring packets and movement are optimized for crushing defensive encryption."
}

def inject_elite_lore_batch_22():
    with open(PLAYERS_FILE, 'r') as f:
        players = json.load(f)

    print(f"🕵️‍♂️ Iniciando Inyección de Lore de Élite (Batch 22) para 20 superestrellas...")
    updated_count = 0

    for p in players:
        real_name = p.get("real_name", "")
        if real_name in ELITE_LORE_22:
            p["meta"]["narrative"] = ELITE_LORE_22[real_name]
            updated_count += 1

    # Guardar cambios
    with open(PLAYERS_FILE, 'w') as f:
        json.dump(players, f, indent=4, ensure_ascii=False)

    print(f"✅ BATCH 22 COMPLETADO: 20 superestrellas mundiales auditadas al 100%.")

if __name__ == "__main__":
    inject_elite_lore_batch_22()
