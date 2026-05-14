import discord
import os
import asyncio

TOKEN = "MTUwNDIwNDc3ODEwMjcyMjc1MA.G4cT6l.a3G33fhdtYgXK3CputA8atB3qWYDCGHRCz67Qw"

class FinalOrderBot(discord.Client):
    async def on_ready(self):
        print(f'Logged in as {self.user}')
        for guild in self.guilds:
            # 1. Identificar categorías a eliminar
            default_categories = ["Canales de texto", "Canales de voz", "Text Channels", "Voice Channels"]
            
            # 2. Asegurar que tenemos las categorías oficiales
            info_cat = discord.utils.get(guild.categories, name="📢 INFORMATION")
            stadium_cat = discord.utils.get(guild.categories, name="🏟️ THE STADIUM")
            
            # 3. Mover canales huérfanos y borrar categorías vacías
            for category in guild.categories:
                if category.name in default_categories:
                    print(f"Limpiando categoría: {category.name}")
                    for channel in category.channels:
                        if channel.name == "screenshots-previews":
                            await channel.edit(category=stadium_cat)
                            print(f"  - Movido {channel.name} a THE STADIUM")
                        elif channel.name == "general-chat":
                            await channel.edit(category=stadium_cat)
                        else:
                            # Si es un canal vacío o genérico, borrar
                            print(f"  - Borrando canal genérico: {channel.name}")
                            await channel.delete()
                    
                    await category.delete()
                    print(f"Categoría {category.name} eliminada.")

            # 4. Crear sección de Voz con estilo
            voice_cat = discord.utils.get(guild.categories, name="🎙️ MEDIA CENTER")
            if not voice_cat:
                voice_cat = await guild.create_category("🎙️ MEDIA CENTER")
            
            if not discord.utils.get(voice_cat.voice_channels, name="Press Conference"):
                await guild.create_voice_channel("Press Conference", category=voice_cat)
            if not discord.utils.get(voice_cat.voice_channels, name="Stadium Tunnel"):
                await guild.create_voice_channel("Stadium Tunnel", category=voice_cat)

        print("Orden final completado.")
        await self.close()

bot = FinalOrderBot(intents=discord.Intents.all())
bot.run(TOKEN)
