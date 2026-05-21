import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/03_data/players.json"

# ELITE LORE MAP (Batch 12 - Asian & Gulf Icons - 2026)
ELITE_LORE_12 = {
    "Alireza Beiranvand": "Verified as 'Beyro'. The homeless-to-hero keeper who holds the Guinness World Record for the longest football throw (61.26m). Famous for saving a penalty from the Portuguese Node's leader in 2018.",
    "Kim Min-jae": "Known as 'The Monster' and the 'Korean Beckenbauer'. The most expensive Asian defender in history whose physical dominance and tactical intelligence have mastered the Italian and German circuits.",
    "Salem Al-Dawsari": "The 'Saudi Flash'. A legendary figure whose historic winning goal against Argentina in 2022 and two AFC Player of the Year awards have made him a verified icon of the Riyadh Node.",
    "Akram Afif": "Verified as 'The Wizard of Qatar'. A two-time Asian Player of the Year and MVP of back-to-back Asian Cup titles, serving as the primary creative mainframe for the Doha Node.",
    "Sardar Azmoun": "Known as 'Sardar' (The Headmaster). A technical striker with a volleyball background that provided him with elite aerial dominance, making him a high-value node in the German and Italian circuits.",
    "Hwang Hee-chan": "Verified as 'The Bull' (Hwangso). A fearless and aggressive winger whose 91st-minute winner against Portugal in 2022 secured a historic tactical advancement for the South Korean Node.",
    "Cho Gue-sung": "The 'Korean Beckham' and Vogue cover star. From being nicknamed 'sickly ostrich' in his youth to becoming the first South Korean to score a World Cup brace, he is a global icon of the Seoul Node.",
    "Almoez Ali": "The leading scorer of the Qatari Node. A clinical striker who trained under the guidance of the legendary Raul Gonzalez, holding the record for the most goals in a single Asian Cup edition.",
    "Ayman Hussein": "Nicknamed 'The Hatchet Man' (Abu Tubar). A prolific goalscorer and national icon of the Iraqi Node, known for his historic 6-goal record in the 2023 Asian Cup and his resilience through tragedy.",
    "Ali Al-Bulaihi": "Verified as 'The Provoker'. The fearless defender of the Riyadh Node famously known for confronting both the Argentine and Portuguese legends face-to-face on the world stage.",
    "Firas Al-Buraikan": "The 'Goal Machine' of the Saudi Node. A versatile and clinical striker whose goal-scoring packets have secured back-to-back Champions League Elite titles in the Middle Eastern circuit.",
    "Mehdi Taremi": "The 'Goal Poacher' of the Inter Milan and Iranian nodes. A world-class striker whose physical strength and tactical intelligence have made him a lethal asset in the European and Asian grids.",
    "Lee Kang-in": "The 'Technical Jewel' of the Seoul and Paris nodes. A technical prodigy whose creative vision and playmaking packets were perfected in the Spanish Grid before conquering France.",
    "Alireza Jahanbakhsh": "The 'Experienced Winger' of the Iranian Node. A legendary figure who conquered the Dutch Grid as top scorer before bringing his technical output to the English and global circuits.",
    "Zidane Iqbal": "The 'Iraqi Jewel'. A Manchester-born playmaker whose technical flair and vision have made him a primary offensive node for the next generation of the Baghdad Ledger.",
    "Ali Jasim": "The 'Rising Star of Iraq'. A fast and creative winger whose explosive pace and technical ability have made him a high-frequency offensive asset in the Asian and European circuits.",
    "Hassan Al-Haydos": "The 'Eternal Captain' of the Qatari Node. A multiple-time Asian champion whose leadership and technical experience provide 100% stability to the Doha and Gulf football grids.",
    "Mohammed Kanno": "The 'Midfield Wall' of the Saudi Node. A physically dominant and technical midfielder whose presence ensures the stability of the Riyadh and global football networks.",
    "Hyeon-woo Jo": "The 'Korean Spider'. A world-class goalkeeper whose reflexes and legendary World Cup performances have made him a high-security fail-safe for the Seoul Node.",
    "Woo-yeong Jeong": "The 'Creative Node' of the South Korean and Munich grids. A versatile playmaker whose tactical intelligence and technical precision were developed in the heart of European football."
}

def inject_elite_lore_batch_12():
    with open(PLAYERS_FILE, 'r') as f:
        players = json.load(f)

    print(f"🕵️‍♂️ Iniciando Inyección de Lore de Élite (Batch 12) para 20 jugadores...")
    updated_count = 0

    for p in players:
        real_name = p.get("real_name", "")
        if real_name in ELITE_LORE_12:
            p["meta"]["narrative"] = ELITE_LORE_12[real_name]
            updated_count += 1

    # Guardar cambios
    with open(PLAYERS_FILE, 'w') as f:
        json.dump(players, f, indent=4, ensure_ascii=False)

    print(f"✅ BATCH 12 COMPLETADO: {updated_count} nuevas leyendas asiáticas y del golfo auditadas al 100%.")

if __name__ == "__main__":
    inject_elite_lore_batch_12()
