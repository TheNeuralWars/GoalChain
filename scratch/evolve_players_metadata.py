import json
import random

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/03_data/players.json"

# 1. Definición de Habilidades por Posición
TRAIT_POOL = {
    "GK": ["Iron Wall", "Penalty Stopper", "Quick Reflexes", "Sweeper Keeper", "Aerial Master", "One-on-One King"],
    "DEF": ["The Rock", "Slide Tackle Master", "Header Specialist", "Interceptor", "Tactical Mind", "Unstoppable Force"],
    "MID": ["The Maestro", "Visionary", "The Engine", "Box-to-Box Dynamo", "Magic Touch", "Interstellar Passer"],
    "FWD": ["Sniper", "Speedster", "Goal Machine", "Acrobat", "Dribbling Wizard", "Clinical Finisher"]
}

# 2. Efectos Visuales por Rareza
VISUAL_EFFECTS = {
    "mythic": "Cosmic Aura & Golden Supernova",
    "legendary": "Holographic Glitch & Silver Spark",
    "epic": "Electric Neon Pulse",
    "rare": "Subtle Cyber Outline"
}

# 3. Clubes Parodiados (Pool Genérico por Prestigio)
PARODY_CLUBS = [
    "Madrid White Ledger", "London Blue Node", "Paris Sapphire PSG", "Manchester Red Chain", 
    "Munich Cyber-Bayer", "Turin Zebra Grid", "Barcelona Garnet Block", "Milan Devil Core",
    "Amsterdam Ajax Logic", "Dortmund Yellow Hive", "Buenos Aires Pampa FC", "Rio Samba Digital"
]

def inject_gameplay_metadata():
    with open(PLAYERS_FILE, 'r') as f:
        players = json.load(f)

    print(f"🚀 Iniciando evolución de {len(players)} jugadores...")

    for p in players:
        pos = p.get("position", "MID")
        rarity = p.get("rarity", "rare")
        name = p.get("name", "Unknown Player")
        country = p.get("country", "Digital Realm")

        # A. Asignar Traits según Rareza
        # Mythic: 3 | Legendary: 2 | Epic: 2 | Rare: 1
        num_traits = 3 if rarity == "mythic" else 2 if rarity in ["legendary", "epic"] else 1
        p["traits"] = random.sample(TRAIT_POOL.get(pos, TRAIT_POOL["MID"]), num_traits)

        # B. Asignar Meta Data
        p["meta"] = {
            "parody_club": random.choice(PARODY_CLUBS),
            "visual_effect": VISUAL_EFFECTS.get(rarity, "Standard Clean"),
            "narrative": "" # Se genera abajo
        }

        # C. Generar Lore Narrativo Dinámico
        trait_str = " and ".join(p["traits"])
        bio_templates = [
            f"A {rarity} unit from the {country} sector. {name} is encoded with {trait_str}, making them a cornerstone of the GoalChain ledger.",
            f"Born in the digital fields of {country}, this {pos} has mastered the art of {p['traits'][0]}. A high-value asset for any elite manager.",
            f"Legend says {name}'s data packets are faster than the block itself. With their {trait_str} ability, they dominate the {p['meta']['parody_club']} squad.",
            f"Verified on the chain as a top-tier {pos}. From {country} to the world, {name} brings {p['traits'][0]} to every high-stakes match."
        ]
        p["meta"]["narrative"] = random.choice(bio_templates)

    # Guardar cambios
    with open(PLAYERS_FILE, 'w') as f:
        json.dump(players, f, indent=4, ensure_ascii=False)

    print("✅ EVOLUCIÓN COMPLETADA: El archivo players.json ahora tiene Habilidades, Lore y Efectos Visuales.")

if __name__ == "__main__":
    inject_gameplay_metadata()
