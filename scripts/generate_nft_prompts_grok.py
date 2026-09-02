import os
import requests
import json
import re
from dotenv import load_dotenv

# Cargar variables desde el archivo .env en la raíz del proyecto
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

XAI_API_KEY = os.getenv('XAI_API_KEY')

SYSTEM_PROMPT = """Eres el Director de Arte de GoalChain. Tu tarea es generar prompts técnicos de ultra-alta fidelidad para la generación de imágenes de NFTs (Midjourney/Flux).

DEBES seguir este BLUEPRINT para cada jugador:
"A premium digital trading card featuring [PLAYER_DESCRIPTION], known as '[PARODY_NAME]'. 
[DIMENSIONS & LAYOUT]: Strictly 2:3 aspect ratio vertical card. Completely flat card surface, 100% contained inside the borders. NO elements breaking the frame. 
[CARD_DESIGN]: Uniform 20px rectangular border of [RARITY_MATERIAL]. 
[SUBJECT]: 3D hyper-realistic stylized player wearing the official [COUNTRY] national kit. Pose: [EPIC_POSE]. 
[ENVIRONMENT/COLOR PALETTE]: Deep dark background with strict Solana color palette lighting: vibrant neon green (#14f195) and neon purple (#9945ff) ambient lights. Futuristic blurred stadium crowd in background. Deep bokeh.
[TECHNICAL]: 8k, centered composition, edge-to-edge, professional sports memorabilia, Unreal Engine 5 aesthetic, octane render, --ar 2:3"

INSTRUCCIONES:
1. Recibirás: Nombre, Pose, Descripción Física, País y Rareza Sugerida.
2. Expande la descripción física para que sea cinematográfica y detallada.
3. Devuelve ÚNICAMENTE el prompt final, sin introducciones ni explicaciones."""

def get_grok_prompt(player_data):
    url = "https://api.x.ai/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {XAI_API_KEY}"
    }
    
    user_content = f"""
    País: {player_data['country']}
    Jugador (Parodia): {player_data['name']}
    Pose: {player_data['pose']}
    Descripción Física: {player_data['description']}
    Rareza: {player_data['rarity']}
    Material del Marco: {player_data['material']}
    """
    
    data = {
        "model": os.environ.get("XAI_MODEL", "grok-4.6"),
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_content}
        ],
        "temperature": 0.3
    }
    
    response = requests.post(url, headers=headers, json=data)
    if response.status_code == 200:
        return response.json()['choices'][0]['message']['content'].strip()
    else:
        return f"Error: {response.text}"

def parse_squads():
    path = os.path.join(os.path.dirname(__file__), '..', 'docs', 'SQUADS_11_MUNDIAL.md')
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Buscar bloque de Argentina
    arg_match = re.search(r'### 🇦🇷 ARGENTINA.*?\n(.*?)\n\n###', content, re.DOTALL)
    if not arg_match:
        return []
    
    table = arg_match.group(1)
    players = []
    lines = table.split('\n')
    for line in lines:
        if '|' in line and '**' in line:
            parts = [p.strip() for p in line.split('|')]
            if len(parts) >= 5:
                name = parts[1].replace('**', '')
                pose = parts[2]
                desc = parts[3]
                
                # Asignar rareza (Lionel Bitcoin/Satoshi es Mythic, el resto Epic/Rare por ahora)
                rarity = "Mythic" if "Lionel" in name else "Epic"
                material = "Black Diamond and Obsidian" if rarity == "Mythic" else "Matte Carbon Fiber"
                
                players.append({
                    'country': 'Argentina',
                    'name': name,
                    'pose': pose,
                    'description': desc,
                    'rarity': rarity,
                    'material': material
                })
    return players

def main():
    print("--- Generando Prompts Maestros con Grok (ARGENTINA) ---")
    if not XAI_API_KEY:
        print("❌ Error: Sin XAI_API_KEY")
        return

    players = parse_squads()
    output_prompts = []

    for p in players[:3]: # Probamos con los primeros 3 para validar
        print(f"Procesando a {p['name']}...")
        full_prompt = get_grok_prompt(p)
        output_prompts.append(f"### {p['name']}\n**Prompt:** `{full_prompt}`\n")

    # Guardar en un archivo de resultados
    output_path = os.path.join(os.path.dirname(__file__), '..', 'artifacts', 'ARGENTINA_MASTER_PROMPTS.md')
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("# 🇦🇷 Argentina: Master Prompts (Grok Generated)\n\n")
        f.write("\n".join(output_prompts))
    
    print(f"\n✅ ¡Prompts generados! Ver en: {output_path}")

if __name__ == "__main__":
    main()
