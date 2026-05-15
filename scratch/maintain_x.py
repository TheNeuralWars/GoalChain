import requests
from requests_oauthlib import OAuth1
import json

# Credenciales
CONSUMER_KEY = "YLTNgANFNTzMkj4AqIUaH8IDI"
CONSUMER_SECRET = "HYDJ1Q4iU1HVgkerKVcjGxoGsZksrUMXg3iHOfmyJMGzHHfoML"
ACCESS_TOKEN = "2054634242458386432-QMqQ9pL54o0tZRbjeYnHXHLroOsSd5"
ACCESS_TOKEN_SECRET = "mW1euCPmhwDAH0DLOG4aGYLikTTp7F91cqOPtXE5Vkz3X"

auth = OAuth1(CONSUMER_KEY, CONSUMER_SECRET, ACCESS_TOKEN, ACCESS_TOKEN_SECRET)

def update_profile():
    url = "https://api.twitter.com/1.1/account/update_profile.json"
    params = {
        "description": "The ultimate Crypto-Panini on @Solana. ⚽️ 100 Genesis Legends. Play-to-Airdrop Alpha LIVE. 💎 Collect. Play. Win. #GoalChain #Solana",
        "location": "Solana Devnet",
        "url": "https://theneuralwars.github.io/GoalChain/"
    }
    req = requests.post(url, auth=auth, params=params)
    if req.status_code == 200:
        print("Perfil actualizado con éxito.")
    else:
        print(f"Error actualizando perfil: {req.text}")

def delete_old_tweets():
    # Obtener el ID del usuario primero
    user_url = "https://api.twitter.com/2/users/me"
    user_req = requests.get(user_url, auth=auth)
    if user_req.status_code != 200:
        print(f"Error obteniendo usuario: {user_req.text}")
        return
    
    user_id = user_req.json()["data"]["id"]
    
    # Obtener últimos tweets
    tweets_url = f"https://api.twitter.com/2/users/{user_id}/tweets"
    tweets_req = requests.get(tweets_url, auth=auth)
    
    if tweets_req.status_code == 200:
        tweets = tweets_req.json().get("data", [])
        # El primer tuit (el más nuevo) es el hilo que acabamos de poner, NO lo borramos.
        # Borramos los anteriores que sean obsoletos.
        for i, tweet in enumerate(tweets):
            if i > 5: # Mantenemos los últimos 5 (que son nuestro hilo nuevo)
                del_url = f"https://api.twitter.com/2/tweets/{tweet['id']}"
                del_req = requests.delete(del_url, auth=auth)
                if del_req.status_code == 200:
                    print(f"Tuit eliminado: {tweet['id']}")
    else:
        print(f"Error obteniendo tuits: {tweets_req.text}")

def comment_on_accounts():
    # Cuentas objetivo
    targets = ["Solana", "Phantom", "PlaySolana"]
    comment = "The World Cup 2026 is coming to @Solana. Check out our Genesis Squad! ⚽️💎🚀"
    
    for account in targets:
        # Buscar el último tuit de la cuenta
        search_url = f"https://api.twitter.com/2/tweets/search/recent?query=from:{account}&max_results=1"
        search_req = requests.get(search_url, auth=auth)
        
        if search_req.status_code == 200:
            data = search_req.json().get("data")
            if data:
                last_tweet_id = data[0]["id"]
                # Comentar
                post_url = "https://api.twitter.com/2/tweets"
                payload = {
                    "text": comment,
                    "reply": {"in_reply_to_tweet_id": last_tweet_id}
                }
                post_req = requests.post(post_url, auth=auth, json=payload)
                if post_req.status_code == 201:
                    print(f"Comentario enviado a @{account}")
        else:
            print(f"Error buscando tuit de @{account}: {search_req.text}")

print("Iniciando mantenimiento de X...")
update_profile()
delete_old_tweets()
comment_on_accounts()
print("Mantenimiento finalizado.")
