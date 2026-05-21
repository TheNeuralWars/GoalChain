import discord
import asyncio

TOKEN = "MTUwNDIwNDc3ODEwMjcyMjc1MA.G4cT6l.a3G33fhdtYgXK3CputA8atB3qWYDCGHRCz67Qw"

class ServerSetupBot(discord.Client):
    async def on_ready(self):
        print(f'🤖 Bot conectado como {self.user}')
        
        for guild in self.guilds:
            print(f'🛠️ Configurando servidor: {guild.name}')
            
            # 1. Gestionar el Canal de Bienvenida (Entradas)
            welcome_channel = discord.utils.get(guild.text_channels, name="entradas")
            if not welcome_channel:
                welcome_channel = await guild.create_text_channel("entradas")
                print(f'✅ Canal #entradas creado.')
            
            # Configurar el servidor para que los mensajes del sistema (bienvenidas) vayan a #entradas
            try:
                await guild.edit(system_channel=welcome_channel)
                print(f'🛡️ Mensajes de bienvenida redirigidos a #entradas.')
            except Exception as e:
                print(f'⚠️ No pude cambiar el canal de sistema automáticamente: {e}')

            # 2. Crear Canal de Voz para Streaming/Reuniones
            meeting_category = discord.utils.get(guild.categories, name="🔊 COMUNICACIÓN")
            if not meeting_category:
                meeting_category = await guild.create_category("🔊 COMUNICACIÓN")

            streaming_channel = discord.utils.get(guild.voice_channels, name="🎥 WAR-ROOM (STREAMING)")
            if not streaming_channel:
                streaming_channel = await guild.create_voice_channel("🎥 WAR-ROOM (STREAMING)", category=meeting_category)
                print(f'✅ Canal de Voz #WAR-ROOM creado.')

            print(f'✨ Configuración de {guild.name} terminada.')

        print("🚀 Todo listo. Cerrando conexión.")
        await self.close()

intents = discord.Intents.all()
bot = ServerSetupBot(intents=intents)
bot.run(TOKEN)
