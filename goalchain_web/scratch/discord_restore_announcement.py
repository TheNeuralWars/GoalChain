import discord
import os
import asyncio

TOKEN = "MTUwNDIwNDc3ODEwMjcyMjc1MA.G4cT6l.a3G33fhdtYgXK3CputA8atB3qWYDCGHRCz67Qw"

class RestoreMessageBot(discord.Client):
    async def on_ready(self):
        print(f'Logged in as {self.user}')
        for guild in self.guilds:
            ann_channel = discord.utils.get(guild.text_channels, name="announcements")
            if ann_channel:
                # El texto original del usuario (recuperado de memoria/logs)
                original_msg = (
                    "# 📢 OFFICIAL ANNOUNCEMENT\n\n"
                    "Hello @everyone! \n\n"
                    "We're building **GoalChain**, the first decentralized football ecosystem where every match counts and every legend matters. "
                    "Our mission is to merge the passion of the World Cup with the transparency of the blockchain.\n\n"
                    "We are currently in **active development**, shaping the future of digital collectibles and sports predictions. "
                    "Stay tuned for the **Genesis Squad** mint and the launch of our $GCH tokenomics.\n\n"
                    "Welcome to the team. Let's make history together! ⚽🔥"
                )
                await ann_channel.send(original_msg)
                print("Mensaje original restaurado con éxito.")
                
        await self.close()

bot = RestoreMessageBot(intents=discord.Intents.all())
bot.run(TOKEN)
