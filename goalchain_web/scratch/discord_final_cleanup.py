import discord
import os
import asyncio

TOKEN = "MTUwNDIwNDc3ODEwMjcyMjc1MA.G4cT6l.a3G33fhdtYgXK3CputA8atB3qWYDCGHRCz67Qw"

class CleanupFinal(discord.Client):
    async def on_ready(self):
        print(f'Logged in as {self.user}')
        for guild in self.guilds:
            # Canales con contenido (LOS QUE MANTENEMOS)
            original_general = guild.get_channel(1503668120521408513)
            original_rules = guild.get_channel(1504191828696764636)
            
            # Canales vacíos (LOS QUE BORRAMOS)
            to_delete = [
                1504207664433856596, # Empty General
                1504207661338722314, # Empty Anuncios
                1504207656355631134, # Empty Reglas
            ]
            
            # Categoría Info
            info_category = guild.get_channel(1504207653910478888)
            
            print("Eliminando duplicados vacíos...")
            for channel_id in to_delete:
                c = guild.get_channel(channel_id)
                if c:
                    await c.delete()
                    print(f'  - Deleted {c.name}')
            
            print("Organizando canales con contenido...")
            if original_general:
                await original_general.edit(name="anuncios", category=info_category, position=0)
                print(f'  - Moved and renamed original general to #anuncios')
            
            if original_rules:
                await original_rules.edit(name="reglas", category=info_category, position=1)
                print(f'  - Moved and renamed original rules to #reglas')
                
        print("\n¡Limpieza completada!")
        await self.close()

bot = CleanupFinal(intents=discord.Intents.all())
bot.run(TOKEN)
