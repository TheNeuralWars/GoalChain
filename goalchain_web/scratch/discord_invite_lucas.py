import discord
import asyncio

TOKEN = "MTUwNDIwNDc3ODEwMjcyMjc1MA.G4cT6l.a3G33fhdtYgXK3CputA8atB3qWYDCGHRCz67Qw"

class InviteLucasBot(discord.Client):
    async def on_ready(self):
        print(f'🤖 Bot conectado como {self.user}')
        
        for guild in self.guilds:
            print(f'🔍 Buscando en servidor: {guild.name}')
            
            # 1. Encontrar el canal #dev-room
            dev_room = discord.utils.get(guild.text_channels, name="dev-room")
            if not dev_room:
                print(f'⚠️ No encontré el canal #dev-room en {guild.name}')
                continue

            # 2. Buscar a Lucas entre los miembros
            # Intentamos por nombre de usuario o nick
            lucas = None
            for member in guild.members:
                if "lucas" in member.name.lower() or (member.nick and "lucas" in member.nick.lower()):
                    lucas = member
                    break
            
            if lucas:
                # 3. Darle permisos explícitos al canal
                await dev_room.set_permissions(lucas, read_messages=True, send_messages=True)
                print(f'✅ Acceso concedido a Lucas ({lucas.name}) en #dev-room.')
                
                # Enviar un mensaje de bienvenida para que sepa que ya está dentro
                await dev_room.send(f"👋 ¡Bienvenido @{lucas.name} a la **Zona de Desarrollo**! Aquí es donde ocurre la magia de GoalChain.")
            else:
                print(f'❌ No pude encontrar a ningún miembro llamado "Lucas" para invitarlo.')
                print(f'💡 Sugerencia: Asegúrate de que Lucas ya esté unido al servidor.')

        print("🚀 Proceso terminado.")
        await self.close()

# Necesitamos activar el intent de miembros para poder buscarlos
intents = discord.Intents.all()
bot = InviteLucasBot(intents=intents)
bot.run(TOKEN)
