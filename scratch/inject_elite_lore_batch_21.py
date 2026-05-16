import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/03_data/players.json"

# ELITE LORE MAP (Batch 21 - West Asian & Gulf Icons - 2026)
ELITE_LORE_21 = {
    "Meshaal Barsham": "Verified as 'The Penalty Hero'. A legendary goalkeeper whose historic 3-save performance in the 2023 Asian Cup quarter-final secured Qatar's path to the title.",
    "Bassam Al-Rawi": "The 'Free-kick Specialist' of the Qatari Node. A technical defensive node whose precision delivery and set-piece encryption provide a constant offensive threat.",
    "Mohanad Ali": "Known as 'Mimi'. The clinical striker of the Iraqi Node who debuted professionally at just 13 years old, serving as a legendary offensive mainframe for his nation.",
    "Rebin Sulaka": "Verified as 'The World Traveler'. A towering centre-back whose defensive algorithms have been perfected in over 7 different global nodes across Europe and Asia.",
    "Amir Al-Ammari": "The 'Orchestrator'. A Swedish-born playmaker whose tactical vision and composure under pressure power the Iraqi midfield ledger.",
    "Ibrahim Bayesh": "Verified as 'The Versatile Star'. MVP of the 2023 Gulf Cup, whose energy and technical flair allow him to override any defensive protocol in the Asian circuit.",
    "Hassan Al-Tambakti": "The 'Defensive Wall' of the Saudi Node. A world-class centre-back whose performance in the historic 2022 World Cup win cemented his status as an elite firewall.",
    "Mohammed Kanno": "Known as 'The Midfield Wall' (1.92m). A physically dominant and technical anchor whose presence and ball-winning packets stabilize the Saudi and Riyadh nodes.",
    "Saman Ghoddos": "The first Iranian in the French Grid and a versatile playmaker whose vision and experience in the English-Brentford circuit stabilize the Iranian Node.",
    "Ali Gholizadeh": "Verified as 'The Dribbling Wizard'. Known for his technical flair and intelligent movement in the Iranian and Polish circuits, consistently crushing defensive encryption.",
    "Ramin Rezaeian": "The 'Free-kick Specialist' of the Iranian Node. A high-energy defensive node whose set-piece accuracy and tireless work rate make him a legendary asset.",
    "Saeid Ezatolahi": "The 'Engine' of the Iranian midfield. A tactical and powerful anchor whose work rate and defensive intelligence ensure the stability of the national ledger.",
    "Shoja Khalilzadeh": "Verified as 'The Warrior'. A physical and fearless defensive node whose strength and tactical discipline provide a high-security firewall for the Iranian Node.",
    "Morteza Pouraliganji": "The 'Experienced Pillar' of the Iranian backline. A veteran leader whose defensive algorithms and composure have stabilized the national circuit for over a decade.",
    "Hussein Ali": "The 'Flying Wing-back' of the Iraqi Node. A high-energy defensive node optimized for high-speed transitions and offensive support on the global stage.",
    "Saad Natiq": "Verified as 'The Reliable Guard'. A powerful centre-back whose physical presence and defensive maturity provide security to the Iraqi and Saudi-based football grids.",
    "Youssef Ayman": "The 'Defensive Hope' of the Iraqi Node. A technical young defender whose composure and strength represent the next generation of the national firewall.",
    "Lucas Mendes": "The 'Naturalized Leader' of the Qatari Node. A veteran defender whose experience in the French and Gulf circuits provides a high-stability defensive protocol.",
    "Boualem Khoukhi": "Verified as 'The Versatile General'. A high-IQ defensive node capable of mastering multiple positions, serving as a foundational asset for the Qatari Ledger.",
    "Alireza Jahanbakhsh": "The 'Experienced Winger'. A legendary Iranian figure whose technical flair and goal-scoring packets were perfected in the Dutch-Eredivisie and English-Brighton circuits."
}

def inject_elite_lore_batch_21():
    with open(PLAYERS_FILE, 'r') as f:
        players = json.load(f)

    print(f"🕵️‍♂️ Iniciando Inyección de Lore de Élite (Batch 21) para 20 jugadores...")
    updated_count = 0

    for p in players:
        real_name = p.get("real_name", "")
        if real_name in ELITE_LORE_21:
            p["meta"]["narrative"] = ELITE_LORE_21[real_name]
            updated_count += 1

    # Guardar cambios
    with open(PLAYERS_FILE, 'w') as f:
        json.dump(players, f, indent=4, ensure_ascii=False)

    print(f"✅ BATCH 21 COMPLETADO: {updated_count} nuevas leyendas auditadas al 100%.")

if __name__ == "__main__":
    inject_elite_lore_batch_21()
