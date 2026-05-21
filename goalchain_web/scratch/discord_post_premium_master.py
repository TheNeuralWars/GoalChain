import discord
import os

TOKEN = "MTUwNDIwNDc3ODEwMjcyMjc1MA.G4cT6l.a3G33fhdtYgXK3CputA8atB3qWYDCGHRCz67Qw"

class PostPremiumMaster(discord.Client):
    async def on_ready(self):
        print(f'Logged in as {self.user}')
        for guild in self.guilds:
            dev_channel = discord.utils.get(guild.text_channels, name="dev-room")
            if dev_channel:
                image_path = "/Users/NicoPez/.gemini/antigravity/brain/fe8ffddd-a347-41d5-9726-189f72dcbad6/goalchain_premium_master_frame_v9_5_1778721517876.png"
                
                if os.path.exists(image_path):
                    msg = (
                        "🏆 **THE HOLY GRAIL: OFFICIAL MASTER FRAME V11.0**\n\n"
                        "Hemos alcanzado la perfección visual. Este es el marco para la colección definitiva.\n"
                        "*   **Calidad Ultra-Premium:** Obsidiana, Cromo y Cristal.\n"
                        "*   **Square Action Slot:** Espacio central para el jugador 1:1.\n"
                        "*   **Zero Text / Zero Bleed:** Preparado para inyección de UI dinámica.\n"
                        "*   **Tintado Neutro:** Optimizado para filtros de rareza (Gold, Diamond, Ruby)."
                    )
                    await dev_channel.send(msg, file=discord.File(image_path))
                    print("Master Frame V11.0 publicado en #dev-room.")
                else:
                    print(f"Error: No se encontró el archivo en {image_path}")
                    
        await self.close()

bot = PostPremiumMaster(intents=discord.Intents.all())
bot.run(TOKEN)
