import discord
import json
import os
import asyncio

TOKEN = "MTUwNDIwNDc3ODEwMjcyMjc1MA.G4cT6l.a3G33fhdtYgXK3CputA8atB3qWYDCGHRCz67Qw"

class OfficialListBot(discord.Client):
    async def on_ready(self):
        print(f'Logged in as {self.user}')
        for guild in self.guilds:
            dev_channel = discord.utils.get(guild.text_channels, name="dev-room")
            if dev_channel:
                await dev_channel.send("## 🏆 THE GOLDEN 100 - OFFICIAL DNA REGISTRY (V10.0)\n"
                                     "Esta es la lista definitiva de parodias reales. @Lucas, ignora todo lo anterior.")
                
                with open('/Users/NicoPez/GoalChain/assets/data/nft_master_prompts_100.json', 'r') as f:
                    prompts = json.load(f)
                
                current_msg = ""
                for i, p in enumerate(prompts):
                    # Solo enviamos los que no sean placeholders genéricos
                    if "Star-Parody" not in p['name']:
                        entry = f"**#{p['id']} {p['name']}**: {p['prompt'][:160]}...\n"
                        if len(current_msg) + len(entry) > 1900:
                            await dev_channel.send(current_msg)
                            current_msg = entry
                            await asyncio.sleep(1)
                        else:
                            current_msg += entry
                
                if current_msg:
                    await dev_channel.send(current_msg)
                
                await dev_channel.send("🚀 **¡Producción de Élite Iniciada!**")
                
        await self.close()

bot = OfficialListBot(intents=discord.Intents.all())
bot.run(TOKEN)
