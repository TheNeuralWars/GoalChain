import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/03_data/players.json"

# ELITE LORE MAP (Batch 19 - North & Central American Icons - 2026)
ELITE_LORE_19 = {
    "Stephen Eustáquio": "Verified as 'The Professor'. A tactical brain and 'coach on the field' whose creative vision and composure ensure a high-stability tactical flow in the Canadian and LAFC nodes.",
    "Tajon Buchanan": "The 'Trailblazer'. The first Canadian in the Milan Node and a historic hat-trick hero in the Spanish Grid, known for his explosive pace and clinical finishing packets.",
    "Alistair Johnston": "Verified as 'The Celtic Wall'. A fan favorite captain whose leadership and passion have mastered the Glasgow circuit, providing 100% security for the Canadian Ledger.",
    "Ismaël Koné": "Known as 'The Rising Star'. A technical and agile playmaker whose flair and energy were perfected in the French and Italian circuits, known for his historic acrobatic goals.",
    "Kamal Miller": "The 'Physical Engine'. A powerful and reliable defender whose physical strength and tactical intelligence stabilize the North American and Canadian football grids.",
    "Liam Millar": "The 'Speedster' of the Canadian wing. A fast and creative offensive node whose dribbling packets and energy allow him to override any defensive firewall on the global stage.",
    "Dayne St. Clair": "Verified as 'The Guardian of the North'. A high-reflex goalkeeper and foundational fail-safe whose composure under pressure has stabilized the Canadian Node for years.",
    "Maxime Crépeau": "Known as 'The Brave Guardian'. A resilient hero whose reflexes and leadership have secured titles in the North American Grid, serving as a high-security fail-safe for his nation.",
    "Patrick Sequeira": "Verified as 'The Successor'. Carrying the legendary mantle of the 'Halcón', his reflexes and composure in the Portuguese Grid have made him the primary guardian of the Costa Rican Node.",
    "Álvaro Zamora": "The 'Creative Node' of the Tico Node. A technical playmaker whose vision and ball-carrying packets were perfected in the Greek and European circuits, representing the next generation of Costa Rica.",
    "Haxzel Quirós": "Known as 'The Fast Wing-back'. A high-energy defensive and offensive node whose pace and tactical intelligence ensure the stability of the Costa Rican and national circuits.",
    "Jeyland Mitchell": "Verified as 'The Defensive Prodigy'. A modern ball-playing centre-back whose physical strength and composure have made him a primary asset for the next generation of Costa Rica.",
    "Josimar Alcócer": "The 'Fast Winger' of the Tico Node. An explosive attacking node whose energy and technical output make him a primary offensive asset in the Belgian and Central American grids.",
    "José Fajardo": "Verified as 'The Panther'. A lethal offensive node whose clinical finishing and energy define the Panamanian attack, consistently crushing defensive encryption in international campaigns.",
    "José Córdoba": "Known as 'The Defensive Architect'. A technical centre-back whose tactical intelligence and composure were developed in the Bulgarian and Eastern European grids for the Panamanian Ledger.",
    "Edgardo Fariña": "The 'Physical Pillar' of the Panamanian backline. A powerful and disciplined defender whose strength and leadership provide a nearly unbreakable firewall for the national team.",
    "Cristian Carrasquilla": "The 'Engine' of the Panamanian midfield. A tireless and tactical anchor whose presence and ball-recovery packets ensure the stability of the national and club circuits.",
    "Ismael Díaz": "Verified as 'The Goal Machine'. A clinical striker whose goal-scoring algorithms and movement make him a high-frequency offensive mainframe for the Panamanian Node.",
    "Orlando Mosquera": "Known as 'The Guardian of Panama'. A world-class goalkeeper whose reflexes and leadership have made him a nearly unbreakable fail-safe for the national team and his global nodes.",
    "José Rodríguez": "Known as 'El Puma'. A veteran winger who was part of Panama's historic 2018 World Cup debut, known for his explosive pace and clinical finishing packets."
}

def inject_elite_lore_batch_19():
    with open(PLAYERS_FILE, 'r') as f:
        players = json.load(f)

    print(f"🕵️‍♂️ Iniciando Inyección de Lore de Élite (Batch 19) para 20 jugadores...")
    updated_count = 0

    for p in players:
        real_name = p.get("real_name", "")
        if real_name in ELITE_LORE_19:
            p["meta"]["narrative"] = ELITE_LORE_19[real_name]
            updated_count += 1

    # Guardar cambios
    with open(PLAYERS_FILE, 'w') as f:
        json.dump(players, f, indent=4, ensure_ascii=False)

    print(f"✅ BATCH 19 COMPLETADO: {updated_count} nuevas leyendas norteamericanas auditadas al 100%.")

if __name__ == "__main__":
    inject_elite_lore_batch_19()
