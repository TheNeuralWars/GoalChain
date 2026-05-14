import discord
import os

TOKEN = "MTUwNDIwNDc3ODEwMjcyMjc1MA.G4cT6l.a3G33fhdtYgXK3CputA8atB3qWYDCGHRCz67Qw"

class PostFinalSkeleton(discord.Client):
    async def on_ready(self):
        print(f'Logged in as {self.user}')
        for guild in self.guilds:
            dev_channel = discord.utils.get(guild.text_channels, name="dev-room")
            if dev_channel:
                image_path = "/Users/NicoPez/.gemini/antigravity/brain/fe8ffddd-a347-41d5-9726-189f72dcbad6/goalchain_pure_skeleton_frame_v9_4_1778721258596.png"
                
                if os.path.exists(image_path):
                    msg = (
                        "💀 **FINAL MASTER ASSET: PURE SKELETON V9.4**\n\n"
                        "Este es el CHASIS DEFINITIVO para la generación masiva.\n"
                        "*   **Zero-Text:** Todas las etiquetas (PAC, SHO, etc.) han sido eliminadas.\n"
                        "*   **Zero-Bleed:** Sin fondo ni desenfoques externos. Recorte perfecto.\n"
                        "*   **Color:** Neutral Chrome para tintado dinámico de rareza.\n"
                        "⚠️ **Instrucción para Lucas:** Usar este archivo como capa base 'FRAME' sobre la cual se montarán 'PLAYER', 'LOGO', 'FLAG' y 'STATS UI'."
                    )
                    await dev_channel.send(msg, file=discord.File(image_path))
                    print("Skeleton maestro publicado en #dev-room.")
                else:
                    print(f"Error: No se encontró el archivo en {image_path}")
                    
        await self.close()

bot = PostFinalSkeleton(intents=discord.Intents.all())
bot.run(TOKEN)
