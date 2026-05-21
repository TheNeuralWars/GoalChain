import requests
from requests_oauthlib import OAuth1

# Credenciales OAuth 1.0a
CONSUMER_KEY = "YLTNgANFNTzMkj4AqIUaH8IDI"
CONSUMER_SECRET = "HYDJ1Q4iU1HVgkerKVcjGxoGsZksrUMXg3iHOfmyJMGzHHfoML"
ACCESS_TOKEN = "2054634242458386432-QMqQ9pL54o0tZRbjeYnHXHLroOsSd5"
ACCESS_TOKEN_SECRET = "mW1euCPmhwDAH0DLOG4aGYLikTTp7F91cqOPtXE5Vkz3X"
auth = OAuth1(CONSUMER_KEY, CONSUMER_SECRET, ACCESS_TOKEN, ACCESS_TOKEN_SECRET)

def post_mentions():
    url = "https://api.twitter.com/2/tweets"
    text = "Calling all @Solana degens! ⚽️\n\nThe World Cup 2026 starts on GoalChain. Play-to-Airdrop Alpha is LIVE.\n\nJoin the Genesis Squad! 💎🚀 @Phantom @PlaySolana @SolanaConf\n\nCheck it out: https://theneuralwars.github.io/GoalChain/"
    
    payload = {"text": text}
    req = requests.post(url, auth=auth, json=payload)
    
    if req.status_code == 201:
        print(f"✅ Mención estratégica publicada con éxito: {req.json()['data']['id']}")
    else:
        print(f"❌ Error publicando mención: {req.text}")

print("Iniciando publicación de mención estratégica...")
post_mentions()
