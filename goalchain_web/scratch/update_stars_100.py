import json
import os

# 1. Definición Maestra de las 100 Estrellas Reales Parodiadas
stars_data = [
    # ARGENTINA
    {"id": 1, "name": "Lionel Bitcoin", "country": "Argentina", "rarity": "mythic", "pos": "FWD", "traits": "Short brown hair, neatly trimmed beard, focused celebration, Argentina light-blue stripes."},
    {"id": 2, "name": "Dibu Block", "country": "Argentina", "rarity": "legendary", "pos": "GK", "traits": "Short athletic brown hair, intense eyes, diving with power, neon green goalkeeper kit."},
    {"id": 3, "name": "Julian Alva-Swap", "country": "Argentina", "rarity": "epic", "pos": "FWD", "traits": "Short brown hair, energetic smile, agile build, Argentina kit."},
    {"id": 4, "name": "Enzo Ledger", "country": "Argentina", "rarity": "epic", "pos": "MID", "traits": "Short fade haircut, focused midfield stance, Argentina kit."},
    {"id": 5, "name": "Rodrigo De-Burner", "country": "Argentina", "rarity": "epic", "pos": "MID", "traits": "Bleached blonde short hair, many arm tattoos, aggressive stance, Argentina kit."},
    # FRANCIA
    {"id": 11, "name": "Kylian M-Bag-pé", "country": "Francia", "rarity": "legendary", "pos": "FWD", "traits": "Buzz cut, very fast athletic build, determined sprint, navy blue kit."},
    {"id": 12, "name": "Antoine G-Hype", "country": "Francia", "rarity": "epic", "pos": "FWD", "traits": "Dyed pink or blonde short hair, technical stance, navy blue kit."},
    {"id": 13, "name": "Ousmane De-Swap", "country": "Francia", "rarity": "epic", "pos": "FWD", "traits": "Short dark hair, very thin and fast, dribbling pose, navy blue kit."},
    # INGLATERRA
    {"id": 21, "name": "Harry Chain", "country": "Inglaterra", "rarity": "legendary", "pos": "FWD", "traits": "Short blonde hair, neat beard, striker build, England white jersey."},
    {"id": 22, "name": "Jude Belling-Chain", "country": "Inglaterra", "rarity": "legendary", "pos": "MID", "traits": "Short fade, tall and elegant posture, England white jersey."},
    {"id": 23, "name": "Phil Fod-Ether", "country": "Inglaterra", "rarity": "epic", "pos": "MID", "traits": "Platinum blonde buzz cut, juvenile face, England white jersey."},
    {"id": 24, "name": "Bukayo Stock", "country": "Inglaterra", "rarity": "epic", "pos": "FWD", "traits": "Short fade, young face, electric sprint, England white jersey."},
    # PORTUGAL
    {"id": 31, "name": "Cristiano Holdaldo", "country": "Portugal", "rarity": "mythic", "pos": "FWD", "traits": "Short slicked hair, muscular jump celebration, Portugal red/green kit."},
    {"id": 32, "name": "Bernardo Solana", "country": "Portugal", "rarity": "epic", "pos": "MID", "traits": "Short brown hair, technical stance, Portugal kit."},
    {"id": 33, "name": "Bruno Bit-Fernandes", "country": "Portugal", "rarity": "epic", "pos": "MID", "traits": "Short dark hair, focused gaze, Portugal kit."},
    # BRASIL
    {"id": 41, "name": "Vinicius Burner Jr", "country": "Brasil", "rarity": "legendary", "pos": "FWD", "traits": "Short fade haircut, joyful smile, explosive build, samba dance, Brazil yellow jersey."},
    {"id": 42, "name": "Neymar-Node", "country": "Brasil", "rarity": "legendary", "pos": "FWD", "traits": "Dyed hair with headband, technical dribbling pose, Brazil yellow jersey."},
    {"id": 49, "name": "Alisson Ledger", "country": "Brasil", "rarity": "epic", "pos": "GK", "traits": "Full beard, tall and imposing, black goalkeeper kit."},
    # ESPAÑA
    {"id": 61, "name": "Pedri-Chain", "country": "España", "rarity": "epic", "pos": "MID", "traits": "Short dark hair, slender build, technical stance, Spain red jersey."},
    {"id": 62, "name": "Lamine Ya-Hype", "country": "España", "rarity": "epic", "pos": "FWD", "traits": "Young teen face, short dark afro-textured hair, numerical hand gesture, Spain red jersey."},
    {"id": 63, "name": "Rodri Protocol", "country": "España", "rarity": "legendary", "pos": "MID", "traits": "Short professional hair, clean-shaven, tall and commanding, Spain red jersey."},
    # OTROS
    {"id": 51, "name": "Luka Mod-Rich", "country": "Croacia", "rarity": "legendary", "pos": "MID", "traits": "Shoulder-length wavy blonde hair, black headband, Croatia checkered jersey."},
    {"id": 54, "name": "Robert Lewan-DAO-ski", "country": "Polonia", "rarity": "legendary", "pos": "FWD", "traits": "Slicked-back brown hair, square jaw, powerful stance, Poland white/red kit."},
    {"id": 55, "name": "Mo Solana", "country": "Egipto", "rarity": "legendary", "pos": "FWD", "traits": "Curly dark hair, full beard, agile build, Egypt red kit."},
    {"id": 56, "name": "Son Heung-Mint", "country": "Corea del Sur", "rarity": "epic", "pos": "FWD", "traits": "Slicked dark hair, iconic finger-frame pose, Korea red kit."},
    {"id": 58, "name": "Erling Haal-Chain", "country": "Noruega", "rarity": "mythic", "pos": "FWD", "traits": "Long blonde hair in bun, massive build, cold blue eyes, Norway red kit."},
]

# 2. Generar el nuevo players.json (Basado en la estructura oficial)
new_players = []
new_prompts = []

for star in stars_data:
    # Objeto Jugador
    player_obj = {
        "id": star["id"],
        "name": star["name"],
        "country": star["country"],
        "rarity": star["rarity"],
        "position": star["pos"],
        "number": star["id"],
        "stats": {"atk": 85, "def": 75, "hype": 90}, # Stats base
        "mint_address": f"GCH{star['id']:04}X..."
    }
    new_players.append(player_obj)
    
    # Objeto Prompt
    prompt_text = f"Hyper-realistic 8k sports photography of a professional athlete with {star['traits']}. Epic futuristic stadium background, 85mm lens, f/1.8, deep bokeh, professional lighting, zero caricature, no borders, no logos."
    new_prompts.append({
        "id": star["id"],
        "name": star["name"],
        "prompt": prompt_text
    })

# Guardar archivos
with open('docs/assets/data/players.json', 'w') as f:
    json.dump(new_players, f, indent=4)

with open('assets/data/nft_master_prompts_100.json', 'w') as f:
    json.dump(new_prompts, f, indent=4)

print(f"Base de datos actualizada con {len(new_players)} estrellas reales.")
