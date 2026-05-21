import discord

DISCORD_TOKEN = "MTUwNDIwNDc3ODEwMjcyMjc1MA.G4cT6l.a3G33fhdtYgXK3CputA8atB3qWYDCGHRCz67Qw"

intents = discord.Intents.default()
intents.guilds = True

client = discord.Client(intents=intents)

@client.event
async def on_ready():
    print(f"🤖 Bot conectado como: {client.user}")
    
    if not client.guilds:
        print("❌ El bot no está en ningún servidor.")
        await client.close()
        return
        
    guild = client.guilds[0]
    print(f"🏰 Servidor: {guild.name}")
    print("\n📋 CURRENT DISCORD STRUCTURE:")
    
    # Sort channels by position
    sorted_channels = sorted(guild.channels, key=lambda c: (c.position if c.position is not None else 0))
    
    # Print categories and orphan channels first
    for channel in sorted_channels:
        if isinstance(channel, discord.CategoryChannel):
            print(f"\n📁 CATEGORY: {channel.name} (Position: {channel.position})")
            for sub_channel in sorted(channel.channels, key=lambda sc: sc.position):
                print(f"   ├── #{sub_channel.name} (ID: {sub_channel.id}, Type: {sub_channel.type})")
        elif channel.category is None:
            print(f"📄 ORPHAN: #{channel.name} (ID: {channel.id}, Type: {channel.type}, Position: {channel.position})")
            
    await client.close()

if __name__ == "__main__":
    client.run(DISCORD_TOKEN)
