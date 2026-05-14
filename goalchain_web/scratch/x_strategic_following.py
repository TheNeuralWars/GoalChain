import tweepy
import json

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

# Lista de cuentas estratégicas para GoalChain
target_accounts = [
    "Solana", "Phantom", "MagicEden", "JupiterExchange", 
    "FIFAWorldCup", "FabrizioRomano", "433", "BleacherReport",
    "DegenerateApeAcademy", "Claynosaurz", "SolanaFloor"
]

def follow_targets():
    print("Iniciando seguimiento estratégico...")
    for username in target_accounts:
        try:
            # Obtener ID del usuario por nombre
            user = client.get_user(username=username)
            if user.data:
                client.follow_user(user.data.id)
                print(f"Siguiendo a @{username}")
        except Exception as e:
            print(f"Error siguiendo a @{username}: {e}")

follow_targets()
