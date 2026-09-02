import os
import requests
import json
from dotenv import load_dotenv

# Cargar variables desde el archivo .env en la raíz del proyecto
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

api_key = os.getenv('XAI_API_KEY')

print("--- GoalChain Grok (xAI) Test Script ---")

if not api_key:
    print("❌ Error: Falta XAI_API_KEY en el archivo .env")
    exit(1)

url = "https://api.x.ai/v1/chat/completions"

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}

data = {
    "model": os.environ.get("XAI_MODEL", "grok-4.6"),
    "messages": [
        {"role": "system", "content": "Eres el motor de inteligencia artificial de GoalChain. Hablas de forma épica, futbolera y con terminología Web3/Solana."},
        {"role": "user", "content": "Saluda a la comunidad de GoalChain y confirma que tu motor de IA está en línea."}
    ],
    "stream": False,
    "temperature": 0.7
}

try:
    print("Conectando con SuperGrok...")
    response = requests.post(url, headers=headers, data=json.dumps(data))
    
    if response.status_code == 200:
        result = response.json()
        content = result['choices'][0]['message']['content']
        print(f"\n🤖 Grok dice:\n{content}\n")
        print("✅ ¡Conexión exitosa!")
    else:
        print(f"❌ Error en la API ({response.status_code}): {response.text}")

except Exception as e:
    print(f"❌ Error inesperado: {e}")
