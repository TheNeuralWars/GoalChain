import requests
from requests_oauthlib import OAuth1

# Credenciales OAuth 1.0a
CONSUMER_KEY = "YLTNgANFNTzMkj4AqIUaH8IDI"
CONSUMER_SECRET = "HYDJ1Q4iU1HVgkerKVcjGxoGsZksrUMXg3iHOfmyJMGzHHfoML"
ACCESS_TOKEN = "2054634242458386432-QMqQ9pL54o0tZRbjeYnHXHLroOsSd5"
ACCESS_TOKEN_SECRET = "mW1euCPmhwDAH0DLOG4aGYLikTTp7F91cqOPtXE5Vkz3X"
auth = OAuth1(CONSUMER_KEY, CONSUMER_SECRET, ACCESS_TOKEN, ACCESS_TOKEN_SECRET)

url = "https://api.twitter.com/2/users/me"
req = requests.get(url, auth=auth)

if req.status_code == 200:
    data = req.json().get("data")
    print(f"✅ Conectado como: @{data['username']} (ID: {data['id']})")
else:
    print(f"❌ Error al consultar perfil: {req.text}")
