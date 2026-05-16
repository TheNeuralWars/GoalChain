import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/03_data/players.json"

# ELITE LORE MAP (Basado en Investigación Real 2026)
ELITE_LORE = {
    "Lionel Messi": "The undisputed GOAT of the GoalChain ledger. With 46 trophies and 900+ senior goals, 'La Pulga' cemented his legacy leading the Miami Node to the 2025 MLS Cup. His journey from Rosario to eternal glory is encoded in every block.",
    "Cristiano Ronaldo": "Known as 'CR7' and 'Mr. Goal', he is the first human to chase 1,000 official goals. A legendary unit who has conquered four different nodes (Madrid, Manchester, Turin, Riyadh), proving that age is just a variable in his code.",
    "Kylian Mbappé": "The '37' speedster of the French Node. A World Cup winner and Real Madrid icon who holds the record for the most goals in World Cup finals. His blistering pace is a glitch in the defensive systems of the world.",
    "Erling Haaland": "Code-named 'The Terminator'. The fastest player to reach 100 Premier League goals, his mythological scoring rate makes him a high-frequency trading asset for any manager seeking pure power.",
    "Lamine Yamal": "The 'Young Wizard' who redefines history. The youngest Ballon d’Or winner ever (2024) and heir to the legendary 'baby photo' legacy with Messi. At 18, he already holds 7 career titles in the Catalan Grid.",
    "Jude Bellingham": "The 'Hey Jude' of the Madrid Ledger. Birmingham retired his #22 to inspire future generations. A generational talent who conquered La Liga and Europe in his debut campaign, proving he is the engine of the new era.",
    "Kevin De Bruyne": "The 'Ginger Pelé' and the creative mainframe of the City Node. His vision and precision passing are legendary, consistently finding the winning packet in the most congested defensive networks.",
    "Mohamed Salah": "The 'Egyptian King' and clinical architect of the Liverpool Node. A talismanic figure whose speed and finishing have made him an eternal icon of the African and European football circuits.",
    "Vinícius Júnior": "The unstoppable winger of the Madrid Node. A master of the 'Electric Dribble', he has transitioned from a rising star to a cornerstone of the world's most successful football ledger.",
    "Son Heung-min": "Nicknamed 'Sonaldo Nazario', he is the soul of the Korean and Spurs nodes. After leading London to a 2025 Europa League title, 'Sonny' took his talents to the LAFC Node to expand his global influence.",
    "Victor Osimhen": "The 'Masked Striker' who rose from selling sachet water in Lagos to conquering the Serie A and Galatasaray nodes. A lethal force of nature and the 2025 African Ballon d'Or winner.",
    "Federico Valverde": "Once 'El Pajarito', now the mighty 'El Halcón'. The vice-captain of the Madrid Ledger, known for his 2026 Champions League hat-trick and his tireless, soaring energy across the midfield.",
    "Jamal Musiala": "The 'Bambi' of the Munich Grid. A creative engine who inherited the iconic No. 10. Known for his spindly, magical dribbling and being the joint-winner of the Euro 2024 Golden Boot.",
    "Pedri": "The 'Midfield Magician' of the Barcelona Node. A master of the Golden Boy legacy who played a record number of matches as a teenager, becoming the tactical mainframe of the Spanish Node.",
    "Gavi": "The 'Pitbull' who plays without fear. The youngest debutant and scorer for the Spanish Node in World Cup history. A Kopa Trophy winner whose tenacity is a legendary variable in the Catalan Grid.",
    "Khvicha Kvaratskhelia": "Commonly known as 'Kvaradona'. The Georgian Messi who conquered Naples before moving to the PSG Node to win the 2025 Champions League. A dribbling glitch that breaks any defense.",
    "Julián Álvarez": "The 'Spider' who has won every major international title before the age of 25. A serial trophy winner who moved to the Madrid-Atletico Node in 2024 to lead their new offensive protocol.",
    "Enzo Fernández": "The 'Musico' of the Chelsea Node. A 2022 World Cup Young Player winner who moved for a record fee to master the London midfield, winning the FIFA Club World Cup in the process.",
    "Emiliano Martínez": "The 'Hero of Lusail' and master of mind games. A Golden Glove winner whose saves secured the 2022 World Cup for Argentina, making him the most feared goalkeeper in any penalty shootout protocol.",
    "Luka Modrić": "The 'Eternal Maestro' and Balkan architect. A Ballon d'Or winner who rose from a refugee background to become the most elegant midfielder in the history of the Madrid Node.",
    "Harry Kane": "The 'Hurri-Kane'. A clinical striker whose pursuit of goal-scoring records has led him to the Munich Grid, where he continues to be the most reliable finisher in the European ecosystem.",
    "Robert Lewandowski": "The veteran 'Goal Poacher' who consistently delivers. A master of the clinical strike who remains a high-value asset in the Barcelona Node, defying the aging curve of his code.",
    "Virgil van Dijk": "The 'Wall' and commander-in-chief of the Liverpool Node. A defensive titan whose presence alone stabilizes any backline, known for his towering strength and tactical leadership.",
    "Rodri": "The 'Tactical Mastermind' and anchor of the global game. The most reliable node in the City midfield, his presence ensures a 100% success rate in defensive and offensive transitions."
}

def inject_elite_lore():
    with open(PLAYERS_FILE, 'r') as f:
        players = json.load(f)

    print(f"🕵️‍♂️ Iniciando Inyección de Lore de Élite para los Top Players...")
    updated_count = 0

    for p in players:
        real_name = p.get("real_name", "")
        if real_name in ELITE_LORE:
            p["meta"]["narrative"] = ELITE_LORE[real_name]
            updated_count += 1

    # Guardar cambios
    with open(PLAYERS_FILE, 'w') as f:
        json.dump(players, f, indent=4, ensure_ascii=False)

    print(f"✅ LORE DE ÉLITE COMPLETADO: {updated_count} leyendas ahora tienen biografías reales y auténticas.")

if __name__ == "__main__":
    inject_elite_lore()
