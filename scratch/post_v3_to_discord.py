import requests
import json
import os
import sys

# Ruta del webhook de Discord. Si no está en variable de entorno, se pedirá por consola.
WEBHOOK_URL = os.getenv("DISCORD_WEBHOOK_URL")

if not WEBHOOK_URL:
    # Si se ejecuta de forma no interactiva, daremos instrucciones
    if len(sys.argv) > 1:
        WEBHOOK_URL = sys.argv[1]
    else:
        print("⚠️ DISCORD_WEBHOOK_URL no configurada.")
        print("Por favor, ejecuta el script pasando el Webhook de Discord como argumento:")
        print("python3 post_v3_to_discord.py <TU_WEBHOOK_URL>")
        # Creamos una entrada interactiva por si el usuario lo ejecuta en terminal directamente
        try:
            WEBHOOK_URL = input("\nIntroduce tu Discord Webhook URL para publicar de inmediato: ").strip()
        except:
            sys.exit(1)

if not WEBHOOK_URL or not WEBHOOK_URL.startswith("https://"):
    print("❌ URL de Webhook no válida. Abortando.")
    sys.exit(1)

# Imagen premium a adjuntar (Atardecer a ras de suelo)
image_path = "/Users/NicoPez/GoalChain/docs/assets/img/nfts/bg/bg_rare_1.png"
file_name = os.path.basename(image_path)

print(f"🏟️ Preparing Discord publication (LEGACY V3 script — for new publications see discord_retention_poster.py + schedulers. MAX LAW: 100% ENGLISH ONLY for all current X/Discord posts.)")

# Definition of Discord Embed with Cyberpunk/Web3 design (translated to ENGLISH per max law)
embed = {
    "title": "🔥 GOALCHAIN V3: MASTER INFRASTRUCTURE UPDATE 🔥",
    "description": (
        "Greetings, locker room! ⚽⛓️\n\n"
        "We have completed the largest technical and visual engine update for **GoalChain** to date, aligning on-chain gameplay with a triple-A aesthetic experience.\n\n"
        "Here are the key details of **Version 3** now live:\n\n"
        "🤖 **1. 3D HYBRID VIDEO GALLERY (PNG + MP4)**\n"
        "Cards come to life! We integrated native support for `.mp4` video loops in the background. Auroras now move and spotlights flash in 3D under smooth Parallax behind the player.\n\n"
        "💎 **2. ULTRA-SLEEK GLASSMORPHIC INTERFACE**\n"
        "We redesigned the data box **55% more compact**. Enjoy a premium translucent design with integrated badges for stats (ATK/DEF/HYPE) and a laser STAMINA energy bar that reacts dynamically.\n\n"
        "⚡ **3. SEASONAL ORACLE RESURRECTION (Anchor Rust)**\n"
        "Your assets are immortal! We programmed the `oracle_reset_season` instruction in Rust. The league Oracle can now revive players eliminated from the world tournament, restoring their stamina and recalibrating yield rates for new competitions.\n\n"
        "💸 **4. INFLATIONARY EQUILIBRIUM ECONOMY**\n"
        "The perfect tokenomics balance:\n"
        "🔹 **50% of Mints** direct to Locked Liquidity (Raydium LP Burn).\n"
        "🔹 **50% to Smart Treasury** in Jito Staking for automatic buybacks and burns.\n\n"
        "📢 *Pre-production of stadiums under the 'Ground-Up Protocol' in Grok is already active. Get ready to open your packs!*"
    ),
    "color": 10044671, # Solana Purple (#9945ff)
    "thumbnail": {
        "url": "https://theneuralwars.github.io/GoalChain/assets/img/mock/logo.jpg"
    },
    "image": {
        "url": f"attachment://{file_name}"
    },
    "footer": {
        "text": "GoalChain Engine V3.0 | The Future of Football on Solana ⛓️⚽",
        "icon_url": "https://theneuralwars.github.io/GoalChain/assets/img/mock/logo.jpg"
    }
}

payload = {
    "username": "GoalChain Oráculo",
    "avatar_url": "https://theneuralwars.github.io/GoalChain/assets/img/mock/logo.jpg",
    "embeds": [embed]
}

# Envío con archivo adjunto
try:
    with open(image_path, "rb") as f:
        files = {
            "file": (file_name, f, "image/png")
        }
        req = requests.post(
            WEBHOOK_URL,
            data={"payload_json": json.dumps(payload)},
            files=files
        )
    
    if req.status_code in [200, 204]:
        print("✅ ¡Anuncio publicado con éxito en tu servidor de Discord!")
    else:
        print(f"❌ Error publicando en Discord ({req.status_code}): {req.text}")
except Exception as e:
    print(f"❌ Error de conexión: {str(e)}")
