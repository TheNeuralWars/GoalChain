import requests
import json
import base64
import time
from requests_oauthlib import OAuth1

# Twitter API Credentials
CONSUMER_KEY = "YLTNgANFNTzMkj4AqIUaH8IDI"
CONSUMER_SECRET = "HYDJ1Q4iU1HVgkerKVcjGxoGsZksrUMXg3iHOfmyJMGzHHfoML"
ACCESS_TOKEN = "2054634242458386432-QMqQ9pL54o0tZRbjeYnHXHLroOsSd5"
ACCESS_TOKEN_SECRET = "mW1euCPmhwDAH0DLOG4aGYLikTTp7F91cqOPtXE5Vkz3X"

auth = OAuth1(CONSUMER_KEY, CONSUMER_SECRET, ACCESS_TOKEN, ACCESS_TOKEN_SECRET)

# ========== STEP 1: Re-upload the promo image ==========
IMAGE_PATH = "/Users/NicoPez/.gemini/antigravity/brain/36d5006a-4444-4877-a1da-466edb3db98c/goalchain_promo_ad_1779023923000.png"

print("Uploading image...")
with open(IMAGE_PATH, "rb") as f:
    image_data = f.read()

total_bytes = len(image_data)
init_url = "https://upload.twitter.com/1.1/media/upload.json"

# INIT
init_resp = requests.post(init_url, data={
    "command": "INIT",
    "total_bytes": total_bytes,
    "media_type": "image/png",
    "media_category": "tweet_image"
}, auth=auth)

media_id = init_resp.json()["media_id_string"]
print(f"  Media ID: {media_id}")

# APPEND
requests.post(init_url, data={
    "command": "APPEND",
    "media_id": media_id,
    "segment_index": 0,
    "media_data": base64.b64encode(image_data).decode("utf-8")
}, auth=auth)

# FINALIZE
requests.post(init_url, data={
    "command": "FINALIZE",
    "media_id": media_id
}, auth=auth)

print("  Image uploaded.")
time.sleep(3)

# ========== STEP 2: Post CLEAN tweet (no emojis) ==========
print("\nPublishing ad-safe tweet...")

tweet_text = """The World Cup 2026 is coming. Your crypto portfolio should be ready.

GoalChain lets you:
- Play penalty shootouts and earn tokens
- Collect 528 Genesis Squad NFT players
- Stake, bet, and earn real yield on Solana

Season 1 Quests are LIVE. Complete missions now to secure your airdrop allocation before the whistle blows.

Start earning today:
zealy.io/cw/goalchain

#Solana #WorldCup2026"""

tweet_url = "https://api.x.com/2/tweets"
payload = {
    "text": tweet_text,
    "media": {
        "media_ids": [media_id]
    }
}

resp = requests.post(tweet_url, json=payload, auth=auth, headers={"Content-Type": "application/json"})

if resp.status_code in [200, 201]:
    tweet_id = resp.json()["data"]["id"]
    print(f"TWEET PUBLISHED!")
    print(f"  ID: {tweet_id}")
    print(f"  URL: https://x.com/GoalChainDotFun/status/{tweet_id}")
    print(f"\n  Use THIS tweet for your X Ads campaign - zero emojis, ad-safe!")
else:
    print(f"Failed: {resp.status_code} - {resp.text}")
