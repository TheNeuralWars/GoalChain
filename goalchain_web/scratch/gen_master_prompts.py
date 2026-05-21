import json
import os

# Asegurar directorios
os.makedirs('assets/data', exist_ok=True)

# Cargamos los jugadores reales (Ruta corregida)
with open('docs/assets/data/players.json', 'r') as f:
    players = json.load(f)

# ADN Visual
physical_traits = {
    "Lionel Bitcoin": "Short brown hair, neatly trimmed beard, focused celebration, Argentina light-blue stripes.",
    "Dibu Block": "Short athletic brown hair, intense eyes, diving with power, neon green goalkeeper kit.",
    "Kylian M-Bag-pé": "Buzz cut, very fast athletic build, determined sprint, navy blue kit.",
    "Cristiano Holdaldo": "Short slicked hair, muscular jump celebration, red and green kit.",
    "Luka Mod-Rich": "Shoulder-length wavy blonde hair, black headband, wise gaze, red/white checkered jersey.",
    "Lewan-DAO-ski": "Slicked-back brown hair, square jaw, powerful stance, white and red kit.",
    "Mo Solana": "Curly dark hair, full beard, agile build, red kit.",
    "Lamine Ya-Hype": "Young face, afro-textured short hair, numerical hand gesture, red jersey.",
    "Vinicius Burner Jr": "Short fade haircut, joyfull smile, explosive build, samba dance, yellow jersey.",
    "Rodri Protocol": "Short professional hair, clean-shaven, tall and commanding, red jersey.",
    "Phil Fod-Ether": "Platinum blonde buzz cut, juvenile face, fast sprint, white pearl jersey.",
    "Erling Haal-Chain": "Long blonde hair in bun, massive build, cold blue eyes, red/orange kit.",
    "Harry Chain": "Short blonde hair, neat beard, striker build, white jersey.",
    "Son Heung-Mint": "Slicked dark hair, iconic finger-frame pose, red kit.",
    "Van-Block": "Very tall, high bun, wide jaw, orange jersey.",
    "Pedri-Chain": "Short dark hair, slender build, wise midfielder look, red kit.",
    "Gavi-Token": "Short brown hair, intense aggressive stance, red kit.",
    "Belling-Chain": "Short fade, tall and elegant posture, white kit.",
    "Musiala-Swap": "Young face, very lean and fast, technical dribbling pose, white/red kit.",
    "Rice-Protocol": "Short dark hair, clean-shaven, tall and strategic, white kit."
}

prompts = []
for p in players:
    trait = physical_traits.get(p['name'], f"Professional world-class athlete from {p['country']}, {p['position']} position, intense focus, realistic texture.")
    prompt_text = f"Hyper-realistic 8k sports photography of a professional athlete with {trait}. Epic futuristic stadium background, 85mm lens, f/1.8, deep bokeh, professional lighting, zero caricature, no borders, no logos."
    
    prompts.append({
        "id": p['id'],
        "name": p['name'],
        "prompt": prompt_text
    })

with open('assets/data/nft_master_prompts_100.json', 'w') as f:
    json.dump(prompts, f, indent=4)

print("Prompts generados exitosamente.")
