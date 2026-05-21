import discord
import asyncio

DISCORD_TOKEN = "MTUwNDIwNDc3ODEwMjcyMjc1MA.G4cT6l.a3G33fhdtYgXK3CputA8atB3qWYDCGHRCz67Qw"

intents = discord.Intents.default()
intents.guilds = True
intents.guild_messages = True

client = discord.Client(intents=intents)

@client.event
async def on_ready():
    print(f"🤖 Bot conectado como: {client.user}")
    
    if not client.guilds:
        print("❌ El bot no está en ningún servidor de Discord. Asegúrate de invitarlo primero.")
        await client.close()
        return
        
    guild = client.guilds[0]
    print(f"🏰 Servidor detectado: {guild.name} (ID: {guild.id})")
    
    # 1. Limpieza opcional de canales genéricos que estorben (opcional pero seguro)
    print("🧹 Analizando canales para reestructurar...")
    
    # Estructura que vamos a construir
    structure = {
        "📢┃INFORMATION": [
            ("📌┃welcome-manifesto", """🤖 **WELCOME TO THE GOALCHAIN LOCKER ROOM!** ⚽⛓️

GoalChain is the premier SportsFi hub on Solana, bringing the passion of 5 billion football fans directly to the blockchain. Whether you are a tactical mastermind, a high-speed degen, or an active builder, this is where you claim your manager card and start dominating.

We are redefining SportsFi for the **FIFA World Cup 2026** by linking real-world sports performance to dynamic high-yield smart contracts. 

---

🔥 **WHAT CAN YOU DO IN GOALCHAIN?**

⚽ **Play-to-Airdrop:** Open the dApp, claim your daily testnet $GCH, and test your skills in our retro-cyberpunk Penalty Shootout arcade game directly from your browser.
🎴 **Collect the Genesis Squad:** Recruit 528 parody football legends with dynamic stats linked to real-life biometrics. Your assets are alive.
🔮 **Live Oracle Betting:** Predict match outcomes, penalties, and corners in real-time during live games with instant trustless settlement.
🏦 **Real Yield Protocol:** Supported by Jito & Marinade liquid staking. The Vault buys back and burns $GCH to keep the economy circular and deflationary.

---

⚡ **YOUR STARTING ORDERS:**

1️⃣ **Go to Zealy:** Complete daily and social quests to rack up XP and multiply your upcoming $GCH Airdrop allocation: 🔗 https://zealy.io/cw/goalchain
2️⃣ **Play the Game:** Show off your highest shootout streaks and share them in 🏟️┃penalty-field.
3️⃣ **Claim Your Role:** Stay active, help the community grow, and earn the exclusive **"Genesis Manager"** role.

The whistle has blown. Build your ultimate squad. Win on Solana. 🚀"""),
            ("📢┃announcements", None),
            ("⚡┃zealy-quests", """⚡ **GOALCHAIN SEASON 1 QUESTS ARE LIVE!** ⚡

Complete social and community missions to claim your spot in the official $GCH Play-to-Airdrop whitelist. 

👉 **JOIN THE QUESTROOM NOW:** https://zealy.io/cw/goalchain

🏆 **Active Quests:**
• Follow & Retweet our launch campaigns on 𝕏
• Achieve a 5-streak in the Penalty Shootout and post your proof in 🏟️┃penalty-field
• Get active in the locker room to unlock tier-based manager roles

_More quests are added daily. Squeeze every point of XP!_""")
        ],
        "🎮┃THE FIELD": [
            ("🏟️┃penalty-field", None),
            ("🔮┃oracle-bets", None)
        ],
        "🗣️┃LOBBY": [
            ("🍻┃degen-locker-room", None),
            ("🇪🇸┃cancha-espanol", None),
            ("📈┃tokenomics-vault", None)
        ]
    }
    
    # Para evitar borrar canales existentes si ya tienen historial
    existing_channels = {c.name.lower(): c for c in guild.channels}
    
    for category_name, channels in structure.items():
        # Crear o buscar la categoría
        category = discord.utils.get(guild.categories, name=category_name)
        if not category:
            print(f"➕ Creando categoría: {category_name}")
            category = await guild.create_category(category_name)
        else:
            print(f"✅ Categoría ya existente: {category_name}")
            
        for channel_name, welcome_msg in channels:
            clean_name = channel_name.lower().replace(" ", "-")
            
            # Buscar si el canal ya existe en esta categoría
            channel = discord.utils.get(category.text_channels, name=clean_name)
            if not channel:
                print(f"   ➕ Creando canal: #{channel_name}")
                channel = await guild.create_text_channel(clean_name, category=category)
                
                # Inyectar mensaje de bienvenida si aplica
                if welcome_msg:
                    print(f"   📝 Inyectando copia en #{channel_name}...")
                    await channel.send(welcome_msg)
            else:
                print(f"   ✅ Canal ya existente: #{channel_name}")
                
    print("\n🎉 ¡REESTRUCTURACIÓN COMPLETA DE DISCORD TERMINADA!")
    await client.close()

if __name__ == "__main__":
    client.run(DISCORD_TOKEN)
