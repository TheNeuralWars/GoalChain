import discord
import os
import asyncio

TOKEN = "MTUwNDIwNDc3ODEwMjcyMjc1MA.G4cT6l.a3G33fhdtYgXK3CputA8atB3qWYDCGHRCz67Qw"

class DevChannelBot(discord.Client):
    async def on_ready(self):
        print(f'Logged in as {self.user}')
        for guild in self.guilds:
            # 1. Crear categoría DEV si no existe
            category = discord.utils.get(guild.categories, name="🛠️ DESARROLLO")
            if not category:
                category = await guild.create_category("🛠️ DESARROLLO")
            
            # 2. Crear canal privado
            overwrites = {
                guild.default_role: discord.PermissionOverwrite(read_messages=False),
                guild.me: discord.PermissionOverwrite(read_messages=True)
            }
            # Intentar encontrar roles de admin o dev para darles acceso
            dev_role = discord.utils.get(guild.roles, name="Developer")
            admin_role = discord.utils.get(guild.roles, name="Admin")
            if dev_role: overwrites[dev_role] = discord.PermissionOverwrite(read_messages=True)
            if admin_role: overwrites[admin_role] = discord.PermissionOverwrite(read_messages=True)

            dev_channel = discord.utils.get(guild.text_channels, name="dev-room")
            if not dev_channel:
                dev_channel = await guild.create_text_channel("dev-room", category=category, overwrites=overwrites)
            
            # 3. Mandar el mensaje técnico detallado
            msg = (
                "## 🛠️ GOALCHAIN TECHNICAL BRIEF: ARCHITECTURE V9.1 (Lucas & Team)\n\n"
                "Hola equipo. Hemos estandarizado la producción de los 1,248 NFTs para garantizar calidad industrial y seguridad legal.\n\n"
                "### 1. Sistema de Capas Dinámicas (Layered Composition)\n"
                "Ya no generamos el cromo completo con IA. Ahora la web compone el NFT en tiempo real usando 3 capas:\n"
                "*   **Capa Base:** Fotografía hiperrealista del jugador (generada con los nuevos prompts de ADN Visual).\n"
                "*   **Capa Marco:** Archivo estático `master_frame_v9.png` (basado en el estilo Phil Fod-Ether).\n"
                "*   **Capa UI:** Texto (Nombre, Stats) y Logo oficial de neón generados por código.\n\n"
                "### 2. ADN Visual (Registro de 100 Prompts)\n"
                "Para evitar bloqueos de copyright y caricaturización, hemos creado un registro de rasgos físicos detallados. "
                "Los prompts ya no mencionan nombres reales ni marcas, sino rasgos físicos exactos (ej: 'coleta rubia', 'barba recortada').\n\n"
                "### 3. Evolución de Rareza por Código\n"
                "La rareza ya no está 'pegada' a la imagen. El CSS ahora 'tiñe' el marco maestro automáticamente:\n"
                "- `rarity-Mythic`: Plata/Glow Blanco.\n"
                "- `rarity-Legendary`: Oro líquido.\n"
                "- `rarity-Epic`: Neón Púrpura.\n\n"
                "**Beneficio:** Podemos subir de nivel a un jugador durante el Mundial simplemente cambiando una línea en el JSON.\n\n"
                "CC: @Lucas @Admin"
            )
            
            await dev_channel.send(msg)
            print(f'Canal #dev-room creado y mensaje enviado en {guild.name}')

        await self.close()

bot = DevChannelBot(intents=discord.Intents.all())
bot.run(TOKEN)
