import os
import requests
import json
import sys

def load_env_file(dotenv_path):
    if not os.path.exists(dotenv_path):
        return
    try:
        from dotenv import load_dotenv
        load_dotenv(dotenv_path)
    except ImportError:
        # Fallback simple parser if python-dotenv is not installed
        with open(dotenv_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" in line:
                    key, val = line.split("=", 1)
                    key = key.strip()
                    val = val.strip()
                    if val.startswith(('"', "'")) and val.endswith(val[0]):
                        val = val[1:-1]
                    os.environ[key] = val

# Load environment variables from .env in the workspace root
load_env_file(os.path.join(os.path.dirname(__file__), '..', '.env'))
# Also try to load from config.env in hermes home
hermes_config = os.path.expanduser("~/hermes/config.env")
if os.path.exists(hermes_config):
    load_env_file(hermes_config)

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

def run_configurator():
    print("🚀 GOALCHAIN ZEALY AUTOMATIC CONFIGURATOR 🚀")
    
    # Datos provistos por el usuario with environment fallback
    subdomain = os.getenv("ZEALY_SUBDOMAIN", "goalchain")
    api_key = os.getenv("ZEALY_API_KEY", "3cee00W2S2Nt1j7Xnl1FjlFS6j3")
    
    if not subdomain or not api_key:
        print("❌ Error: Subdominio y API Key son obligatorios.")
        sys.exit(1)
        
    print("\n🔍 Conectando con Zealy para buscar categorías...")
    categories = list_categories(subdomain, api_key)
    
    if not categories:
        print("❌ No se pudieron cargar las categorías. Asegúrate de que tu API Key sea correcta.")
        sys.exit(1)
        
    print(f"✅ Conexión exitosa. Se encontraron {len(categories)} categorías.")
    for cat in categories:
        print(f"   - [{cat.get('id')}] {cat.get('name')}")
        
    target_category_id = categories[0].get('id')
    for cat in categories:
        if 'onboarding' in cat.get('name', '').lower() or 'getting' in cat.get('name', '').lower() or 'social' in cat.get('name', '').lower():
            target_category_id = cat.get('id')
            break
            
    print(f"\n📂 Las misiones se añadirán a la categoría ID: {target_category_id}")
    
    quests = [
        {
            "categoryId": target_category_id,
            "name": "🐦 Follow @GoalChainSOL on X",
            "published": True,
            "recurrence": "once",
            "conditionOperator": "AND",
            "conditions": [],
            "rewards": [{"type": "xp", "value": 100}],
            "description": make_tiptap_desc("Follow our official Twitter / X account to stay updated with announcements, sports oracle data, and daily Genesis Squad giveaways."),
            "tasks": [
                {
                    "type": "visitLink",
                    "name": "Follow @GoalChainSOL on X",
                    "settings": {
                        "linkUrl": "https://x.com/GoalChainSOL"
                    }
                }
            ]
        },
        {
            "categoryId": target_category_id,
            "name": "📢 Share the Official GoalChain Launch",
            "published": True,
            "recurrence": "once",
            "conditionOperator": "AND",
            "conditions": [],
            "rewards": [{"type": "xp", "value": 150}],
            "description": make_tiptap_desc("Like and repost our official launch tweet to spread the word about the parimutuel SportsFi revolution on Solana. Show that you are a Genesis Degen!"),
            "tasks": [
                {
                    "type": "visitLink",
                    "name": "Interact with our pinned post",
                    "settings": {
                        "linkUrl": "https://x.com/GoalChainSOL/status/2061948281257697449"
                    }
                }
            ]
        },
        {
            "categoryId": target_category_id,
            "name": "👾 Join the GoalChain Discord",
            "published": True,
            "recurrence": "once",
            "conditionOperator": "AND",
            "conditions": [],
            "rewards": [{"type": "xp", "value": 100}],
            "description": make_tiptap_desc("Join the official GoalChain community. Connect with other Managers, discuss match tactics, and participate in exclusive tournaments."),
            "tasks": [
                {
                    "type": "visitLink",
                    "name": "Join our server",
                    "settings": {
                        "linkUrl": "https://discord.gg/YcsmySVDU"
                    }
                }
            ]
        },
        {
            "categoryId": target_category_id,
            "name": "🥅 Try the Penalty Shootout Simulator",
            "published": True,
            "recurrence": "once",
            "conditionOperator": "AND",
            "conditions": [],
            "rewards": [{"type": "xp", "value": 200}],
            "description": make_tiptap_desc("Visit goalchain.fun, play a match in the Penalty Shootout Simulator, and upload a screenshot showing your score and your connected wallet address."),
            "tasks": [
                {
                    "type": "file",
                    "name": "Upload your screenshot from goalchain.fun",
                    "settings": {
                        "text": "Upload the screenshot of your game on goalchain.fun",
                        "restrictFileType": False,
                        "maxFileCount": 1,
                        "maxFileSize": 10
                    }
                }
            ]
        },
        {
            "categoryId": target_category_id,
            "name": "🔥 Feedback & Architecture Suggestions",
            "published": True,
            "recurrence": "daily",
            "conditionOperator": "AND",
            "conditions": [],
            "rewards": [{"type": "xp", "value": 50}],
            "description": make_tiptap_desc("What mechanics, sports oracle features, or parimutuel games would you like to see in the next version of GoalChain? Submit your text suggestion. Available daily!"),
            "tasks": [
                {
                    "type": "text",
                    "name": "Propose a feature or leave feedback",
                    "settings": {
                        "text": "Write your proposal or feedback here...",
                        "autoValidated": False
                    }
                }
            ]
        }
    ]
    
    additional_campaign_quests = [
        {
            "categoryId": target_category_id,
            "name": "⚡ Degen Preseason: Stamina Boost Daily Check-in",
            "published": True,
            "recurrence": "daily",
            "conditionOperator": "AND",
            "conditions": [],
            "rewards": [{"type": "xp", "value": 75}],
            "description": make_tiptap_desc("Join the daily Stamina Boost ritual in the Discord channel #degen-preseason or #degen-locker-room. Comment or react to the post of the day. 2x multiplier active!"),
            "tasks": [
                {
                    "type": "visitLink",
                    "name": "Go to Stamina Boost on Discord",
                    "settings": {
                        "linkUrl": "https://discord.gg/YcsmySVDU",
                        "inviteUrl": "https://discord.gg/YcsmySVDU"
                    }
                }
            ]
        },
        {
            "categoryId": target_category_id,
            "name": "🎨 Degen Preseason: Meme the Genesis (Week 1)",
            "published": True,
            "recurrence": "once",
            "conditionOperator": "AND",
            "conditions": [],
            "rewards": [{"type": "xp", "value": 250}],
            "description": make_tiptap_desc("Create and upload a meme featuring the parody players of the Genesis Squad (use the player list). Post it on Discord in the designated meme channel. Community votes determine the bonus rewards!"),
            "tasks": [
                {
                    "type": "file",
                    "name": "Upload your GoalChain meme",
                    "settings": {
                        "text": "Meme with player parody (e.g., Lionel Satoshi, Ruben Dias-Base, etc.)",
                        "restrictFileType": False,
                        "maxFileCount": 1,
                        "maxFileSize": 10
                    }
                }
            ]
        },
        {
            "categoryId": target_category_id,
            "name": "🗣️ Degen Preseason: Join Voice Locker Room Night",
            "published": True,
            "recurrence": "weekly",
            "conditionOperator": "AND",
            "conditions": [],
            "rewards": [{"type": "xp", "value": 150}],
            "description": make_tiptap_desc("Attend at least one Voice Night (Tactics Talk or Scout Report). Participate in the voice chat or upload a screenshot of the event. Earn the Voice Legend role + XP."),
            "tasks": [
                {
                    "type": "visitLink",
                    "name": "Join Discord Voice channels",
                    "settings": {
                        "linkUrl": "https://discord.gg/YcsmySVDU",
                        "inviteUrl": "https://discord.gg/YcsmySVDU"
                    }
                }
            ]
        },
        {
            "categoryId": target_category_id,
            "name": "🤖 Degen Preseason: Ask X-Scout (First Question)",
            "published": True,
            "recurrence": "once",
            "conditionOperator": "AND",
            "conditions": [],
            "rewards": [{"type": "xp", "value": 100}],
            "description": make_tiptap_desc("Ask your first question to the X-Scout agent in the #ask-xscout Discord channel. The agent will reply using our 528 database of players. Connect with our AI!"),
            "tasks": [
                {
                    "type": "visitLink",
                    "name": "Go to #ask-xscout channel on Discord",
                    "settings": {
                        "linkUrl": "https://discord.gg/YcsmySVDU",
                        "inviteUrl": "https://discord.gg/YcsmySVDU"
                    }
                }
            ]
        },
        {
            "categoryId": target_category_id,
            "name": "👥 Degen Preseason: Form your Squad (Squad Wars)",
            "published": True,
            "recurrence": "once",
            "conditionOperator": "AND",
            "conditions": [],
            "rewards": [{"type": "xp", "value": 200}],
            "description": make_tiptap_desc("Form or join a Squad of 4-6 members on Discord (#squad-wars). Compete in the first weekly challenge (trivia, predictions, or quests). Group rewards + roles await!"),
            "tasks": [
                {
                    "type": "visitLink",
                    "name": "Join Discord to form your Squad",
                    "settings": {
                        "linkUrl": "https://discord.gg/YcsmySVDU",
                        "inviteUrl": "https://discord.gg/YcsmySVDU"
                    }
                }
            ]
        }
    ]
    
    quests.extend(additional_campaign_quests)
    
    print("\n🔨 Starting Zealy quest creation...")
    for q in quests:
        create_quest(subdomain, api_key, q)
        
    print("\n🏁 Proceso de configuración automatizada finalizado.")

if __name__ == "__main__":
    run_configurator()
