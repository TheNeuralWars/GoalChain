import discord
from discord.ext import commands
import os

# NUNCA subas tokens reales a GitHub. Usa variables de entorno.
TOKEN = os.getenv('DISCORD_BOT_TOKEN', 'TU_TOKEN_AQUÍ')

intents = discord.Intents.default()
intents.members = True
bot = commands.Bot(command_prefix='!', intents=intents)

@bot.event
async def on_ready():
    print(f'✅ Bot conectado como {bot.user}')
    # Lógica de configuración aquí...
