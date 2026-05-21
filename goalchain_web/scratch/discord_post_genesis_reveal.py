import discord
import os

TOKEN = "MTUwNDIwNDc3ODEwMjcyMjc1MA.G4cT6l.a3G33fhdtYgXK3CputA8atB3qWYDCGHRCz67Qw"

class PostGenesisReveal(discord.Client):
    async def on_ready(self):
        print(f'Logged in as {self.user}')
        for guild in self.guilds:
            dev_channel = discord.utils.get(guild.text_channels, name="dev-room")
            if dev_channel:
                image_path = "/Users/NicoPez/.gemini/antigravity/brain/fe8ffddd-a347-41d5-9726-189f72dcbad6/goalchain_player_1_prototype_v14_0_1778726606992.png"
                
                if os.path.exists(image_path):
                    msg = (
                        "🌟 **GENESIS REVEAL: LIONEL SATOSHI (PLAYER #001)** 🌟\n\n"
                        "Aquí tenemos la primera prueba de concepto real del ecosistema GoalChain.\n"
                        "*   **Chasis:** Master Frame V14.0 (Final Architecture).\n"
                        "*   **Layering:** Integración perfecta de Jugador, Logos y Data.\n"
                        "*   **Visuals:** Premium Sports Collectible (Solana Standard).\n\n"
                        "Este es el nivel de calidad que entregaremos a nuestra comunidad. ¡A por todas!"
                    )
                    await dev_channel.send(msg, file=discord.File(image_path))
                    print("Genesis Reveal publicado en #dev-room.")
                else:
                    print(f"Error: No se encontró el archivo en {image_path}")
                    
        await self.close()

bot = PostGenesisReveal(intents=discord.Intents.all())
bot.run(TOKEN)
