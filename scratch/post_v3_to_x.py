import requests
from requests_oauthlib import OAuth1
import os

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
    req = requests.post(url, auth=auth, json=payload, headers=headers)
    if req.status_code == 201:
        return req.json()["data"]["id"]
    else:
        print(f"Error posteando tuit: {req.text}")
        return None

# Ruta de la imagen RARE 1 (Atardecer profesional) que generamos hoy
image_path = "/Users/NicoPez/GoalChain/docs/assets/img/nfts/bg/bg_rare_1.png"

print("🚀 Publicando hilo de GoalChain V3 en X...")

# 1. Subir imagen
media_id = upload_media(image_path)

if media_id:
    print(f"✅ Imagen subida con éxito (ID: {media_id})")
else:
    print("❌ Falló la subida de imagen, se publicará solo texto.")

# --- HILO DE TUITS ---

# Tuit 1: Presentación
t1_text = "🔥 GOALCHAIN V3: THE NEXT GENERATION OF 3D CYBER-SPORTS ON SOLANA IS LIVE! 🔥\n\nHemos re-diseñado y forjado la infraestructura definitiva del Genesis Squad para llevar el Gaming Web3 al siguiente nivel.\n\nAbrí el hilo para conocer la revolución visual y técnica 👇\n\n#Solana #Web3Gaming #NFTs #DeFi $GCH"
t1_id = post_tweet(t1_text, media_id=media_id)

if t1_id:
    print(f"🎉 Tuit 1 publicado con éxito (ID: {t1_id})")
    
    # Tuit 2: Parallax 3D & Video
    t2_text = "1/ 🌌 HYBRID 3D VIDEO CARDS 🎬\n\nNuestra galería Parallax 3D ahora soporta nativamente fondos animados en bucles perfectos (.mp4).\n\nMira cómo flotan los jugadores sobre estadios interestelares con auroras boreales en movimiento eterno. ¡Espectáculo puro en tu Phantom Wallet!"
    t2_id = post_tweet(t2_text, reply_to=t1_id)
    print(f"   Tuit 2 publicado: {t2_id}")
    
    # Tuit 3: Sleek UI
    t3_text = "2/ 💎 ULTRA-SLEEK GLASSMORPHIC UI 📱\n\nRediseñamos la interfaz de las cartas un 55% más compacta.\n\nPaneles translúcidos premium, badges de estadísticas integrados (ATK/DEF/HYPE) y una barra de energía láser de STAMINA en tiempo real que reacciona a los partidos reales."
    t3_id = post_tweet(t3_text, reply_to=t2_id)
    print(f"   Tuit 3 publicado: {t3_id}")

    # Tuit 4: Oracle Revival
    t4_text = "3/ ⚡ ORACLE SEASONAL REVIVAL (Anchor Rust) 🔮\n\n¡Adiós a la muerte permanente de tus activos!\n\nProgramamos el protocolo 'oracle_reset_season' en Rust. Los jugadores eliminados pueden ser revividos por el Oráculo para competir en nuevos torneos, recalibrando sus tasas de yield."
    t4_id = post_tweet(t4_text, reply_to=t3_id)
    print(f"   Tuit 4 publicado: {t4_id}")
    
    # Tuit 5: Tokenomics
    t5_text = "4/ 💸 INFLATIONARY EQUILIBRIUM ECONOMICS 📈\n\nUn tokenomics sostenible:\n🔹 50% de Mints directo a Liquidez Bloqueada (Raydium LP burn).\n🔹 50% al Smart Treasury en Jito Staking para buybacks & burns automatizados.\n\nEl silbato está a punto de sonar. ¿Estás listo para dominar el ledger? 🏆⚽"
    t5_id = post_tweet(t5_text, reply_to=t4_id)
    print(f"   Tuit 5 publicado: {t5_id}")
    
    print("\n🏆 HILO DE ACTUALIZACIÓN DE GOALCHAIN V3 COMPLETADO CON ÉXITO EN X.")
else:
    print("❌ Falló la publicación del primer Tuit. Abortando hilo.")
