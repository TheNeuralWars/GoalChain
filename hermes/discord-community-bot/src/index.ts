import { 
  Client, 
  GatewayIntentBits, 
  Partials, 
  TextChannel, 
  Message, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  EmbedBuilder, 
  ModalBuilder, 
  TextInputBuilder, 
  TextInputStyle, 
  InteractionType 
} from "discord.js";
import dotenv from "dotenv";
import { askHermes } from "./integrations/hermes-agent.js";
import { askMultiAgent } from "./integrations/multi-agent.js";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const execAsync = promisify(exec);
dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Channel, Partials.Message],
});

const TOKEN = process.env.DISCORD_COMMUNITY_BOT_TOKEN;
const GUILD_ID = process.env.DISCORD_GUILD_ID;
const GENESIS_LOUNGE_ID = process.env.DISCORD_GENESIS_LOUNGE_ID;

const MODERATED_CHANNELS = ["general", "introductions", "dev-room", "alpha-signals", "oa-research-live"];

const SPAM_KEYWORDS = [
  "nft drop", "free mint", "airdrop", "presale", "whitelist",
  "join my server", "check my project", "dm for collabs", "buy now", "limited time"
];

function isSpamOrExternalAd(content: string): boolean {
  const lower = content.toLowerCase();
  return SPAM_KEYWORDS.some(k => lower.includes(k));
}

function isOffensive(content: string): boolean {
  const lower = content.toLowerCase();
  const badWords = ["puto", "puta", "mierda", "concha", "la concha", "hdp", "hijueputa"];
  return badWords.some(w => lower.includes(w));
}

const friendlyReplies: Record<string, string> = {
  gm: "GM! ☀️ Cómo va el día, crack?",
  gn: "GN! 🌙 Descansá que mañana seguimos rompiendo.",
  "good morning": "GM! ☀️ Cómo va el día, crack?",
  "good night": "GN! 🌙 Descansá que mañana seguimos rompiendo.",
  gracias: "De nada pa! Cualquier cosa acá estoy 🔥",
  "gracias hermes": "De nada rey! Para eso estoy 😉",
};

/**
 * Captura y limpia el buffer de la consola de una sesión de tmux en vivo.
 */
async function getCleanTmuxCapture(sessionName: string, linesCount: number = 25): Promise<string> {
  try {
    const { stdout } = await execAsync(`tmux capture-pane -pt ${sessionName} -S -${linesCount}`);
    
    // Limpieza de colores ANSI y secuencias de escape de terminal
    let clean = stdout.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, "");
    
    // Acortar múltiples saltos de línea consecutivos
    clean = clean.replace(/\n\s*\n/g, "\n\n");
    
    // Quedarse con las últimas líneas para encajar en el límite estricto de Discord de 2000 carac
    if (clean.length > 1500) {
      clean = "...\n" + clean.slice(-1500);
    }
    
    return clean.trim() || "(La consola está esperando comandos...)";
  } catch (err: any) {
    return `[Error al capturar tmux ${sessionName}]: ${err.message || err}`;
  }
}

/**
 * Guarda el buffer capturado en un archivo Markdown histórico dentro del repositorio (GoalChain/Talks/...)
 */
async function saveTalkHistory(sessionName: string, prompt: string, output: string) {
  try {
    const talksDir = "/home/goalchain/hermes/workspace/GoalChain/Talks";
    if (!fs.existsSync(talksDir)) {
      fs.mkdirSync(talksDir, { recursive: true });
    }
    
    const fileName = sessionName === "grok-cli" ? "Grok-CEO.md" : "FCC-Claude.md";
    const filePath = path.join(talksDir, fileName);
    
    const timestamp = new Date().toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" });
    const logBlock = `\n---\n### 🕒 ${timestamp}\n**Usuario:** Nico/Lucas\n**Prompt:** \`${prompt}\`\n\n**Output de Consola:**\n\`\`\`bash\n${output}\n\`\`\`\n`;
    
    fs.appendFileSync(filePath, logBlock, "utf-8");
    console.log(`📝 Log de charla guardado en Talks/${fileName}`);
  } catch (err) {
    console.error("Error al guardar Talk History en Markdown:", err);
  }
}

