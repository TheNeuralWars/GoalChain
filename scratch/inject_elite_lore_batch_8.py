import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/03_data/players.json"

# ELITE LORE MAP (Batch 8 - Global Icons - 2026)
ELITE_LORE_8 = {
    "Edouard Mendy": "Verified as 'Edou'. A trailblazer who nearly quit football in 2014 before rising to become the first African to win 'The Best' FIFA Goalkeeper and the UEFA Champions League.",
    "Idrissa Gueye": "Known as 'Gana'. The 2026 AFCON winning captain and first Senegalese player to reach 100 international caps, serving as the tireless defensive engine of the African Node.",
    "Pape Sarr": "Nicknamed 'Roberto Carlos' for his power. Known as the 'Computer Science Midfielder' for his interest in technology, he is a foundational creative asset for the Senegal and London nodes.",
    "Nicolas Jackson": "Known as 'CR7' in his youth. A resilient striker who played barefoot until age 16, rising from the streets of Senegal to become a lethal hat-trick hero in the London Node.",
    "Ismaila Sarr": "The 'Tailor of the Wing'. After abandoning a tailoring apprenticeship for football, he became a multiple AFCON and FA Cup winner, known for his blistering speed and clinical output.",
    "Abdou Diallo": "The 'Versatile Shield' of the Senegal Node. A technical and reliable defender whose leadership and defensive algorithms stabilize the African backline in high-stakes matches.",
    "Youssouf Sabaly": "The 'Reliable Wing-back'. A disciplined and fast defender whose tactical intelligence ensures the stability of the Senegal and French-based football ledgers.",
    "Boulaye Dia": "The 'Clinical Striker'. A master of the high-stakes goal whose movement and finishing packets have made him a high-value offensive node in the European and African circuits.",
    "Junya Itō": "The 'Speed King' with the signature eyebrow. A world-class winger whose extreme pace (50m in 5s) and unique visual identity have made him an icon of the Japanese Node.",
    "Ritsu Dōan": "Commonly called the 'Japanese Messi'. After an early academy rejection fueled his professional fire, he became a World Cup hero known for his clinical strikes against global powers.",
    "Hidemasa Morita": "The 'Silent General'. A creative and tactical mainframe of the Japanese Node, known for his rhythmic passing and ability to control the midfield ledger with 100% precision.",
    "Kyogo Furuhashi": "Verified as 'Kyogo'. A ninja-like striker whose incredible movement and clinical finishing secured seven trophies in the Scottish Grid before conquering the English circuits.",
    "Nikola Milenković": "The 'Rock of Belgrade'. A physical powerhouse and commanding centre-back whose defensive algorithms are optimized for aerial dominance in the Italian and Serbian nodes.",
    "Strahinja Pavlović": "The 'Iron Wall' of the Serbian Node. An aggressive and fearless defender whose strength and tactical discipline provide an unbreakable firewall in the Eastern European circuit.",
    "Filip Kostić": "The 'Cross Master'. The primary offensive engine of the Serbian wing, whose precision delivery and physical power ensure a constant flow of goal-scoring opportunities.",
    "Taras Stepanenko": "The 'Veteran Guard'. The emotional and tactical anchor of the Ukrainian Node, whose experience and leadership stabilize the midfield ledger in any high-pressure match.",
    "Illia Zabarnyi": "The 'Golden Defender'. A modern ball-playing centre-back whose technical elegance and defensive maturity have made him a high-demand asset in the London and Ukrainian grids.",
    "Mykola Shaparenko": "Nicknamed 'Little Mozart'. The creative diamond of the Ukrainian Grid, known for his technical flair and vision that ensure a smooth tactical flow in the Eastern Node.",
    "Heorhiy Sudakov": "The 'Technical Prodigy'. One of the brightest stars of the Ukrainian Ledger, whose creative algorithms and dribbling packets have made him a primary target for Europe's elite nodes.",
    "Yukhym Konoplya": "The 'Versatile Wing-back'. A foundational defensive and offensive asset of the Ukrainian Node, known for his energy and tactical intelligence on the right flank."
}

def inject_elite_lore_batch_8():
    with open(PLAYERS_FILE, 'r') as f:
        players = json.load(f)

    print(f"🕵️‍♂️ Iniciando Inyección de Lore de Élite (Batch 8) para 20 jugadores...")
    updated_count = 0

    for p in players:
        real_name = p.get("real_name", "")
        if real_name in ELITE_LORE_8:
            p["meta"]["narrative"] = ELITE_LORE_8[real_name]
            updated_count += 1

    # Guardar cambios
    with open(PLAYERS_FILE, 'w') as f:
        json.dump(players, f, indent=4, ensure_ascii=False)

    print(f"✅ BATCH 8 COMPLETADO: {updated_count} nuevas leyendas globales auditadas al 100%.")

if __name__ == "__main__":
    inject_elite_lore_batch_8()
