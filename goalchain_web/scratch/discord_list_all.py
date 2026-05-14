import discord
import os
import asyncio

TOKEN = "MTUwNDIwNDc3ODEwMjcyMjc1MA.G4cT6l.a3G33fhdtYgXK3CputA8atB3qWYDCGHRCz67Qw"

class ListAllBot(discord.Client):
    async def on_ready(self):
        print(f'Logged in as {self.user}')
        for guild in self.guilds:
            print(f'\n--- Guild: {guild.name} ---')
            for category in guild.categories:
                print(f'Category: {category.name}')
                for channel in category.channels:
                    last_msg = ""
                    if isinstance(channel, discord.TextChannel):
                        try:
                            msgs = [m async for m in channel.history(limit=1)]
                            if msgs: last_msg = f" | Last msg: {msgs[0].content[:30]}..."
                        except: pass
                    print(f'  - #{channel.name} (ID: {channel.id}){last_msg}')
                    
            print('\nChannels without category:')
            for channel in guild.channels:
                if channel.category is None:
                    print(f'  - #{channel.name} (ID: {channel.id})')
                    
        await self.close()

bot = ListAllBot(intents=discord.Intents.all())
bot.run(TOKEN)