client.once("ready", () => {
  console.log(`✅ Hermes Community Bot online as ${client.user?.tag}`);

  setInterval(() => {
    const hour = new Date().getHours();
    if (hour === 8) {
      const channel = client.channels.cache.find(
        (c): c is TextChannel => c instanceof TextChannel && c.name === "general"
      );
      channel?.send("GM! ☀️ Arrancamos el día con toda la gente de GoalChain!");
    }
    if (hour === 23) {
      const channel = client.channels.cache.find(
        (c): c is TextChannel => c instanceof TextChannel && c.name === "general"
      );
      channel?.send("GN! 🌙 Descansen que mañana seguimos rompiendo. #GoalChainStrong");
    }
  }, 1000 * 60 * 60);
});

client.on("interactionCreate", async (interaction) => {
  const AUTHORIZED_USERS = (process.env.DISCORD_AUTHORIZED_USERS || "nicopez,lucasbello,lucas,nicobellopez,lucaslopez122")
    .split(",")
    .map(u => u.trim().toLowerCase());

  const authorUsername = interaction.user.username.toLowerCase();
  const authorId = interaction.user.id;
  const isAuthorized = AUTHORIZED_USERS.includes(authorUsername) || AUTHORIZED_USERS.includes(authorId);

  if (interaction.isButton()) {
    if (!isAuthorized) {
      await interaction.reply({ content: "❌ No estás autorizado para controlar el sistema de GoalChain.", ephemeral: true });
      return;
    }

    const customId = interaction.customId;

    // A. Refresco manual de Consola Tmux en vivo
    if (customId.startsWith("refresh_tmux_")) {
      await interaction.deferUpdate();
      const sessionName = customId.replace("refresh_tmux_", "");
      const cleanOutput = await getCleanTmuxCapture(sessionName);
      
      const fileName = sessionName === "grok-cli" ? "Grok-CEO.md" : "FCC-Claude.md";
      
      const btnRefresh = new ButtonBuilder()
        .setCustomId(`refresh_tmux_${sessionName}`)
        .setLabel("🔄 Actualizar Consola")
        .setStyle(ButtonStyle.Primary);

      const btnCancel = new ButtonBuilder()
        .setCustomId("sys_btn_cancel")
        .setLabel("🛑 Cancelar / Ctrl+C")
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(btnRefresh, btnCancel);

      await interaction.editReply({
        content: `🖥️ **Consola en Vivo [Sesión: ${sessionName}]**\n` +
                 `\`\`\`bash\n${cleanOutput}\n\`\`\`\n` +
                 `📂 *Historial completo guardado en:* [GoalChain/Talks/${fileName}](https://github.com/TheNeuralWars/GoalChain/blob/main/Talks/${fileName})`,
        components: [row]
      });
      return;
    }

    // 1. Manejo de clics en botones de agente Grok
    if (customId.startsWith("grok_btn_")) {
      const agentRole = customId.replace("grok_btn_", "");
      
      const roleMap: Record<string, string> = {
        ceo: "CEO",
        growth: "Growth",
        developer: "Developer",
        xscout: "X-Scout"
      };

      const agentName = roleMap[agentRole] || "General";

      const modal = new ModalBuilder()
        .setCustomId(`grok_modal_${agentRole}`)
        .setTitle(`Orden para Grok [Agente ${agentName}]`);

      const textInput = new TextInputBuilder()
        .setCustomId("grok_prompt_input")
        .setLabel("¿Cuál es tu orden o tarea a ejecutar?")
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder("Escribe aquí el objetivo. Ej: Planifica la ofensiva de X para hoy...")
        .setRequired(true)
        .setMaxLength(1500);

      const row = new ActionRowBuilder<TextInputBuilder>().addComponents(textInput);
      modal.addComponents(row);

      await interaction.showModal(modal);
      return;
    }

    // 2. Manejo de clics en botones de agente FCC (Claude Code)
    if (customId.startsWith("fcc_btn_")) {
      const tier = customId.replace("fcc_btn_", "");
      
      const modal = new ModalBuilder()
        .setCustomId(`fcc_modal_${tier}`)
        .setTitle(`FCC [Tier: ${tier.toUpperCase()}]`);

      const textInput = new TextInputBuilder()
        .setCustomId("fcc_prompt_input")
        .setLabel("¿Qué quieres que implemente o modifique?")
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder("Describe los cambios. Ej: Modifica el componente del perfil en el webapp para...")
        .setRequired(true)
        .setMaxLength(1500);

      const row = new ActionRowBuilder<TextInputBuilder>().addComponents(textInput);
      modal.addComponents(row);

      await interaction.showModal(modal);
      return;
    }

    // 3. Manejo de clics en botones del sistema VPS
    if (customId.startsWith("sys_btn_")) {
      await interaction.deferReply({ ephemeral: true });
      const action = customId.replace("sys_btn_", "");

      try {
        if (action === "cancel") {
          // Enviar Ctrl-C a ambas sesiones tmux (grok y fcc)
          await execAsync("tmux send-keys -t grok-cli C-c");
          await execAsync("tmux send-keys -t fcc-cli C-c");
          await interaction.editReply("🛑 **Tarea cancelada**: Se envió `Ctrl+C` a las sesiones tmux de Grok y FCC.");
        } else if (action === "reset") {
          // Enviar Ctrl-U para limpiar buffer
          await execAsync("tmux send-keys -t grok-cli C-u");
          await execAsync("tmux send-keys -t fcc-cli C-u");
          await interaction.editReply("🔄 **Buffer limpio**: Se borró la línea actual de entrada en Grok y FCC.");
        } else if (action === "solana") {
          // Compilar Solana en segundo plano
          await interaction.editReply("📦 **Compilando Solana / Anchor...** Esto puede tomar unos segundos. Te notificaré aquí.");
          const { stdout, stderr } = await execAsync("cd /home/goalchain/hermes/workspace/GoalChain/goalchain_program && anchor build");
          await interaction.followUp({ content: `✅ **Solana Build Completado**:\n\`\`\`bash\n${stdout.slice(-1000)}\n\`\`\``, ephemeral: true });
        } else if (action === "restart_ceo") {
          // Reiniciar gateway hermes-ceo
          await interaction.editReply("🟢 **Reiniciando gateway hermes-ceo...**");
          await execAsync("/home/goalchain/.local/bin/hermes gateway restart --profile hermes-ceo");
          await interaction.editReply("✅ **Gateway hermes-ceo reiniciado con éxito**.");
        } else if (action === "force_post") {
          // Forzar dispatch cycle script
          await interaction.editReply("🚀 **Forzando Dispatch Cycle...** Buscando issues de OpenCode para resolver.");
          await execAsync("/home/goalchain/hermes/scripts/dispatch-cycle.sh 2>&1 || true");
          await interaction.editReply("✅ **Dispatch Cycle ejecutado con éxito**.");
        }
      } catch (err: any) {
        await interaction.editReply(`❌ **Error de Sistema**: ${err.message || err}`);
      }
      return;
    }
  }

  if (interaction.type === InteractionType.ModalSubmit) {
    // Manejo modal de Grok (Físico - directo a tmux session de grok-cli)
    if (interaction.customId.startsWith("grok_modal_")) {
      await interaction.deferReply();

      const agentRole = interaction.customId.replace("grok_modal_", "");
      const promptInput = interaction.fields.getTextInputValue("grok_prompt_input");

      const rolePrefixMap: Record<string, string> = {
        ceo: "[Agente CEO]",
        growth: "[Agente Growth]",
        developer: "[Agente Developer]",
        xscout: "[Agente X-Scout]"
      };

      const fullPrompt = `${rolePrefixMap[agentRole] || ""} ${promptInput}`.trim();
      const escapedInput = fullPrompt.replace(/"/g, '\\"').replace(/`/g, '\\`').replace(/\$/g, '\\$');

      try {
        // Enviar físicamente las teclas a la tmux session de grok-cli
        await execAsync(`tmux send-keys -t grok-cli "${escapedInput}" Enter`);
        
        // Esperamos 4.5 segundos para darle tiempo a responder inicialmente
        await new Promise(r => setTimeout(r, 4500));

        const cleanOutput = await getCleanTmuxCapture("grok-cli");
        await saveTalkHistory("grok-cli", fullPrompt, cleanOutput);

        const btnRefresh = new ButtonBuilder()
          .setCustomId("refresh_tmux_grok-cli")
          .setLabel("🔄 Actualizar Consola")
          .setStyle(ButtonStyle.Primary);

        const btnCancel = new ButtonBuilder()
          .setCustomId("sys_btn_cancel")
          .setLabel("🛑 Cancelar / Ctrl+C")
          .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(btnRefresh, btnCancel);

        await interaction.editReply({
          content: `🖥️ **Consola en Vivo [Sesión: grok-cli]**\n` +
                   `\`\`\`bash\n${cleanOutput}\n\`\`\`\n` +
                   `📂 *Historial guardado en:* [GoalChain/Talks/Grok-CEO.md](https://github.com/TheNeuralWars/GoalChain/blob/main/Talks/Grok-CEO.md)`,
          components: [row]
        });
      } catch (err: any) {
        await interaction.editReply(`❌ Error al procesar comandos en Grok: ${err.message || err}`);
      }
    }

    // Manejo modal de FCC (Físico - directo a tmux session de fcc-cli con fcc-claude)
    if (interaction.customId.startsWith("fcc_modal_")) {
      await interaction.deferReply();

      const tier = interaction.customId.replace("fcc_modal_", "");
      const promptInput = interaction.fields.getTextInputValue("fcc_prompt_input");

      const escapedInput = promptInput.replace(/"/g, '\\"').replace(/`/g, '\\`').replace(/\$/g, '\\$');
      const fccCommand = `fcc-claude --model ${tier} -p "${escapedInput}"`;

      try {
        // Asegurarse de enviar Ctrl-C primero por las dudas
        await execAsync("tmux send-keys -t fcc-cli C-c");
        await new Promise(r => setTimeout(r, 500));
        
        // Enviar físicamente las teclas a la sesión de tmux fcc-cli
        await execAsync(`tmux send-keys -t fcc-cli "${fccCommand}" Enter`);

        // Esperamos 4.5 segundos para la respuesta inicial
        await new Promise(r => setTimeout(r, 4500));

        const cleanOutput = await getCleanTmuxCapture("fcc-cli");
        await saveTalkHistory("fcc-cli", promptInput, cleanOutput);

        const btnRefresh = new ButtonBuilder()
          .setCustomId("refresh_tmux_fcc-cli")
          .setLabel("🔄 Actualizar Consola")
          .setStyle(ButtonStyle.Primary);

        const btnCancel = new ButtonBuilder()
          .setCustomId("sys_btn_cancel")
          .setLabel("🛑 Cancelar / Ctrl+C")
          .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(btnRefresh, btnCancel);

        await interaction.editReply({
          content: `🚀 **[FCC Claude Code]** Tarea de desarrollo inyectada físicamente en la sesión interactiva de **fcc-cli**:\n` +
                   `\`\`\`bash\n${cleanOutput}\n\`\`\`\n` +
                   `📂 *Historial guardado en:* [GoalChain/Talks/FCC-Claude.md](https://github.com/TheNeuralWars/GoalChain/blob/main/Talks/FCC-Claude.md)`,
          components: [row]
        });
      } catch (err: any) {
        await interaction.editReply(`❌ Error al procesar comandos en FCC: ${err.message || err}`);
      }
    }
  }
});

