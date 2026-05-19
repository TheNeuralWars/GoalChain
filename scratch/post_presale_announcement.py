import discord
import os

DISCORD_TOKEN = "MTUwNDIwNDc3ODEwMjcyMjc1MA.G4cT6l.a3G33fhdtYgXK3CputA8atB3qWYDCGHRCz67Qw"
ANNOUNCEMENTS_CHANNEL_ID = 1503668120521408513

intents = discord.Intents.default()
intents.guilds = True

client = discord.Client(intents=intents)

@client.event
async def on_ready():
    print(f"🤖 Bot conectado como: {client.user}")
    
    channel = client.get_channel(ANNOUNCEMENTS_CHANNEL_ID)
    if not channel:
        print(f"❌ Canal de anuncios no encontrado.")
        await client.close()
        return
        
    print(f"🚀 Enviando anuncio oficial de la preventa en #{channel.name}...")
    
    # Sunset image or promo image to attach
    image_path = "/Users/NicoPez/GoalChain/docs/assets/img/nfts/bg/bg_rare_sunset.png"
    file_name = os.path.basename(image_path)
    file = discord.File(image_path, filename=file_name)
    
    # Premium IDO Embed
    embed = discord.Embed(
        title="⚡ THE GOALCHAIN PRE-LAUNCH IDO PRESALE IS OFFICIALLY LIVE! 🚀⚽",
        description=(
            "Attention Managers! 🚨\n\n"
            "We are thrilled to announce that the **Official $GCH Bootstrap Presale** is now officially open to the public directly from our decentralized dApp!\n\n"
            "This is your absolute best opportunity to secure your $GCH tokens at a heavily discounted rate before we launch on Raydium/Orca DEX pools.\n\n"
            "By participating in the presale, **100% of your contributed SOL goes straight into The Vault (Liquid JitoSOL Staking)**, immediately powering up our dynamic *Infinity Engine* token buy-backs and burns! 🏦🔥\n\n"
            "---"
        ),
        color=0x14F195 # Solana Neon Green
    )
    
    embed.add_field(
        name="💎 PRESALE METRICS & DATA",
        value=(
            "• **Presale Rate:** `1 SOL = 50,000 $GCH` (Exclusive pre-listing discount!)\n"
            "• **Min. Contribution:** `0.1 SOL`\n"
            "• **Soft / Hard Cap:** `1,000 / 5,000 SOL`\n"
            "• **Distribution Pool:** 15,000,000 $GCH (15% of Genesis Supply)\n"
            "• **Release Schedule:** Programmatically distributed directly to your contributing wallet once the public presale concludes."
        ),
        inline=False
    )
    
    embed.add_field(
        name="🔗 HOW TO CONTRIBUTE IMMEDIATELY:",
        value=(
            "1️⃣ Go to the official dApp: 🔗 **[goalchain.fun](https://goalchain.fun)**\n"
            "2️⃣ Connect your Phantom/Solana wallet using the button in the top right.\n"
            "3️⃣ Scroll down to the **GoalChain Launchpad** widget, enter your desired SOL amount, and click **Contribute**.\n"
            "4️⃣ That's it! Monitor real-time presale funding progress directly from the glass-card interface."
        ),
        inline=False
    )
    
    embed.add_field(
        name="🛡️ SECURITY DIRECTORY WARNING",
        value=(
            "GoalChain managers will *never* DM you asking for funds or seed phrases. The only place to contribute to the official presale is directly through our verified website at **[https://goalchain.fun](https://goalchain.fun)**. Keep your wallets safe!"
        ),
        inline=False
    )
    
    embed.set_image(url=f"attachment://{file_name}")
    embed.set_footer(text="GoalChain Launchpad Operations | The Future of Football on Solana", icon_url="https://goalchain.fun/assets/img/logo_3d_clean.png")
    
    try:
        await channel.send(embed=embed, file=file)
        print("✅ ANUNCIO OFICIAL DE PREVENTA ENVIADO CON ÉXITO A DISCORD!")
    except Exception as e:
        print(f"❌ Error al enviar el anuncio de preventa: {str(e)}")
        
    await client.close()

if __name__ == "__main__":
    client.run(DISCORD_TOKEN)
