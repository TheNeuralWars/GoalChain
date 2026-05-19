import requests
import json
import sys

# Script para automatizar la creación de misiones en Zealy (Crew3)
# Documentación API Zealy V2: https://api-v2.zealy.io/

def make_tiptap_desc(text_content):
    return {
        "type": "doc",
        "content": [
            {
                "type": "paragraph",
                "content": [
                    {
                        "type": "text",
                        "text": text_content
                    }
                ]
            }
        ]
    }

def list_categories(subdomain, api_key):
    url = f"https://api-v2.zealy.io/public/communities/{subdomain}/modules"
    headers = {
        "x-api-key": api_key,
        "Content-Type": "application/json"
    }
    
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"❌ Error al obtener categorías: {response.text}")
        return None

def create_quest(subdomain, api_key, quest_data):
    url = f"https://api-v2.zealy.io/public/communities/{subdomain}/quests"
    headers = {
        "x-api-key": api_key,
        "Content-Type": "application/json"
    }
    
    response = requests.post(url, headers=headers, json=quest_data)
    if response.status_code in [200, 201]:
        print(f"✅ Misión creada exitosamente: '{quest_data['name']}'")
        return response.json()
    else:
        print(f"❌ Error al crear misión '{quest_data['name']}': {response.text}")
        return None

if __name__ == "__main__":
    print("🚀 GOALCHAIN ZEALY AUTOMATIC CONFIGURATOR 🚀")
    
    # Datos provistos por el usuario
    subdomain = "goalchain"
    api_key = "3cee00W2S2Nt1j7Xnl1FjlFS6j3"
    
    if not subdomain or not api_key:
        print("❌ Error: Subdominio y API Key son obligatorios.")
        sys.exit(1)
        
    print("\n🔍 Conectando con Zealy para buscar categorías...")
    categories = list_categories(subdomain, api_key)
    
    if not categories:
        print("❌ No se pudieron cargar las categorías. Asegúrate de que tu API Key sea correcta y que la comunidad esté creada.")
        sys.exit(1)
        
    print(f"✅ Conexión exitosa. Se encontraron {len(categories)} categorías.")
    for cat in categories:
        print(f"   - [{cat.get('id')}] {cat.get('name')}")
        
    # Usar la primera categoría por defecto o buscar una que se llame 'Onboarding' / 'Social'
    target_category_id = categories[0].get('id')
    for cat in categories:
        if 'onboarding' in cat.get('name', '').lower() or 'getting' in cat.get('name', '').lower() or 'social' in cat.get('name', '').lower():
            target_category_id = cat.get('id')
            break
            
    print(f"\n📂 Las misiones se añadirán a la categoría ID: {target_category_id}")
    
    # Definición de misiones de GoalChain con formato TipTap y settings correctos
    quests = [
        {
            "categoryId": target_category_id,
            "name": "🐦 Sigue a @GoalChainDotFun en X",
            "published": True,
            "recurrence": "once",
            "conditionOperator": "AND",
            "conditions": [],
            "rewards": [{"type": "xp", "value": 100}],
            "description": make_tiptap_desc("Sigue nuestra cuenta oficial en Twitter / X para no perderte ningún anuncio, oráculo deportivo ni los sorteos diarios del Genesis Squad."),
            "tasks": [
                {
                    "type": "visitLink",
                    "name": "Sigue a @GoalChainDotFun en Twitter",
                    "settings": {
                        "linkUrl": "https://twitter.com/GoalChainDotFun"
                    }
                }
            ]
        },
        {
            "categoryId": target_category_id,
            "name": "📢 Comparte el Lanzamiento Oficial de GoalChain",
            "published": True,
            "recurrence": "once",
            "conditionOperator": "AND",
            "conditions": [],
            "rewards": [{"type": "xp", "value": 150}],
            "description": make_tiptap_desc("Da Like y Repost a nuestro tweet oficial para correr la voz sobre la revolución parimutuel en Solana. ¡Demuestra que eres un Genesis Degen!"),
            "tasks": [
                {
                    "type": "visitLink",
                    "name": "Interactúa con nuestro Tweet fijado",
                    "settings": {
                        "linkUrl": "https://twitter.com/GoalChainDotFun/status/2055983823637082445"
                    }
                }
            ]
        },
        {
            "categoryId": target_category_id,
            "name": "👾 Únete al Discord de GoalChain",
            "published": True,
            "recurrence": "once",
            "conditionOperator": "AND",
            "conditions": [],
            "rewards": [{"type": "xp", "value": 100}],
            "description": make_tiptap_desc("Únete a la trinchera oficial de la comunidad de GoalChain. Conéctate con otros Managers, debate tácticas y participa en torneos exclusivos."),
            "tasks": [
                {
                    "type": "visitLink",
                    "name": "Únete a nuestro servidor",
                    "settings": {
                        "linkUrl": "https://discord.gg/nzjHNBfSh"
                    }
                }
            ]
        },
        {
            "categoryId": target_category_id,
            "name": "🥅 Prueba el Simulador de Penaltis",
            "published": True,
            "recurrence": "once",
            "conditionOperator": "AND",
            "conditions": [],
            "rewards": [{"type": "xp", "value": 200}],
            "description": make_tiptap_desc("Ve a goalchain.fun, juega una partida en el Simulador de Penaltis y sube una captura de pantalla donde se muestre tu puntuación y tu wallet conectada."),
            "tasks": [
                {
                    "type": "file",
                    "name": "Sube tu captura de pantalla de goalchain.fun",
                    "settings": {
                        "text": "Sube aquí la captura de tu partida en goalchain.fun",
                        "restrictFileType": False,
                        "maxFileCount": 1,
                        "maxFileSize": 10
                    }
                }
            ]
        },
        {
            "categoryId": target_category_id,
            "name": "🔥 Feedback & Sugerencias de Arquitectura",
            "published": True,
            "recurrence": "daily",
            "conditionOperator": "AND",
            "conditions": [],
            "rewards": [{"type": "xp", "value": 50}],
            "description": make_tiptap_desc("¿Qué mecánica, oráculo deportivo o juego parimutuel te gustaría ver en la próxima versión de GoalChain? Envíanos tu sugerencia en texto. ¡Misión disponible todos los días!"),
            "tasks": [
                {
                    "type": "text",
                    "name": "Propón un juego o deja tu feedback",
                    "settings": {
                        "text": "Escribe aquí tu propuesta de juego o feedback...",
                        "autoValidated": False
                    }
                }
            ]
        }
    ]
    
    print("\n🔨 Iniciando creación de misiones en Zealy...")
    for q in quests:
        create_quest(subdomain, api_key, q)
        
    print("\n🏁 Proceso de configuración automatizada finalizado.")