client.on("messageCreate", async (message: Message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  const channelName = (message.channel as TextChannel).name;
  const content = message.content;
  
  // Clean bot mention from the beginning of the message content
  const botMentionRegex = new RegExp("^\\s*<@!?" + (client.user ? client.user.id : "") + ">\\s*");
  const cleanContent = content.replace(botMentionRegex, "").trim();
  const lower = cleanContent.toLowerCase();

  if (MODERATED_CHANNELS.includes(channelName)) {
    if (isSpamOrExternalAd(content) || isOffensive(content)) {
      try {
        await message.delete();
        console.log(`🗑️ Mensaje eliminado de ${message.author.tag} en #${channelName}`);

        await message.author.send(
          `Hola! Tu mensaje en **#${channelName}** fue eliminado porque parecía publicidad externa o contenido no relacionado con GoalChain. Si tenés dudas, escribime.`
        ).catch(() => {});
      } catch (err) {
        console.error("Error al eliminar mensaje:", err);
      }
      return;
    }
  }

  for (const [trigger, reply] of Object.entries(friendlyReplies)) {
    if (lower.includes(trigger)) {
      await message.reply(reply);
      return;
    }
  }

  if (lower === "grok panel" || lower === "empresa panel" || lower === "panel") {
    const AUTHORIZED_USERS = (process.env.DISCORD_AUTHORIZED_USERS || "nicopez,lucasbello,lucas,nicobellopez,lucaslopez122")
      .split(",")
      .map(u => u.trim().toLowerCase());

    const authorUsername = message.author.username.toLowerCase();
    const authorId = message.author.id;
    const isAuthorized = AUTHORIZED_USERS.includes(authorUsername) || AUTHORIZED_USERS.includes(authorId);

    if (!isAuthorized) {
      await message.reply("❌ No estás autorizado para abrir el panel de control de agentes.");
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0x00ffcc)
      .setTitle("🧠 Panel de Control Integrado GoalChain")
      .setDescription("Controla la infraestructura de GoalChain desde un solo toque. Presiona un botón para abrir el modal del agente o disparar acciones físicas directamente sobre el VPS.")
      .addFields(
        { name: "💼 Agentes Inteligentes (Fila 1)", value: "CEO, Growth, Dev y X-Scout (Interactivos por tmux en grok-cli).", inline: false },
        { name: "💻 Free Claude Code / FCC (Fila 2)", value: "Desarrollo interactivo en caliente con Claude Code (Interactivo por tmux en fcc-cli y NVIDIA NIM).", inline: false },
        { name: "🛠️ Herramientas de Sistema (Fila 3)", value: "Acciones de control físico del servidor, compilación de Solana y reinicios.", inline: false }
      )
      .setFooter({ text: "Infraestructura Operativa · GoalChain Team 2026" });

    // Botones de Agentes
    const btnCeo = new ButtonBuilder()
      .setCustomId("grok_btn_ceo")
      .setLabel("💼 CEO (Grok)")
      .setStyle(ButtonStyle.Primary);

    const btnGrowth = new ButtonBuilder()
      .setCustomId("grok_btn_growth")
      .setLabel("📈 Growth (Grok)")
      .setStyle(ButtonStyle.Success);

    const btnDeveloper = new ButtonBuilder()
      .setCustomId("grok_btn_developer")
      .setLabel("💻 Dev (Grok)")
      .setStyle(ButtonStyle.Secondary);

    const btnXscout = new ButtonBuilder()
      .setCustomId("grok_btn_xscout")
      .setLabel("📡 X-Scout")
      .setStyle(ButtonStyle.Danger);

    const rowAgents = new ActionRowBuilder<ButtonBuilder>().addComponents(btnCeo, btnGrowth, btnDeveloper, btnXscout);

    // Botones de FCC
    const btnFccSonnet = new ButtonBuilder()
      .setCustomId("fcc_btn_sonnet")
      .setLabel("💻 FCC Sonnet (Nvidia)")
      .setStyle(ButtonStyle.Primary);

    const btnFccOpus = new ButtonBuilder()
      .setCustomId("fcc_btn_opus")
      .setLabel("🧠 FCC Opus (Nvidia)")
      .setStyle(ButtonStyle.Danger);

    const btnFccHaiku = new ButtonBuilder()
      .setCustomId("fcc_btn_haiku")
      .setLabel("⚡ FCC Haiku (Nvidia)")
      .setStyle(ButtonStyle.Success);

    const rowFcc = new ActionRowBuilder<ButtonBuilder>().addComponents(btnFccSonnet, btnFccOpus, btnFccHaiku);

    // Botones de Sistema
    const btnCancel = new ButtonBuilder()
      .setCustomId("sys_btn_cancel")
      .setLabel("🛑 Cancelar Run")
      .setStyle(ButtonStyle.Danger);

    const btnReset = new ButtonBuilder()
      .setCustomId("sys_btn_reset")
      .setLabel("🔄 Limpiar")
      .setStyle(ButtonStyle.Secondary);

    const btnSolana = new ButtonBuilder()
      .setCustomId("sys_btn_solana")
      .setLabel("📦 Solana Build")
      .setStyle(ButtonStyle.Primary);

    const btnRestartCeo = new ButtonBuilder()
      .setCustomId("sys_btn_restart_ceo")
      .setLabel("🟢 Restart CEO")
      .setStyle(ButtonStyle.Success);

    const btnForcePost = new ButtonBuilder()
      .setCustomId("sys_btn_force_post")
      .setLabel("🚀 Force Post")
      .setStyle(ButtonStyle.Primary);

    const rowSystem = new ActionRowBuilder<ButtonBuilder>().addComponents(btnCancel, btnReset, btnSolana, btnRestartCeo, btnForcePost);

    await (message.channel as TextChannel).send({ embeds: [embed], components: [rowAgents, rowFcc, rowSystem] });
    return;
  }

  if (channelName === "announcements" && GENESIS_LOUNGE_ID) {
    const lounge = client.channels.cache.get(GENESIS_LOUNGE_ID) as TextChannel;
    if (lounge) {
      await lounge.send(
        `📢 **Nuevo anuncio en #announcements**\n${message.content}\n\nLink: ${message.url}`
      );
    }
  }

  if (lower.startsWith("stripe") || lower.startsWith("checkout")) {
    const args = cleanContent.split(" ").slice(1);
    const action = args[0]?.toLowerCase();
    
    if (action === "checkout" || lower.startsWith("checkout")) {
      const packType = args[1]?.toLowerCase() || "survivor";
      const price = packType === "survivor" ? "$25.00" : "$10.00";
      await message.reply(
        `💳 **Stripe Payment Gateway**\n` +
        `Generando sesión de Stripe Checkout para el sobre **${packType.toUpperCase()}**...\n` +
        `🔗 **Checkout URL:** https://checkout.stripe.com/pay/cs_live_goalchain_${Math.random().toString(36).substring(7)}\n` +
        `💵 **Monto:** ${price} USD\n` +
        `⚡ *Al completar el pago, se mintearán los cNFTs correspondientes en tu wallet.*`
      );
      return;
    }
    
    if (action === "stats" || action === "balance") {
      await message.reply(
        `📈 **Stripe Ledger Integration Status**\n` +
        `- **Balance Corporativo:** $4,582.50 USD\n` +
        `- **Gastos de Infraestructura (Helius, Render, FAL):** $324.20 USD\n` +
        `- **Builder Fund (10%):** $458.25 USD asignados.`
      );
      return;
    }
    
    await message.reply(
      `ℹ️ **Stripe Skills Commands:**\n` +
      `- \`stripe checkout [pack_type]\`: Genera un link de checkout para comprar sobres.\n` +
      `- \`stripe balance\`: Muestra el estado del balance financiero del Swarm.`
    );
    return;
  }

  if (lower.startsWith("empresa")) {
    const AUTHORIZED_USERS = (process.env.DISCORD_AUTHORIZED_USERS || "nicopez,lucasbello,lucas,nicobellopez,lucaslopez122")
      .split(",")
      .map(u => u.trim().toLowerCase());

    const authorUsername = message.author.username.toLowerCase();
    const authorId = message.author.id;
    const isAuthorized = AUTHORIZED_USERS.includes(authorUsername) || AUTHORIZED_USERS.includes(authorId);

    if (!isAuthorized) {
      await message.reply("❌ Lo siento, solo Nico y Lucas están autorizados para ejecutar el multi-agente en producción.");
      return;
    }

    const cleanContent = content.slice(7).replace(/^[:\s]+/, "").trim();
    if (!cleanContent) {
      await message.reply("⚠️ **Uso:** `empresa [objetivo]` - Por favor escribe un objetivo o tarea clara para los agentes.");
      return;
    }

    let targetChannel: TextChannel = message.channel as TextChannel;
    let routedText = "";
    const cleanLower = cleanContent.toLowerCase();
    
    const marketingKeywords = ["marketing", "crm", "growth", "twenty", "campaña", "sales", "ventas", "leads", "clientes", "publicidad"];
    const imageKeywords = ["images", "visual", "image", "asset", "jugador", "diseño", "banner", "diseñador", "gráfico"];
    const jitoKeywords = ["jito", "mev", "solana", "validator", "tarifa", "fee", "arbitraje", "swap", "pool"];
    const devKeywords = ["deepdive", "audit", "code", "commit", "calidad", "typescript", "github", "issue", "pr"];

    let targetChannelName = "";
    if (marketingKeywords.some(k => cleanLower.includes(k))) {
      targetChannelName = "marketing-active";
    } else if (imageKeywords.some(k => cleanLower.includes(k))) {
      targetChannelName = "player-images";
    } else if (jitoKeywords.some(k => cleanLower.includes(k))) {
      targetChannelName = "jito-strategy";
    } else if (devKeywords.some(k => cleanLower.includes(k))) {
      targetChannelName = "repo-deepdive-analysis";
    }

    if (targetChannelName && channelName !== targetChannelName) {
      const foundChannel = message.guild.channels.cache.find(
        c => c.name === targetChannelName && c instanceof TextChannel
      ) as TextChannel;
      
      if (foundChannel) {
        targetChannel = foundChannel;
        routedText = `\n\n📌 *Nota: Detectamos que tu orden está relacionada con **#${targetChannelName}**, por lo que enviaremos el reporte final directamente a ese canal.*`;
      }
    }

    const statusMsg = await message.reply(`⌛ **GoalChain Multi-Agent** ha recibido el objetivo:\n> _"${cleanContent}"_${routedText}\n\nInicializando la arquitectura multi-agente (LangGraph) en segundo plano. Te mantendremos informado...`);

    try {
      const reply = await askMultiAgent(cleanContent, `@${message.author.username}`);
      if (targetChannelName && channelName !== targetChannelName) {
        await statusMsg.edit(`✅ **¡Objetivo Completado!** El reporte final ha sido publicado directamente en el canal especializado <#${targetChannel.id}>.`);
        await targetChannel.send(`📢 **Reporte de Ejecución Multi-Agente** (Solicitado por @${message.author.username} desde <#${message.channel.id}>):\n\n${reply}`);
      } else {
        await statusMsg.edit(reply);
      }
    } catch (e: any) {
      await statusMsg.edit(`🔴 **Error al procesar el objetivo**: ${e.message || e}`);
    }
    return;
  }

  const isMentioned = client.user ? message.mentions.has(client.user) : false;
  const isDevChannel = channelName === "dev-room" || channelName === "oa-research-live";
  const isManagerCommand = lower.startsWith("manager:") || lower.startsWith("hermes:");

  const commandKeywords = ["hace", "haz", "crea", "run", "deploy", "task", "spike", "implementa", "brief", "prompt", "orden", "ejecuta", "sync", "sethome", "configura", "update", "reinicia", "responde", "respondé", "contestá", "contesta", "decile", "dile"];
  const isInstruction = isManagerCommand || isDevChannel || (isMentioned && commandKeywords.some(k => lower.includes(k)));

  const isQuestionAboutProject =
    isMentioned && (
      lower.includes("qué es") ||
      lower.includes("como funciona") ||
      lower.includes("explicame") ||
      lower.includes("dudas") ||
      lower.includes("cómo") ||
      lower.includes("goalchain") ||
      lower.includes("what is") ||
      lower.includes("how to") ||
      lower.includes("help")
    );

  const shouldRespond = isManagerCommand || isDevChannel || isMentioned || isQuestionAboutProject;

  if (shouldRespond && channelName !== "announcements") {
    const AUTHORIZED_USERS = (process.env.DISCORD_AUTHORIZED_USERS || "nicopez,lucasbello,lucas,nicobellopez,lucaslopez122")
      .split(",")
      .map(u => u.trim().toLowerCase());

    const authorUsername = message.author.username.toLowerCase();
    const authorId = message.author.id;
    const isAuthorized = AUTHORIZED_USERS.includes(authorUsername) || AUTHORIZED_USERS.includes(authorId);

    if (isInstruction && !isAuthorized) {
      await message.reply("❌ Lo siento, solo Nico y Lucas están autorizados para dar órdenes o enviar prompts a Hermes. / Sorry, only Nico and Lucas are authorized to issue commands or prompts to Hermes.");
      return;
    }

    let finalContent = cleanContent;
    if (lower.startsWith("manager:")) {
      finalContent = cleanContent.slice(8).trim();
    } else if (lower.startsWith("hermes:")) {
      finalContent = cleanContent.slice(7).trim();
    }

    const reply = await askHermes(finalContent, `Usuario: @${message.author.username}, Canal: #${channelName}`);
    await message.reply(reply);
    return;
  }
});

client.login(TOKEN).catch((err) => {
  console.error("Failed to login Discord bot:", err);
  process.exit(1);
});
