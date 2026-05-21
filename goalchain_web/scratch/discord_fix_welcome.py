import discord
import os
import asyncio

TOKEN = "MTUwNDIwNDc3ODEwMjcyMjc1MA.G4cT6l.a3G33fhdtYgXK3CputA8atB3qWYDCGHRCz67Qw"

class WelcomeFixBot(discord.Client):
    async def on_ready(self):
        print(f'Logged in as {self.user}')
        for guild in self.guilds:
            welcome_channel = discord.utils.get(guild.text_channels, name="welcome")
            ann_channel = discord.utils.get(guild.text_channels, name="announcements")
            rules_channel = discord.utils.get(guild.text_channels, name="rules")
            roadmap_channel = discord.utils.get(guild.text_channels, name="roadmap")
            links_channel = discord.utils.get(guild.text_channels, name="official-links")
            
            if welcome_channel:
                await welcome_channel.purge(limit=10)
                
                welcome_msg = (
                    "# ⚽ WELCOME TO GOALCHAIN! ⚽\n"
                    "Greetings, Legend! We are thrilled to have you here.\n\n"
                    "GoalChain is the ultimate **Web3 Football Ecosystem** where your passion for the game meets the power of the blockchain. "
                    "Feel free to explore our channels, meet the community, and take a look at our upcoming NFT collections.\n\n"
                    "### 🧭 Quick Guide:\n"
                    f"*   Check {ann_channel.mention if ann_channel else '#announcements'} for the latest news.\n"
                    f"*   Read {rules_channel.mention if rules_channel else '#rules'} to stay in the game fairly.\n"
                    f"*   See our vision in {roadmap_channel.mention if roadmap_channel else '#roadmap'}.\n"
                    f"*   Find all verified links in {links_channel.mention if links_channel else '#official-links'}.\n\n"
                    "We are currently in **active development**, and something big is coming soon. Stay tuned and get ready to play! 🚀"
                )
                await welcome_channel.send(welcome_msg)
                print("Mensaje de bienvenida sincronizado.")
                
        await self.close()

bot = WelcomeFixBot(intents=discord.Intents.all())
bot.run(TOKEN)
