import requests
from requests_oauthlib import OAuth1
import json
import os

# Working credentials from scripts/post_x_thread.py
consumer_key = "YLTNgANFNTzMkj4AqIUaH8IDI"
consumer_secret = "HYDJ1Q4iU1HVgkerKVcjGxoGsZksrUMXg3iHOfmyJMGzHHfoML"
access_token = "2054634242458386432-QMqQ9pL54o0tZRbjeYnHXHLroOsSd5"
access_token_secret = "mW1euCPmhwDAH0DLOG4aGYLikTTp7F91cqOPtXE5Vkz3X"

auth = OAuth1(consumer_key, consumer_secret, access_token, access_token_secret)

# Path to the perfected launch image
image_path = "/Users/NicoPez/.gemini/antigravity/brain/21bf6eea-14fb-4a1b-96d3-3d4cfded4583/goalchain_launch_perfect_1780439601123.png"

# Post copy
tweet_text = (
    "GoalChain Preseason is LIVE! 🚀\n\n"
    "Gear up for the ultimate SportsFi experience as we count down to the World Cup 2026.\n"
    "⚽ Play tactical football matchups.\n"
    "🏆 Assemble your dream squad.\n"
    "🤖 Scout with AI-powered oracle insights.\n\n"
    "Get ready: the official NFT collection, token mint, and playable MVP launch the moment the countdown hits zero.\n\n"
    "Join our Discord and start earning Preseason XP on Zealy now:\n"
    "🔗 https://discord.gg/YcsmySVDU\n\n"
    "#SportsFi #Solana #Web3Gaming"
)

def post_launch():
    # 1. Upload the image to Twitter v1.1 Media API
    media_id = None
    if os.path.exists(image_path):
        print(f"Uploading image: {image_path}")
        media_url = "https://upload.twitter.com/1.1/media/upload.json"
        with open(image_path, "rb") as f:
            files = {"media": f}
            res_media = requests.post(media_url, auth=auth, files=files)
            
        if res_media.status_code == 200:
            media_id = res_media.json()["media_id_string"]
            print(f"✅ Image uploaded successfully. Media ID: {media_id}")
        else:
            print(f"❌ Error uploading image: {res_media.text}")
    else:
        print(f"⚠️ Image not found at {image_path}. Posting tweet without image.")

    # 2. Create the tweet using Twitter v2 API
    url_v2 = "https://api.twitter.com/2/tweets"
    payload = {"text": tweet_text}
    if media_id:
        payload["media"] = {"media_ids": [media_id]}
        
    res = requests.post(url_v2, auth=auth, json=payload)
    if res.status_code == 201:
        tweet_data = res.json()
        tweet_id = tweet_data["data"]["id"]
        print(f"✅ Launch tweet posted successfully! Tweet ID: {tweet_id}")
        print(f"🔗 Tweet Link: https://x.com/GoalChainSOL/status/{tweet_id}")
        return tweet_id
    else:
        print(f"❌ Error posting tweet: {res.text}")
        return None

if __name__ == "__main__":
    post_launch()
