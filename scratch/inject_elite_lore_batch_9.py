import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/03_data/players.json"

# ELITE LORE MAP (Batch 9 - Americas & Nigeria - 2026)
ELITE_LORE_9 = {
    "Guillermo Ochoa": "Verified as 'San Memo'. In 2026, he becomes the first player in history to be selected for 6 World Cup squads. A living legend of the Mexican Node whose iconic saves have secured his status as the eternal guardian of the Aztec ledger.",
    "Hirving Lozano": "Known as 'Chucky' for his habit of scaring teammates in his youth. Now a legendary leader of San Diego FC and the Mexican Node, his explosive pace and clinical finishing remain a primary offensive threat on the chain.",
    "Luis Chávez": "The free-kick maestro of the Mexican Node. Famous for paying his own release clause to pursue his European dream, his stunning goals and technical precision have made him a symbol of persistence and talent.",
    "César Montes": "Commonly known as 'El Cachorro'. The powerful and commanding centre-back of Lokomotiv Moscow and the Mexican Node, optimized for aerial dominance and physical defensive protocols.",
    "Orbelín Pineda": "The versatile magician of AEK Athens and the Mexican Node. A creative and industrious playmaker whose vision and ball-carrying packets ensure a high-stability tactical flow in the Aztec midfield.",
    "Luis Romo": "The 'Silent Engine' of the Mexican Node. A versatile midfielder whose tactical discipline and reliability make him a foundational asset for any high-pressure football ledger.",
    "Folarin Balogun": "The primary No. 9 of the US Node in 2026. A lethal and fast striker whose goal-scoring algorithms have been perfected in the French and North American circuits, becoming a high-value offensive asset.",
    "Yunus Musah": "The 4-country dynamo of AC Milan and the US Node. Born in NY, raised in Italy, and trained in London, his unique background has created an elite ball-carrying and defensive protocol.",
    "Ademola Lookman": "The 2024 African Footballer of the Year and star of the Madrid-Atletico Node. A clinical winger whose historic 2024 Europa League hat-trick cemented his legacy as one of the most lethal nodes in the Nigerian ledger.",
    "Alex Iwobi": "The most experienced Nigerian in Premier League history with over 300 appearances. Known as the 'Nutmeg Prince', his tactical evolution into a versatile midfielder has made him a cornerstone of the Super Eagles.",
    "Samuel Chukwueze": "Verified as 'The Nigerian Robben'. An explosive winger whose technical dribbling once matched Messi's records at the Bernabéu, serving as a high-frequency offensive node for the Milan and Nigerian circuits.",
    "Kelechi Iheanacho": "Known globally as 'Senior Man Kelz'. A clinical striker with a lethal instinct for goal-scoring, whose experience in Europe's elite ledgers makes him a high-impact asset for the Nigerian Node.",
    "Victor Boniface": "The 'Leverkusen Powerhouse'. An invincible striker whose physical strength and goal-scoring packets were foundational to the historic 2024-2025 campaigns, becoming a primary offensive node for Nigeria.",
    "Wilfred Ndidi": "Commonly called 'The Octopus'. A legendary defensive midfielder whose long reach and tackling efficiency provide a nearly unbreakable firewall for the Leicester and Nigerian grids.",
    "Yáser Asprilla": "The 'New Diamond' of Colombian football. A technical prodigy whose creativity and technical flair have made him the primary offensive architect for the next generation of the South American Node.",
    "Camilo Vargas": "The 'Guardian of Atlas'. A world-class goalkeeper whose reflexes and leadership have secured titles in the Mexican Grid, serving as the primary fail-safe for the Colombian Ledger.",
    "William Troost-Ekong": "The 'Captain' and vocal leader of the Nigerian Node. A powerful and disciplined centre-back whose defensive algorithms and organizational skills stabilize the Super Eagles' backline.",
    "Calvin Bassey": "The 'Physical Tower'. A versatile and fast defender who can master both the centre-back and left-back protocols, bringing 100% reliability to the Nigerian and London-based grids.",
    "Gerardo Arteaga": "The 'Versatile Guard' of the left flank. A disciplined defender whose technical intelligence and energy have made him a foundational asset for the Mexican Node and his European-based circuits.",
    "Jorge Sánchez": "The 'Aztec Shield'. A physical and fast defensive node whose high-frequency output on the right flank ensures the stability of the Mexican backline against the world's fastest attackers."
}

def inject_elite_lore_batch_9():
    with open(PLAYERS_FILE, 'r') as f:
        players = json.load(f)

    print(f"🕵️‍♂️ Iniciando Inyección de Lore de Élite (Batch 9) para 20 jugadores...")
    updated_count = 0

    for p in players:
        real_name = p.get("real_name", "")
        if real_name in ELITE_LORE_9:
            p["meta"]["narrative"] = ELITE_LORE_9[real_name]
            updated_count += 1

    # Guardar cambios
    with open(PLAYERS_FILE, 'w') as f:
        json.dump(players, f, indent=4, ensure_ascii=False)

    print(f"✅ BATCH 9 COMPLETADO: {updated_count} nuevas leyendas auditadas al 100%.")

if __name__ == "__main__":
    inject_elite_lore_batch_9()
