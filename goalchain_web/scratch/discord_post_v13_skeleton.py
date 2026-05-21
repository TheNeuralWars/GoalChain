import discord
import os

TOKEN = "MTUwNDIwNDc3ODEwMjcyMjc1MA.G4cT6l.a3G33fhdtYgXK3CputA8atB3qWYDCGHRCz67Qw"

class PostV13Skeleton(discord.Client):
    async def on_ready(self):
        print(f'Logged in as {self.user}')
        for guild in self.guilds:
            dev_channel = discord.utils.get(guild.text_channels, name="dev-room")
            if dev_channel:
                image_path = "/Users/NicoPez/.gemini/antigravity/brain/fe8ffddd-a347-41d5-9726-189f72dcbad6/goalchain_master_frame_v13_0_prototype_1778722414832.png"
                
                if os.path.exists(image_path):
                    msg = (
                        "🌟 **NEW MASTER ASSET: THE CLEAN CHASSIS V13.0**\n\n"
                        "Este es el esqueleto definitivo, refinado para máxima sofisticación.\n"
                        "*   **Estética:** Minimalismo de lujo (Titanio/Grafito).\n"
                        "*   **Arquitectura:** Rectángulo vertical maximizado.\n"
                        "*   **Pureza:** Zero Text, Zero Logos, Solid Black Background.\n"
                        "⚠️ **Nota para Lucas:** Este archivo es la capa 'FRAME' base. La inyección de UI y stats será totalmente limpia sobre esta estructura."
                    )
                    await dev_channel.send(msg, file=discord.File(image_path))
                    print("Master Frame V13.0 publicado en #dev-room.")
                else:
                    print(f"Error: No se encontró el archivo en {image_path}")
                    
        await self.close()

bot = PostV13Skeleton(intents=discord.Intents.all())
bot.run(TOKEN)
