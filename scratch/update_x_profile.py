import requests
from requests_oauthlib import OAuth1

# Twitter API Credentials
CONSUMER_KEY = "YLTNgANFNTzMkj4AqIUaH8IDI"
CONSUMER_SECRET = "HYDJ1Q4iU1HVgkerKVcjGxoGsZksrUMXg3iHOfmyJMGzHHfoML"
ACCESS_TOKEN = "2054634242458386432-QMqQ9pL54o0tZRbjeYnHXHLroOsSd5"
ACCESS_TOKEN_SECRET = "mW1euCPmhwDAH0DLOG4aGYLikTTp7F91cqOPtXE5Vkz3X"

auth = OAuth1(CONSUMER_KEY, CONSUMER_SECRET, ACCESS_TOKEN, ACCESS_TOKEN_SECRET)

# ========== STEP 1: Get current profile ==========
print("🔍 Fetching current profile...")
me_url = "https://api.twitter.com/1.1/account/verify_credentials.json"
resp = requests.get(me_url, auth=auth)
if resp.status_code == 200:
    data = resp.json()
    print(f"   Name: {data.get('name')}")
    print(f"   Bio: {data.get('description')}")
    print(f"   URL: {data.get('url')}")
    print(f"   Location: {data.get('location')}")
else:
    print(f"❌ Error: {resp.status_code} - {resp.text}")

# ========== STEP 2: Update profile ==========
print("\n🚀 Updating profile for maximum impact...")

update_url = "https://api.twitter.com/1.1/account/update_profile.json"

new_profile = {
    "name": "GoalChain ⚽⛓️",
    "url": "https://goalchain.fun",
    "description": "The Future of Football on Solana ⚽🟣 Play-to-Airdrop | 528 NFT Genesis Squad | Live Oracle\n🏆 World Cup 2026 — Season 1 Quests LIVE\n👇 Earn $GCH now",
    "location": "Solana Blockchain 🌐"
}

update_resp = requests.post(update_url, data=new_profile, auth=auth)

if update_resp.status_code == 200:
    updated = update_resp.json()
    print("✅ PROFILE UPDATED SUCCESSFULLY!")
    print(f"   Name: {updated.get('name')}")
    print(f"   Bio: {updated.get('description')}")
    print(f"   URL: {updated.get('url')}")
    print(f"   Location: {updated.get('location')}")
else:
    print(f"❌ Update failed: {update_resp.status_code} - {update_resp.text}")
