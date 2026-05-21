import requests
from requests_oauthlib import OAuth1
import sys

# Credenciales OAuth 1.0a
CONSUMER_KEY = "YLTNgANFNTzMkj4AqIUaH8IDI"
CONSUMER_SECRET = "HYDJ1Q4iU1HVgkerKVcjGxoGsZksrUMXg3iHOfmyJMGzHHfoML"
ACCESS_TOKEN = "2054634242458386432-QMqQ9pL54o0tZRbjeYnHXHLroOsSd5"
ACCESS_TOKEN_SECRET = "mW1euCPmhwDAH0DLOG4aGYLikTTp7F91cqOPtXE5Vkz3X"
auth = OAuth1(CONSUMER_KEY, CONSUMER_SECRET, ACCESS_TOKEN, ACCESS_TOKEN_SECRET)

SHOUTOUTS = [
    (
        "Shouting out to the @solana and @phantom builders! ⚽️⚡️\n\n"
        "GoalChain V3 is pushing Web3 cyber-sports to the limit with dynamic 3D Parallax cards, looping MP4 stadium backdrops, and ultra-sleek glassmorphic wallet UI. The road to the cyber-cup 2026 is fully on-chain!\n\n"
        "Let's build! 🏆💎"
    ),
    (
        "Real yield meets cyber-sports on @solana! 📈⚡️\n\n"
        "Big shout-out to @Jito_Labs and @SuperteamDAO! GoalChain V3 just rolled out a Smart Treasury backed entirely by Jito Staking, allocating 50% of NFT sales directly to automated buybacks & burns ($GCH). Real tech, real builders!\n\n"
        "LFG! ⚽️🔥"
    )
]

def post_shoutout(text):
    url = "https://api.twitter.com/2/tweets"
    payload = {"text": text}
    
    headers = {"Content-Type": "application/json"}
    req = requests.post(url, auth=auth, json=payload, headers=headers)
    
    if req.status_code == 201:
        return req.json()["data"]["id"]
    else:
        print(f"❌ Error publicando mención: {req.text}")
        return None

def main():
    print("🚀 Iniciando campaña de Menciones Estratégicas (Shout-Outs) en X...")
    
    for i, text in enumerate(SHOUTOUTS):
        print(f"\n📢 [{i+1}/{len(SHOUTOUTS)}] Publicando mención:")
        print(f"   👉 \"{text[:100]}...\"")
        
        tweet_id = post_shoutout(text)
        if tweet_id:
            print(f"   🎉 ¡Mención publicada con éxito! (ID: {tweet_id})")
        else:
            print("   ⚠️ Falló la publicación de la mención.")

if __name__ == "__main__":
    main()
