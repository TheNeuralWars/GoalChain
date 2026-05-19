import requests
import base64
from requests_oauthlib import OAuth1

# Twitter API Credentials
CONSUMER_KEY = "YLTNgANFNTzMkj4AqIUaH8IDI"
CONSUMER_SECRET = "HYDJ1Q4iU1HVgkerKVcjGxoGsZksrUMXg3iHOfmyJMGzHHfoML"
ACCESS_TOKEN = "2054634242458386432-QMqQ9pL54o0tZRbjeYnHXHLroOsSd5"
ACCESS_TOKEN_SECRET = "mW1euCPmhwDAH0DLOG4aGYLikTTp7F91cqOPtXE5Vkz3X"

auth = OAuth1(CONSUMER_KEY, CONSUMER_SECRET, ACCESS_TOKEN, ACCESS_TOKEN_SECRET)

# Logo Path
LOGO_PATH = "/Users/NicoPez/GoalChain/docs/assets/img/logo_3d_clean.png"

print("🔄 Reading 3D logo and base64 encoding...")
with open(LOGO_PATH, "rb") as image_file:
    # Read the image file and encode it to base64
    encoded_string = base64.b64encode(image_file.read()).decode("utf-8")

print("🚀 Uploading new profile picture to X...")
url = "https://api.twitter.com/1.1/account/update_profile_image.json"
payload = {
    "image": encoded_string
}

resp = requests.post(url, data=payload, auth=auth)

if resp.status_code == 200:
    print("✅ PROFILE PICTURE UPDATED SUCCESSFULLY!")
    data = resp.json()
    print(f"   New Avatar URL: {data.get('profile_image_url_https')}")
else:
    print(f"❌ Failed to update profile picture: {resp.status_code} - {resp.text}")
