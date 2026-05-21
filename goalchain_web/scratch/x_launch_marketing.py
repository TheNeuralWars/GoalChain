import tweepy
import json
import time

# Cargar credenciales
with open('goalchain_web/scratch/x_secrets.json', 'r') as f:
    secrets = json.load(f)

# Cliente v2
client = tweepy.Client(
    consumer_key=secrets['api_key'],
    consumer_secret=secrets['api_secret'],
    access_token=secrets['access_token'],
    access_token_secret=secrets['access_secret']
)

# Cliente v1.1 (Para actualizar perfil)
auth = tweepy.OAuth1UserHandler(
    secrets['api_key'], 
    secrets['api_secret'], 
    secrets['access_token'], 
    secrets['access_secret']
)
api = tweepy.API(auth)

def setup_profile():
    print("Actualizando biografía...")
    bio = "⚽ The Future of Football on Solana. | 💎 Genesis Squad: 1,248 Elite NFTs. | 📈 Real-time Oracle performance. | Join the Decentralized World Cup 2026. #GoalChain"
    try:
        api.update_profile(
            description=bio,
            location="Solana Blockchain",
            url="https://goalchain.fun"
        )
        print("Perfil actualizado!")
    except Exception as e:
        print(f"Error perfil: {e}")

def post_thread():
    print("Publicando Hilo Fundacional...")
    thread = [
        "1/5 ⚽ Welcome to GoalChain: The most ambitious decentralized football ecosystem built for the 2026 World Cup. \n\nWe aren't just building NFTs; we're building a live performance layer where football passion meets blockchain transparency. 🧵 #GoalChain #Solana",
        
        "2/5 💎 The Genesis Squad is coming. \n\n1,248 unique digital collectibles representing the 48 nations. Each player is a parody tribute to the legends of the game, featuring high-fidelity layered artwork and dynamic metadata. #NFTs #Web3",
        
        "3/5 📈 Performance-driven NFTs. \n\nOur custom Oracle connects real-world pitch performance to your collectibles. When your players shine in the real World Cup, they evolve in the GoalChain universe. Mutability at its finest. ⚡",
        
        "4/5 🔥 The Infinity Burn Model. \n\nGoalChain is designed for sustainability. 30% of all ecosystem fees go into a perpetual buy-back & burn engine powered by staking yields. We play for the long term. $GCH",
        
        "5/5 🏆 Join the Stadium. \n\nThis is just the beginning. The Road to the Finals 2026 starts here. \n\nExplore: https://goalchain.fun\nJoin our Discord: https://discord.gg/7TUgSfqtd\n\nRT if you're ready for the kick-off! 🚀⚽"
    ]
    
    last_id = None
    for tweet in thread:
        try:
            if not last_id:
                response = client.create_tweet(text=tweet)
            else:
                response = client.create_tweet(text=tweet, in_reply_to_tweet_id=last_id)
            
            last_id = response.data['id']
            print(f"Tweet enviado: {last_id}")
            time.sleep(2) # Evitar spam
        except Exception as e:
            print(f"Error tweet: {e}")

setup_profile()
post_thread()
