import discord
import os
import asyncio

TOKEN = "MTUwNDIwNDc3ODEwMjcyMjc1MA.G4cT6l.a3G33fhdtYgXK3CputA8atB3qWYDCGHRCz67Qw"

class DeleteBot(discord.Client):
    async def on_ready(self):
        print(f'Logged in as {self.user}')
        for guild in self.guilds:
            dev_channel = discord.utils.get(guild.text_channels, name="dev-room")
            if dev_channel:
                print(f"Limpiando canal #{dev_channel.name}...")
                # Borramos mensajes de la lista de prompts genéricos
                async for message in dev_channel.history(limit=50):
                    if message.author == self.user and "DNA VISUAL" in message.content:
                        await message.delete()
                        await asyncio.sleep(0.5)
                print("Limpieza de duplicados genéricos completada.")
        await self.close()

bot = DeleteBot(intents=discord.Intents.all())
bot.run(TOKEN)
