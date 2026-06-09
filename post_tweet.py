#!/usr/bin/env python3
import json
import random
import tweepy
from datetime import datetime

# Load players
with open('/data/apps/GoalChain/docs/assets/data/players.json', 'r') as f:
    players = json.load(f)

# Filter legendary and mythic
legendary_mythic = [p for p in players if p['rarity'] in ('legendary', 'mythic')]

# Recently posted (from marketing_log.md)
recently_posted = {
    'Son Heung-Star',
    'Kylian M-Bypass-pé',
    'Virgil Van-Hash',
    'Percy Tau-Lion'
}

# Available players
available = [p for p in legendary_mythic if p['name'] not in recently_posted]

# Randomly select one
selected = random.choice(available)

# Build tweet
# Format: {Name} ({Real Name}) | {Rarity} {Position} | ATK {atk} DEF {def} HYPE {hype} | {height} {weight} | {match_salary} GCH/match
# Traits: {traits}
# GoalChain Presale CTA

name = selected['name']
real_name = selected['real_name']
rarity = selected['rarity'].upper()
position = selected['position']
atk = selected['stats']['atk']
def_ = selected['stats']['def']
hype = selected['stats']['hype']
height = selected['physical']['h']
weight = selected['physical']['w']
salary = selected['match_salary_gch']
traits = ', '.join(selected['traits'])

tweet = f"{name} ({real_name}) | {rarity} {position} | ATK {atk} DEF {def_} HYPE {hype} | {height} {weight} | {salary} GCH/match\nTraits: {traits}\n\n🚀 GoalChain Presale LIVE! Join the revolution: goalchain.io $GCH #GoalChain #Web3Football"

# Ensure under 280 chars
if len(tweet) > 280:
    tweet = tweet[:277] + "..."

print(f"Selected: {name} ({real_name})")
print(f"Rarity: {rarity}")
print(f"Tweet ({len(tweet)} chars):\n{tweet}")

# Load X credentials
with open('/data/apps/GoalChain/x_secrets.json', 'r') as f:
    secrets = json.load(f)

# Post to X using Tweepy v2
client = tweepy.Client(
    bearer_token=secrets['bearer_token'],
    consumer_key=secrets['api_key'],
    consumer_secret=secrets['api_secret'],
    access_token=secrets['access_token'],
    access_token_secret=secrets['access_secret']
)

response = client.create_tweet(text=tweet)
tweet_id = response.data['id']
tweet_url = f"https://x.com/goalchain/status/{tweet_id}"

print(f"Posted! Tweet ID: {tweet_id}")
print(f"URL: {tweet_url}")

# Log to marketing_log.md
log_entry = f"""## X (Twitter) Post - {datetime.utcnow().isoformat()}Z
- Type: player-spotlight
- Player: {name} ({real_name})
- Rarity: {rarity.lower()}
- Tweet ID: {tweet_id}
- URL: {tweet_url}
- Character count: {len(tweet)}
"""

with open('/data/apps/GoalChain/scratch/marketing_log.md', 'a') as f:
    f.write(log_entry + "\n")

print("Logged to marketing_log.md")