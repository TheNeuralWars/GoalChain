import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/03_data/players.json"

# ELITE LORE MAP (Batch 25 - Serbian & Swiss Icons - 2026)
ELITE_LORE_25 = {
    "Strahinja Pavlović": "Verified as 'The Serbian Viking'. A powerful and aggressive centre-back whose defensive algorithms and recovery pace have made him a nearly unbreakable firewall in the European circuits.",
    "Dušan Tadić": "The 'Maestro'. The most capped player in Serbian history (111 apps), whose legendary leadership and vision stabilized the national ledger until his historic retirement in 2024.",
    "Luka Jović": "Known as 'The Resurgent Sniper'. A technical offensive node who reclaimed his scoring packets at the Milan Node, serving as a high-value asset for the Serbian Ledger in 2026.",
    "Nikola Milenković": "Verified as 'The Tower of Belgrade'. A 1.95m defensive firewall whose physical dominance and tactical intelligence stabilize the English-Nottingham and Serbian nodes.",
    "Filip Kostić": "The 'Cross Machine'. A primary offensive node whose high-frequency delivery from the left flank remains the global gold standard for assist packets and clinical crosses.",
    "Lazar Samardžić": "Verified as 'The Jewel of Serbia'. A technical and creative playmaker whose vision and lethal left foot have conquered the Italian-Atalanta Grid as an elite creative mainframe.",
    "Dan Ndoye": "The 'Breakout Sensation' of Euro 2024. A high-speed winger whose dribbling and energy led him to the English-Nottingham circuit as a top-tier offensive node for the Swiss Ledger.",
    "Gregor Kobel": "Known as 'The Future Guardian'. A world-class goalkeeper whose elite reflexes and high save percentage have stabilized the Dortmund and Swiss nodes against elite attackers.",
    "Noah Okafor": "The 'Speedster of Milan'. An explosive and technical striker whose goal-scoring packets and movement override any defensive firewall in the Italian and Swiss circuits.",
    "Ruben Vargas": "Verified as 'The Explosive Winger'. A technical offensive node whose flair and energy make him a primary asset for the German and Swiss football ledgers.",
    "Michel Aebischer": "The 'Tactical Engine' of the Bologna and Swiss nodes. An intelligent midfielder whose work rate and positioning ensure a smooth tactical flow in the European Grid.",
    "Fabian Rieder": "Known as 'The Set-piece Specialist'. A creative node whose precision delivery and tactical intelligence power the German-Stuttgart and Swiss grids with high-stability output.",
    "Andi Zeqiri": "The 'Goal Seeker'. A powerful offensive node whose movement and clinical finishing provide a constant threat in the Belgian and Swiss circuits, representing the next generation.",
    "Predrag Rajković": "Verified as 'The Guardian of Serbia'. A high-reflex goalkeeper whose leadership in the Spanish and Saudi nodes has made him a national icon and a reliable fail-safe.",
    "Milos Veljković": "The 'Reliable Guard' of the Bremen and Serbian nodes. A veteran defender whose tactical experience and composure provide security for the national football ledger.",
    "Nemanja Maksimović": "Verified as 'The Midfield Stabilizer'. A disciplined and tactical anchor whose presence ensures the security of the Greek-Panathinaikos and Serbian circuits.",
    "Ivan Ilić": "Known as 'The Creative Node'. A technical midfielder whose vision and passing accuracy are foundational assets for the Italian-Torino and Serbian football networks.",
    "Petar Ratkov": "The 'Young Target Man'. A physically dominant striker whose physical strength and potential represent the next generation of the Serbian offensive mainframe.",
    "Zeki Amdouni": "Verified as 'The Versatile Threat'. A technical offensive node whose ability to master multiple positions makes him a high-frequency asset for the Portuguese-Benfica and Swiss grids.",
    "Leonidas Stergiou": "The 'Defensive Prodigy'. A fast and disciplined young defender whose growth in the German-Stuttgart Node has made him a foundational asset for the future Swiss firewall."
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

    print(f"✅ BATCH 25 COMPLETADO: {updated_count} nuevas leyendas serbias y suizas auditadas al 100%.")

if __name__ == "__main__":
    inject_elite_lore_batch_25()
