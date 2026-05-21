import tweepy
import json
import os

# Cargar secretos
with open('goalchain_web/scratch/x_secrets.json', 'r') as f:
    secrets = json.load(f)

# Auth OAuth 1.0a (Requerido para actualizar perfil)
auth = tweepy.OAuth1UserHandler(
    secrets['api_key'], 
    secrets['api_secret'],
    secrets['access_token'], 
    secrets['access_secret']
)
api = tweepy.API(auth)

def update_banner():
    banner_path = "/Users/NicoPez/.gemini/antigravity/brain/fe8ffddd-a347-41d5-9726-189f72dcbad6/goalchain_x_header_stadium_v1_0_1778727131885.png"
    
    if os.path.exists(banner_path):
        try:
            api.update_profile_banner(banner_path)
            print("✅ Portada de X actualizada con éxito.")
        except Exception as e:
            print(f"❌ Error al actualizar la portada: {e}")
    else:
        print(f"❌ Error: No se encontró la imagen en {banner_path}")

if __name__ == "__main__":
    update_banner()
