import requests
from requests_oauthlib import OAuth1
import os

# Credenciales OAuth 1.0a (V1) para subir la imagen y postear en X
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

# Ruta de la imagen promocional (Rare Sunset Background)
image_path = "/Users/NicoPez/GoalChain/docs/assets/img/nfts/bg/bg_rare_sunset.png"

print("🚀 Publicando Hilo Oficial de la Mega Guía GoalChain en X (Twitter)...")

# 1. Subir imagen
media_id = upload_media(image_path)

if media_id:
    print(f"✅ Imagen subida con éxito (ID: {media_id})")
else:
    print("❌ Falló la subida de imagen, se publicará solo texto.")

# --- ESTRUCTURA DEL HILO ---

# Tuit 1: Presentación de la Mega Guía Oficial (Español e Inglés)
t1_text = (
    "🌐 GOALCHAIN: THE SUPREME SPORTSFI MANIFESTO IS LIVE! 🏆⚽\n\n"
    "Presentamos oficialmente al mundo la Mega Guía definitiva (bilingüe 🇪🇸🇺🇸) con la ingeniería económica y la tecnología de oráculos que impulsan a GoalChain.fun hacia el Mundial 2026.\n\n"
    "Abrimos hilo técnico / DeFi deep-dive 👇\n\n"
    "#Solana #Web3Gaming #DeFi #LST $GCH"
)

t1_id = post_tweet(t1_text, media_id=media_id)

if t1_id:
    print(f"🎉 Tuit 1 publicado con éxito (ID: {t1_id})")
    
    # Tuit 2: Bóveda de Staking Líquido JitoSOL
    t2_text = (
        "1/ 🏦 JITOSOL STAKING VAULT & DUAL-MOCK ⚡\n\n"
        "Durante la preventa de $GCH, el 100% de las contribuciones de SOL se colocan directamente en el Stake Pool de Jito (JitoSOL) on-chain.\n\n"
        "Para auditorías de seguridad impecables, programamos un bypass inteligente: en localnet de validación (SystemProgram), se desvía a reservas físicas, mientras que en producción se ejecutan CPI directas."
    )
    t2_id = post_tweet(t2_text, reply_to=t1_id)
    print(f"   Tuit 2 publicado: {t2_id}")
    
    # Tuit 3: starting XI dynamic rewards V3
    t3_text = (
        "2/ 📈 DYNAMIC Starting XI YIELD 📊\n\n"
        "El rendimiento diario de tu alineación está gobernado por una fórmula de emisión matemática estricta:\n"
        "Yield = Base (Rareza de Carta) × Manager Boost (Nivel de Mánager NFT) × Stadium Multiplier (Estadios VR representados como RWA digital real estate)."
    )
    t3_id = post_tweet(t3_text, reply_to=t2_id)
    print(f"   Tuit 3 publicado: {t3_id}")

    # Tuit 4: Oracle Live feeds & Slashing
    t4_text = (
        "3/ 🟥 LIVE SPORTS ORACLE & THE DEATH PLEDGE 💀\n\n"
        "Nuestros cNFTs (Bubblegum) vibran en caliente. Al detectar goles o tarjetas en la vida real, el Oráculo ejecuta escrituras atómicas en Solana.\n\n"
        "⚠️ ¡ALERTA! Si la selección de tu jugador queda eliminada del Mundial, se activa el 'Death Pledge': su rendimiento diario cae a 0% de por vida. ¡Puro trading especulativo!"
    )
    t4_id = post_tweet(t4_text, reply_to=t3_id)
    print(f"   Tuit 4 publicado: {t4_id}")
    
    # Tuit 5: The MEV circular economy flywheel
    t5_text = (
        "4/ 🔄 MEV SWAP-AND-BURN VALUE FLYWHEEL ♾️\n\n"
        "¿Miedo a la inflación? Toda fricción de packs y regalías se deposita en JitoSOL. Las ganancias e intereses acumulados por propinas MEV se reclaman en pools de Raydium/Orca para recomprar y quemar $GCH perpetuamente.\n\n"
        "¡A más juego, más yield, más compras automáticas del token! 📉❌"
    )
    t5_id = post_tweet(t5_text, reply_to=t4_id)
    if t5_id:
        print(f"   Tuit 5 publicado: {t5_id}")
    else:
        print("   ⚠️ Tuit 5 falló. Intentando continuar hilo...")
        t5_id = t4_id  # Fallback to keep the thread connected
    
    # Tuit 6: CTA Link
    t6_text = (
        "5/ 📖 READ THE MASTERPIECE NOW! 🗺️✨\n\n"
        "La guía cuenta con soporte de traducción al instante en un clic, animaciones interactivas de Solana y simulaciones financieras en tiempo real.\n\n"
        "👉 Lee la guía oficial completa aquí: https://goalchain.fun/mega-guide.html\n\n"
        "¡Alinea tu plantel y conquista el ledger! ⚽🏆"
    )
    t6_id = post_tweet(t6_text, reply_to=t5_id)
    print(f"   Tuit 6 publicado: {t6_id}")
    
    print("\n🏆 HILO DE PRESENTACIÓN DE LA MEGA GUÍA COMPLETADO CON ÉXITO EN X.")
else:
    print("❌ Falló la publicación del primer Tuit. Abortando hilo.")
