import discord
import os
import asyncio

TOKEN = "MTUwNDIwNDc3ODEwMjcyMjc1MA.G4cT6l.a3G33fhdtYgXK3CputA8atB3qWYDCGHRCz67Qw"

class FinderBot(discord.Client):
    async def on_ready(self):
        print(f'Logged in as {self.user}')
        print("Buscando mensajes de usuarios humanos...")
        for guild in self.guilds:
            for channel in guild.text_channels:
                try:
                    async for message in channel.history(limit=20):
                        if not message.author.bot:
                            print(f'FOUND MESSAGE in #{channel.name} (ID: {channel.id}):')
                            print(f'  Author: {message.author.name}')
                            print(f'  Content: {message.content[:100]}...')
                            print('---')
                except:
                    pass
        await self.close()

bot = FinderBot(intents=discord.Intents.all())
bot.run(TOKEN)
