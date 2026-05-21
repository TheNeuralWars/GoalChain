import discord
import os

TOKEN = "MTUwNDIwNDc3ODEwMjcyMjc1MA.G4cT6l.a3G33fhdtYgXK3CputA8atB3qWYDCGHRCz67Qw"

class BriefingBot(discord.Client):
    async def on_ready(self):
        print(f'🤖 Bot conectado como {self.user}')
        
        for guild in self.guilds:
            dev_room = discord.utils.get(guild.text_channels, name="dev-room")
            if not dev_room: continue

            # 1. Mensaje de Texto Principal
            header = (
                "## 🧬 GOALCHAIN UPDATE: MOTOR DE GENERACIÓN V13.0\n"
                "Hola @Lucas, hemos culminado la arquitectura técnica para la producción de la **Genesis Squad**.\n\n"
                "### 🛠️ Avances Técnicos Clave:\n"
                "*   **Chasis Perforado V13:** Hemos pasado de bordes redondeados a **biselado técnico (Chamfered)** a 45°. Look industrial y agresivo.\n"
                "*   **Auto-Centering Engine:** Las 12 stats ahora se posicionan automáticamente en los 4 paneles usando anclajes matemáticos. Cero errores de alineación.\n"
                "*   **Estadios Neuronales:** Sistema de fondos dinámicos (5 variantes por rareza) con perspectiva a ras de suelo para que el jugador tenga 'presencia'.\n"
                "*   **Tinte de Rareza:** El código ahora aplica un 'baño de color' translúcido al marco metálico según la rareza (Oro, Diamante, Acero).\n\n"
                "### 🖼️ Renders de Calidad de Producción:"
            )
            
            await dev_room.send(header)

            # 2. Subir las imágenes de prueba
            renders = [
                "/Users/NicoPez/GoalChain/assets/final_renders/GCH_STADIUM_GOLD_render.png",
                "/Users/NicoPez/GoalChain/assets/final_renders/GCH_STADIUM_DIAMOND_render.png"
            ]
            
            for path in renders:
                if os.path.exists(path):
                    file = discord.File(path)
                    await dev_room.send(file=file)
                else:
                    print(f"⚠️ No encontré la imagen en {path}")

            footer = (
                "--- \n"
                "💡 **Estado:** Listos para la inyección de los 1,248 jugadores.\n"
                "CC: @NicoPez"
            )
            await dev_room.send(footer)
            print(f"✅ Briefing enviado con éxito a {guild.name}")

        await self.close()

intents = discord.Intents.all()
bot = BriefingBot(intents=intents)
bot.run(TOKEN)
