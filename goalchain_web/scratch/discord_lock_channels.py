import discord
import os
import asyncio

TOKEN = "MTUwNDIwNDc3ODEwMjcyMjc1MA.G4cT6l.a3G33fhdtYgXK3CputA8atB3qWYDCGHRCz67Qw"

class LockChannelBot(discord.Client):
    async def on_ready(self):
        print(f'Logged in as {self.user}')
        for guild in self.guilds:
            ann_channel = discord.utils.get(guild.text_channels, name="announcements")
            rules_channel = discord.utils.get(guild.text_channels, name="rules")
            roadmap_channel = discord.utils.get(guild.text_channels, name="roadmap")
            welcome_channel = discord.utils.get(guild.text_channels, name="welcome")
            
            channels_to_lock = [ann_channel, rules_channel, roadmap_channel, welcome_channel]
            
            for channel in channels_to_lock:
                if channel:
                    print(f"Bloqueando envío de mensajes en #{channel.name}...")
                    # Denegar envío a todos
                    await channel.set_permissions(guild.default_role, send_messages=False)
                    # Permitirme a mí (el bot) enviar mensajes
                    await channel.set_permissions(self.user, send_messages=True)
                    print(f"#{channel.name} ahora es de solo lectura para el público.")
                
        await self.close()

bot = LockChannelBot(intents=discord.Intents.all())
bot.run(TOKEN)
