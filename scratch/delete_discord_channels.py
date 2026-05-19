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
    
    # Target exactly the three categories we just created
    target_categories = ["📢┃INFORMATION", "🎮┃THE FIELD", "🗣️┃LOBBY"]
    
    print("\n🧹 Initiating rollback of newly created categories and channels...")
    for category in guild.categories:
        if category.name in target_categories:
            print(f"⚠️ Found category to delete: {category.name}")
            
            # Delete all channels inside this category first
            for channel in category.channels:
                print(f"   🗑️ Deleting channel: #{channel.name}")
                await channel.delete()
                
            # Delete the category itself
            print(f"   🗑️ Deleting category: {category.name}")
            await category.delete()
            
    print("\n✅ ROLLBACK OF NEW CHANNELS COMPLETED SUCCESSFULLY!")
    await client.close()

if __name__ == "__main__":
    client.run(DISCORD_TOKEN)
