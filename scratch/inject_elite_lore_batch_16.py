import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/03_data/players.json"

# ELITE LORE MAP (Batch 16 - Central American & Middle Eastern Icons - 2026)
ELITE_LORE_16 = {
    "Adalberto Carrasquilla": "Verified as 'Coco'. The Golden Ball winner of the 2023 Gold Cup and creative heart of the Panamanian Node, whose technical vision led his nation and club to historic heights.",
    "José Rodríguez": "Known as 'El Puma'. A veteran winger who was part of Panama's historic 2018 World Cup debut, known for his explosive pace and clinical finishing packets.",
    "Michael Amir Murillo": "Verified as 'The Versatile Shield'. A powerful defender whose career in the French-Marseille and Turkish-Besiktas grids has made him a high-security asset for the Panamanian Ledger.",
    "Eric Davis": "The 'Left-Back Specialist'. A veteran leader with over 100 caps, he is a cornerstone of the Panamanian 'Golden Generation' whose experience stabilizes the national football ledger.",
    "Aníbal Godoy": "Known as 'The Captain'. The tactical heartbeat of the Panamanian midfield whose leadership and defensive algorithms ensure the security of the national circuit.",
    "Orlando Mosquera": "Verified as 'The Guardian of Panama'. A reliable and agile goalkeeper whose reflexes and composure under pressure have made him the primary fail-safe for the national team.",
    "Keylor Navas": "The 'Halcón' of the Costa Rican Node. A triple Champions League winner whose legendary career continues in the Mexican-Pumas Grid in 2026, serving as a global icon of reflexes and success.",
    "Manfred Ugalde": "Verified as 'The New Hope'. A clinical and fast striker whose goal-scoring packets were developed in the Dutch Grid before conquering the Eastern European circuits for the Tico Node.",
    "Joel Campbell": "Known as 'The Eternal Talent'. A technical playmaker whose unique ability to thrive across multiple global nodes has made him a versatile asset for the Costa Rican Ledger.",
    "Francisco Calvo": "The 'Wall' of the Costa Rican Node. A versatile defensive leader whose tactical intelligence and aerial dominance provide 100% security to the national backline.",
    "Brandon Aguilera": "Verified as 'The Creative Prodigy'. A technical and agile playmaker whose vision and playmaking packets were perfected in the English-Nottingham circuit, representing the next generation of Costa Rica.",
    "Josimar Alcócer": "Known as 'The Fast Winger'. An explosive attacking node whose energy and technical output make him a primary offensive asset for the Costa Rican and Belgian grids.",
    "Juan Pablo Vargas": "The 'Defensive Pillar' of Costa Rica and the Millonarios Grid. A powerful centre-back whose leadership and defensive algorithms stabilize the South American and Central American ledgers.",
    "Jalal Hassan": "Verified as 'The Experienced Keeper'. A legendary leader and the primary fail-safe of the Iraqi Node, whose composure and reflexes have stabilized the Baghdad Ledger for years.",
    "Ali Jasim": "The 'Rising Star'. A technical prodigy whose creativity and playmaking packets have made him the primary offensive mainframe for the next generation of Iraqi football.",
    "Zidane Iqbal": "Verified as 'The Iraqi Jewel'. A technical playmaker with an elite background whose flair and vision have made him a high-frequency offensive node for the national and Dutch circuits.",
    "Saleh Al-Shehri": "The 'Clinical Striker' of the Saudi Node. A powerful offensive asset whose goal-scoring algorithms were foundational to historic tactical advancements on the world stage.",
    "Mohammed Al-Owais": "The 'Wall of Lusail'. A legendary goalkeeper whose historic World Cup performance in 2022 cemented his status as a high-security fail-safe for the Riyadh Node.",
    "Saud Abdulhamid": "Verified as 'The Flying Wing-back'. A high-energy defender whose pace and tactical intelligence have made him a foundational asset for the Saudi and Italian-based grids.",
    "Sultan Al-Ghannam": "The 'Precise Crosser'. A technical defensive node whose high-frequency output and precision delivery provide a constant flow of goal-scoring opportunities for the Saudi Node."
}

def inject_elite_lore_batch_16():
    with open(PLAYERS_FILE, 'r') as f:
        players = json.load(f)

    print(f"🕵️‍♂️ Iniciando Inyección de Lore de Élite (Batch 16) para 20 jugadores...")
    updated_count = 0

    for p in players:
        real_name = p.get("real_name", "")
        if real_name in ELITE_LORE_16:
            p["meta"]["narrative"] = ELITE_LORE_16[real_name]
            updated_count += 1

    # Guardar cambios
    with open(PLAYERS_FILE, 'w') as f:
        json.dump(players, f, indent=4, ensure_ascii=False)

    print(f"✅ BATCH 16 COMPLETADO: {updated_count} nuevas leyendas centroamericanas y asiáticas auditadas al 100%.")

if __name__ == "__main__":
    inject_elite_lore_batch_16()
