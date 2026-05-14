import discord
import os

TOKEN = "MTUwNDIwNDc3ODEwMjcyMjc1MA.G4cT6l.a3G33fhdtYgXK3CputA8atB3qWYDCGHRCz67Qw"

class BlueprintBot(discord.Client):
    async def on_ready(self):
        print(f'🤖 Bot conectado como {self.user}')
        
        for guild in self.guilds:
            dev_room = discord.utils.get(guild.text_channels, name="dev-room")
            if not dev_room: continue

            # 1. Mensaje sobre el Chasis Crudo
            msg = (
                "### 🦴 ESTRUCTURA MAESTRA: CHASIS V13.0 (RAW)\n"
                "Aquí pueden ver el marco técnico sin fondos. Observen las perforaciones biseladas y la retícula de stats lista para la inyección de datos."
            )
            await dev_room.send(msg)
            
            # Subir el Chasis (Usamos el render GCH_001 que es el más técnico)
            chassis_path = "/Users/NicoPez/GoalChain/assets/final_renders/GCH_001_render.png"
            if os.path.exists(chassis_path):
                await dev_room.send(file=discord.File(chassis_path))

            # 2. Mensaje sobre las Variantes de Estadios
            msg_bg = (
                "### 🏟️ MUESTRARIO DE ESTADIOS NEURONALES (Individuales)\n"
                "Estas son las bases sobre las que se apoya el chasis. Perspectiva baja para mayor escala."
            )
            await dev_room.send(msg_bg)

            # Subir fondos individuales
            bgs = [
                "/Users/NicoPez/GoalChain/assets/rarity_backgrounds/gold_1.png",
                "/Users/NicoPez/GoalChain/assets/rarity_backgrounds/diamond_1.png",
                "/Users/NicoPez/GoalChain/assets/rarity_backgrounds/steel_1.png"
            ]
            for bg_path in bgs:
                if os.path.exists(bg_path):
                    await dev_room.send(file=discord.File(bg_path))

            print(f"✅ Blueprint y Fondos enviados a {guild.name}")

        await self.close()

intents = discord.Intents.all()
bot = BlueprintBot(intents=intents)
bot.run(TOKEN)
