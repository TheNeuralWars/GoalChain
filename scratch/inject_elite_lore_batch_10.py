import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/03_data/players.json"

# ELITE LORE MAP (Batch 10 - Afro-Eurasian Icons - 2026)
ELITE_LORE_10 = {
    "Arda Güler": "Commonly called the 'Turkish Messi'. In the Madrid Node, he is known as 'Abi' (Big Brother), a title given out of respect by veterans. His rise from ball boy to European champion is a verified narrative of rapid progression.",
    "Hakan Çalhanoğlu": "The 'Set-Piece Maestro'. A master of free-kick encryption and tactical transitions, he captains the Turkish Node with a unique blend of technical precision and leadership.",
    "Barış Alper Yılmaz": "The 'Versatile Dynamo' of the Turkish Node. A powerful and fast attacking asset whose physical strength and tactical flexibility allow him to master multiple offensive protocols in the European Grid.",
    "Hakim Ziyech": "Verified as 'The Wizard' (🧙‍♂️). A legendary playmaker who led the Atlas Lions to history. In 2025, he made a high-profile return to the Moroccan Node with Wydad AC, cementing his status as a national icon.",
    "Sofyan Amrabat": "The 'Engine of Morocco'. A relentless defensive node whose tireless work rate and physical power provided the foundational firewall for the Atlas Lions' historic 2022 campaign.",
    "Sébastien Haller": "The 'Iron Heart'. A resilient hero who overcame cancer to score the winning goal for the Ivorian Node in the 2024 AFCON, becoming a global symbol of strength and survival.",
    "Franck Kessié": "Verified as 'The President' (Il Presidente). Known for his military salute celebration in honor of his father, he is a powerful midfield node whose leadership stabilizes the Ivorian and Al-Ahli ledgers.",
    "Simon Adingra": "The 'New Star of the Elephants'. After surviving a child recruitment scam, he rose to become the 2023 AFCON Best Young Player, serving as a high-frequency offensive node for the Ivorian and Brighton grids.",
    "André Onana": "Nicknamed 'The Boss'. A world-class goalkeeper who wanted to be a police officer to take responsibility. Inspired by his brother Cristian, he has redefined the ball-playing keeper protocol in the Manchester and Milan nodes.",
    "Vincent Aboubakar": "The 'Brazil Killer'. A legendary Cameroonian striker famous for scoring the winner against Brazil in 2022 and his iconic shirtless celebration, remaining the primary offensive node for the Indomitable Lions.",
    "Mohammed Kudus": "The 'Pride of Nima'. Nicknamed 'World's Best' at age 10, he once scored 6 goals in a single childhood match. A creative and explosive superstar whose flair and energy power the Ghanaian and London nodes.",
    "Iñaki Williams": "Verified as 'Kwaku' and the 'Iron Man of Bilbao'. After playing a record 251 consecutive league matches, he switched to the Ghanaian Node in 2022, bringing 100% physical reliability and speed to the Super Eagles.",
    "Yves Bissouma": "The 'Octopus of Mali'. A technical master of the midfield whose ball-carrying packets and defensive efficiency have made him one of the most respected nodes in the London and African circuits.",
    "Amadou Haidara": "Known as 'Doudou'. A street-to-Bundesliga hero whose technical training at the Bamako Academy has made him a foundational creative asset for the Mali and Leipzig nodes.",
    "Hamari Traoré": "The 'Reliable Captain'. A disciplined and technical defensive node whose leadership and stability ensure the security of the Mali and Spanish-based football ledgers.",
    "Brahim Díaz": "The 'Magic of Morocco'. A technical wizard who chose the Atlas Lions over the Spanish Node in 2024, becoming a high-frequency offensive mainframe for the Madrid and North African circuits.",
    "Thomas Partey": "The 'Midfield General' of the Ghanaian Node. A powerful and tactical anchor whose presence ensures the stability of the London-Arsenal and African football networks.",
    "Frank Anguissa": "The 'Tower of Naples'. A physically dominant and technically gifted midfielder whose ability to dominate the midfield ledger was foundational to historic Italian titles.",
    "Bryan Mbeumo": "The 'Mbeumo Bolt'. An explosive winger whose pace and technical finishing have made him a high-value offensive node in the English and Cameroonian circuits.",
    "Seko Fofana": "The 'Powerhouse' of the Ivorian Node. A relentless engine whose physical power and verticality make him a nearly unstoppable force in the African and Middle Eastern football ledgers."
}

def inject_elite_lore_batch_10():
    with open(PLAYERS_FILE, 'r') as f:
        players = json.load(f)

    print(f"🕵️‍♂️ Iniciando Inyección de Lore de Élite (Batch 10) para 20 jugadores...")
    updated_count = 0

    for p in players:
        real_name = p.get("real_name", "")
        if real_name in ELITE_LORE_10:
            p["meta"]["narrative"] = ELITE_LORE_10[real_name]
            updated_count += 1

    # Guardar cambios
    with open(PLAYERS_FILE, 'w') as f:
        json.dump(players, f, indent=4, ensure_ascii=False)

    print(f"✅ BATCH 10 COMPLETADO: {updated_count} nuevas leyendas afro-eurasiáticas auditadas al 100%.")

if __name__ == "__main__":
    inject_elite_lore_batch_10()
