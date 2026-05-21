import discord
import os
import asyncio

TOKEN = "MTUwNDIwNDc3ODEwMjcyMjc1MA.G4cT6l.a3G33fhdtYgXK3CputA8atB3qWYDCGHRCz67Qw"

class LinksBot(discord.Client):
    async def on_ready(self):
        print(f'Logged in as {self.user}')
        for guild in self.guilds:
            info_cat = discord.utils.get(guild.categories, name="📢 INFORMATION")
            links_channel = discord.utils.get(guild.text_channels, name="official-links")
            
            if not links_channel:
                links_channel = await guild.create_text_channel("official-links", category=info_cat)
            
            await links_channel.purge(limit=10)
            
            # Bloquear canal (Solo lectura)
            await links_channel.set_permissions(guild.default_role, send_messages=False)
            
            embed = discord.Embed(
                title="🔗 GOALCHAIN OFFICIAL LINKS",
                description="Everything you need to navigate the GoalChain ecosystem. Always double-check links and stay safe! ⚽💎",
                color=0x00ffa3
            )
            
            embed.add_field(name="🌐 Website", value="[goalchain.fun](https://goalchain.fun)", inline=False)
            embed.add_field(name="🐦 X (Twitter)", value="[@GoalChainDotFun](https://x.com/GoalChainDotFun)", inline=False)
            embed.add_field(name="📸 Instagram", value="[@goalchain.fun](https://instagram.com/goalchain.fun)", inline=False)
            embed.add_field(name="🤝 Collaborators Portal", value="[goalchain.fun/colabs.html](https://goalchain.fun/colabs.html)", inline=False)
            embed.add_field(name="⚖️ Legal Notices", value="[Terms & Privacy](https://goalchain.fun/legal.html)", inline=False)
            embed.add_field(name="📦 Resource Bunker", value="[GitHub Repository](https://github.com/NicoPez/GoalChain)", inline=False)
            
            embed.set_thumbnail(url="https://goalchain.fun/assets/img/logo.png") # Asumiendo que el logo está ahí
            embed.set_footer(text="Official communication channel of the GoalChain Protocol.")
            
            await links_channel.send(embed=embed)
            print("Canal de links oficiales restaurado y cargado.")
            
        await self.close()

bot = LinksBot(intents=discord.Intents.all())
bot.run(TOKEN)
