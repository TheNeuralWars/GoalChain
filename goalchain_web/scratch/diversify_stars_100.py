import json

# Diccionario de Identidades Únicas y Creativas (V11.0)
stars = [
    # ARGENTINA
    (1, "Lionel Satoshi", "Argentina", "mythic", "FWD", "Bearded, short brown hair, 1.70m, pointing fingers up, Argentina light-blue stripes."),
    (2, "Dibu De-Fi", "Argentina", "legendary", "GK", "Short athletic brown hair, intense eyes, diving with power, neon green kit."),
    (3, "Julian Bull-varez", "Argentina", "epic", "FWD", "Short brown hair, energetic smile, agile build, Argentina kit."),
    (4, "Enzo Ether", "Argentina", "epic", "MID", "Short fade haircut, focused midfield stance, Argentina kit."),
    (5, "Rodrigo De-Pool", "Argentina", "epic", "MID", "Bleached blonde short hair, arm tattoos, aggressive stance, Argentina kit."),
    (6, "Angel Di Merkle", "Argentina", "legendary", "FWD", "Thin build, technical dribbling pose, Argentina kit."),
    (7, "Alexis Mac-Chain", "Argentina", "epic", "MID", "Short reddish-brown hair, beard stubble, technical midfielder, Argentina kit."),
    (8, "Cuti Crypt", "Argentina", "epic", "DEF", "Short dark hair, aggressive defensive stance, Argentina kit."),
    (9, "Lautaro Bull-Run", "Argentina", "epic", "FWD", "Short dark hair, powerful stocky build, Argentina kit."),
    (10, "Lisandro The-Butcher-DAO", "Argentina", "epic", "DEF", "Short dark hair, sliding tackle pose, Argentina kit."),
    
    # FRANCIA
    (11, "Kylian M-Node-pé", "Francia", "legendary", "FWD", "Buzz cut, very fast athletic build, determined sprint, navy blue kit."),
    (12, "Antoine G-ZkSync", "Francia", "epic", "FWD", "Dyed pink short hair, technical stance, navy blue kit."),
    (13, "Ousmane De-Shard", "Francia", "epic", "FWD", "Short dark hair, thin and fast, navy blue kit."),
    (14, "Aurélien Tchoua-Mining", "Francia", "epic", "MID", "Short dark hair, powerful midfield build, navy blue kit."),
    (15, "Eduardo Cama-Contract", "Francia", "epic", "MID", "Dreadlocks tied back, athletic and lean, navy blue kit."),
    (16, "Theo Shiller", "Francia", "epic", "DEF", "Short blonde hair, fast defensive sprint, navy blue kit."),
    (17, "Mike Maignan-Node", "Francia", "epic", "GK", "Short hair, tall and athletic, black goalkeeper kit."),
    
    # INGLATERRA
    (21, "Harry Stake", "Inglaterra", "legendary", "FWD", "Short blonde hair, neat beard, striker build, white jersey."),
    (22, "Jude Belling-Swap", "Inglaterra", "legendary", "MID", "Short fade, tall and elegant posture, white jersey."),
    (23, "Phil Fod-Phantom", "Inglaterra", "epic", "MID", "Platinum blonde buzz cut, juvenile face, white jersey."),
    (24, "Bukayo Solana", "Inglaterra", "epic", "FWD", "Short fade, young face, electric sprint, white jersey."),
    (25, "Declan Rice-Validator", "Inglaterra", "epic", "MID", "Short dark hair, tall and strategic, white jersey."),
    (26, "Kyle Gas-Walker", "Inglaterra", "epic", "DEF", "Short fade, very fast and muscular, white jersey."),
    
    # BRASIL
    (41, "Vinicius Jpeg Jr", "Brasil", "legendary", "FWD", "Short fade haircut, joyful smile, explosive build, yellow jersey."),
    (42, "Neymar-NFT", "Brasil", "legendary", "FWD", "Dyed hair with headband, technical dribbling pose, yellow jersey."),
    (43, "Rodrygo-Yield", "Brasil", "epic", "FWD", "Short dark hair, slim and fast, yellow jersey."),
    (49, "Alisson Vault-son", "Brasil", "epic", "GK", "Full beard, tall and imposing, black kit."),
    
    # ESPAÑA
    (61, "Pedri-Alpha", "España", "epic", "MID", "Short dark hair, slender build, technical stance, red jersey."),
    (62, "Lamine Ya-Moon", "España", "epic", "FWD", "Young teen face, short dark afro-textured hair, red jersey."),
    (63, "Rodri Proof-of-Stake", "España", "legendary", "MID", "Short professional hair, clean-shaven, tall and commanding, red jersey."),
    (64, "Gavi-Gas", "España", "epic", "MID", "Short brown hair, intense aggressive stance, red jersey."),
    (65, "Nico Shard-Williams", "España", "epic", "FWD", "Short fade with patterns, red jersey."),

    # OTROS ICONOS
    (31, "Cristiano Siu-toshi", "Portugal", "mythic", "FWD", "Short slicked hair, muscular jump celebration, red/green kit."),
    (51, "Luka Mod-Oracle", "Croacia", "legendary", "MID", "Shoulder-length wavy blonde hair, black headband, checkered jersey."),
    (54, "Robert Lewan-DEX-ski", "Polonia", "legendary", "FWD", "Slicked-back brown hair, powerful stance, white/red kit."),
    (55, "Mo Satoshi-Salah", "Egipto", "legendary", "FWD", "Curly dark hair, full beard, agile build, red kit."),
    (56, "Son Heung-Web3", "Corea del Sur", "epic", "FWD", "Slicked dark hair, iconic finger-frame pose, red kit."),
    (58, "Erling Haal-Link", "Noruega", "mythic", "FWD", "Long blonde hair in bun, massive build, red kit."),
    (60, "Kevin De-Bridge", "Bélgica", "legendary", "MID", "Short blonde hair, focused passing pose, red kit."),
    (80, "Thibaut Wall-tois", "Bélgica", "legendary", "GK", "Extremely tall, intense gaze, yellow goalkeeper kit."),
    (81, "Victor Osi-Mask", "Nigeria", "epic", "FWD", "Protective face mask, powerful leap, green kit."),
    (85, "Gigi Block-rumma", "Italia", "legendary", "GK", "Tall, youthful but imposing, blue kit."), # Mantengo un 'Block' icónico
    (90, "Alphonso Shard-Davies", "Canadá", "epic", "DEF", "Extremely fast sprint, red kit."),
    (95, "Luis Byt-Suarez", "Uruguay", "legendary", "FWD", "Determined look, striker build, light blue kit."),
    (100, "Memo Vault-choa", "México", "rare", "GK", "Curly hair, headband, legendary goalkeeper, green kit.")
]

# Generar archivos
players_out = []
prompts_out = []

for s in stars:
    players_out.append({
        "id": s[0], "name": s[1], "country": s[2], "rarity": s[3], "position": s[4],
        "stats": {"atk": 88, "def": 70, "hype": 90}
    })
    prompt_text = f"Hyper-realistic 8k sports photography of a professional athlete with {s[5]}. Epic futuristic stadium background, 85mm lens, f/1.8, deep bokeh, zero caricature, no logos."
    prompts_out.append({"id": s[0], "name": s[1], "prompt": prompt_text})

with open('docs/assets/data/players.json', 'w') as f: json.dump(players_out, f, indent=4)
with open('assets/data/nft_master_prompts_100.json', 'w') as f: json.dump(prompts_out, f, indent=4)

print("¡Identidades diversificadas y creativas inyectadas!")
