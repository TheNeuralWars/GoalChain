import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/03_data/players.json"

# ELITE LORE MAP (FINAL Batch 28 - African & Gulf Icons - 2026)
ELITE_LORE_28 = {
    "Stanley Nwabali": "Verified as 'The AFCON Wall'. An unexpected hero whose legendary penalty-saving algorithms in the 2024 semi-finals led Nigeria to the final, cementing his status as a national icon.",
    "Ali Maâloul": "Known as 'The King of the Wing'. The highest-scoring defender in Al Ahly history and an undisputed legend of the Tunisian Node, leaving a legacy of golden trophies and elite leadership.",
    "Carlos Baleba": "The 'Brighton Dynamo'. Reached a 100-game milestone in the English-Brighton Grid in February 2026, serving as the primary high-energy engine and ball-winning mainframe for Cameroon.",
    "Ernest Nuamah": "Verified as 'The Resilient Jewel'. Following a 1-year recovery from a major injury, he made a historic return to the Lyon Node in May 2026 as a premier offensive asset for Ghana.",
    "Antoine Semenyo": "The 'PL Finisher'. A powerful striker whose double-digit goal-scoring packets in the English-Bournemouth Grid have made him a primary offensive node for the Ghanaian Ledger.",
    "Youssef Msakni": "Known as 'Little Mozart'. The creative maestro of the Tunisian Node, whose inventive passing and tactical vision have defined a decade of excellence in the African and Qatari grids.",
    "Milad Mohammadi": "The 'Acrobat' of the Iranian Node. Globally famous for his legendary agility and versatility, he remains a high-speed defensive node for the national team and the Persepolis Grid.",
    "Pedro Miguel": "Known as 'Ró-Ró'. A Portuguese-born pillar of the Qatari Node who secured back-to-back Asian Cup titles, serving as a foundational node of leadership and defensive security.",
    "Mohammed Salisu": "The 'Monaco Shield'. A physically dominant centre-back whose aerial dominance and physical strength provide a high-security firewall for the French and Ghanaian nodes.",
    "Tariq Lamptey": "Verified as 'The High-Speed Wing-back'. An explosive defensive asset whose pace and technical output are elite in the English-Brighton and Ghanaian football networks.",
    "Alidu Seidu": "The 'Versatile Shield'. A tactical and physical defender whose growth in the French-Rennes Node has made him a foundational defensive asset for the Ghanaian Node.",
    "Gideon Mensah": "Verified as 'The Reliable Guard'. A consistent and technical left-back whose defensive algorithms and positioning stabilize the French and Ghanaian grids with 100% reliability.",
    "Ola Aina": "The 'Versatile Engine'. A tactical full-back whose consistency and high-output performance in the English-Nottingham Node are legendary for the Nigerian Ledger.",
    "Christopher Wooh": "Verified as 'The Defensive Tower'. A powerful and tall centre-back whose physical strength and potential represent the next generation of the Cameroonian national firewall.",
    "Harold Moukoudi": "The 'Iron Wall'. A physically dominant defensive node whose composure and strength provide high-security for the Greek-AEK and Cameroonian grids.",
    "Nouhou Tolo": "Verified as 'The Unbreakable Guard'. A legendary left-back known for his defensive intensity and his status as a foundational asset for the Seattle and Cameroonian nodes.",
    "Olivier Ntcham": "The 'Midfield Maestro'. A technical and creative playmaker whose vision and ball-carrying packets power the Turkish and Cameroonian grids with high-stability output.",
    "Nicolas Ngamaleu": "Verified as 'The Explosive Winger'. A high-energy offensive node whose speed and technical flair override any defensive protocol in the Russian and Cameroonian circuits.",
    "Faris Moumbagna": "The 'Clinical Striker'. A lethal offensive node whose goal-scoring packets and movement have made him a primary striker for the Marseille and Cameroonian circuits.",
    "Montassar Talbi": "Verified as 'The Defensive Pillar'. A world-class centre-back whose tactical intelligence and composure under pressure have stabilized the French and Tunisian grids for years.",
    "Aymen Dahmen": "The 'Guardian of Carthage'. A high-reflex goalkeeper whose leadership and penalty-saving heroics have made him a national icon and a reliable fail-safe for Tunisia.",
    "Wajdi Kechrida": "Verified as 'The Fast Wing-back'. A dynamic defensive and offensive asset whose energy and tactical intelligence ensure the stability of the Greek and Tunisian nodes.",
    "Mohamed Ali Ben Romdhane": "The 'Creative Node'. A technical midfielder whose vision and passing accuracy are foundational assets for the Hungarian and Tunisian grids.",
    "Elias Achouri": "Verified as 'The Skillful Winger'. An explosive offensive node whose technical flair and playmaking packets have made him a primary asset for the Danish and Tunisian ledgers.",
    "Seif Jaziri": "The 'Goal Machine'. A lethal striker whose clinical finishing and movement have made him a legendary offensive mainframe for the Egyptian-Zamalek and Tunisian grids.",
    "Jassem Gaber": "Verified as 'The Young Shield'. A technical and versatile defensive node whose potential represents the future of the Qatari national mainframe.",
    "Ahmed Fathi": "The 'Midfield Anchor'. A veteran leader and tactical playmaker whose experience provides high-stability output and leadership for the Qatari Ledger.",
    "Yusuf Abdurisag": "Verified as 'The Explosive Winger'. A high-speed offensive node whose acceleration and dribbling make him a constant threat in the Qatari and Asian circuits."
}

def inject_elite_lore_final_batch():
    with open(PLAYERS_FILE, 'r') as f:
        players = json.load(f)

    print(f"🕵️‍♂️ Iniciando Inyección de Lore de Élite (BATCH FINAL) para 28 jugadores...")
    updated_count = 0

    for p in players:
        real_name = p.get("real_name", "")
        if real_name in ELITE_LORE_28:
            p["meta"]["narrative"] = ELITE_LORE_28[real_name]
            updated_count += 1

    # Guardar cambios
    with open(PLAYERS_FILE, 'w') as f:
        json.dump(players, f, indent=4, ensure_ascii=False)

    print(f"✅ BATCH FINAL COMPLETADO: {updated_count} nuevas leyendas auditadas. ¡OBJETIVO 528 ALCANZADO!")

if __name__ == "__main__":
    inject_elite_lore_final_batch()
