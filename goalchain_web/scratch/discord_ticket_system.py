import discord
from discord import app_commands
import os

TOKEN = "MTUwNDIwNDc3ODEwMjcyMjc1MA.G4cT6l.a3G33fhdtYgXK3CputA8atB3qWYDCGHRCz67Qw"

class TicketView(discord.ui.View):
    def __init__(self):
        super().__init__(timeout=None)

    @discord.ui.button(label="📩 Submit Wallet", style=discord.ButtonStyle.green, custom_id="ticket_wallet")
    async def wallet_button(self, interaction: discord.Interaction, button: discord.ui.Button):
        await self.create_ticket(interaction, "wallet")

    @discord.ui.button(label="🤝 Collaboration", style=discord.ButtonStyle.blurple, custom_id="ticket_collab")
    async def collab_button(self, interaction: discord.Interaction, button: discord.ui.Button):
        await self.create_ticket(interaction, "collab")

    async def create_ticket(self, interaction: discord.Interaction, type: str):
        guild = interaction.guild
        category = discord.utils.get(guild.categories, name="🎫 TICKETS")
        if not category:
            category = await guild.create_category("🎫 TICKETS")

        # Crear canal privado
        overwrites = {
            guild.default_role: discord.PermissionOverwrite(read_messages=False),
            interaction.user: discord.PermissionOverwrite(read_messages=True, send_messages=True),
            guild.me: discord.PermissionOverwrite(read_messages=True, send_messages=True)
        }
        
        channel_name = f"ticket-{type}-{interaction.user.name}"
        channel = await guild.create_text_channel(channel_name, category=category, overwrites=overwrites)
        
        await interaction.response.send_message(f"Ticket created! Head over to {channel.mention}", ephemeral=True)
        
        # Mensaje inicial en el ticket
        embed = discord.Embed(
            title=f"New {type.capitalize()} Ticket",
            description=f"Hello {interaction.user.mention}! \n\nPlease provide your information here. A member of the GoalChain team will assist you soon.",
            color=0x00ffa3
        )
        await channel.send(embed=embed)

class GoalChainBot(discord.Client):
    def __init__(self):
        super().__init__(intents=discord.Intents.all())

    async def on_ready(self):
        print(f'Logged in as {self.user}')
        for guild in self.guilds:
            # Crear canal de apertura de tickets
            support_cat = discord.utils.get(guild.categories, name="📢 INFORMATION")
            ticket_channel = discord.utils.get(guild.text_channels, name="open-a-ticket")
            if not ticket_channel:
                ticket_channel = await guild.create_text_channel("open-a-ticket", category=support_cat)
            
            await ticket_channel.purge(limit=10)
            
            embed = discord.Embed(
                title="🎫 GoalChain Support & Collabs",
                description=(
                    "Need assistance? Want to share your wallet for a prize? Or maybe you're a creator looking to collaborate?\n\n"
                    "Click the buttons below to open a **private ticket** with the GoalChain team."
                ),
                color=0x00ffa3
            )
            embed.set_footer(text="The future of football is decentralized.")
            
            await ticket_channel.send(embed=embed, view=TicketView())
            print("Sistema de tickets desplegado y activo.")
        
        # Bot stays running to handle interactions

bot = GoalChainBot()
bot.run(TOKEN)
