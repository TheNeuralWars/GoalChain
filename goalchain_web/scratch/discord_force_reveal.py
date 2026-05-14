import discord
import os

TOKEN = "MTUwNDIwNDc3ODEwMjcyMjc1MA.G4cT6l.a3G33fhdtYgXK3CputA8atB3qWYDCGHRCz67Qw"

class ForceReveal(discord.Client):
    async def on_ready(self):
        print(f'Logged in as {self.user}')
        for guild in self.guilds:
            channel = discord.utils.get(guild.text_channels, name="dev-room")
            if channel:
                img = "/Users/NicoPez/.gemini/antigravity/brain/fe8ffddd-a347-41d5-9726-189f72dcbad6/goalchain_player_1_prototype_v14_0_1778726606992.png"
                msg = (
                    "🌟 **OFFICIAL GENESIS REVEAL: LIONEL SATOSHI** 🌟\n\n"
                    "¡La espera ha terminado! Aquí está el estándar de GoalChain.\n"
                    "Chasis V14.0 + Layering Dinámico."
                )
                await channel.send(msg, file=discord.File(img))
                print("¡ENVIADO CORRECTAMENTE!")
        await self.close()

bot = ForceReveal(intents=discord.Intents.all())
bot.run(TOKEN)
