import requests
from requests_oauthlib import OAuth1

# Credentials from scratch/get_my_username.py
CONSUMER_KEY = "YLTNgANFNTzMkj4AqIUaH8IDI"
CONSUMER_SECRET = "HYDJ1Q4iU1HVgkerKVcjGxoGsZksrUMXg3iHOfmyJMGzHHfoML"
ACCESS_TOKEN = "2054634242458386432-QMqQ9pL54o0tZRbjeYnHXHLroOsSd5"
ACCESS_TOKEN_SECRET = "mW1euCPmhwDAH0DLOG4aGYLikTTp7F91cqOPtXE5Vkz3X"
auth = OAuth1(CONSUMER_KEY, CONSUMER_SECRET, ACCESS_TOKEN, ACCESS_TOKEN_SECRET)

BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAAF1o9gEAAAAAwCqZKPp7E9vKg6rRs1bgUuHC8Gc%3DsQvb0q8ku3L1MQoV5nkZtzxPLzcAj7SvDkqokV4721c1lH86De"
headers = {"Authorization": f"Bearer {BEARER_TOKEN}"}

# User ID of @GoalChainDotFun
USER_ID = "2054634242458386432"

def get_recent_tweets_and_replies():
    print(f"🔍 Fetching recent tweets and replies for user ID: {USER_ID} (@GoalChainDotFun)...")
    
    # We include replies and retweets to see what comments were made on other tweets
    url = f"https://api.twitter.com/2/users/{USER_ID}/tweets?max_results=20&tweet.fields=created_at,in_reply_to_user_id,referenced_tweets,text"
    
    req = requests.get(url, headers=headers)
    
    if req.status_code == 200:
        data = req.json()
        tweets = data.get("data", [])
        print(f"✅ Found {len(tweets)} tweets/replies:")
        for idx, tweet in enumerate(tweets):
            print(f"\n[{idx + 1}] Tweet ID: {tweet['id']} | Created at: {tweet['created_at']}")
            print(f"    Reply to: {tweet.get('in_reply_to_user_id', 'None')}")
            print(f"    Text: {tweet['text']}")
    else:
        print(f"❌ Error fetching tweets: {req.status_code} - {req.text}")

if __name__ == "__main__":
    get_recent_tweets_and_replies()
