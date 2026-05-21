import requests
from requests_oauthlib import OAuth1

# Credenciales
CONSUMER_KEY = "YLTNgANFNTzMkj4AqIUaH8IDI"
CONSUMER_SECRET = "HYDJ1Q4iU1HVgkerKVcjGxoGsZksrUMXg3iHOfmyJMGzHHfoML"
ACCESS_TOKEN = "2054634242458386432-QMqQ9pL54o0tZRbjeYnHXHLroOsSd5"
ACCESS_TOKEN_SECRET = "mW1euCPmhwDAH0DLOG4aGYLikTTp7F91cqOPtXE5Vkz3X"
auth = OAuth1(CONSUMER_KEY, CONSUMER_SECRET, ACCESS_TOKEN, ACCESS_TOKEN_SECRET)

article_text = """🚀 THE FUTURE OF FOOTBALL IS HERE: WELCOME TO GOALCHAIN 🚀

The world's biggest sport meets the world's fastest network: #Solana. 🏟️✨

What is GoalChain? 🧵 (Deep Dive)

1. DIGITAL STICKER REVOLUTION 🃏
Forget paper stickers that get lost. The Genesis Squad is a unique collection of 100 players (epic parodies) with stats that evolve based on real-world performance. 

2. PLAY-TO-AIRDROP ⚽💰
Don't just play—earn! Our penalty shootout game is directly linked to the GCH token. Every goal brings you closer to the next big airdrop on the network.

3. IMPACTFUL TOKENOMICS ($GCH) 📈
With a total supply of 1B and burn mechanisms in every Mystery Pack, the GCH token is built for scarcity. Less supply, more value!

4. THE ROAD TO 2026 🗺️
We're building the infrastructure so that by the 2026 World Cup, GoalChain will be the go-to app for fans on the blockchain.

Are you ready to join the squad? 🇦🇷🇧🇷🇫🇷

Read the full whitepaper here: [LINK_TO_DAPP]

#GoalChain #SolanaSummer #Web3 #NFTs #WorldCup2026 #GameFi"""

def post_long_tweet():
    url = "https://api.twitter.com/2/tweets"
    payload = {"text": article_text}
    headers = {"Content-Type": "application/json"}
    
    req = requests.post(url, auth=auth, json=payload, headers=headers)
    if req.status_code == 201:
        print(f"✅ Post largo publicado con éxito: {req.json()['data']['id']}")
    else:
        print(f"❌ Error: {req.text}")

if __name__ == "__main__":
    post_long_tweet()
