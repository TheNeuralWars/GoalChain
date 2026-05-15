import requests
from requests_oauthlib import OAuth1
import os
import json

# Credenciales OAuth 1.0a (V1) para subir la imagen y postear
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
    else:
        print(f"Error subiendo imagen: {req.text}")
        return None

def post_tweet(text, media_id=None, reply_to=None):
    url = "https://api.twitter.com/2/tweets"
    payload = {"text": text}
    if media_id:
        payload["media"] = {"media_ids": [media_id]}
    if reply_to:
        payload["reply"] = {"in_reply_to_tweet_id": reply_to}
    
    headers = {"Content-Type": "application/json"}
    # Usamos OAuth 1.0a para la API V2 también (es soportado)
    req = requests.post(url, auth=auth, json=payload, headers=headers)
    if req.status_code == 201:
        return req.json()["data"]["id"]
    else:
        print(f"Error posteando tuit: {req.text}")
        return None

# --- CONTENIDO DEL HILO ---
image_path = "/Users/NicoPez/.gemini/antigravity/brain/e717337d-737e-4170-b6e8-ffd6c1ebff19/goalchain_soccer_hero_1778863555336.png"

print("Iniciando publicación del hilo en GoalChain...")

# 1. Subir imagen
media_id = upload_media(image_path)

# 2. Tuit 1 (Con imagen)
t1_text = "⚽️ El fútbol cambió para siempre.\n\nPresentamos GoalChain: El primer ecosistema de 'Crypto-Panini' sobre @Solana.\n\n100 Leyendas. 100 NFTs únicos. 100% On-chain.\n\nAbrí el hilo para saber cómo calificar para el $GCH Airdrop. 👇\n\n#Solana #GoalChain #PlayToAirdrop"
t1_id = post_tweet(t1_text, media_id=media_id)

if t1_id:
    print(f"Tuit 1 publicado: {t1_id}")
    
    # 3. Tuit 2
    t2_text = "💎 Genesis Squad: No son simples cromos.\n\nCada NFT es tu llave para el ecosistema.\n✅ Generados con IA de alta fidelidad.\n✅ Stats dinámicos y rarezas únicas.\n✅ Solo 100 unidades en la colección fundadora.\n\n¿Estás listo para el álbum del Mundial 2026? 🏟️"
    t2_id = post_tweet(t2_text, reply_to=t1_id)
    
    # 4. Tuit 3
    t3_text = "⚽️ Play-to-Airdrop: No solo coleccionás, jugás.\n\nMete goles en nuestro mini-juego de penaltis y acumulá $GCH en Devnet.\n\n🏆 Tu racha te posiciona en el Leaderboard.\n📸 El Snapshot final determinará tu nivel de Airdrop en Mainnet.\n\n¡Cada gol cuenta! 🥅🔥"
    t3_id = post_tweet(t3_text, reply_to=t2_id)
    
    # 5. Tuit 4
    t4_text = "🚀 ALPHA LIVE: Estamos en vivo.\n\nConectá tu wallet de @Phantom, abrí tu primer sobre 3D y empezá a subir en el ranking.\n\nProbá la dApp aquí: https://theneuralwars.github.io/GoalChain/\n\n¡Nos vemos en la cancha! ⚽️💎⛓️"
    t4_id = post_tweet(t4_text, reply_to=t3_id)
    
    print("Hilo completado con éxito en X.")
else:
    print("Falló el primer tuit, abortando hilo.")
