import os
import requests
import json
import random
from dotenv import load_dotenv

# Cargar variables desde el archivo .env en la raíz del proyecto
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

XAI_API_KEY = os.getenv('XAI_API_KEY')
X_BEARER_TOKEN = os.getenv('X_BEARER_TOKEN')

def get_grok_response(prompt):
    url = "https://api.x.ai/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {XAI_API_KEY}"
    }
    data = {
        "model": os.environ.get("XAI_MODEL", "grok-4.6"),
        "messages": [
            {"role": "system", "content": "Eres el Community Manager de GoalChain. Tu estilo es vibrante, épico, lleno de emojis de fútbol y términos Web3 (Solana, NFTs, Bullish, Moon, etc)."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.8
    }
    response = requests.post(url, headers=headers, json=data)
    if response.status_code == 200:
        return response.json()['choices'][0]['message']['content']
    else:
        return f"Error: {response.text}"

def load_nations():
    nations = []
    path = os.path.join(os.path.dirname(__file__), '..', 'docs', 'SQUADS_11_MUNDIAL.md')
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        for line in lines:
            if line.startswith('###'):
                # Extraer nombre de nación (ej: ### 🇦🇷 ARGENTINA (The Champions))
                name = line.replace('###', '').strip()
                nations.append(name)
    return nations

def main():
    print("--- GoalChain Hype Generator (Powered by SuperGrok) ---")
    
    if not XAI_API_KEY:
        print("❌ Error: Falta XAI_API_KEY en el .env")
        return

    nations = load_nations()
    if not nations:
        print("❌ No se encontraron naciones en SQUADS_11_MUNDIAL.md")
        return

    selected_nation = random.choice(nations)
    print(f"Nación seleccionada al azar: {selected_nation}")

    prompt = f"Genera un tweet corto (máximo 280 caracteres) para anunciar el lanzamiento de los NFTs de la selección de {selected_nation} en GoalChain. Menciona a algunos de sus jugadores estrella (parodiados con nombres Web3 si es posible). Sé extremadamente bullish."
    
    print("Generando contenido con Grok...")
    tweet_content = get_grok_response(prompt)
    
    print("\n--- TWEET GENERADO ---")
    print(tweet_content)
    print("----------------------\n")
    
    print("Sugerencia: Puedes usar scripts/test_twitter.py para publicar este contenido manualmente o automatizarlo.")

if __name__ == "__main__":
    main()
