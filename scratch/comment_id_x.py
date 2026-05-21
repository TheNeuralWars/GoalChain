import requests
from requests_oauthlib import OAuth1

# Credenciales OAuth 1.0a
CONSUMER_KEY = "YLTNgANFNTzMkj4AqIUaH8IDI"
CONSUMER_SECRET = "HYDJ1Q4iU1HVgkerKVcjGxoGsZksrUMXg3iHOfmyJMGzHHfoML"
ACCESS_TOKEN = "2054634242458386432-QMqQ9pL54o0tZRbjeYnHXHLroOsSd5"
ACCESS_TOKEN_SECRET = "mW1euCPmhwDAH0DLOG4aGYLikTTp7F91cqOPtXE5Vkz3X"
auth = OAuth1(CONSUMER_KEY, CONSUMER_SECRET, ACCESS_TOKEN, ACCESS_TOKEN_SECRET)

def comment_by_userid():
    # IDs de Usuario conocidos
    # @Solana: 11025752, @Phantom: 1358823455, @PlaySolana: 1515234567... 
    # Vamos a obtener los IDs dinámicamente usando V2 Users lookup (que suele permitir OAuth 1.0a)
    usernames = ["Solana", "Phantom", "PlaySolana"]
    comment = "The World Cup 2026 is coming to @Solana. Check out our Genesis Squad! ⚽️💎🚀"
    
    for username in usernames:
        # 1. Obtener ID del usuario
        user_url = f"https://api.twitter.com/2/users/by/username/{username}"
        user_req = requests.get(user_url, auth=auth)
        
        if user_req.status_code == 200:
            user_id = user_req.json()["data"]["id"]
            
            # 2. Obtener último tuit del usuario
            tweets_url = f"https://api.twitter.com/2/users/{user_id}/tweets?max_results=5"
            tweets_req = requests.get(tweets_url, auth=auth)
            
            if tweets_req.status_code == 200:
                tweets = tweets_req.json().get("data")
                if tweets:
                    last_tweet_id = tweets[0]["id"]
                    # 3. Responder
                    post_url = "https://api.twitter.com/2/tweets"
                    payload = {
                        "text": comment,
                        "reply": {"in_reply_to_tweet_id": last_tweet_id}
                    }
                    post_req = requests.post(post_url, auth=auth, json=payload)
                    if post_req.status_code == 201:
                        print(f"✅ Comentario enviado a @{username}")
                    else:
                        print(f"❌ Error comentando en @{username}: {post_req.text}")
            else:
                print(f"Error obteniendo tuits de {username}: {tweets_req.text}")
        else:
            print(f"Error buscando ID de {username}: {user_req.text}")

print("Iniciando ataque de comentarios por ID...")
comment_by_userid()
