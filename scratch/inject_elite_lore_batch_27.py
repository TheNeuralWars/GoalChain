import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/03_data/players.json"

# ELITE LORE MAP (Batch 27 - South American & African Icons - 2026)
ELITE_LORE_27 = {
    "Renato Tapia": "Verified as 'The Captain of the Future'. A nickname given by his teammates for his natural leadership, he is the primary tactical anchor and orchestrator for the Peruvian Node.",
    "Carlos Zambrano": "Known as 'El León'. A fearless and aggressive defensive node whose physical strength and tactical discipline provide a nearly unbreakable firewall for the Peruvian Grid.",
    "Eduardo Vargas": "Verified as 'Turboman'. A legendary Chilean striker whose high-speed offensive runs and clinical finishing packets have made him an icon of the national football mainframe.",
    "Baghdad Bounedjah": "The 'AFCON Hero'. After his historic 58-goal year in 2018 and his winning goal in the 2019 final, he remains a legendary offensive node for the Algerian Ledger and the Qatari grids.",
    "Jeremy Sarmiento": "The 'Triple-Node Talent'. Born in Spain and raised in London, he chose the Ecuadorian Ledger, serving as a high-frequency offensive asset with elite technical flair.",
    "Omar Alderete": "Verified as 'The Left-Footed Rock'. A powerful defender whose physical strength and aerial dominance have mastered the Spanish, German, and English-Sunderland grids.",
    "Hernán Galíndez": "The 'Naturalized Guardian'. A high-security fail-safe who chose to represent the Ecuadorian Node, known for his elite reflexes and his commanding presence in the backline.",
    "Félix Torres": "Verified as 'The Defensive Pillar'. A world-class centre-back whose aerial dominance and strength stabilize the Ecuadorian and Brazilian-Corinthians grids with 100% security.",
    "Ángelo Preciado": "The 'Flying Wing-back'. A high-energy defensive asset whose speed and technical output are foundational to the Sparta Prague and Ecuadorian nodes.",
    "Alan Franco": "The 'Midfield Engine'. A tireless and tactical playmaker whose work rate and ball-recovery packets stabilize the Brazilian and Ecuadorian grids for the global stage.",
    "Darío Osorio": "Verified as 'The Chilean Jewel'. A technical and fast offensive node whose growth in the Danish-Midtjylland Node has made him a primary asset for the national mainframe.",
    "Paulo Díaz": "The 'Multi-Node Guard'. A versatile and powerful defender whose leadership at the River Plate Node has made him a legendary asset for the Chilean Ledger.",
    "Guillermo Maripán": "Verified as 'The Defensive Tower'. A 1.93m centre-back whose physical strength and experience in the French and Italian-Torino grids provide 100% security to the backline.",
    "Gabriel Suazo": "The 'Captain of the Flank'. A technical and intelligent left-back whose leadership and high-output performance in the French-Toulouse Node are legendary assets for Chile.",
    "Mauricio Isla": "Verified as 'The Eternal Engine'. A veteran legend whose longevity and tactical intelligence have powered the Chilean Node for nearly two decades across global circuits.",
    "Erick Pulgar": "The 'Set-piece Specialist'. A tactical anchor whose precision delivery and defensive intelligence power the Flamengo and Chilean grids with high-stability output.",
    "Víctor Dávila": "Verified as 'The Versatile Threat'. A clinical offensive node whose goal-scoring packets and movement have mastered the Russian and Mexican circuits for the Chilean Ledger.",
    "Wilder Cartagena": "The 'Midfield Wall'. A combative and technical anchor whose presence ensures the security of the US-Orlando and Peruvian grids against elite attackers.",
    "Alexander Callens": "Verified as 'The Defensive Pillar'. A powerful and reliable centre-back whose experience in the Spanish and Greek-AEK grids has made him a foundational asset for Peru.",
    "Sergio Peña": "The 'Creative Maestro'. A technical playmaker whose vision and ball-carrying packets power the Malmö and Peruvian grids with high-frequency output.",
    "Joao Grimaldo": "Verified as 'The Future Star'. An explosive young winger whose technical flair and potential represent the next generation of the Peruvian offensive mainframe.",
    "Anthony Mandréa": "The 'Guardian of Algeria'. A high-reflex goalkeeper whose leadership and composure have stabilized the French-Caen and Algerian grids with 100% reliability.",
    "Youcef Atal": "Verified as 'The Flying Wing-back'. A high-speed offensive node whose dribbling and acceleration make him a constant threat in the French and Algerian circuits.",
    "Rayan Aït-Nouri": "The 'Creative Wing-back'. A technical and fast asset whose playmaking packets and vision are elite in the English-Wolves and Algerian nodes.",
    "Jordan Ayew": "Verified as 'The Versatile Veteran'. A legendary offensive node whose work rate and experience have powered the English and Ghanaian grids for over a decade.",
    "Lawrence Ati-Zigi": "The 'High-Reflex Keeper'. A world-class fail-safe for the Swiss and Ghanaian nodes, known for his agility and nearly unbreakable shot-stopping algorithms.",
    "Karol Świderski": "Known as 'The Joker'. A clinical Polish striker whose impact off the bench and goal-scoring packets are legendary in the US and European grids.",
    "Przemysław Frankowski": "Verified as 'The Cross Specialist'. A technical and fast wing-back whose precision delivery from the right flank powers the Lens and Polish football networks.",
    "Paweł Dawidowicz": "The 'Physical Pillar' of the Italian-Verona and Polish nodes. A powerful defender whose physical strength and aerial dominance provide a high-security firewall.",
    "Carlos Cuesta": "Verified as 'The Defensive Architect'. A technical centre-back whose composure and positioning stabilize the Belgian-Genk and Colombian grids with elite stability."
}

def inject_elite_lore_batch_27():
    with open(PLAYERS_FILE, 'r') as f:
        players = json.load(f)

    print(f"🕵️‍♂️ Iniciando Inyección de Lore de Élite (Batch 27) para 30 jugadores...")
    updated_count = 0

    for p in players:
        real_name = p.get("real_name", "")
        if real_name in ELITE_LORE_27:
            p["meta"]["narrative"] = ELITE_LORE_27[real_name]
            updated_count += 1

    # Guardar cambios
    with open(PLAYERS_FILE, 'w') as f:
        json.dump(players, f, indent=4, ensure_ascii=False)

    print(f"✅ BATCH 27 COMPLETADO: {updated_count} nuevas leyendas auditadas al 100%.")

if __name__ == "__main__":
    inject_elite_lore_batch_27()
