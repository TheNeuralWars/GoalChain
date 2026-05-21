import requests
from requests_oauthlib import OAuth1
import sys

# Credenciales OAuth 1.0a (Para postear)
CONSUMER_KEY = "YLTNgANFNTzMkj4AqIUaH8IDI"
CONSUMER_SECRET = "HYDJ1Q4iU1HVgkerKVcjGxoGsZksrUMXg3iHOfmyJMGzHHfoML"
ACCESS_TOKEN = "2054634242458386432-QMqQ9pL54o0tZRbjeYnHXHLroOsSd5"
ACCESS_TOKEN_SECRET = "mW1euCPmhwDAH0DLOG4aGYLikTTp7F91cqOPtXE5Vkz3X"
auth = OAuth1(CONSUMER_KEY, CONSUMER_SECRET, ACCESS_TOKEN, ACCESS_TOKEN_SECRET)

# Bearer Token (Para buscar tuits recientes)
BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAAF1o9gEAAAAAwCqZKPp7E9vKg6rRs1bgUuHC8Gc%3DsQvb0q8ku3L1MQoV5nkZtzxPLzcAj7SvDkqokV4721c1lH86De"
search_headers = {"Authorization": f"Bearer {BEARER_TOKEN}"}

# Mapeo de cuentas objetivo y sus comentarios premium contextualizados en inglés
INTERACTIONS = {
    "solana": (
        "Web3 gaming on @solana just leveled up! ⚽️⚡️ We just launched GoalChain V3 featuring dynamic 3D Parallax cards with looping MP4 stadium backdrops and a decentralized Oracle tournament revival. The future of digital football is on Solana!"
    ),
    "phantom": (
        "Hey @phantom team! Check out this absolute UI magic in our new GoalChain V3 cards. Sleek glassmorphic metadata panels, active energy lasers, and dynamic 3D Parallax looping MP4 video backgrounds rendering beautifully in the wallet! 💎⚽️🎬"
    ),
    "Jito_Labs": (
        "We just realigned GoalChain's tokenomics by dedicating 50% of NFT sales directly to a Smart Treasury, backed entirely by Jito Staking to execute automated buybacks & burns! Real yield meets digital football. LFG! 📈⚡️ $GCH"
    ),
    "SuperteamDAO": (
        "Building the future of Solana cyber-sports! GoalChain V3 is live with dynamic 3D cards, custom hybrid video backgrounds, and a decentralized oracle seasonal tournament revival system. Solana gaming goes hard! ⚽️🏆💎"
    )
}

def post_strategic_comments():
    print("🚀 Iniciando campaña de comentarios contextuales en X (inglés)...")
    
    for account, comment in INTERACTIONS.items():
        print(f"\n🔍 Buscando último tuit de @{account}...")
        # 1. Buscar último tuit original (excluyendo retuits y respuestas) usando Bearer Token
        search_url = f"https://api.twitter.com/2/tweets/search/recent?query=from:{account} -is:retweet -is:reply&max_results=10"
        try:
            search_req = requests.get(search_url, headers=search_headers)
            data = None
            
            if search_req.status_code == 200:
                data = search_req.json().get("data")
            
            # Fallback: Si la cuenta no tiene tuits originales recientes, buscamos tweets generales sobre "Solana gaming"
            if not data:
                print(f"⚠️ No se encontraron tuits originales recientes de @{account}. Usando búsqueda general sobre 'Solana gaming'...")
                general_search_url = "https://api.twitter.com/2/tweets/search/recent?query=solana gaming -is:retweet -is:reply&max_results=10"
                general_req = requests.get(general_search_url, headers=search_headers)
                if general_req.status_code == 200:
                    data = general_req.json().get("data")
            
            if data:
                last_tweet_id = data[0]["id"]
                last_tweet_text = data[0]["text"].replace("\n", " ")[:60]
                print(f"📌 Tuit encontrado para responder (ID: {last_tweet_id}): \"{last_tweet_text}...\"")
                
                # 2. Publicar respuesta en hilo usando OAuth 1.0a
                post_url = "https://api.twitter.com/2/tweets"
                payload = {
                    "text": comment,
                    "reply": {"in_reply_to_tweet_id": last_tweet_id}
                }
                
                post_req = requests.post(post_url, auth=auth, json=payload)
                
                if post_req.status_code == 201:
                    reply_id = post_req.json()["data"]["id"]
                    print(f"✅ ¡Comentario enviado exitosamente! (Reply ID: {reply_id})")
                else:
                    print(f"❌ Error comentando: {post_req.text}")
            else:
                print(f"⚠️ No se encontraron tuits elegibles para interactuar bajo la búsqueda de @{account}")
        except Exception as e:
            print(f"❌ Excepción ocurrida al interactuar con @{account}: {str(e)}")

if __name__ == "__main__":
    post_strategic_comments()
