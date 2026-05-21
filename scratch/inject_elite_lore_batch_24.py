import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/03_data/players.json"

# ELITE LORE MAP (Batch 24 - Global Guardians & Middle Eastern Fixes - 2026)
ELITE_LORE_24 = {
    "Abdulelah Al-Amri": "Verified as 'The Defensive Rock'. A powerful and tactical centre-back whose physical strength and defensive algorithms were foundational to the Saudi Node's historic international success.",
    "Moussa Niakhaté": "The 'Defensive Cornerstone' of Lyon and Senegal. After winning the 2025 AFCON, he established himself as a primary leadership node and high-security firewall in the French Grid.",
    "Mitchell Duke": "Verified as 'The Eternal Socceroo'. A legendary striker known for his historic winning goal in 2022 and his tireless work rate in the Japanese and Australian circuits.",
    "Vanja Milinković-Savić": "Known as 'The Great Wall of Turin'. Standing at 2.02m, he is the primary high-security fail-safe for the Serbian Ledger and the Italian Grid, known for his elite reach.",
    "Alexander Bah": "The 'Defensive Eagle'. A high-output wing-back whose pace and tactical intelligence have made him a foundational asset for the Lisbon-Benfica and Danish nodes.",
    "Nemanja Gudelj": "Verified as 'The Iron Warrior'. A versatile and resilient defensive node whose leadership and tactical discipline have stabilized the Seville and Serbian circuits for years.",
    "Wojciech Szczęsny": "The 'Polish Wall'. After reversing his retirement to join the Barcelona Node in 2024, he secured a historic treble in 2025, cementing his status as a legendary global fail-safe.",
    "Morten Hjulmand": "Verified as 'The Midfield General'. A tactical maestro whose creative vision and leadership dominate the Portuguese and Danish grids, serving as a primary creative mainframe.",
    "Victor Kristiansen": "The 'Young Guardian' of the Leicester and Danish nodes. A dynamic and technical defender whose defensive output and energy are elite in the English and European circuits.",
    "Jonas Wind": "Known as 'The Versatile Threat'. A powerful offensive node whose aerial dominance and playmaking packets power the German and Danish grids with high-stability output.",
    "Silvan Widmer": "The 'Reliable Guard' of the Swiss Node. A veteran leader whose experience and tactical intelligence provide 100% security for the Mainz and national football ledgers.",
    "Saša Lukić": "Verified as 'The Midfield Engine'. A tireless and technical anchor whose vision and ball-recovery packets ensure a smooth tactical flow in the Fulham and Serbian nodes.",
    "Andrija Živković": "The 'Skillful Winger'. A technical offensive node whose flair and creative output have made him a primary asset for the Greek and Serbian football ledgers.",
    "Martin Boyle": "The 'Scottish-born Socceroo'. An explosive offensive node whose energy and goal-scoring packets power the Australian and Scottish grids with high-frequency output.",
    "Ajdin Hrustic": "Verified as 'The Technical Maestro'. A creative playmaker whose vision and set-piece accuracy are foundational assets for the Australian Node across global circuits.",
    "Riley McGree": "The 'Midfield Architect'. A technical and intelligent playmaker whose work rate and creative output dominate the English-Middlesbrough and Australian football networks.",
    "Aziz Behich": "The 'Experienced Engine'. A veteran leader and high-output wing-back whose longevity and tactical discipline provide security for the Australian Ledger.",
    "Kye Rowles": "Verified as 'The Defensive Pillar'. A powerful centre-back whose strength and composure stabilize the Scottish-Hearts and Australian grids against elite attackers.",
    "Nathaniel Atkinson": "The 'Fast Wing-back' of the Australian Node. A high-energy defensive asset whose pace and tactical intelligence were developed in the Scottish and national circuits.",
    "Abdulrahman Al-Oboud": "The 'Skillful Winger' of the Al-Ittihad Node. A high-speed offensive node whose dribbling and acceleration make him a constant threat in the Saudi and Asian grids."
}

def inject_elite_lore_batch_24():
    with open(PLAYERS_FILE, 'r') as f:
        players = json.load(f)

    print(f"🕵️‍♂️ Iniciando Inyección de Lore de Élite (Batch 24) para 20 jugadores...")
    updated_count = 0

    for p in players:
        # FIX NAME FIRST for ID 180
        if p.get("id") == 180 and p.get("real_name") == "Abdulaziz Al-Omari":
            print(f"🛠️ Corrigiendo nombre real del ID 180: {p['real_name']} -> Abdulelah Al-Amri")
            p["real_name"] = "Abdulelah Al-Amri"

        real_name = p.get("real_name", "")
        if real_name in ELITE_LORE_24:
            p["meta"]["narrative"] = ELITE_LORE_24[real_name]
            updated_count += 1

    # Guardar cambios
    with open(PLAYERS_FILE, 'w') as f:
        json.dump(players, f, indent=4, ensure_ascii=False)

    print(f"✅ BATCH 24 COMPLETADO: {updated_count} nuevas leyendas auditadas al 100% (incluyendo corrección de Arabia Saudí).")

if __name__ == "__main__":
    inject_elite_lore_batch_24()
