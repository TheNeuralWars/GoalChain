import os
import re

def build_master_prompts():
    squad_file = r"C:\Users\lucas\.gemini\antigravity\scratch\GoalChain\docs\SQUADS_11_MUNDIAL.md"
    output_file = r"C:\Users\lucas\.gemini\antigravity\scratch\GoalChain\docs\GOALCHAIN_MASTER_PROMPTS_V1.md"
    
    if not os.path.exists(squad_file):
        print("Error: SQUADS_11_MUNDIAL.md not found.")
        return

    with open(squad_file, "r", encoding="utf-8") as f:
        content = f.read()

    # Regex to find nations and their players
    # Format: ### 🇦🇷 ARGENTINA\n1. **Lionel Satoshi**...
    nations = re.split(r'### ', content)
    
    master_content = [
        "# 🎨 GoalChain: Master NFT Prompt Dictionary (Génesis 528)\n",
        "Este documento es el **Diccionario Maestro** de prompts para la generación de imágenes de los 528 jugadores de GoalChain. Todos los prompts siguen la **Fórmula Maestra V7.1** para garantizar una estética premium, consistente y alineada con el ecosistema Solana.\n",
        "---\n",
        "## 📐 El Blueprint Maestro (Universal)\n",
        "> \"A premium digital trading card featuring [PLAYER_DESCRIPTION], known as '[PARODY_NAME]'. [LAYOUT]: Strictly 2:3 aspect ratio, 100% contained inside borders. [CARD_DESIGN]: 20px border of [RARITY_MATERIAL]. [SUBJECT]: 3D hyper-realistic stylized player in [COUNTRY] kit. Pose: [EPIC_POSE]. [ENVIRONMENT]: Deep dark background, Solana neon green (#14f195) and neon purple (#9945ff) lighting, futuristic stadium bokeh. [TECHNICAL]: 8k, Unreal Engine 5 aesthetic, octane render, --ar 2:3\"\n",
        "---\n"
    ]

    for nation_data in nations[1:]:
        lines = nation_data.strip().split('\n')
        nation_name = lines[0].strip()
        players = [l for l in lines[1:] if re.match(r'\d+\.', l)]
        
        master_content.append(f"## {nation_name}\n")
        
        for player in players:
            # Extract player name: 1. **Name**
            match = re.search(r'\d+\. \*\*(.*?)\*\*', player)
            if match:
                player_name = match.group(1)
                
                # Determine rarity/material based on some logic or fixed rules
                rarity = "Polished Titanium"
                if "Satoshi" in player_name or "M-Bypass-pé" in player_name or "Neymar" in player_name or "Cristiano" in player_name or "Salah" in player_name:
                    rarity = "Liquid Gold and Obsidian"
                elif "Dibu" in player_name or "Ya-Alpha" in player_name:
                    rarity = "Dark Ruby and Obsidian"
                
                prompt = (
                    f"{player.split('**')[0]}**{player_name}:** \"A premium digital trading card featuring a 3D hyper-realistic stylized {player_name}, "
                    f"epic soccer pose, known as '{player_name}'. [LAYOUT]: Strictly 2:3 aspect ratio, 100% contained inside borders. "
                    f"[CARD_DESIGN]: 20px border of {rarity}. [SUBJECT]: Wearing the official {nation_name.split()[-1]} kit. "
                    f"[TECHNICAL]: 8k, Unreal Engine 5 aesthetic, octane render, --ar 2:3\""
                )
                master_content.append(f"{prompt}\n")
        
        master_content.append("\n---\n")

    master_content.append("\n## 📦 FINALIZACIÓN DEL PROYECTO GÉNESIS\n")
    master_content.append("Este archivo contiene ahora el **Blueprint Técnico** para los 528 activos de GoalChain.")

    with open(output_file, "w", encoding="utf-8") as f:
        f.writelines(master_content)
    
    print(f"Successfully generated {output_file}")

if __name__ == "__main__":
    build_master_prompts()
