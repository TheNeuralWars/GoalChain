import discord
import os
import asyncio

TOKEN = "MTUwNDIwNDc3ODEwMjcyMjc1MA.G4cT6l.a3G33fhdtYgXK3CputA8atB3qWYDCGHRCz67Qw"

class CleanupBot(discord.Client):
    async def on_ready(self):
        print(f'Logged in as {self.user}')
        for guild in self.guilds:
            print(f'\n--- Guild: {guild.name} ---')
            channels = sorted(guild.channels, key=lambda c: c.position)
            
            # Buscamos duplicados
            seen_names = {}
            for channel in channels:
                if isinstance(channel, discord.TextChannel):
                    if channel.name not in seen_names:
                        seen_names[channel.name] = []
                    seen_names[channel.name].append(channel)
            
            for name, list_channels in seen_names.items():
                if len(list_channels) > 1:
                    print(f'Duplicate found: #{name}')
                    for i, c in enumerate(list_channels):
                        last_msg = "No messages"
                        try:
                            msgs = [m async for m in c.history(limit=1)]
                            if msgs:
                                last_msg = f"Last msg: {msgs[0].content[:50]}..."
                        except:
                            pass
                        print(f'  [{i}] ID: {c.id} - {last_msg}')
            
        print("\nDiagnóstico completado. Esperando instrucciones de borrado.")
        await self.close()

bot = CleanupBot(intents=discord.Intents.all())
bot.run(TOKEN)
