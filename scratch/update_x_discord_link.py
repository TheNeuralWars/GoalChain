import requests
from requests_oauthlib import OAuth1

# Twitter API Credentials (using active credentials from project context)
CONSUMER_KEY = "YLTNgANFNTzMkj4AqIUaH8IDI"
CONSUMER_SECRET = "HYDJ1Q4iU1HVgkerKVcjGxoGsZksrUMXg3iHOfmyJMGzHHfoML"
ACCESS_TOKEN = "2054634242458386432-QMqQ9pL54o0tZRbjeYnHXHLroOsSd5"
ACCESS_TOKEN_SECRET = "mW1euCPmhwDAH0DLOG4aGYLikTTp7F91cqOPtXE5Vkz3X"

auth = OAuth1(CONSUMER_KEY, CONSUMER_SECRET, ACCESS_TOKEN, ACCESS_TOKEN_SECRET)

print("🔍 Modificando perfil de Twitter/X con el nuevo link de Discord...")

update_url = "https://api.twitter.com/1.1/account/update_profile.json"

new_profile = {
    "name": "GoalChain ⚽⚡",
    "url": "https://goalchain.fun",
    "description": "Official GoalChain (Solana). The ultimate SportsFi project for World Cup 2026. Pre-Launch IDO is LIVE! ⚡ Paired with Jito Vault buy-backs. Join: discord.gg/nzjHNBfSh",
    "location": "Solana Blockchain 🌐"
}

update_resp = requests.post(update_url, data=new_profile, auth=auth)

if update_resp.status_code == 200:
    updated = update_resp.json()
    print("✅ ¡PERFIL DE X ACTUALIZADO CON ÉXITO!")
    print(f"   Name: {updated.get('name')}")
    print(f"   Bio: {updated.get('description')}")
    print(f"   URL: {updated.get('url')}")
    print(f"   Location: {updated.get('location')}")
else:
    print(f"❌ Error al actualizar el perfil de X: {update_resp.status_code} - {update_resp.text}")
