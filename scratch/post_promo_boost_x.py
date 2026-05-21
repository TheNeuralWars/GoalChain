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

# ========== STEP 1: Upload Image ==========
IMAGE_PATH = "/Users/NicoPez/.gemini/antigravity/brain/36d5006a-4444-4877-a1da-466edb3db98c/goalchain_promo_ad_1779023923000.png"

print("📸 Uploading promotional image to Twitter...")

# INIT
with open(IMAGE_PATH, "rb") as f:
    image_data = f.read()

total_bytes = len(image_data)
print(f"   Image size: {total_bytes} bytes")

init_url = "https://upload.twitter.com/1.1/media/upload.json"
init_params = {
    "command": "INIT",
    "total_bytes": total_bytes,
    "media_type": "image/png",
    "media_category": "tweet_image"
}
init_resp = requests.post(init_url, data=init_params, auth=auth)
if init_resp.status_code != 202:
    print(f"❌ INIT failed: {init_resp.status_code} - {init_resp.text}")
    exit(1)

media_id = init_resp.json()["media_id_string"]
print(f"   Media ID: {media_id}")

# APPEND (chunked)
CHUNK_SIZE = 1024 * 1024  # 1MB chunks
segment = 0
for i in range(0, total_bytes, CHUNK_SIZE):
    chunk = image_data[i:i + CHUNK_SIZE]
    append_params = {
        "command": "APPEND",
        "media_id": media_id,
        "segment_index": segment
    }
    files = {"media_data": base64.b64encode(chunk).decode("utf-8")}
    append_resp = requests.post(init_url, data={**append_params, **files}, auth=auth)
    if append_resp.status_code not in [200, 204]:
        print(f"❌ APPEND failed: {append_resp.status_code} - {append_resp.text}")
        exit(1)
    segment += 1
    print(f"   Chunk {segment} uploaded...")

# FINALIZE
finalize_params = {
    "command": "FINALIZE",
    "media_id": media_id
}
finalize_resp = requests.post(init_url, data=finalize_params, auth=auth)
if finalize_resp.status_code not in [200, 201]:
    print(f"❌ FINALIZE failed: {finalize_resp.status_code} - {finalize_resp.text}")
    exit(1)

print(f"✅ Image uploaded successfully! Media ID: {media_id}")

# Wait for processing
time.sleep(3)

# ========== STEP 2: Post Tweet ==========
print("\n🚀 Publishing promotional tweet...")

tweet_text = """🏆 The World Cup 2026 is coming. Your crypto portfolio should be ready.

GoalChain lets you:
⚽ Play penalty shootouts and earn $GCH tokens
🎴 Collect 528 Genesis Squad NFT players
📈 Stake, bet, and earn real yield on Solana

Season 1 Quests are LIVE — complete missions now to secure your airdrop allocation before the whistle blows.

👇 Start earning today
https://zealy.io/cw/goalchain

#Solana #WorldCup2026"""

tweet_url = "https://api.x.com/2/tweets"
payload = {
    "text": tweet_text,
    "media": {
        "media_ids": [media_id]
    }
}

headers = {"Content-Type": "application/json"}
tweet_resp = requests.post(tweet_url, json=payload, auth=auth, headers=headers)

if tweet_resp.status_code in [200, 201]:
    tweet_data = tweet_resp.json()
    tweet_id = tweet_data["data"]["id"]
    print(f"✅ TWEET PUBLISHED SUCCESSFULLY!")
    print(f"   Tweet ID: {tweet_id}")
    print(f"   URL: https://x.com/GoalChainDotFun/status/{tweet_id}")
    print(f"\n🎯 NEXT STEP: Go to https://ads.x.com and promote this tweet!")
else:
    print(f"❌ Tweet failed: {tweet_resp.status_code} - {tweet_resp.text}")
