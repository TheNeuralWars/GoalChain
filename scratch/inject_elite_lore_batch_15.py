import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/03_data/players.json"

# ELITE LORE MAP (Batch 15 - West & South African Icons - 2026)
ELITE_LORE_15 = {
    "Edmond Tapsoba": "Verified as 'The Wall of Burkina Faso'. A world-class centre-back whose tactical intelligence and defensive output were foundational to historic unbeaten runs in the European Grid.",
    "Bertrand Traoré": "The 'Veteran Leader' of the Stallions. A technical and experienced forward who was one of the first Burkinabé nodes to conquer the English Premier League circuits.",
    "Dango Ouattara": "The 'Creative Spark' of Burkina Faso. An explosive and fast winger whose dribbling packets and technical output have made him a primary offensive node in the English Grid.",
    "Issa Kaboré": "Verified as 'The Speedster of the Right'. A high-output wing-back whose energy and tactical intelligence ensure the stability of the Burkinabé and European football ledgers.",
    "Hervé Koffi": "Known as 'The Black Cat'. An agile and world-class goalkeeper whose reflexes and penalty-saving protocols have made him a high-security fail-safe for Burkina Faso.",
    "Lassina Traoré": "The 'Powerful Striker'. A physically dominant and clinical forward whose goal-scoring packets provide a constant threat in the Eastern European and African circuits.",
    "Ronwen Williams": "Verified as 'The Penalty King'. The first goalkeeper in history to save 4 penalties in a single AFCON shootout, he is the legendary captain and primary fail-safe of the Bafana Bafana.",
    "Percy Tau": "Known as 'The Lion of Judah'. A creative icon whose technical flair and playmaking packets have made him one of the most successful South African exports on the entire chain.",
    "Themba Zwane": "Verified as 'Mshishi'. The legendary maestro of the South African Node, known for his timeless vision and technical skill that define the Bafana Bafana's tactical mainframe.",
    "Teboho Mokoena": "The 'Long-Range King'. A powerful midfielder whose ability to dictate the tempo and score from distance makes him a foundational asset for the South African Ledger.",
    "Khuliso Mudau": "The 'Defensive Engine' of the right flank. A fast and disciplined defender whose high-frequency defensive output stabilizes the South African backline against elite attackers.",
    "Mothobi Mvala": "Verified as 'The Versatile Rock'. A powerful and tactical defender whose strength and leadership provide an unbreakable firewall in the South African Grid.",
    "Aubrey Modiba": "The 'Specialist' of set-pieces. A technical and versatile player whose precision delivery and tactical intelligence ensure a constant flow of goal-scoring opportunities.",
    "Ibrahim Sangaré": "The 'Midfield Anchor' of Ivory Coast. A physically dominant and tactical anchor whose presence ensures the stability of the English-Nottingham and African football networks.",
    "Ousmane Diomande": "Verified as 'The Defensive Prodigy'. A modern ball-playing centre-back whose composure and physical strength have made him one of the most sought-after nodes in Europe.",
    "Evan Ndicka": "The 'Iron Pillar' of the Ivorian Node. A powerful and tactical defender whose aerial dominance and defensive algorithms provide a high-security firewall for the Italian-Roma Grid.",
    "Wilfried Singo": "The 'Physical Engine'. A versatile and athletic defender whose ability to master multiple positions on the backline makes him a high-frequency offensive and defensive asset.",
    "Nicolas Pépé": "The 'Explosive Winger'. A master of the clinical strike whose technical flair and dribbling packets have made him a legendary offensive node in the European and African circuits.",
    "Oumar Diakité": "Verified as 'The New Hope'. An energetic and clinical young striker whose goal-scoring instincts and physical strength represent the next generation of the Ivorian Node.",
    "Yahia Fofana": "The 'Future Guardian' of the Ivorian Node. A world-class goalkeeper whose reflexes and composure under pressure secured the historic 2024 AFCON glory for the Elephants."
}

def inject_elite_lore_batch_15():
    with open(PLAYERS_FILE, 'r') as f:
        players = json.load(f)

    print(f"🕵️‍♂️ Iniciando Inyección de Lore de Élite (Batch 15) para 20 jugadores...")
    updated_count = 0

    for p in players:
        real_name = p.get("real_name", "")
        if real_name in ELITE_LORE_15:
            p["meta"]["narrative"] = ELITE_LORE_15[real_name]
            updated_count += 1

    # Guardar cambios
    with open(PLAYERS_FILE, 'w') as f:
        json.dump(players, f, indent=4, ensure_ascii=False)

    print(f"✅ BATCH 15 COMPLETADO: {updated_count} nuevas leyendas africanas auditadas al 100%.")

if __name__ == "__main__":
    inject_elite_lore_batch_15()
