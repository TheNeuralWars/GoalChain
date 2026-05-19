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

print(f"🏟️ Preparando publicación en Discord...")

# Definición del Embed de Discord con diseño Cyberpunk/Web3
embed = {
    "title": "🔥 GOALCHAIN V3: ACTUALIZACIÓN MAESTRA DE INFRAESTRUCTURA 🔥",
    "description": (
        "¡Saludos, vestuario! ⚽⛓️\n\n"
        "Hemos completado la mayor actualización del motor técnico y visual de **GoalChain** hasta la fecha, alineando la jugabilidad en cadena con una experiencia estética triple A.\n\n"
        "Aquí tienes los detalles clave de la **Versión 3** que ya están en vivo:\n\n"
        "🤖 **1. GALERÍA 3D EN VIDEO HÍBRIDO (PNG + MP4)**\n"
        "¡Los cromos cobran vida! Hemos integrado soporte nativo para bucles de video `.mp4` en el fondo. Ahora las auroras boreales se mueven y los reflectores destellan en 3D bajo un efecto Parallax fluido detrás del jugador.\n\n"
        "💎 **2. INTERFAZ ULTRA-SLEEK GLASSMORPHIC**\n"
        "Rediseñamos la caja de datos un **55% más compacta**. Disfruta de un diseño translúcido premium con badges integrados para las estadísticas (ATK/DEF/HYP) y una barra de energía láser de STAMINA que reacciona dinámicamente.\n\n"
        "⚡ **3. RESURRECCIÓN ESTACIONAL POR ORÁCULO (Anchor Rust)**\n"
        "¡Tus activos son inmortales! Programamos la instrucción `oracle_reset_season` en Rust. El Oráculo de la liga ahora puede revivir a los jugadores eliminados del torneo mundialista, restaurando su estamina y recalibrando sus tasas de yield para las nuevas competiciones.\n\n"
        "💸 **4. ECONOMÍA DE EQUILIBRIO INFLACIONARIO**\n"
        "El balance perfecto de tokenomics:\n"
        "🔹 **50% de Mints** directo a Liquidez Bloqueada (Raydium LP Burn).\n"
        "🔹 **50% al Smart Treasury** en Jito Staking para recompras y quemas automáticas.\n\n"
        "📢 *La pre-producción de los estadios bajo el 'Protocolo a Ras de Suelo' en Grok ya está activa. ¡Prepárate para abrir tus sobres!*"
    ),
    "color": 10044671, # Púrpura Solana (#9945ff)
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
