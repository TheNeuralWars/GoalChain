import discord
import os

TOKEN = "MTUwNDIwNDc3ODEwMjcyMjc1MA.G4cT6l.a3G33fhdtYgXK3CputA8atB3qWYDCGHRCz67Qw"

class PostFinalSynthesis(discord.Client):
    async def on_ready(self):
        print(f'Logged in as {self.user}')
        for guild in self.guilds:
            dev_channel = discord.utils.get(guild.text_channels, name="dev-room")
            if dev_channel:
                image_path = "/Users/NicoPez/.gemini/antigravity/brain/fe8ffddd-a347-41d5-9726-189f72dcbad6/goalchain_final_master_frame_v14_0_chassis_1778726029739.png"
                
                if os.path.exists(image_path):
                    msg = (
                        "💎 **THE MASTERPIECE: OFFICIAL CHASSIS V14.0**\n\n"
                        "Hemos sintetizado lo mejor de cada prototipo. Este es el marco final.\n"
                        "*   **Estética:** Geometría angular ultra-detallada (Rolex/Automotive style).\n"
                        "*   **Técnico:** Rectángulo vertical limpio, 12 slots de stats.\n"
                        "*   **Material:** Titanium Chrome Neutro para tintado dinámico.\n"
                        "⚠️ **ESTADO:** DEFINITIVO. Prohibido modificar sin orden directa del DT."
                    )
                    await dev_channel.send(msg, file=discord.File(image_path))
                    print("Master Frame V14.0 publicado en #dev-room.")
                else:
                    print(f"Error: No se encontró el archivo en {image_path}")
                    
        await self.close()

bot = PostFinalSynthesis(intents=discord.Intents.all())
bot.run(TOKEN)
