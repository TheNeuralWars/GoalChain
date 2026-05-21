import discord
import os
import asyncio

TOKEN = "MTUwNDIwNDc3ODEwMjcyMjc1MA.G4cT6l.a3G33fhdtYgXK3CputA8atB3qWYDCGHRCz67Qw"

class PurgeBot(discord.Client):
    async def on_ready(self):
        print(f'Logged in as {self.user}')
        for guild in self.guilds:
            dev_channel = discord.utils.get(guild.text_channels, name="dev-room")
            if dev_channel:
                print(f"Purgando canal #{dev_channel.name}...")
                
                # Definimos lo que QUEREMOS MANTENER
                to_keep_keywords = [
                    "TECHNICAL BRIEF",
                    "MASTER ASSETS",
                    "OFFICIAL DNA REGISTRY",
                    "Master Frame",
                    "MASTER LOGO",
                    "NFT Master Prompts"
                ]
                
                # Borrar todo lo que no coincida o sea redundante
                async for message in dev_channel.history(limit=100):
                    # No borrar mensajes de sistema ni lo que queremos mantener
                    keep = any(kw in message.content for kw in to_keep_keywords)
                    
                    # Regla extra: si es la lista oficial, mantener solo la V11.0 (o la última)
                    if "OFFICIAL DNA REGISTRY" in message.content and "V10.0" in message.content:
                        keep = False # Borrar la V10 si existe la V11
                    
                    if not keep:
                        await message.delete()
                        await asyncio.sleep(0.3)
                
                print("Canal #dev-room purgado y optimizado.")
        await self.close()

bot = PurgeBot(intents=discord.Intents.all())
bot.run(TOKEN)
