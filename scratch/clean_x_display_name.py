import requests
from requests_oauthlib import OAuth1

# Twitter API Credentials
CONSUMER_KEY = "YLTNgANFNTzMkj4AqIUaH8IDI"
CONSUMER_SECRET = "HYDJ1Q4iU1HVgkerKVcjGxoGsZksrUMXg3iHOfmyJMGzHHfoML"
ACCESS_TOKEN = "2054634242458386432-QMqQ9pL54o0tZRbjeYnHXHLroOsSd5"
ACCESS_TOKEN_SECRET = "mW1euCPmhwDAH0DLOG4aGYLikTTp7F91cqOPtXE5Vkz3X"

auth = OAuth1(CONSUMER_KEY, CONSUMER_SECRET, ACCESS_TOKEN, ACCESS_TOKEN_SECRET)

print("🚀 Cleaning display name (removing emojis for X Ads compliance)...")

update_url = "https://api.twitter.com/1.1/account/update_profile.json"

# Remove emojis from name for absolute compliance with X Ads validation
new_profile = {
    "name": "GoalChain", 
    "url": "https://goalchain.fun",
    "location": "Solana Blockchain 🌐"
}

update_resp = requests.post(update_url, data=new_profile, auth=auth)

if update_resp.status_code == 200:
    updated = update_resp.json()
    print("✅ DISPLAY NAME CLEANED SUCCESSFULLY!")
    print(f"   Name: {updated.get('name')}")
else:
    print(f"❌ Update failed: {update_resp.status_code} - {update_resp.text}")
