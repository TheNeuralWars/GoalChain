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
        print(f"❌ Canal no encontrado.")
        await client.close()
        return
        
    print(f"🚀 Enviando corrección y aclaración técnica a #{channel.name}...")
    
    # Elegant Correction Embed
    embed = discord.Embed(
        title="ℹ️ CLARIFICATION: THE UNCAPPED INFINITY ENGINE PARADIGM 🔄💎",
        description=(
            "Managers! We wanted to quickly clarify a technical detail regarding our recent Tokenomics 2.0 release:\n\n"
            "The **100,000,000 $GCH** figure represents the **Initial Genesis Supply** used to bootstrap our launch pools, marketing Campaigns, and early play-rewards.\n\n"
            "**GoalChain's utility economy operates on a dynamic, uncapped supply model.** Here is why this is massive for our ecosystem:\n\n"
            "---"
        ),
        color=0x9945FF # Solana Purple
    )
    
    embed.add_field(
        name="♾️ No Arbitrary Hard Caps",
        value=(
            "Fixed caps in Web3 gaming lead to a fatal flaw: once rewards run out, new players cannot participate, and yield emissions starve. "
            "GoalChain scales infinitely with World Cup engagement, adapting to actual player growth."
        ),
        inline=False
    )
    
    embed.add_field(
        name="🔥 Dynamic Staking & MEV Burns",
        value=(
            "To prevent inflation, our **JitoSOL Treasury Vault** continuously stakes accumulated funds. "
            "The APY + MEV tip yield is programmatically spent to **buy back $GCH from liquidity pools and burn it permanently**. "
            "As activity scales, our organic buying and burn pressure scales with it, maintaining healthy price action."
        ),
        inline=False
    )
    
    embed.add_field(
        name="🎯 Active Sinks",
        value=(
            "Every game transaction—buying energy potions, merging player cards, and placing live bets—triggers direct token burns. "
            "Supply increases with play, but gets heavily consumed by utility!"
        ),
        inline=False
    )
    
    embed.set_footer(text="GoalChain Core Architecture | The Future of Football on Solana", icon_url="https://goalchain.fun/assets/img/logo_3d_clean.png")
    
    try:
        await channel.send(embed=embed)
        print("✅ CORRECCIÓN ENVIADA CON ÉXITO A DISCORD!")
    except Exception as e:
        print(f"❌ Error al enviar la corrección: {str(e)}")
        
    await client.close()

if __name__ == "__main__":
    client.run(DISCORD_TOKEN)
