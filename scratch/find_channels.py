import discord
import os
import asyncio

DISCORD_TOKEN = "MTUwNDIwNDc3ODEwMjcyMjc1MA.G4cT6l.a3G33fhdtYgXK3CputA8atB3qWYDCGHRCz67Qw"

intents = discord.Intents.default()
intents.guilds = True

client = discord.Client(intents=intents)

@client.event
async def on_ready():
    print(f"✅ Bot conectado como: {client.user}")
    print("\n--- GUILDS Y CANALES DISPONIBLES ---")
    for guild in client.guilds:
        print(f"\n🏰 Servidor: {guild.name} (ID: {guild.id})")
        # Conseguir canales de texto
        text_channels = [ch for ch in guild.channels if isinstance(ch, discord.TextChannel)]
        for ch in text_channels:
            # Obtener permisos del bot en el canal
            perms = ch.permissions_for(guild.me)
            can_send = perms.send_messages
            print(f"  - 💬 #{ch.name} (ID: {ch.id}) [Enviar Mensajes: {can_send}]")
    
    await client.close()

if __name__ == "__main__":
    client.run(DISCORD_TOKEN)
