import tweepy
import json

# Cargar secretos
with open('goalchain_web/scratch/x_secrets.json', 'r') as f:
    secrets = json.load(f)

# Auth
client = tweepy.Client(
    bearer_token=secrets['bearer_token'],
    consumer_key=secrets['api_key'],
    consumer_secret=secrets['api_secret'],
    access_token=secrets['access_token'],
    access_token_secret=secrets['access_secret']
)

# Auth v1.1 para subir media
auth = tweepy.OAuth1UserHandler(
    secrets['api_key'], 
    secrets['api_secret'],
    secrets['access_token'], 
    secrets['access_secret']
)
api = tweepy.API(auth)

def post_complex_thread():
    # 1. Subir la imagen de Lionel Satoshi
    image_path = "/Users/NicoPez/.gemini/antigravity/brain/fe8ffddd-a347-41d5-9726-189f72dcbad6/goalchain_player_1_prototype_v14_0_1778726606992.png"
    media = api.media_upload(image_path)
    
    # 2. Tweets del hilo
    tweets = [
        "The complexity bomb has been primed. 💣\n\nGoalChain is no longer just a project; it's a sovereign digital territory for the next generation of football. This is where data meets destiny.\n\n#GoalChain #Solana #TheNeuralWars #CryptoFootball",
        "Built on @Solana with a pure layered architecture. 🏗️\n\n1,248 unique players.\nLive match Oracles.\nMaster Frame V14.0.\n\nEvery pixel is engineered for the ultimate SportsFi experience.",
        "The Neural Wars are coming. 🧬🏟️\n\nBehind every player card lies a deep mythology. Every goal in the real world sends a shockwave through our ecosystem. You aren't just a collector; you are a commander.",
        "The bunker is open. The Genesis Squad is preparing for the first drop. 🛡️🚀\n\nJoin us before the invasion begins: https://discord.gg/goalchain"
    ]
    
    # Publicar hilo
    last_tweet_id = None
    for i, text in enumerate(tweets):
        if i == 0:
            # El primer tweet lleva la imagen
            response = client.create_tweet(text=text, media_ids=[media.media_id])
        else:
            response = client.create_tweet(text=text, in_reply_to_tweet_id=last_tweet_id)
        
        last_tweet_id = response.data['id']
        print(f"Tweet {i+1} publicado.")

if __name__ == "__main__":
    post_complex_thread()
