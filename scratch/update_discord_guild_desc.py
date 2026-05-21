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
    print(f"🏰 Servidor: {guild.name} (ID: {guild.id})")
    
    # Discord server description has a strict 120 character limit.
    # This one is exactly 107 characters (extremely punchy and ad-safe).
    short_description = "The premier SportsFi hub on Solana. Play penalties, collect Genesis NFTs, and dominate the 2026 World Cup!"
    
    print(f"🔄 Updating server description to: '{short_description}'")
    try:
        # Edit the guild description using the bot
        await guild.edit(description=short_description)
        print("✅ SERVER DESCRIPTION UPDATED SUCCESSFULLY!")
    except discord.Forbidden:
        print("❌ Permission Denied: The bot needs the 'Manage Guild' (Gestionar Servidor) permission to update the description.")
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        
    await client.close()

if __name__ == "__main__":
    client.run(DISCORD_TOKEN)
