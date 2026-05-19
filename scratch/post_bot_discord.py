import discord
import os
import sys

DISCORD_TOKEN = "MTUwNDIwNDc3ODEwMjcyMjc1MA.G4cT6l.a3G33fhdtYgXK3CputA8atB3qWYDCGHRCz67Qw"
CHANNEL_ID = 1503668120521408513  # #announcements

intents = discord.Intents.default()
intents.guilds = True

client = discord.Client(intents=intents)

@client.event
async def on_ready():
    print(f"✅ Bot conectado como: {client.user}")
    channel = client.get_channel(CHANNEL_ID)
    
    if not channel:
        print(f"❌ No se encontró el canal con ID: {CHANNEL_ID}")
        await client.close()
        return

    # Ruta de la imagen del atardecer
    image_path = "/Users/NicoPez/GoalChain/docs/assets/img/nfts/bg/bg_rare_1.png"
    file_name = os.path.basename(image_path)
    
    # Crear el archivo adjunto
    file = discord.File(image_path, filename=file_name)
    
    # Crear el embed con colores y emojis
    embed = discord.Embed(
        title="🔥 GOALCHAIN V3: ACTUALIZACIÓN MAESTRA DE INFRAESTRUCTURA 🔥",
        description=(
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
        color=0x9945FF  # Morado Solana
    )
    
    # Asignar la imagen cargada al embed
    embed.set_image(url=f"attachment://{file_name}")
    embed.set_thumbnail(url="https://theneuralwars.github.io/GoalChain/assets/img/mock/logo.jpg")
    embed.set_footer(
        text="GoalChain Engine V3.0 | The Future of Football on Solana ⛓️⚽",
        icon_url="https://theneuralwars.github.io/GoalChain/assets/img/mock/logo.jpg"
    )
    
    print(f"🚀 Enviando anuncio a #{channel.name}...")
    try:
        await channel.send(embed=embed, file=file)
        print("✅ ¡Anuncio de Discord publicado con éxito!")
    except Exception as e:
        print(f"❌ Error al enviar el mensaje: {str(e)}")
        
    await client.close()

if __name__ == "__main__":
    client.run(DISCORD_TOKEN)
