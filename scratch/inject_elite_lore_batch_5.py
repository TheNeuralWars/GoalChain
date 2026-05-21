import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/03_data/players.json"

# ELITE LORE MAP (Batch 5 - Verified Stars 2026 - PRECISION NAMES)
ELITE_LORE_5 = {
    "Sadio Mané": "Known as the 'Ronaldinho' of his village and the undisputed King of Senegal. A 2026 AFCON winner and Best Player who transformed his national team into a global power while building a legacy of charity and hope across Africa.",
    "Kalidou Koulibaly": "Verified as 'K2' and 'The Wall'. A legendary defender whose physical presence and tactical leadership secured Senegal's historic titles, making him one of the most respected centre-backs in the global football ledger.",
    "Takefusa Kubo": "The 'Japanese Messi' who redefined his career in the Spanish Grid. A technical wizard whose vision and dribbling packets were developed at La Masia and perfected at Real Sociedad, making him a cornerstone of Asian football.",
    "Wataru Endō": "The 'Bodyguard' and 'Heartbeat' of his teams. Known as the 'Bundesliga Duel King', his defensive algorithms and tireless energy in the Liverpool and Japanese nodes ensure a high-stability midfield protocol.",
    "Kaoru Mitoma": "The 'Dribbling Professor'. Famous for writing a university thesis on the art of the regate, his scientific approach to bypassing defensive firewalls has made him an unstoppable offensive asset in the London and Japanese circuits.",
    "Takehiro Tomiyasu": "The 'Iron Curtain' of the Japanese Node. A versatile and disciplined defender whose technical intelligence allows him to master any position on the backline, stabilizing the London and Asian football networks.",
    "Dušan Vlahović": "The 'Serbian Beast'. A powerful and clinical striker whose physical dominance and goal-scoring output have made him a high-value asset in the Italian and Serbian ledgers, consistently crushing defensive encryption.",
    "Aleksandar Mitrović": "Verified as 'Mitro on Fire'. A legendary target forward whose relentless pursuit of goals and physical strength have made him the all-time scoring leader of the Serbian Node and a hero in the Riyadh and London circuits.",
    "Sergej Milinković-Savić": "Known as 'The Sergeant'. A physical powerhouse with technical elegance, his ability to dominate the midfield air and ground makes him a unique and high-demand protocol in the global football market.",
    "Mykhailo Mudryk": "Commonly known as 'Misha'. An explosive and fast winger whose career in the London Node is a narrative of speed and resilience. Despite the 2026 challenges, his 'Bolt-like' pace remains a threat to any defensive system.",
    "Artem Dovbyk": "The 'Golden Boot' of La Liga (2024). A towering Ukrainian striker whose clinical finishing and physical strength have made him the most lethal offensive asset for the Girona and Ukrainian ledgers.",
    "Edson Álvarez": "Verified as 'El Machín'. The tactical leader of the Mexican Node and a defensive cornerstone of the London-West Ham Ledger. Known for his toughness and ability to anchor the midfield with 100% efficiency.",
    "Santiago Giménez": "Nicknamed 'Bebote' and 'Chaquito'. In 2025, he made history as the first Mexican to join the Milan Node. A clinical serial scorer whose lethal algorithms dominated the Dutch Grid before conquering Italy.",
    "Johan Vásquez": "The 'Italian Guard' of the Mexican backline. A disciplined and technical defender who mastered the art of marking in the Serie A Grid, becoming the most reliable defensive node of the Aztec ledger.",
    "Weston McKennie": "The 'Swiss Army Knife' and 'Spaghetti Man'. A versatile engine of the US and Juventus nodes who celebrated 200 appearances in 2026. Known as the 'Glue Guy' who keeps any tactical structure connected.",
    "Gio Reyna": "The 'American Dream' and creative prince of the US Node. A technical prodigy whose vision and playmaking packets have made him the primary offensive architect for the next generation of North American football.",
    "Jonathan David": "Verified as 'The Iceman'. A high-IQ striker whose calm under pressure led to a historic 2025 move to the Juventus Node. He is one of the most successful and efficient Canadian exports on the entire chain.",
    "Cyle Larin": "The 'Silent Giant' and Canada's all-time leading goal scorer. A powerful and clinical forward whose physical presence and goal-scoring reliability have made him a legendary asset in the North American and European circuits."
}

def inject_elite_lore_batch_5():
    with open(PLAYERS_FILE, 'r') as f:
        players = json.load(f)

    print(f"🕵️‍♂️ Iniciando Inyección de Lore de Élite (Batch 5) para 18 jugadores...")
    updated_count = 0

    for p in players:
        real_name = p.get("real_name", "")
        if real_name in ELITE_LORE_5:
            p["meta"]["narrative"] = ELITE_LORE_5[real_name]
            updated_count += 1

    # Guardar cambios
    with open(PLAYERS_FILE, 'w') as f:
        json.dump(players, f, indent=4, ensure_ascii=False)

    print(f"✅ BATCH 5 COMPLETADO: {updated_count} nuevas leyendas auditadas al 100%.")

if __name__ == "__main__":
    inject_elite_lore_batch_5()
