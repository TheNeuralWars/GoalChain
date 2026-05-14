import discord
import json
import os
import asyncio

TOKEN = "MTUwNDIwNDc3ODEwMjcyMjc1MA.G4cT6l.a3G33fhdtYgXK3CputA8atB3qWYDCGHRCz67Qw"

class FullLogBot(discord.Client):
    async def on_ready(self):
        print(f'Logged in as {self.user}')
        for guild in self.guilds:
            dev_channel = discord.utils.get(guild.text_channels, name="dev-room")
            if dev_channel:
                # 1. Subir el Logo (Si existe en assets)
                logo_path = "/Users/NicoPez/GoalChain/docs/assets/img/logo.png" # Ruta probable
                if os.path.exists(logo_path):
                    await dev_channel.send("⚡ **GOALCHAIN MASTER LOGO (Neon Edition):**", file=discord.File(logo_path))
                
                # 2. Publicar los 100 Prompts en Texto (por bloques)
                with open('/Users/NicoPez/GoalChain/assets/data/nft_master_prompts_100.json', 'r') as f:
                    prompts = json.load(f)
                
                await dev_channel.send("📝 **LISTA COMPLETA DE PROMPTS (DNA VISUAL V9.1):**")
                
                current_msg = ""
                for i, p in enumerate(prompts):
                    entry = f"**#{p['id']} {p['name']}**: {p['prompt'][:150]}...\n"
                    if len(current_msg) + len(entry) > 1900:
                        await dev_channel.send(current_msg)
                        current_msg = entry
                        await asyncio.sleep(1) # Evitar rate limit
                    else:
                        current_msg += entry
                
                if current_msg:
                    await dev_channel.send(current_msg)
                
                await dev_channel.send("🚀 **¡Lista completa indexada!** @Lucas ya puedes empezar.")
                
        await self.close()

bot = FullLogBot(intents=discord.Intents.all())
bot.run(TOKEN)
