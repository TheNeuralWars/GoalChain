import requests
from requests_oauthlib import OAuth1
import os

# Credenciales
CONSUMER_KEY = "YLTNgANFNTzMkj4AqIUaH8IDI"
CONSUMER_SECRET = "HYDJ1Q4iU1HVgkerKVcjGxoGsZksrUMXg3iHOfmyJMGzHHfoML"
ACCESS_TOKEN = "2054634242458386432-QMqQ9pL54o0tZRbjeYnHXHLroOsSd5"
ACCESS_TOKEN_SECRET = "mW1euCPmhwDAH0DLOG4aGYLikTTp7F91cqOPtXE5Vkz3X"
auth = OAuth1(CONSUMER_KEY, CONSUMER_SECRET, ACCESS_TOKEN, ACCESS_TOKEN_SECRET)

def upload_media(file_path):
    url = "https://upload.twitter.com/1.1/media/upload.json"
    files = {"media": open(file_path, "rb")}
    req = requests.post(url, auth=auth, files=files)
    if req.status_code == 200:
        return req.json()["media_id_string"]
    return None

# Imágenes seleccionadas
images = [
    "/Users/NicoPez/GoalChain/assets/img/promo/goalchain_soccer_hero_1778863555336.png",
    "/Users/NicoPez/GoalChain/assets/img/promo/bg_mythic_001_lunar_1778864743593.png",
    "/Users/NicoPez/GoalChain/assets/img/promo/bg_legendary_002_underwater_1778864817628.png",
    "/Users/NicoPez/GoalChain/assets/img/promo/bg_epic_001_fireworks_1778864695762.png"
]

print("Iniciando publicación del Álbum GoalChain...")
media_ids = []
for img in images:
    mid = upload_media(img)
    if mid:
        media_ids.append(mid)
        print(f"Imagen subida: {os.path.basename(img)}")

if len(media_ids) > 0:
    url = "https://api.twitter.com/2/tweets"
    payload = {
        "text": "Welcome to the future of football. 🏟️✨\n\nFrom the moon to the deep ocean, the GoalChain arenas are ready for the World Cup 2026. \n\nWhich one is your favorite? 🌕🐠🎆 #GoalChain #Solana #Web3Gaming",
        "media": {"media_ids": media_ids}
    }
    headers = {"Content-Type": "application/json"}
    req = requests.post(url, auth=auth, json=payload, headers=headers)
    
    if req.status_code == 201:
        print(f"✅ Álbum publicado con éxito: {req.json()['data']['id']}")
    else:
        print(f"❌ Error publicando álbum: {req.text}")
