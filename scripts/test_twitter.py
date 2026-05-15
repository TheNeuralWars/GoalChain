import os
import tweepy
from dotenv import load_dotenv

# Cargar variables desde el archivo .env en la raíz del proyecto
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# Obtener credenciales
api_key = os.getenv('X_API_KEY')
api_secret = os.getenv('X_API_SECRET')
access_token = os.getenv('X_ACCESS_TOKEN')
access_secret = os.getenv('X_ACCESS_SECRET')
bearer_token = os.getenv('X_BEARER_TOKEN')

print("--- GoalChain X (Twitter) Test Script ---")

if not all([api_key, api_secret, access_token, access_secret, bearer_token]):
    print("❌ Error: Faltan credenciales en el archivo .env")
    exit(1)

# Configuración del Cliente v2
client = tweepy.Client(
    bearer_token=bearer_token,
    consumer_key=api_key,
    consumer_secret=api_secret,
    access_token=access_token,
    access_token_secret=access_secret
)

try:
    # Mensaje de prueba con estética GoalChain
    tweet_text = "⚽ El motor de GoalChain está oficialmente en línea.\n\nPrepárate para la experiencia de fútbol descentralizada más épica del Mundial 2026. 🏆🚀\n\n#GoalChain #Solana #NFT #WorldCup2026"
    
    print(f"Enviando tweet: \n\"{tweet_text}\"\n")
    
    response = client.create_tweet(text=tweet_text)
    
    print(f"✅ ¡Tweet enviado con éxito!")
    print(f"🔗 ID del Tweet: {response.data['id']}")
    print(f"🌐 Mira el perfil oficial: https://x.com/GoalChainDotFun")

except Exception as e:
    print(f"❌ Error al enviar el tweet: {e}")
    print("\nNota: Asegúrate de que las llaves tengan permisos de 'Read and Write' en el Developer Portal de X.")
