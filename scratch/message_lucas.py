import discord
import asyncio

DISCORD_TOKEN = "MTUwNDIwNDc3ODEwMjcyMjc1MA.G4cT6l.a3G33fhdtYgXK3CputA8atB3qWYDCGHRCz67Qw"
DEV_ROOM_CHANNEL_ID = 1504234802734174310

intents = discord.Intents.default()
intents.guilds = True
intents.messages = True
intents.members = True

client = discord.Client(intents=intents)

@client.event
async def on_ready():
    print(f"🤖 Bot conectado como: {client.user}")
    
    # Obtener el canal dev-room
    channel = client.get_channel(DEV_ROOM_CHANNEL_ID)
    if not channel:
        print(f"❌ No se pudo encontrar el canal con ID {DEV_ROOM_CHANNEL_ID}")
        await client.close()
        return
        
    # Intentar buscar a Lucas en los miembros para poder mencionarlo de forma real
    lucas_mention = "@Lucas"
    for member in channel.guild.members:
        if "lucas" in member.name.lower() or (member.nick and "lucas" in member.nick.lower()):
            lucas_mention = member.mention
            print(f"🎯 Encontrado miembro Lucas: {member.name} ({member.id}) -> Usando mención real.")
            break
            
    message_content = (
        f"⚡ **¡Seguimiento del progreso para {lucas_mention}!**\n\n"
        "Nico me ha pedido que te comparta esta gran actualización sobre el pipeline de arte y parecido físico:\n\n"
        "💡 *“Hemos hecho un progreso enorme. Conseguí la técnica definitiva para que los jugadores generados vengan perfectamente emparejados (matcheados) con nuestra lista maestra, y además los hemos verificado por segunda vez en un repaso exhaustivo de su parecido con los jugadores reales de carne y hueso.*\n\n"
        "📈 *Hasta ahora hemos alcanzado un **50% de parecido promedio**. Así que seguiremos refinando y generando con los sucesivos Batches hasta comprobar que absolutamente todos los jugadores de todas las entregas estén completados y con el máximo nivel de parecido posible.”*\n\n"
        "¡Excelente avance coordinado! Seguimos adelante con los siguientes batches en la lista. ⚽🔥"
    )
    
    try:
        await channel.send(message_content)
        print("✅ Segundo mensaje enviado con éxito a Lucas en #dev-room!")
    except Exception as e:
        print(f"❌ Error al enviar el mensaje: {e}")
        
    await client.close()

if __name__ == "__main__":
    client.run(DISCORD_TOKEN)
