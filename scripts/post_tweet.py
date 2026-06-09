import tweepy
import json
from datetime import datetime

# Load API keys
with open('/data/apps/GoalChain/x_secrets.json', 'r') as f:
    secrets = json.load(f)

# Authenticate with Twitter API v2
client = tweepy.Client(
    bearer_token=secrets['bearer_token'],
    consumer_key=secrets['api_key'],
    consumer_secret=secrets['api_secret'],
    access_token=secrets['access_token'],
    access_token_secret=secrets['access_secret']
)

# Craft the tweet (max 280 chars)
tweet = """🏴‍☠️ LEGENDARY SPOTLIGHT: Trent Cross-Arnold (Trent Alexander-Arnold)

⚔️ DEF 91 | ATK 42 | HYPE 88
📏 1.80m | ⚖️ 75kg | 🎂 25 yrs
💎 Trait: The Rock
🏟️ Turin Zebra Grid

Own the future of football. GoalChain Presale LIVE 🔗

#GoalChain #Web3Football #GCH"""

print(f"Tweet length: {len(tweet)} chars")
print(f"Tweet:\n{tweet}")

# Post the tweet
response = client.create_tweet(text=tweet)
tweet_id = response.data['id']
tweet_url = f"https://x.com/goalchain/status/{tweet_id}"

print(f"\n✅ Tweet posted successfully!")
print(f"Tweet ID: {tweet_id}")
print(f"URL: {tweet_url}")

# Log the post
log_entry = f"""## X (Twitter) Post - {datetime.utcnow().isoformat()}Z
- Type: player-spotlight
- Player: Trent Cross-Arnold
- Rarity: legendary
- Tweet ID: {tweet_id}
- URL: {tweet_url}
- Character count: {len(tweet)}

"""

with open('/data/apps/GoalChain/scratch/marketing_log.md', 'a') as f:
    f.write(log_entry)

print("✅ Logged to marketing_log.md")
