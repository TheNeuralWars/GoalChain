import requests
from requests_oauthlib import OAuth1

# Credenciales OAuth 1.0a
CONSUMER_KEY = "YLTNgANFNTzMkj4AqIUaH8IDI"
CONSUMER_SECRET = "HYDJ1Q4iU1HVgkerKVcjGxoGsZksrUMXg3iHOfmyJMGzHHfoML"
ACCESS_TOKEN = "2054634242458386432-QMqQ9pL54o0tZRbjeYnHXHLroOsSd5"
ACCESS_TOKEN_SECRET = "mW1euCPmhwDAH0DLOG4aGYLikTTp7F91cqOPtXE5Vkz3X"
auth = OAuth1(CONSUMER_KEY, CONSUMER_SECRET, ACCESS_TOKEN, ACCESS_TOKEN_SECRET)

def post_poll():
    url = "https://api.twitter.com/2/tweets"
    payload = {
        "text": "The Genesis Squad is growing. Who should be the NEXT reveal? 🗳️⚽️\n\nVote now! The legend with most votes gets minted next. #Solana #GoalChain #Airdrop",
        "poll": {
            "options": [
                "Lionel Satoshi 🇦🇷",
                "Cristiano Ethereum 🇵🇹",
                "Erling Gasland 🇳🇴",
                "Luka Blockchaic 🇭🇷"
            ],
            "duration_minutes": 1440 # 24 horas
        }
    }
    
    headers = {"Content-Type": "application/json"}
    req = requests.post(url, auth=auth, json=payload, headers=headers)
    
    if req.status_code == 201:
        print(f"✅ Encuesta publicada con éxito: {req.json()['data']['id']}")
    else:
        print(f"❌ Error publicando encuesta: {req.text}")

print("Lanzando encuesta comunitaria...")
post_poll()
