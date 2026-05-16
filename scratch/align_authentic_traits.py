import json

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/03_data/players.json"

# 1. Mapa de Habilidades de Autor (Top Legends)
SIGNATURE_TRAITS = {
    "Lionel Messi": ["GOAT Aura", "Playmaker Maestro", "Dribbling God"],
    "Cristiano Ronaldo": ["Clutch Finisher", "Physical Specimen", "Aerial Threat"],
    "Kylian Mbappé": ["Sonic Speed", "Elite Striker", "Golden Boy"],
    "Erling Haaland": ["Goal Machine", "Physical Powerhouse", "Terminator Finisher"],
    "Kevin De Bruyne": ["Visionary Maestro", "Precision Passer", "Midfield General"],
    "Emiliano Martínez": ["Penalty Specialist", "Iron Wall", "Mind Games Master"],
    "Vinícius Júnior": ["Dribbling Wizard", "Speedster", "Electric Winger"],
    "Jude Bellingham": ["The Engine", "Box-to-Box King", "Generational Talent"],
    "Rodri": ["Tactical Mastermind", "The Anchor", "Midfield Wall"],
    "Lamine Yamal": ["Future Star", "Dribbling Prodigy", "Technical Wizard"],
    "Mohamed Salah": ["Egyptian King", "Clinical Finisher", "Speedster"],
    "Harry Kane": ["Elite Sniper", "Playmaking Striker", "Target Man"],
    "Robert Lewandowski": ["Goal Poacher", "Clinical Finisher", "Strong Target"],
    "Virgil van Dijk": ["The Wall", "Aerial Master", "Leader of Men"],
    "Luka Modrić": ["Eternal Maestro", "Visionary", "Midfield Architect"]
}

def align_authentic_traits():
    with open(PLAYERS_FILE, 'r') as f:
        players = json.load(f)

    print(f"🕵️‍♂️ Iniciando Auditoría de Veracidad para {len(players)} jugadores...")
    updated_count = 0

    for p in players:
        real_name = p.get("real_name", "")
        pos = p.get("position", "MID")
        stats = p.get("stats", {})
        phys = p.get("physical", {}).get("t", "").lower()
        
        traits = []

        # A. Prioridad 1: Habilidades de Autor (Signature)
        if real_name in SIGNATURE_TRAITS:
            traits = SIGNATURE_TRAITS[real_name]
        
        else:
            # B. Prioridad 2: Lógica basada en Posición + Stats + Biometría
            # --- ATACANTES ---
            if pos == "FWD":
                if stats.get("atk", 0) > 85: traits.append("Clinical Finisher")
                if "fast" in phys or "speed" in phys: traits.append("Speedster")
                if "tall" in phys or "towering" in phys: traits.append("Aerial Threat")
                if "dribbling" in phys or "technical" in phys: traits.append("Dribbling Wizard")
                if not traits: traits.append("Goal Hunter")

            # --- MEDIOCAMPISTAS ---
            elif pos == "MID":
                if stats.get("atk", 0) > 80: traits.append("Playmaker")
                if "engine" in phys or "tireless" in phys: traits.append("The Engine")
                if "vision" in phys or "pass" in phys: traits.append("Visionary")
                if "technical" in phys: traits.append("Technical Maestro")
                if not traits: traits.append("Box-to-Box")

            # --- DEFENSORES ---
            elif pos == "DEF":
                if stats.get("def", 0) > 85: traits.append("The Rock")
                if "tall" in phys or "towering" in phys: traits.append("Aerial Master")
                if "strong" in phys or "powerful" in phys: traits.append("Physical Powerhouse")
                if "fast" in phys: traits.append("Recovery Pace")
                if not traits: traits.append("Interceptor")

            # --- PORTEROS ---
            elif pos == "GK":
                if stats.get("def", 0) > 88: traits.append("Iron Wall")
                if "reflexes" in phys or "agile" in phys: traits.append("Quick Reflexes")
                if "tall" in phys or "towering" in phys: traits.append("Aerial Commander")
                if not traits: traits.append("Shot Stopper")

        # C. Limitar a máximo 3 traits y asegurar unicidad
        p["traits"] = list(dict.fromkeys(traits))[:3]
        
        # D. Actualizar Narrativa para que mencione las nuevas habilidades
        trait_str = ", ".join(p["traits"])
        p["meta"]["narrative"] = f"A world-class {pos} verified as a {p['rarity']} asset. Known globally for being a {trait_str}, this player is a cornerstone of the GoalChain ecosystem."
        
        updated_count += 1

    # Guardar cambios
    with open(PLAYERS_FILE, 'w') as f:
        json.dump(players, f, indent=4, ensure_ascii=False)

    print(f"✅ AUDITORÍA COMPLETADA: {updated_count} jugadores alineados con su realidad futbolística.")

if __name__ == "__main__":
    align_authentic_traits()
