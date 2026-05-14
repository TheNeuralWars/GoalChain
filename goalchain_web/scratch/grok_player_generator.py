import os
import requests
import json
from dotenv import load_dotenv

# Cargar credenciales
load_dotenv()
XAI_API_KEY = os.getenv("XAI_API_KEY")

def generate_player_art(rarity, position, description):
    print(f"🚀 Generando arte para: {rarity} {position}...")
    
    url = "https://api.x.ai/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {XAI_API_KEY}"
    }
    
    # Prompt maestro para los jugadores de GoalChain
    prompt = (
        f"A cinematic high-detail full body shot of a futuristic soccer player, {position}, "
        f"wearing advanced biomechanical {rarity} armor, glowing neon accents, "
        f"The Neural Wars aesthetic, dark futuristic stadium background, "
        f"no face visibility (full tech helmet), hyper-realistic textures, 8k, "
        f"aspect ratio 2:3. {description}"
    )

    data = {
        "model": "grok-2-1212", # Modelo de producción de Grok 2
        "messages": [
            {"role": "system", "content": "You are a master concept artist for a futuristic SportsFi project called GoalChain."},
            {"role": "user", "content": f"Generate an image based on this prompt: {prompt}"}
        ]
    }

    try:
        response = requests.post(url, headers=headers, json=data)
        result = response.json()
        
        # Nota: La API de X.ai devuelve la URL de la imagen si el modelo soporta generación directa
        # o una descripción detallada si es solo texto.
        print("✅ Respuesta de Grok recibida.")
        print(json.dumps(result, indent=2))
        
        return result
    except Exception as e:
        print(f"❌ Error al conectar con Super Grok: {e}")
        return None

if __name__ == "__main__":
    generate_player_art("Gold", "Forward", "Cyber-helmet with holographic HUD")
