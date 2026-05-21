import discord
import asyncio

DISCORD_TOKEN = "MTUwNDIwNDc3ODEwMjcyMjc1MA.G4cT6l.a3G33fhdtYgXK3CputA8atB3qWYDCGHRCz67Qw"

intents = discord.Intents.default()
intents.guilds = True

client = discord.Client(intents=intents)

# Mapping of Channel ID to its new Premium Name
CHANNEL_MAP = {
    # 📢 INFORMATION
    1504207654757732606: "📌┃welcome-manifesto",
    1504191828696764636: "📜┃stadium-rules",
    1503668120521408513: "📢┃announcements",
    1504207661946900603: "🗺️┃roadmap",
    1504280963918725130: "🔗┃official-links",
    1504279046769348679: "🎟️┃open-ticket",
    
    # 🏟️ THE STADIUM
    1504251275175264352: "🍻┃degen-locker-room",
    1503668120521408514: "📸┃stadium-previews",
    1504207665910255666: "📈┃trading-floor",
    1504207666774282442: "🔮┃match-predictions",
    1504207668099678309: "🛠️┃stadium-support",
    
    # 💎 VIP LOUNGE
    1504207669773336639: "👑┃genesis-lounge",
    1504207671069376653: "⚡┃alpha-signals",
    
    # 🛠️ DESARROLLO
    1504234802734174310: "💻┃dev-room",
    
    # 🎙️ MEDIA CENTER (Voice Channels)
    1504249626742751324: "🎙️┃press-conference",
    1504249627921350786: "🏟️┃stadium-tunnel",
    
    # Orphans
    1504592597883031602: "🎫┃entradas"
}

@client.event
async def on_ready():
    print(f"🤖 Bot conectado como: {client.user}")
    
    if not client.guilds:
        print("❌ El bot no está en ningún servidor.")
        await client.close()
        return
        
    guild = client.guilds[0]
    print(f"🏰 Servidor detectado: {guild.name}")
    print("\n🚀 Iniciando renombrado premium de canales por ID...")
    
    for channel_id, new_name in CHANNEL_MAP.items():
        channel = guild.get_channel(channel_id)
        if channel:
            old_name = channel.name
            try:
                await channel.edit(name=new_name)
                print(f"   ✅ Renombrado: #{old_name} ➔ #{new_name}")
            except Exception as e:
                print(f"   ❌ Error al renombrar #{old_name}: {str(e)}")
        else:
            print(f"   ⚠️ Canal con ID {channel_id} no encontrado en el servidor.")
            
    # --- POSTING PREMIUM EMBEDS IN KEY CHANNELS ---
    
    # 1. Post welcome-manifesto message if we can find the channel
    welcome_channel = guild.get_channel(1504207654757732606)
    if welcome_channel:
        print("\n📝 Creando Embed de Bienvenida Premium en #welcome-manifesto...")
        
        # We can clean existing welcome channel messages first if needed, but sending a fresh embed is cleaner
        embed = discord.Embed(
            title="🤖 WELCOME TO GOALCHAIN LOCKER ROOM! ⚽⛓️",
            description=(
                "GoalChain is the premier SportsFi hub on Solana, bringing the passion of 5 billion football fans directly to the blockchain.\n\n"
                "We are redefining SportsFi for the **FIFA World Cup 2026** by linking real-world sports performance to dynamic high-yield smart contracts on Solana. Assets are alive, reacting to real-world performance!"
            ),
            color=0x14F195 # Solana Neon Green
        )
        
        embed.add_field(
            name="⚽ Play-to-Airdrop Arcade",
            value="Claim your daily testnet $GCH and showcase your shooting skills in our HTML5 Penalty Arcade game on the website.",
            inline=False
        )
        embed.add_field(
            name="🎴 Genesis NFT Squad",
            value="Collect 528 parody football legends. Watch their stats and salary yield evolve live via official real-world sports oracles.",
            inline=False
        )
        embed.add_field(
            name="⚡ Your Next Steps",
            value="1️⃣ Join our Zealy Questroom to boost your $GCH Airdrop allocation: 🔗 [Zealy.io](https://zealy.io/cw/goalchain)\n"
                  "2️⃣ Test your shoots and post your streaks in #screenshots-previews\n"
                  "3️⃣ Earn active manager roles inside this server!",
            inline=False
        )
        embed.set_footer(text="GoalChain Engine V3.0 | The Future of Football on Solana", icon_url="https://goalchain.fun/assets/img/logo_3d_clean.png")
        await welcome_channel.send(embed=embed)
        print("   ✅ Embed de bienvenida enviado.")

    # 2. Post official-links message
    links_channel = guild.get_channel(1504280963918725130)
    if links_channel:
        print("\n📝 Creando Embed de Links Oficiales en #official-links...")
        embed = discord.Embed(
            title="🔗 GOALCHAIN OFFICIAL DIRECTORY",
            description="Use only the official links verified below to secure your connection and protect your assets.",
            color=0x9945FF # Solana Purple
        )
        embed.add_field(
            name="🌐 Web & App Platform",
            value="👉 [goalchain.fun](https://goalchain.fun)",
            inline=True
        )
        embed.add_field(
            name="🏆 Zealy Airdrop Quests",
            value="👉 [zealy.io/cw/goalchain](https://zealy.io/cw/goalchain)",
            inline=True
        )
        embed.add_field(
            name="🗂️ Project Whitepaper & Docs",
            value="👉 [docs.goalchain.fun](https://goalchain.fun/mega-guide.html)",
            inline=True
        )
        embed.set_footer(text="GoalChain Security Directory", icon_url="https://goalchain.fun/assets/img/logo_3d_clean.png")
        await links_channel.send(embed=embed)
        print("   ✅ Embed de links oficiales enviado.")

    print("\n🎉 ¡PROCESO DE OPTIMIZACIÓN DISCORD COMPLETADO!")
    await client.close()

if __name__ == "__main__":
    client.run(DISCORD_TOKEN)
