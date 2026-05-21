import discord
import os
import asyncio

TOKEN = "MTUwNDIwNDc3ODEwMjcyMjc1MA.G4cT6l.a3G33fhdtYgXK3CputA8atB3qWYDCGHRCz67Qw"

class RemoveTextList(discord.Client):
    async def on_ready(self):
        print(f'Logged in as {self.user}')
        for guild in self.guilds:
            dev_channel = discord.utils.get(guild.text_channels, name="dev-room")
            if dev_channel:
                print(f"Limpiando redundancias en #{dev_channel.name}...")
                
                # Borramos mensajes que contienen la lista de texto (ID #)
                async for message in dev_channel.history(limit=50):
                    # Mantener el mensaje de cabecera "THE GOLDEN 100" si quieres, 
                    # o borrar todo lo que huela a lista.
                    if message.author == self.user:
                        if "**#" in message.content or "THE GOLDEN 100 - OFFICIAL REGISTRY" in message.content:
                            await message.delete()
                            await asyncio.sleep(0.4)
                
                print("Canal optimizado: Solo quedan los archivos maestros.")
        await self.close()

bot = RemoveTextList(intents=discord.Intents.all())
bot.run(TOKEN)
