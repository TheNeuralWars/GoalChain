import requests
from requests_oauthlib import OAuth1
import json
import os

# Credenciales de GoalChain
consumer_key = "YLTNgANFNTzMkj4AqIUaH8IDI"
consumer_secret = "HYDJ1Q4iU1HVgkerKVcjGxoGsZksrUMXg3iHOfmyJMGzHHfoML"
access_token = "2054634242458386432-QMqQ9pL54o0tZRbjeYnHXHLroOsSd5"
access_token_secret = "mW1euCPmhwDAH0DLOG4aGYLikTTp7F91cqOPtXE5Vkz3X"

auth = OAuth1(consumer_key, consumer_secret, access_token, access_token_secret)

# Imagen generada
image_path = "/Users/NicoPez/.gemini/antigravity/brain/e717337d-737e-4170-b6e8-ffd6c1ebff19/goalchain_mega_pitch_poster_1778932890191.png"

# Hilo de Tweets
tweets = [
    "¿Te imaginas ser dueño del NFT de Messi y cobrar un porcentaje de su salario real cada semana? 🤯⚽\n\nBienvenido a GoalChain. No es solo un juego de penales. Es un ecosistema económico persistente en @Solana donde el fútbol real dicta el valor de tus activos. \n\nAbro hilo sobre la Economía V2. 🧵👇 #GoalChain #Solana #RWA",
    "1. El Motor de Yield: Salarios Reales 💎\nNuestros NFTs no son solo arte. Están conectados a los Salarios Reales de los cracks.\n\n- Si el jugador real gana más, tu NFT genera más tokens. 📈\n- Dividendos diarios basados en el rendimiento real.\n- Yield Dinámico: Valor real en tiempo real.",
    "2. Real Estate Digital: Estadios NFT 🏟️\nLa propiedad de estadios llega a GoalChain como activos RWA.\n\n- Genera rédito pasivo basado en la Asistencia Digital.\n- Comisiones por cada partido jugado en TU estadio. 🏦\n- Mejora tu infraestructura para ganar más.",
    "3. Propiedad de Equipos y Bolsa 🏢\n¿Quieres ir más allá? Compra el equipo entero. 🤝\n\n- Los Mega-NFTs de equipos están ligados a su Valor en Bolsa real.\n- Si el club cotiza al alza, tu NFT también.\n- Máxima expresión de Real World Assets en fútbol. 📊⚽",
    "4. El 'Flywheel' de Sinergia 🔄\nAquí es donde rompemos el mercado:\n\n- Si alguien compra un EQUIPO, los dueños de los NFTs de esos JUGADORES reciben un % automático del revenue. 💸\n- Sinergia total entre coleccionistas y Managers. Éxito compartido.",
    "5. Manager Levels y Patrocinios 👔\nTu progresión importa. Sube de nivel para desbloquear:\n\n- Acceso a torneos exclusivos de alto stake.\n- Patrocinios: Descubre promesas, patrocina su carrera y llévate una parte de sus ganancias.\n- Sé el dueño del juego.",
    "6. El Futuro es Ahora 🚀\n528 Jugadores. 48 Selecciones. Una economía circular anclada a la realidad del deporte más hermoso del mundo.\n\n¿Estás listo para ser el dueño de GoalChain? 🏆💎🦾\n\nPronto: Lanzamiento de la Genesis Squad.\n#GoalChain #Solana #GameFi #FIFA2026"
]

def post_thread():
    # 1. Subir imagen (v1.1)
    media_id = None
    if os.path.exists(image_path):
        media_url = "https://upload.twitter.com/1.1/media/upload.json"
        files = {"media": open(image_path, "rb")}
        res_media = requests.post(media_url, auth=auth, files=files)
        if res_media.status_code == 200:
            media_id = res_media.json()["media_id_string"]
            print(f"✅ Imagen subida con ID: {media_id}")
        else:
            print(f"❌ Error al subir imagen: {res_media.text}")

    # 2. Publicar Hilo (v2)
    url_v2 = "https://api.twitter.com/2/tweets"
    last_tweet_id = None

    for i, text in enumerate(tweets):
        payload = {"text": text}
        if i == 0 and media_id:
            payload["media"] = {"media_ids": [media_id]}
        if last_tweet_id:
            payload["reply"] = {"in_reply_to_tweet_id": last_tweet_id}
        
        res = requests.post(url_v2, auth=auth, json=payload)
        if res.status_code == 201:
            last_tweet_id = res.json()["data"]["id"]
            print(f"✅ Tweet {i+1} publicado. ID: {last_tweet_id}")
        else:
            print(f"❌ Error en Tweet {i+1}: {res.text}")
            break

if __name__ == "__main__":
    post_thread()
