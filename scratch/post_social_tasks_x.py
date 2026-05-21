import requests
from requests_oauthlib import OAuth1
import os

CONSUMER_KEY = "YLTNgANFNTzMkj4AqIUaH8IDI"
CONSUMER_SECRET = "HYDJ1Q4iU1HVgkerKVcjGxoGsZksrUMXg3iHOfmyJMGzHHfoML"
ACCESS_TOKEN = "2054634242458386432-QMqQ9pL54o0tZRbjeYnHXHLroOsSd5"
ACCESS_TOKEN_SECRET = "mW1euCPmhwDAH0DLOG4aGYLikTTp7F91cqOPtXE5Vkz3X"
auth = OAuth1(CONSUMER_KEY, CONSUMER_SECRET, ACCESS_TOKEN, ACCESS_TOKEN_SECRET)

def upload_media(image_path):
    url = "https://upload.twitter.com/1.1/media/upload.json"
    try:
        with open(image_path, "rb") as f:
            files = {"media": f}
            req = requests.post(url, auth=auth, files=files)
            if req.status_code in [200, 201]:
                return req.json()["media_id_string"]
            else:
                print(f"❌ Error uploading media: {req.text}")
                return None
    except Exception as e:
        print(f"❌ Error leyendo archivo: {e}")
        return None

def post_tweet(text, media_id=None):
    url = "https://api.twitter.com/2/tweets"
    payload = {"text": text}
    if media_id:
        payload["media"] = {"media_ids": [media_id]}
        
    req = requests.post(url, auth=auth, json=payload)
    if req.status_code == 201:
        print(f"✅ ¡Tweet publicado exitosamente! (ID: {req.json()['data']['id']})")
    else:
        print(f"❌ Error al publicar tweet: {req.text}")

if __name__ == "__main__":
    image_path = "/Users/NicoPez/GoalChain/docs/assets/img/nfts/bg/bg_legendary_hologram.png"
    text = (
        "🚀 THE $GCH AIRDROP CAMPAIGN IS LIVE! 🚀\n\n"
        "Join the ultimate Web3 cyber-sports revolution on @solana. ⚽️⛓️\n"
        "Earn GoalPoints by completing daily social quests, referring friends, and climbing the on-chain leaderboard.\n\n"
        "More points = Bigger GCH bag. The road to the 2026 World Cup starts now! 💰💎\n\n"
        "🔗 Connect your wallet & start earning: goalchain.fun\n\n"
        "#Solana #Web3Gaming #PlayToAirdrop #Airdrop"
    )
    
    print("Subiendo imagen...")
    media_id = upload_media(image_path)
    if media_id:
        print(f"Imagen subida (Media ID: {media_id}). Publicando tweet...")
        post_tweet(text, media_id)
