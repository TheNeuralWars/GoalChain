import requests
from requests_oauthlib import OAuth1
import random
import sys

# Credenciales OAuth 1.0a
CONSUMER_KEY = "YLTNgANFNTzMkj4AqIUaH8IDI"
CONSUMER_SECRET = "HYDJ1Q4iU1HVgkerKVcjGxoGsZksrUMXg3iHOfmyJMGzHHfoML"
ACCESS_TOKEN = "2054634242458386432-QMqQ9pL54o0tZRbjeYnHXHLroOsSd5"
ACCESS_TOKEN_SECRET = "mW1euCPmhwDAH0DLOG4aGYLikTTp7F91cqOPtXE5Vkz3X"
auth = OAuth1(CONSUMER_KEY, CONSUMER_SECRET, ACCESS_TOKEN, ACCESS_TOKEN_SECRET)

# Bearer Token
BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAAF1o9gEAAAAAwCqZKPp7E9vKg6rRs1bgUuHC8Gc%3DsQvb0q8ku3L1MQoV5nkZtzxPLzcAj7SvDkqokV4721c1lH86De"
search_headers = {"Authorization": f"Bearer {BEARER_TOKEN}"}

# Comentarios dinámicos para evitar ser detectados como bot/spam
COMMENTS = [
    "Solana is the absolute gold standard for Web3 gaming! ⚽️⚡️ We are currently building GoalChain V3 with dynamic 3D Parallax video cards, custom stadium backgrounds, and a decentralized oracle seasonal tournament system. Exciting times ahead!",
    "Building on Solana is a cheat code. 💎⚽️ GoalChain V3 just rolled out premium glassmorphic UI cards, dynamic energy gauges, and a smart buyback/burn treasury supported by Jito Staking. High-fidelity cyber-sports are here!",
    "The Solana gaming ecosystem is thriving right now! We've just updated our dApp with premium 3D Parallax looping MP4 video cards. The road to the cyber-cup 2026 is fully on-chain! LFG! 🏆🏟️⛓️"
]

def search_organic_tweets():
    # Excluimos retuits, respuestas y nuestra propia cuenta @GoalChainDotFun
    query = "solana gaming -from:GoalChainDotFun -is:retweet -is:reply"
    url = f"https://api.twitter.com/2/tweets/search/recent?query={query}&max_results=10&tweet.fields=author_id"
    
    print(f"🔍 Buscando tuits orgánicos sobre 'Solana gaming' de otros usuarios...")
    req = requests.get(url, headers=search_headers)
    
    if req.status_code == 200:
        return req.json().get("data", [])
    else:
        print(f"❌ Error al buscar tuits orgánicos: {req.text}")
        return []

def post_reply(tweet_id, text):
    url = "https://api.twitter.com/2/tweets"
    payload = {
        "text": text,
        "reply": {"in_reply_to_tweet_id": tweet_id}
    }
    req = requests.post(url, auth=auth, json=payload)
    if req.status_code == 201:
        return req.json()["data"]["id"]
    else:
        print(f"❌ Error respondiendo al tuit {tweet_id}: {req.text}")
        return None

def main():
    tweets = search_organic_tweets()
    
    if not tweets:
        print("⚠️ No se encontraron tuits elegibles para interactuar hoy.")
        return
        
    print(f"✅ Se encontraron {len(tweets)} tuits. Seleccionando 3 al azar para interactuar de forma segura...")
    selected_tweets = random.sample(tweets, min(len(tweets), 3))
    
    for i, tweet in enumerate(selected_tweets):
        tweet_id = tweet["id"]
        tweet_text = tweet["text"].replace("\n", " ")[:70]
        author_id = tweet.get("author_id", "Desconocido")
        
        print(f"\n💬 [{i+1}/3] Interactuando con el tuit de Autor ID {author_id} (Tuit ID: {tweet_id}):")
        print(f"   👉 \"{tweet_text}...\"")
        
        # Seleccionar un comentario aleatorio
        comment = random.choice(COMMENTS)
        
        # Publicar respuesta
        reply_id = post_reply(tweet_id, comment)
        if reply_id:
            print(f"   🎉 ¡Respuesta enviada con éxito! (Reply ID: {reply_id})")
        else:
            print("   ⚠️ Falló la interacción con este tuit.")

if __name__ == "__main__":
    main()
