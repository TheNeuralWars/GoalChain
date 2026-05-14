import tweepy
import json

# Cargar credenciales
with open('goalchain_web/scratch/x_secrets.json', 'r') as f:
    secrets = json.load(f)

# Autenticación OAuth 1.0a (Para postear tweets)
auth = tweepy.OAuth1UserHandler(
    secrets['api_key'], 
    secrets['api_secret'], 
    secrets['access_token'], 
    secrets['access_secret']
)

api = tweepy.API(auth)

# Autenticación OAuth 2.0 (Para la API v2 de Twitter)
client = tweepy.Client(
    bearer_token=secrets['bearer_token'],
    consumer_key=secrets['api_key'],
    consumer_secret=secrets['api_secret'],
    access_token=secrets['access_token'],
    access_token_secret=secrets['access_secret']
)

try:
    # Intentar postear un tweet de prueba
    response = client.create_tweet(text="The GoalChain Engine is officially online. ⚽🔥 \n\nGet ready for the most decentralized football experience of the 2026 World Cup. #GoalChain #Solana #NFT #WorldCup2026")
    print(f"Tweet enviado con éxito! ID: {response.data['id']}")
except Exception as e:
    print(f"Error al enviar tweet: {e}")
