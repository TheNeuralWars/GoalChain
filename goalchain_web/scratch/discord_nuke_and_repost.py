import discord
import os
import json
import asyncio

TOKEN = "MTUwNDIwNDc3ODEwMjcyMjc1MA.G4cT6l.a3G33fhdtYgXK3CputA8atB3qWYDCGHRCz67Qw"

class NukeAndRepost(discord.Client):
    async def on_ready(self):
        print(f'Logged in as {self.user}')
        for guild in self.guilds:
            dev_channel = discord.utils.get(guild.text_channels, name="dev-room")
            if dev_channel:
                print(f"Borrando TODO el contenido de #{dev_channel.name}...")
                
                # 1. NUKE: Borrado absoluto
                async for message in dev_channel.history(limit=200):
                    try:
                        await message.delete()
                        await asyncio.sleep(0.5) # Respetar rate limit
                    except Exception as e:
                        print(f"Error borrando: {e}")
                
                print("Canal vacío. Iniciando RE-POSTEO OFICIAL V11.0...")

                # 2. RE-POSTEO DE BRIEFING
                briefing = (
                    "## 🛠️ GOALCHAIN TECHNICAL BRIEF: ARCHITECTURE V9.1\n"
                    "Hola equipo. Estándar de producción de los 1,248 NFTs:\n"
                    "*   **Composición:** Base (Foto IA) + Marco (V9.1) + UI Dinámica.\n"
                    "*   **Rarezas:** El CSS tiñe el marco maestro automáticamente (`rarity-mythic`, etc.).\n"
                    "*   **Identidad:** Prohibido usar nombres reales en prompts. Usar ADN Visual."
                )
                await dev_channel.send(briefing)

                # 3. RE-POSTEO DE ACTIVOS
                logo_path = "/Users/NicoPez/GoalChain/docs/assets/img/logo.png"
                frame_path = "/Users/NicoPez/.gemini/antigravity/brain/fe8ffddd-a347-41d5-9726-189f72dcbad6/goalchain_master_template_legendary_v9_1778705457701.png"
                json_path = "/Users/NicoPez/GoalChain/assets/data/nft_master_prompts_100.json"
                
                if os.path.exists(logo_path): await dev_channel.send("⚡ **MASTER LOGO:**", file=discord.File(logo_path))
                if os.path.exists(frame_path): await dev_channel.send("🖼️ **MASTER FRAME V9.1:**", file=discord.File(frame_path))
                if os.path.exists(json_path): await dev_channel.send("📄 **PROMPTS JSON:**", file=discord.File(json_path))

                # 4. RE-POSTEO DE LISTA DE ORO (V11.0)
                with open(json_path, 'r') as f:
                    prompts = json.load(f)
                
                await dev_channel.send("## 🏆 THE GOLDEN 100 - OFFICIAL REGISTRY (V11.0)")
                current_msg = ""
                for p in prompts:
                    if "Star-Parody" not in p['name']:
                        entry = f"**#{p['id']} {p['name']}**: {p['prompt'][:160]}...\n"
                        if len(current_msg) + len(entry) > 1900:
                            await dev_channel.send(current_msg)
                            current_msg = entry
                            await asyncio.sleep(1)
                        else:
                            current_msg += entry
                
                if current_msg: await dev_channel.send(current_msg)
                
                print("Operación completada.")
        await self.close()

bot = NukeAndRepost(intents=discord.Intents.all())
bot.run(TOKEN)
