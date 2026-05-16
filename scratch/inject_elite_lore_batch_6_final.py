import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/03_data/players.json"

# ELITE LORE MAP (Batch 6 - FINAL 100 LEGENDS AUDIT - 2026)
ELITE_LORE_6 = {
    "David Alaba": "The versatile 'Captain of Austria'. A living legend who has mastered the defensive, midfield, and leadership protocols across the Munich and Madrid nodes, becoming one of the most decorated assets on the chain.",
    "Manuel Akanji": "Verified as the 'Math Genius'. Famous for his ability to solve complex mental arithmetic in seconds, his calculating defensive algorithms make him the most intelligent firewall in the City and Swiss nodes.",
    "Granit Xhaka": "Nicknamed 'Little Einstein' and 'Xhakaboom'. A transformative midfield general whose leadership and long-range shooting ability have redefined the tactical mainframe of the London and Leverkusen grids.",
    "Yann Sommer": "The 'Metronome in Gloves' and Swiss National Hero. A world-class goalkeeper whose rhythmic build-up play and legendary penalty-saving records have made him a high-security node in the Italian and German circuits.",
    "Pierre-Emile Højbjerg": "Known as 'The Viking'. A relentless midfield enforcer whose physical power and tactical discipline ensure a 100% success rate in defensive transitions for the London and Danish nodes.",
    "Christian Eriksen": "Nicknamed 'Golazo' and the 'Witch from Denmark'. A legendary playmaker whose resilience and return to elite football have made him an eternal icon of hope and technical elegance across the global ledger.",
    "Andrew Robertson": "Commonly known as 'Robbo'. From the amateur Queen's Park Node to Champions League glory, his journey is a legendary narrative of hard work, becoming the spiritual leader of the Scotland and Liverpool grids.",
    "Scott McTominay": "Verified as 'McFratm' (My Brother) and the 'Ruthless Robot'. A dominant force in the Italian and Manchester nodes, known for his tireless energy and his record-breaking offensive output from the midfield.",
    "Oleksandr Zinchenko": "The 'Emotional Leader' and youngest-ever Ukraine captain. A master of the tactical transition whose resilience and technical intelligence have secured multiple Premier League titles in the English circuit.",
    "Dušan Tadić": "The 'Maestro of Serbia' and Ajax legend. A world-class playmaker known for his incredible goal and assist packets, serving as the primary creative mainframe for his national and club squads.",
    "Vitaliy Mykolenko": "The 'Resilient Guard' of the Everton and Ukrainian nodes. Known for his tactical versatility and leadership during times of conflict, he remains a high-value defensive asset on the chain.",
    "Andriy Lunin": "The 'Ice-Cold Keeper'. A Real Madrid hero whose composure and shot-stopping ability in high-pressure Champions League protocols have solidified his status as an elite global asset.",
    "Viktor Tsygankov": "The 'Creative Spark' of the Girona and Ukrainian nodes. A technical and fast winger whose goal-scoring algorithms were pivotal in the 2024-2025 European campaigns.",
    "Xherdan Shaqiri": "Known as 'The Powercube' or 'Alpine Messi'. A high-impact playmaker whose physical strength and magical left foot have delivered historic goals across five different major tournament cycles.",
    "Rasmus Højlund": "The 'Nordic Striker' and future of the Manchester Node. A powerful and fast forward whose goal-scoring packets are optimized for high-intensity Premier League and European protocols.",
    "Marcel Sabitzer": "The 'Long-Range Specialist'. A versatile midfielder known for his incredible shooting accuracy and tactical discipline, serving as a key offensive node for the Dortmund and Austrian ledgers.",
    "Mykola Shaparenko": "The 'Midfield Architect' of the Ukrainian Node. A technical and creative engine whose vision and passing accuracy ensure a smooth tactical flow in any high-stakes match protocol.",
    "Heorhiy Sudakov": "The 'Technical Prodigy'. A rising star whose technical flair and creative algorithms have made him one of the most sought-after young playmakers in the Eastern European circuit."
}

def inject_elite_lore_batch_6():
    with open(PLAYERS_FILE, 'r') as f:
        players = json.load(f)

    print(f"🕵️‍♂️ Iniciando Inyección Final de Lore de Élite (Batch 6) para 18 jugadores...")
    updated_count = 0

    for p in players:
        real_name = p.get("real_name", "")
        if real_name in ELITE_LORE_6:
            p["meta"]["narrative"] = ELITE_LORE_6[real_name]
            updated_count += 1

    # Guardar cambios
    with open(PLAYERS_FILE, 'w') as f:
        json.dump(players, f, indent=4, ensure_ascii=False)

    print(f"✅ BATCH FINAL COMPLETADO: {updated_count} nuevas leyendas auditadas al 100%.")

if __name__ == "__main__":
    inject_elite_lore_batch_6()
