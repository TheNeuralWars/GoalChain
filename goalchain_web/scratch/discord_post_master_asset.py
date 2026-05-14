import discord
import os

TOKEN = "MTUwNDIwNDc3ODEwMjcyMjc1MA.G4cT6l.a3G33fhdtYgXK3CputA8atB3qWYDCGHRCz67Qw"

class PostMasterAsset(discord.Client):
    async def on_ready(self):
        print(f'Logged in as {self.user}')
        for guild in self.guilds:
            dev_channel = discord.utils.get(guild.text_channels, name="dev-room")
            if dev_channel:
                image_path = "/Users/NicoPez/.gemini/antigravity/brain/fe8ffddd-a347-41d5-9726-189f72dcbad6/goalchain_neutral_master_frame_v9_3_1778720317594.png"
                
                if os.path.exists(image_path):
                    msg = (
                        "🖼️ **MASTER ASSET REVEAL: NEUTRAL FRAME V9.3**\n\n"
                        "Este es el marco maestro definitivo para la colección de 1,248 NFTs.\n"
                        "*   **Formato:** 2:3 Vertical.\n"
                        "*   **Color:** Neutral Chrome (Plata/Diamante).\n"
                        "*   **Uso:** Este activo será tintado dinámicamente vía CSS/Capas según la rareza.\n"
                        "*   **Slots:** Reservados para Logo (arriba-izq) y Bandera (arriba-der)."
                    )
                    await dev_channel.send(msg, file=discord.File(image_path))
                    print("Asset maestro publicado en #dev-room.")
                else:
                    print(f"Error: No se encontró el archivo en {image_path}")
                    
        await self.close()

bot = PostMasterAsset(intents=discord.Intents.all())
bot.run(TOKEN)
