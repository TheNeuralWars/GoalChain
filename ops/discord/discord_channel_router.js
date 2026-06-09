#!/usr/bin/env node
/**
 * discord_channel_router.js — GoalChain Discord Posting Router
 * =============================================================
 * 📋 LEY DE CANALES DISCORD — IMPLEMENTADA (highest priority, permanent)
 *
 * Canal → Propósito (único, permanente)
 * Canal               Para qué                                      Quién postea          Límite
 * #📢 announcements   Lanzamientos oficiales, milestones de presale,  Bot solo en eventos   1/día
 *                     eventos on-chain reales                       mayores
 *
 * #👑 genesis-lounge  Player spotlights + lore drops + biometrics.    Bot (router)          2/día
 *                     Retención profunda de holders
 *
 * #🍻 degen-locker-room Zealy push + señales X-Scout + urgencia       Bot (router)          1/día
 *                     presale + CTAs
 *
 * #marketing-active   Log interno de ops únicamente. Sin contenido   Bot nunca postea      —
 *                     público                                       aquí públicamente
 *
 * #general            Chat orgánico de la comunidad                  Bot NO postea         —
 *
 * Lo que se cambió
 * - VPS: discord_marketing_poster.js reemplazado por discord_channel_router.js — ya no blast a 4 canales a la vez
 * - Estado diario: el router guarda discord_router_state.json para saber qué ya se publicó hoy
 * - Sin @everyone en posts de retención — solo para anuncios oficiales reales
 * - Backup: discord_marketing_poster.js.bak.golden-rule en el VPS por si acaso
 *
 * GOLDEN RULE + MAX LAW: English only. ONE channel per content type. No repeats.
 * No cross-blasting. Study state + logs before deciding. X = short public diff.
 * Discord retention = deeper, channel-specific, no overload.
 *
 * NEVER post the same narrative block to genesis-lounge + degen-locker-room same day.
 */

const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
const path = require("path");

// ─── CONFIG ──────────────────────────────────────────────────────────────────
let TOKEN = process.env.DISCORD_BOT_TOKEN || process.env.DISCORD_TOKEN;
if (!TOKEN) {
  const paths = [
    "/data/apps/dot-hermes/profiles/hermes-ceo/.env",
    "/data/apps/dot-hermes/.env",
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) {
      try {
        const envContent = fs.readFileSync(p, "utf8");
        const match = envContent.match(/DISCORD_BOT_TOKEN=(.+)/) || envContent.match(/DISCORD_TOKEN=(.+)/);
        if (match) {
          TOKEN = match[1].trim().replace(/"/g, "").replace(/'/g, "");
          break;
        }
      } catch (e) {}
    }
  }
}
if (!TOKEN) {
  console.error("[Router] ERROR: DISCORD_BOT_TOKEN not found.");
  process.exit(1);
}

// Channel IDs (permanent — do not add channels without updating channel map above)
const CHANNELS = {
  announcements: "1503668120521408513",   // Official news only
  marketingOps:  "1508990192495755385",   // Internal ops log (NOT public content)
  genesisLounge: "1504207669773336639",   // Player spotlights + lore
  degenLocker:   "1504251275175264352",   // Zealy + alpha + CTA
};

// ─── STATE: what ran today to prevent same-day repeats ───────────────────────
const STATE_FILE = "/data/apps/dot-hermes/logs/discord_router_state.json";

function loadState() {
  try {
    const s = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
    const today = new Date().toISOString().slice(0, 10);
    if (s.date !== today) return { date: today, postedToday: [] };
    return s;
  } catch {
    return { date: new Date().toISOString().slice(0, 10), postedToday: [] };
  }
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// ─── SQUAD DATA ──────────────────────────────────────────────────────────────
function loadSquad() {
  const paths = [
    "/data/apps/GoalChain/docs/assets/data/players.json",
    "/data/apps/GoalChain/ai_context/03_data/players.json",
    "/home/goalchain/hermes/workspace/GoalChain/docs/assets/data/players.json",
    "/home/goalchain/hermes/workspace/GoalChain/ai_context/03_data/players.json",
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, "utf8"));
  }
  return [];
}

function pickSpotlight(squad, state) {
  if (!squad.length) return null;
  // Avoid repeating same player same week
  const usedNames = (state.usedSpotlights || []);
  let cands = squad.filter(p => ["legendary", "mythic"].includes(p.rarity) && !usedNames.includes(p.name));
  if (!cands.length) cands = squad.filter(p => !usedNames.includes(p.name));
  if (!cands.length) cands = squad; // full reset if all used
  const p = cands[Math.floor(Math.random() * cands.length)];
  return {
    name: p.name,
    real: p.real_name || "",
    country: p.country || "",
    rarity: (p.rarity || "").toUpperCase(),
    stats: p.stats || {},
    lore: ((p.meta && p.meta.narrative) ? p.meta.narrative : "").slice(0, 200) + "...",
    physical: p.physical || {},
  };
}

// ─── CONTENT BUILDERS ────────────────────────────────────────────────────────

/**
 * GENESIS LOUNGE: Deep player spotlight + lore. No CTA overload.
 * Channel: #👑 genesis-lounge
 */
