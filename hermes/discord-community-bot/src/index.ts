import { Client, GatewayIntentBits, Partials, TextChannel, Message } from 'discord.js';
import dotenv from 'dotenv';
import { askHermes } from './integrations/hermes-agent.js';

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

const MODERATED_CHANNELS = ['general', 'introductions', 'dev-room', 'alpha-signals', 'oa-research-live'];

const SPAM_KEYWORDS = [
  'nft drop', 'free mint', 'airdrop', 'presale', 'whitelist',
  'join my server', 'check my project', 'dm for collabs', 'buy now', 'limited time'
];

function isSpamOrExternalAd(content: string): boolean {
  const lower = content.toLowerCase();
  return SPAM_KEYWORDS.some(k => lower.includes(k));
}

function isOffensive(content: string): boolean {
  const lower = content.toLowerCase();
  const badWords = ['puto', 'puta', 'mierda', 'concha', 'la concha', 'hdp', 'hijueputa'];
  return badWords.some(w => lower.includes(w));
}

// Respuestas amigables
const friendlyReplies: Record<string, string> = {
  gm: 'GM! ☀️ Cómo va el día, crack?',
  gn: 'GN! 🌙 Descansá que mañana seguimos rompiendo.',
  'good morning': 'GM! ☀️ Cómo va el día, crack?',
  'good night': 'GN! 🌙 Descansá que mañana seguimos rompiendo.',
  gracias: 'De nada pa! Cualquier cosa acá estoy 🔥',
  'gracias hermes': 'De nada rey! Para eso estoy 😉',
};

client.once('ready', () => {
  console.log(`✅ Hermes Community Bot online as ${client.user?.tag}`);

  // GM / GN automático (cada 24h)
  setInterval(() => {
    const hour = new Date().getHours();
    if (hour === 8) {
      const channel = client.channels.cache.find(
        (c): c is TextChannel => c instanceof TextChannel && c.name === 'general'
      );
      channel?.send('GM! ☀️ Arrancamos el día con toda la gente de GoalChain!');
    }
    if (hour === 23) {
      const channel = client.channels.cache.find(
        (c): c is TextChannel => c instanceof TextChannel && c.name === 'general'
      );
      channel?.send('GN! 🌙 Descansen que mañana seguimos rompiendo. #GoalChainStrong');
    }
  }, 1000 * 60 * 60); // cada hora chequea
});

client.on('messageCreate', async (message: Message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  const channelName = (message.channel as TextChannel).name;
  const content = message.content;
  const lower = content.toLowerCase();

  // === MODERACIÓN ===
  if (MODERATED_CHANNELS.includes(channelName)) {
    if (isSpamOrExternalAd(content) || isOffensive(content)) {
      try {
        await message.delete();
        console.log(`🗑️ Mensaje eliminado de ${message.author.tag} en #${channelName}`);

        await message.author.send(
          `Hola! Tu mensaje en **#${channelName}** fue eliminado porque parecía publicidad externa o contenido no relacionado con GoalChain. Si tenés dudas, escribime.`
        ).catch(() => {});
      } catch (err) {
        console.error('Error al eliminar mensaje:', err);
      }
      return;
    }
  }

  // === RESPUESTAS AMIGABLES ===
  for (const [trigger, reply] of Object.entries(friendlyReplies)) {
    if (lower.includes(trigger)) {
      await message.reply(reply);
      return;
    }
  }

  // === CITAR ANUNCIOS EN GENESIS-LOUNGE ===
  if (channelName === 'announcements' && GENESIS_LOUNGE_ID) {
    const lounge = client.channels.cache.get(GENESIS_LOUNGE_ID) as TextChannel;
    if (lounge) {
      await lounge.send(
        `📢 **Nuevo anuncio en #announcements**\n${message.content}\n\nLink: ${message.url}`
      );
    }
  }

  // === INTEGRACIÓN CON HERMES AGENT + GROK ===
  const isMentioned = client.user ? message.mentions.has(client.user) : false;
  const isDevChannel = channelName === 'dev-room' || channelName === 'oa-research-live';
  const isManagerCommand = lower.startsWith('manager:') || lower.startsWith('hermes:');

  // Determinar si es una orden o sugerencia de prompt para Hermes
  const commandKeywords = ['hace', 'haz', 'crea', 'run', 'deploy', 'task', 'spike', 'implementa', 'brief', 'prompt', 'orden', 'ejecuta', 'sync', 'sethome', 'configura', 'update', 'reinicia', 'responde', 'respondé', 'contestá', 'contesta', 'decile', 'dile'];
  const isInstruction = isManagerCommand || isDevChannel || (isMentioned && commandKeywords.some(k => lower.includes(k)));

  // Determinar si es una pregunta general sobre el proyecto
  const isQuestionAboutProject =
    isMentioned && (
      lower.includes('qué es') ||
      lower.includes('como funciona') ||
      lower.includes('explicame') ||
      lower.includes('dudas') ||
      lower.includes('cómo') ||
      lower.includes('goalchain') ||
      lower.includes('what is') ||
      lower.includes('how to') ||
      lower.includes('help')
    );

  // El bot responde si es un comando, canal dev, mención directa o pregunta
  const shouldRespond = isManagerCommand || isDevChannel || isMentioned || isQuestionAboutProject;

  if (shouldRespond && channelName !== 'announcements') {
    // Configurar lista de usuarios autorizados (se puede pisar con env var)
    const AUTHORIZED_USERS = (process.env.DISCORD_AUTHORIZED_USERS || 'nicopez,lucasbello,lucas')
      .split(',')
      .map(u => u.trim().toLowerCase());

    const authorUsername = message.author.username.toLowerCase();
    const authorId = message.author.id;
    const isAuthorized = AUTHORIZED_USERS.includes(authorUsername) || AUTHORIZED_USERS.includes(authorId);

    if (isInstruction && !isAuthorized) {
      await message.reply('❌ Lo siento, solo Nico y Lucas están autorizados para dar órdenes o enviar prompts a Hermes. / Sorry, only Nico and Lucas are authorized to issue commands or prompts to Hermes.');
      return;
    }

    // Limpiar prefijo si existe
    let cleanContent = content;
    if (lower.startsWith('manager:')) {
      cleanContent = content.slice(8).trim();
    } else if (lower.startsWith('hermes:')) {
      cleanContent = content.slice(7).trim();
    }

    const reply = await askHermes(cleanContent, `Usuario: @${message.author.username}, Canal: #${channelName}`);
    await message.reply(reply);
    return;
  }
});

client.login(TOKEN).catch((err) => {
  console.error('Failed to login Discord bot:', err);
  process.exit(1);
});
