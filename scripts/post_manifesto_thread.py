import os
import requests
from requests_oauthlib import OAuth1
import json

def load_env():
    env_vars = {}
    env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                if '=' in line:
                    key, val = line.split('=', 1)
                    env_vars[key.strip()] = val.strip()
    return env_vars

def main():
    env = load_env()
    consumer_key = env.get("X_API_KEY")
    consumer_secret = env.get("X_API_SECRET")
    access_token = env.get("X_ACCESS_TOKEN")
    access_token_secret = env.get("X_ACCESS_SECRET")

    if not all([consumer_key, consumer_secret, access_token, access_token_secret]):
        print("❌ Error: Missing Twitter credentials in .env file.")
        return

    auth = OAuth1(consumer_key, consumer_secret, access_token, access_token_secret)

    tweets = [
        "GoalChain has evolved into The Living Protocol: a self-governing organism powered by collective intelligence on @Solana. \n\nWe are dismantling predatory sports betting to build a truly Player-First Economy. \n\nAbro hilo / Thread 🧵👇 #GoalChain #Solana #DeFi",
        
        "1/ The Problem: Predatory Betting 📉\nTraditional betting is designed to extract value—the house always wins. \n\nWe are inverting this predatory loop. Our goal is to build an ecosystem where the user captures the upside, aligning sports with human growth. #GoalChain",
        
        "2/ The 1% Founder Cap ⚖️\nWe believe in contribution, not exploitation. On-chain founder fees are hard-coded to a maximum of 1% (`MAX_FEE_BPS = 100`). \n\nNo massive founder extraction. The protocol belongs to the community. #Solana",
        
        "3/ The 10% Unified Builder Fund 🛠️\nWe have unified developer, API, infrastructure, and marketing costs. 10% of generated value flows directly to the Builder Fund. \n\nNo opaque marketing pockets. Active builders are dynamically rewarded by the AI CEO. #OpenSource",
        
        "4/ 99% Parimutuel Payouts 🎯\nWith founder fees capped at 1%, GoalChain returns 99% of all betting pools directly to the winning players. \n\nThe remaining 89% of protocol value flows straight to the Community Treasury, ensuring tokenomic equilibrium. #RealYield",
        
        "5/ Open Source Governance 🌐\nWe are moving from a closed project to a decentralized organism overseen by an autonomous AI CEO Agent. \n\nAll code is open, and all data feeds are verified via our GitHub-linked oracle on Solana. \n\nCheck us out at http://goalchain.fun! 🚀⚽"
    ]

    print("--- GoalChain Manifesto Thread Poster ---")
    url_v2 = "https://api.twitter.com/2/tweets"
    last_tweet_id = None

    for i, text in enumerate(tweets):
        payload = {"text": text}
        if last_tweet_id:
            payload["reply"] = {"in_reply_to_tweet_id": last_tweet_id}
        
        res = requests.post(url_v2, auth=auth, json=payload)
        if res.status_code == 201:
            last_tweet_id = res.json()["data"]["id"]
            print(f"✅ Tweet {i+1} published. ID: {last_tweet_id}")
        else:
            print(f"❌ Error in Tweet {i+1}: {res.status_code} - {res.text}")
            break

if __name__ == "__main__":
    main()