function buildSpotlightPost(sp) {
  const statsLine = sp.stats.atk
    ? `ATK ${sp.stats.atk} · DEF ${sp.stats.def} · HYPE ${sp.stats.hype}`
    : "";
  const physLine = [sp.physical.t, sp.physical.h, sp.physical.w].filter(Boolean).join(" · ");

  return `**Genesis Squad | ${sp.rarity} Spotlight**

**${sp.name}** — ${sp.real} · ${sp.country}
${statsLine ? `⚡ ${statsLine}` : ""}${physLine ? `\n📐 ${physLine}` : ""}

${sp.lore}

This is one of 528 players forged across 19 deliberate Grok batches — each with real biometrics, lore, and on-chain yield. Not AI-generated noise. Studied craft.

→ Full squad drops when Genesis NFT mint goes live.
→ Holders earn daily $GCH yield from real player salary oracles.
→ play.goalchain.fun`;
}

/**
 * DEGEN LOCKER ROOM: Zealy push + presale urgency + X-Scout alpha.
 * Channel: #🍻 degen-locker-room
 */
function buildDegenPost() {
  const degenPosts = [
    `⚡ **Zealy Season 1 is ticking.**

XP earned now = $GCH airdrop at launch. 25% of total supply goes to the community.

Quest types live:
→ **Social:** Follow + Repost @GoalChainSOL on X
→ **Discord:** Earn the Degen role (active in this channel)
→ **Game:** Share penalty streak screenshots from the live scoreboard

Every quest you skip = allocation you leave on the table.
👉 https://zealy.io/cw/goalchain`,

    `🔍 **X-Scout Alpha**

Our live AI agent is scanning Solana in real time.
Recent signals: GOAL/USDC 2.4% arb detected. WC match volatility windows mapped.

This is the on-chain infrastructure running before most people know GoalChain exists.

Presale: 1 SOL = 50,000 $GCH | ~30% hard cap raised.
Vault executing buybacks from every Genesis sale.
→ https://goalchain.fun/`,

    `🔥 **Presale Update**

The Vault holds 100% of Genesis NFT sale revenue.
It stakes via Jito → auto-buys $GCH → burns forever (Infinity Burn).

Every presale entry fuels the deflationary pressure before launch.
~30% of hard cap raised. Window is open.

→ https://goalchain.fun/
→ Zealy quests: https://zealy.io/cw/goalchain`,
  ];

  return degenPosts[Math.floor(Math.random() * degenPosts.length)];
}

// ─── ROUTING LOGIC ───────────────────────────────────────────────────────────

/**
 * Decides what to post and WHERE based on what's already gone out today.
 * Returns: { channelId, content, channelName, contentType }
 */
function decidePost(state) {
  const posted = state.postedToday || [];
  const genesisCount = (posted.filter(x => x === "genesis-spotlight")).length;
  const degenCount = (posted.filter(x => x === "degen-cta")).length;

  // 📋 LEY DE CANALES: respect exact daily limits
  // genesis-lounge: max 2 spotlights (deep retention)
  // degen-locker-room: max 1 (Zealy + X-Scout + urgency)
  // announcements: only major (never in normal router runs)

  if (genesisCount < 2) {
    return { channelKey: "genesisLounge", contentType: "genesis-spotlight" };
  }

  if (degenCount < 1) {
    return { channelKey: "degenLocker", contentType: "degen-cta" };
  }

  // Nothing left to post today — respect the no-overload rule
  return null;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
const squad = loadSquad();
const state = loadState();
const decision = decidePost(state);

if (!decision) {
  console.log(`[Router] Nothing to post — daily limits reached for all channels. Exiting.`);
  console.log(`[Router] Posted today: ${(state.postedToday || []).join(", ")}`);
  process.exit(0);
}

const spotlight = pickSpotlight(squad, state);

let content;
if (decision.contentType === "genesis-spotlight") {
  if (!spotlight) {
    console.log("[Router] No squad data available for spotlight. Exiting.");
    process.exit(0);
  }
  content = buildSpotlightPost(spotlight);
} else {
  content = buildDegenPost();
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("ready", async () => {
  console.log(`[Router] Logged in as ${client.user.tag}`);
  const channelId = CHANNELS[decision.channelKey];
  const channelName = decision.channelKey;

  try {
    const ch = await client.channels.fetch(channelId);
    if (!ch) throw new Error("Channel not found");

    await ch.send(content);
    console.log(`[Router] ✅ Posted [${decision.contentType}] → #${ch.name}`);

    // Update state
    state.postedToday = [...(state.postedToday || []), decision.contentType];
    if (decision.contentType === "genesis-spotlight" && spotlight) {
      state.usedSpotlights = [...(state.usedSpotlights || []), spotlight.name];
      if (state.usedSpotlights.length > 50) state.usedSpotlights = state.usedSpotlights.slice(-50);
    }
    saveState(state);

    // Log to marketing ops (internal only, no public post)
    const logPath = "/data/apps/GoalChain/scratch/marketing_log.md";
    const entry = `\n## Discord Router - ${new Date().toISOString()}\n- Type: ${decision.contentType}\n- Channel: #${ch.name} (${channelId})\n- Spotlight: ${spotlight ? `${spotlight.name} (${spotlight.real})` : "N/A"}\n- Rule: ONE channel per content type per day (Golden Rule enforced)\n`;
    try { fs.appendFileSync(logPath, entry); } catch {}

  } catch (e) {
    console.log(`[Router] ❌ Error posting to ${channelName}: ${e.message}`);
  }

  process.exit(0);
});

client.login(TOKEN);
