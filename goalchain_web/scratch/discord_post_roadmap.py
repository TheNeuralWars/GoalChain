import discord
import asyncio

TOKEN = "MTUwNDIwNDc3ODEwMjcyMjc1MA.G4cT6l.a3G33fhdtYgXK3CputA8atB3qWYDCGHRCz67Qw"

class RoadmapBot(discord.Client):
    async def on_ready(self):
        print(f'🤖 Bot conectado como {self.user}')
        
        for guild in self.guilds:
            dev_room = discord.utils.get(guild.text_channels, name="dev-room")
            if not dev_room: continue

            # 1. Título y Fase Actual
            msg1 = (
                "# 🚀 GOALCHAIN: THE MASTER LAUNCH PLAN (Roadmap Mundial 2026)\n"
                "Hola equipo, aquí tienen el calendario crítico para los próximos 28 días. @Lucas @NicoPez\n\n"
                "## 🗓️ FASE 1: Base Técnica y Artística (14 - 21 Mayo)\n"
                "*Enfoque: Finalización de assets y blindaje del protocolo.*\n"
                "> 🚨 **16 Mayo:** Lanzamiento oficial del 'Genesis Teaser'.\n"
                "> 🚨 **18 Mayo:** Apertura de la 'Golden Whitelist'.\n"
                "> 🚨 **20 Mayo:** GENERACIÓN FINAL DE LOS 1,248 METADATOS.\n"
                "> 🚨 **21 Mayo:** Auditoría final del Smart Contract."
            )
            await dev_room.send(msg1)

            # 2. Fase 2 y 3
            msg2 = (
                "## 🗓️ FASE 2: La Gran Venta y El Token (22 - 29 Mayo)\n"
                "> 💎 **24 Mayo:** Publicación oficial del 'Economy Paper'.\n"
                "> 💎 **25 Mayo:** **MINT DAY (Genesis Squad 1,248 NFTs).**\n"
                "> 💎 **27 Mayo:** Lanzamiento IDO $GCH (Jupiter/Raydium).\n\n"
                "## 🗓️ FASE 3: Despliegue de Interfaces (30 Mayo - 6 Junio)\n"
                "> 📱 **01 Junio:** Lanzamiento de la App Completa (Mainnet).\n"
                "> 📱 **03 Junio:** Activación del terminal de Drift Protocol.\n"
                "> 📱 **05 Junio:** Lanzamiento del juego de Penales."
            )
            await dev_room.send(msg2)

            # 3. El Kick-off Final
            msg3 = (
                "## 🗓️ FASE 4: EL KICK-OFF (7 - 11 Junio)\n"
                "> 🔥 **09 Junio:** Mega-Sorteo Mythic Player.\n"
                "> 🔥 **10 Junio:** Conexión Oráculos API FIFA (Vía Helius).\n"
                "> 🚀 **11 JUNIO 2026: EVENTO DE LANZAMIENTO MUNDIAL**\n\n"
                "**'En GoalChain, no solo vemos el Mundial. Lo jugamos en la billetera.'** 🏆"
            )
            await dev_room.send(msg3)

            print(f"✅ Roadmap publicado en {guild.name}")

        await self.close()

intents = discord.Intents.all()
bot = RoadmapBot(intents=intents)
bot.run(TOKEN)
