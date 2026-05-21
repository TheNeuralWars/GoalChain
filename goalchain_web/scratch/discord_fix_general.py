import discord
import os
import asyncio

TOKEN = "MTUwNDIwNDc3ODEwMjcyMjc1MA.G4cT6l.a3G33fhdtYgXK3CputA8atB3qWYDCGHRCz67Qw"

class FindGeneralBot(discord.Client):
    async def on_ready(self):
        print(f'Logged in as {self.user}')
        for guild in self.guilds:
            stadium_cat = discord.utils.get(guild.categories, name="🏟️ THE STADIUM")
            if not stadium_cat:
                stadium_cat = await guild.create_category("🏟️ THE STADIUM")
            
            general = discord.utils.get(guild.text_channels, name="general-chat")
            if not general:
                print("General Chat no encontrado. Recreando...")
                general = await guild.create_text_channel("general-chat", category=stadium_cat)
                await general.send("🏟️ **Welcome to the General Chat!** \nThis is the place to talk about football, crypto, and everything GoalChain. Let's keep it respectful and full of hype! ⚽🔥")
            else:
                print(f"General Chat encontrado en {general.category.name if general.category else 'raíz'}")
                if general.category != stadium_cat:
                    await general.edit(category=stadium_cat)
            
            # Asegurar permisos abiertos para el público
            await general.set_permissions(guild.default_role, send_messages=True, read_messages=True)
            print("General Chat listo y visible.")
            
        await self.close()

bot = FindGeneralBot(intents=discord.Intents.all())
bot.run(TOKEN)
