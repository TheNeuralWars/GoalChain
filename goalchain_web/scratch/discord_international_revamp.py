import discord
import os
import asyncio

TOKEN = "MTUwNDIwNDc3ODEwMjcyMjc1MA.G4cT6l.a3G33fhdtYgXK3CputA8atB3qWYDCGHRCz67Qw"

class InternationalRevampBot(discord.Client):
    async def on_ready(self):
        print(f'Logged in as {self.user}')
        for guild in self.guilds:
            # 1. Renombrar Categorías y Canales
            translations = {
                "📢 INFORMACIÓN": "📢 INFORMATION",
                "anuncios": "announcements",
                "reglas": "rules",
                "roadmap": "roadmap",
                "bienvenida": "welcome",
                "🏟️ ESTADIO (General)": "🏟️ THE STADIUM",
                "general": "general-chat",
                "trading": "trading-floor",
                "predicciones": "match-predictions",
                "soporte": "support",
                "💎 ZONA VIP": "💎 VIP LOUNGE",
                "genesis-lounge": "genesis-lounge",
                "alpha-signals": "alpha-signals"
            }
            
            for category in guild.categories:
                if category.name in translations:
                    await category.edit(name=translations[category.name])
            
            for channel in guild.channels:
                if channel.name in translations:
                    await channel.edit(name=translations[channel.name])

            # 2. Mensaje de Bienvenida (#welcome)
            welcome_channel = discord.utils.get(guild.text_channels, name="welcome")
            if welcome_channel:
                await welcome_channel.purge(limit=10) # Limpiar bienvenida vieja
                welcome_msg = (
                    "# ⚽ WELCOME TO GOALCHAIN! ⚽\n"
                    "Greetings, Legend! We are thrilled to have you here.\n\n"
                    "GoalChain is the ultimate **Web3 Football Ecosystem** where your passion for the game meets the power of the blockchain. "
                    "Feel free to explore our channels, meet the community, and take a look at our upcoming NFT collections.\n\n"
                    "### 🧭 Quick Guide:\n"
                    "*   Check <#1504207661338722314> for the latest news.\n"
                    "*   Read <#1504207656355631134> to stay in the game fairly.\n"
                    "*   See our vision in <#1504207661946900603>.\n\n"
                    "We are currently in **active development**, and something big is coming soon. Stay tuned and get ready to play! 🚀"
                )
                await welcome_channel.send(welcome_msg)

            # 3. Mensaje de Roadmap (#roadmap)
            roadmap_channel = discord.utils.get(guild.text_channels, name="roadmap")
            if roadmap_channel:
                await roadmap_channel.purge(limit=10)
                roadmap_msg = (
                    "## 🗺️ GOALCHAIN ROADMAP: THE ROAD TO THE FINALS\n\n"
                    "### 📍 Phase 1: The Foundation (Q1-Q2 2026)\n"
                    "*   ✅ Project Inception & Branding\n"
                    "*   ✅ Smart Contract Architecture (Solana/Anchor)\n"
                    "*   ✅ **Genesis Squad DNA Definition** (100 Legends Parodied)\n"
                    "*   🚧 High-Fidelity NFT Layered System implementation\n\n"
                    "### 🚀 Phase 2: The Kick-Off (Q3 2026)\n"
                    "*   🔥 **Genesis Squad NFT Mint**\n"
                    "*   🪙 Token Generation Event ($GCH)\n"
                    "*   🛒 Official Marketplace Launch\n"
                    "*   🎮 Penalty Mini-game (Play-to-Earn Alpha)\n\n"
                    "### 🏆 Phase 3: World Cup Glory (Q4 2026)\n"
                    "*   ⚡ **Live Oracle Integration** (Real-time stat updates)\n"
                    "*   ⚽ Global Betting Pools Opening\n"
                    "*   📈 Dynamic Rarity Evolution System\n"
                    "*   🌍 Partnership expansions with World Cup stars\n\n"
                    "--- \n*The future of football is decentralized.*"
                )
                await roadmap_channel.send(roadmap_msg)
                
        print("Revamp completado con éxito.")
        await self.close()

bot = InternationalRevampBot(intents=discord.Intents.all())
bot.run(TOKEN)
