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

    # Usar una de las imágenes disponibles en el repositorio
    image_path = "/Users/NicoPez/GoalChain/docs/assets/img/nfts/bg/bg_rare_1.png"
    file_name = os.path.basename(image_path)
    
    # Crear el archivo adjunto si existe
    file = None
    if os.path.exists(image_path):
        file = discord.File(image_path, filename=file_name)
    
    content = """# ⚡ LAUNCH UPDATE: INFRASTRUCTURE AND SPORTS PREDICTOR PHASE 1 & 2 COMPLETED ⚡

Attention GoalChain community! ⚽⛓️

We have taken a giant step in the platform's technical development. The **Stabilization Phase (Phase 1)** and the **Sports Engine Enrichment (Phase 2)** are completed and ready for testing on mobile devices.

Here is the summary of the spectacular new features:

📱 **1. 100% RESPONSIVE MOBILE DESIGN (Phase 1)**
The complete dashboard is now 100% Mobile-Friendly. The sidebar collapses into an elegant top-nav on mobile screens, and all tactical tables adapt perfectly to any smartphone screen.

📊 **2. ENRICHED 528 PLAYER ROSTER (Phase 2)**
All 528 Genesis Squad cards have been calibrated with their runtime values:
• **Base $GCH Yield**: Derived from player hype and rarity (e.g., Mythics generate up to +1200 $GCH/day).
• **Dynamic Stamina and Fatigue**: Players feature real-time stamina loss and elimination states.
• **Exclusive Lores**: Each player possesses their own unique Web3 narrative.

🔮 **3. RAINMAKER AI SPORTS PREDICTOR V2.0**
The sports engine comes alive! Rainmaker now loads the real fixture of 24 group stage matches, knockouts, and the final of the **2026 World Cup** (MetLife Stadium).
• Calculates probabilities based on the aggregated power index of the country's cards (Attack, Defense, and Hype).
• Allows cycling through matches and activating the Autonomous Betbot with dynamic Pyth Feed fluctuation.
• Improved terminal with support for testing commands like `/fixture`, `/burn`, `/optimize`, and `/status`.

📖 **4. MEGA GUIDE AND EMBLEM VAULT MINTING INTEGRATION**
The official **Bilingual Mega Guide (Spanish/English)** tab is now fully integrated directly on the website. Additionally, the Emblem Vault creator now dynamically reads your highest-hype players.

The work has been pushed to the repository and is ready to be tested on various mobile devices! 🚀"""
    
    print(f"🚀 Enviando anuncio a #{channel.name}...")
    try:
        if file:
            await channel.send(content=content, file=file)
        else:
            await channel.send(content=content)
        print("✅ ¡Anuncio de Discord publicado con éxito!")
    except Exception as e:
        print(f"❌ Error al enviar el mensaje: {str(e)}")
        
    await client.close()

if __name__ == "__main__":
    client.run(DISCORD_TOKEN)
