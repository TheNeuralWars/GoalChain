import discord
import os

TOKEN = "MTUwNDIwNDc3ODEwMjcyMjc1MA.G4cT6l.a3G33fhdtYgXK3CputA8atB3qWYDCGHRCz67Qw"

class CheckReveal(discord.Client):
    async def on_ready(self):
        print(f'Logged in as {self.user}')
        for guild in self.guilds:
            dev_channel = discord.utils.get(guild.text_channels, name="dev-room")
            if dev_channel:
                async for message in dev_channel.history(limit=5):
                    if "LIONEL SATOSHI" in message.content:
                        print(f"CONFIRMADO: El mensaje está en Discord. ID: {message.id}")
                        break
        await self.close()

bot = CheckReveal(intents=discord.Intents.all())
bot.run(TOKEN)
