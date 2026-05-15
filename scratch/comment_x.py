import requests
from requests_oauthlib import OAuth1

# Credenciales OAuth 1.0a (Para postear)
CONSUMER_KEY = "YLTNgANFNTzMkj4AqIUaH8IDI"
CONSUMER_SECRET = "HYDJ1Q4iU1HVgkerKVcjGxoGsZksrUMXg3iHOfmyJMGzHHfoML"
ACCESS_TOKEN = "2054634242458386432-QMqQ9pL54o0tZRbjeYnHXHLroOsSd5"
ACCESS_TOKEN_SECRET = "mW1euCPmhwDAH0DLOG4aGYLikTTp7F91cqOPtXE5Vkz3X"
auth = OAuth1(CONSUMER_KEY, CONSUMER_SECRET, ACCESS_TOKEN, ACCESS_TOKEN_SECRET)

# Bearer Token (Para buscar)
BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAAF1o9gEAAAAAwCqZKPp7E9vKg6rRs1bgUu"
search_headers = {"Authorization": f"Bearer {BEARER_TOKEN}"}

def comment_on_accounts():
    targets = ["Solana", "Phantom", "PlaySolana"]
    comment = "The World Cup 2026 is coming to @Solana. Check out our Genesis Squad! ⚽️💎🚀"
    
    for account in targets:
        # 1. Buscar usando Bearer Token
        search_url = f"https://api.twitter.com/2/tweets/search/recent?query=from:{account}&max_results=1"
        search_req = requests.get(search_url, headers=search_headers)
        
        if search_req.status_code == 200:
            data = search_req.json().get("data")
            if data:
                last_tweet_id = data[0]["id"]
                # 2. Comentar usando OAuth 1.0a
                post_url = "https://api.twitter.com/2/tweets"
                payload = {
                    "text": comment,
                    "reply": {"in_reply_to_tweet_id": last_tweet_id}
                }
                post_req = requests.post(post_url, auth=auth, json=payload)
                if post_req.status_code == 201:
                    print(f"Comentario enviado a @{account}")
                else:
                    print(f"Error comentando en @{account}: {post_req.text}")
        else:
            print(f"Error buscando tuit de @{account}: {search_req.text}")

print("Iniciando ataque de comentarios estratégicos...")
comment_on_accounts()
