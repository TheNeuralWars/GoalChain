import requests
from requests_oauthlib import OAuth1

CONSUMER_KEY = "YLTNgANFNTzMkj4AqIUaH8IDI"
CONSUMER_SECRET = "HYDJ1Q4iU1HVgkerKVcjGxoGsZksrUMXg3iHOfmyJMGzHHfoML"
ACCESS_TOKEN = "2054634242458386432-QMqQ9pL54o0tZRbjeYnHXHLroOsSd5"
ACCESS_TOKEN_SECRET = "mW1euCPmhwDAH0DLOG4aGYLikTTp7F91cqOPtXE5Vkz3X"
auth = OAuth1(CONSUMER_KEY, CONSUMER_SECRET, ACCESS_TOKEN, ACCESS_TOKEN_SECRET)

# 1. Get Me to resolve ID
me_url = "https://api.twitter.com/2/users/me"
me_req = requests.get(me_url, auth=auth)

if me_req.status_code == 200:
    me_data = me_req.json().get("data")
    my_id = me_data['id']
    my_username = me_data['username']
    print(f"✅ Resolved Account: @{my_username} (ID: {my_id})")
    
    # 2. Try fetching followers
    followers_url = f"https://api.twitter.com/2/users/{my_id}/followers"
    followers_req = requests.get(followers_url, auth=auth)
    
    if followers_req.status_code == 200:
        followers_data = followers_req.json().get("data", [])
        print(f"✅ Successfully fetched {len(followers_data)} followers:")
        for idx, follower in enumerate(followers_data[:20]):
            print(f"   [{idx+1}] @{follower['username']} (ID: {follower['id']})")
    else:
        print(f"❌ Failed to fetch followers: {followers_req.status_code} - {followers_req.text}")
else:
    print(f"❌ Failed to get self details: {me_req.status_code} - {me_req.text}")
