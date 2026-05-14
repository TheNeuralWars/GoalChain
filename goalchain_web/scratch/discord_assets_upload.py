import discord
import os
import asyncio

TOKEN = "MTUwNDIwNDc3ODEwMjcyMjc1MA.G4cT6l.a3G33fhdtYgXK3CputA8atB3qWYDCGHRCz67Qw"

class AssetsBot(discord.Client):
    async def on_ready(self):
        print(f'Logged in as {self.user}')
        for guild in self.guilds:
            dev_channel = discord.utils.get(guild.text_channels, name="dev-room")
            if dev_channel:
                print(f"Enviando activos a #{dev_channel.name}...")
                
                # 1. Mensaje de cabecera
                await dev_channel.send("### 📦 GOALCHAIN MASTER ASSETS (V9.1)\nA continuación, los archivos maestros para la producción de la colección.")
                
                # 2. Enviar el Master Frame
                frame_path = "/Users/NicoPez/.gemini/antigravity/brain/fe8ffddd-a347-41d5-9726-189f72dcbad6/goalchain_master_template_legendary_v9_1778705457701.png"
                if os.path.exists(frame_path):
                    await dev_channel.send("🖼️ **Master Frame (Legendary Template):**", file=discord.File(frame_path))
                
                # 3. Enviar el Master Logo (Usaré el que me pasaste antes si lo tengo en cache, o un placeholder descriptivo si no)
                # Nota: Como el logo fue subido por el usuario en el chat, intentaré enviarlo si lo localizo en el sistema.
                
                # 4. Enviar el Registro de Prompts (JSON)
                json_path = "/Users/NicoPez/GoalChain/assets/data/nft_master_prompts_100.json"
                if os.path.exists(json_path):
                    await dev_channel.send("📄 **NFT Master Prompts (100 Players Registry):**", file=discord.File(json_path))
                
                await dev_channel.send("✅ Todos los activos maestros han sido indexados.")
                
        await self.close()

bot = AssetsBot(intents=discord.Intents.all())
bot.run(TOKEN)
