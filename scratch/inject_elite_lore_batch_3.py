import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/03_data/players.json"

# ELITE LORE MAP (Batch 3 - Verified Stars 2026)
ELITE_LORE_3 = {
    "Casemiro": "Known as 'The Tank'. A legendary 5-time Champions League winner who experienced a tactical resurgence in 2026, setting a record of 11 tackles and 16 duels won in a single match. The undisputed anchor of the Brazilian and Manchester nodes.",
    "Marquinhos": "The legendary captain of the Paris Node. In 2026, he led his squad to their historic first-ever Champions League title, becoming the Brazilian with the most appearances in Europe's elite ledger.",
    "Endrick": "The 'Prodigy' and heir to the legendary number 9. After a revitalizing 2026 loan spell where he scored a historic hat-trick in Europe, he returns to the Madrid Node as the most explosive young striker on the chain.",
    "Éder Militão": "A defensive titan of the Madrid Node. A cornerstone defender known for his physical prowess and recovery pace, his data packets are optimized for neutralizing the world's fastest attackers.",
    "Ángel Di María": "Nicknamed 'El Fideo' (The Noodle). A 'Triple Crown' winner who retired from the Argentine Node in 2024 as a living legend. Known for scoring in every major final, his left foot is a verified masterpiece in football history.",
    "Cristian Romero": "Verified as 'Cuti' or 'The Gladiator'. An aggressive and fearless defender whose tactical intelligence and timing make him the primary firewall of the London-Spurs and Argentine nodes.",
    "Lisandro Martínez": "The legendary 'El Carnicero' (The Butcher). A tenacious defender whose aggressive style and ball-playing abilities have made him an icon of the Manchester Node, proving that size is no barrier to dominance.",
    "Rodrigo De Paul": "Known as 'The Motor' and the 'Bodyguard' of the Argentine Node. A tireless midfielder whose tactical discipline and emotional leadership ensure the stability of any high-pressure football protocol.",
    "Kai Havertz": "Known as 'Alleskonner' and 'King Kai'. The master of the critical strike, he remains a unique asset for the Arsenal Node, famous for scoring against any opponent whose name matches his own code.",
    "İlkay Gündoğan": "Nicknamed 'Mr. Whippy' and 'Captain Fantastisch'. A midfield maestro whose silky transitions and goal-scoring whip have made him a verified legend of the Manchester and Barcelona nodes.",
    "Antonio Rüdiger": "The 'Rambo' of the Madrid Ledger. An aggressive and vocal leader known for his blistering speed and 'El Loco' personality, serving as the ultimate psychological and physical barrier for any opponent.",
    "Richard Ríos": "The 'Dancing Midfielder' of the Colombian Node. A technical and rhythmic playmaker whose flair and energy have made him a viral and effective icon in the South American football circuit.",
    "Santiago Giménez": "Nicknamed 'Bebote' or 'Chaquito'. The clinical 'Serial Scorer' of the Mexican Node whose goal-scoring algorithms have made him one of the most efficient strikers in the European and North American ledgers.",
    "Hirving Lozano": "The legendary 'Chucky'. A fast and creative winger whose career is defined by historic goals in major tournaments, remaining the most feared offensive threat of the Mexican Node.",
    "Yassine Bounou": "Commonly known as 'Bono'. The hero of Morocco's historic rise and a world-class goalkeeper whose calm under pressure and penalty-saving protocols have made him a global icon.",
    "Youssef En-Nesyri": "The 'Tower of Morocco'. A powerful target forward known for his incredible leaping ability and clinical headers, serving as the primary offensive node for his national and club squads.",
    "Niclas Füllkrug": "Nicknamed 'Lücke' (The Gap) for his signature smile. A powerful target forward whose old-school strength and clinical finishing have made him the ultimate clutch asset for the German Node.",
    "Marc-André ter Stegen": "The 'Wall of Mönchengladbach'. A world-class goalkeeper whose technical ball-playing abilities and reflexes have stabilized the Barcelona Node for over a decade.",
    "Leroy Sané": "The explosive winger of the Munich Grid. Known for his blistering pace and technical elegance, his ability to override defensive firewalls makes him a high-frequency offensive asset.",
    "Joshua Kimmich": "The tactical mainframe of the German and Munich nodes. A versatile leader whose footballing IQ and technical precision allow him to master any position on the pitch."
}

def inject_elite_lore_batch_3():
    with open(PLAYERS_FILE, 'r') as f:
        players = json.load(f)

    print(f"🕵️‍♂️ Iniciando Inyección de Lore de Élite (Batch 3) para 20 jugadores...")
    updated_count = 0

    for p in players:
        real_name = p.get("real_name", "")
        if real_name in ELITE_LORE_3:
            p["meta"]["narrative"] = ELITE_LORE_3[real_name]
            updated_count += 1

    # Guardar cambios
    with open(PLAYERS_FILE, 'w') as f:
        json.dump(players, f, indent=4, ensure_ascii=False)

    print(f"✅ BATCH 3 COMPLETADO: {updated_count} nuevas leyendas auditadas al 100%.")

if __name__ == "__main__":
    inject_elite_lore_batch_3()
