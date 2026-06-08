#!/usr/bin/env node
/**
 * discord_channel_router.js — GoalChain Discord Posting Router
 * =============================================================
 * GOLDEN RULE ENFORCED: Each type of content has ONE specific channel.
 * No cross-posting. No repetition. Max impact per channel.
 *
 * CHANNEL MAP (permanent law — change only with explicit directive):
 * ─────────────────────────────────────────────────────────────────
 * #📢 announcements     → Official news ONLY: launches, presale milestones,
 *                          major partnerships, on-chain events. Max 1/day.
 *                          Audience: everyone (public-facing). Pin-worthy.
 *
 * #marketing-active     → INTERNAL/TEAM: campaign planning, post schedules,
 *                          scheduler logs, copy drafts. NOT for public content.
 *                          (Rename to #ops-marketing if possible)
 *
 * #👑 genesis-lounge    → Deep COMMUNITY RETENTION: player spotlights,
 *                          lore drops, biometric reveals, squad facts.
 *                          Audience: holders + invested community. Max 2/day.
 *
 * #🍻 degen-locker-room → ALPHA + ENGAGEMENT: Zealy quests, X-Scout arb
 *                          signals, presale urgency, degen energy, calls to
 *                          action. Audience: active degens. Max 1/day.
 *
 * #general              → Community conversation ONLY. Bot does NOT post here.
 *                          Let it breathe as organic discussion space.
 *
 * CONTENT → CHANNEL ROUTING:
 * ─────────────────────────────────────────────────────────────────
 * Player Spotlight (lore + stats)      → #genesis-lounge
 * Zealy quest push / airdrop urgency   → #degen-locker-room
 * Presale milestone / Vault update     → #announcements (if major) OR #degen
 * X-Scout arb signal                   → #degen-locker-room
 * Launch / Partnership announcement    → #announcements
 * Internal campaign log                → #marketing-active (not public content)
 * ─────────────────────────────────────────────────────────────────
 * NEVER: same message in 2+ channels same day.
 * NEVER: @everyone in retention posts (announcements only for real news).
 */

const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
const path = require("path");

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const envContent = fs.readFileSync(path.join(__dirname, ".env"), "utf8");
const TOKEN = envContent.match(/DISCORD_COMMUNITY_BOT_TOKEN=(.+)/)[1].trim().replace(/"/g, "");

// Channel IDs (permanent — do not add channels without updating channel map above)
const CHANNELS = {
  announcements: "1503668120521408513",   // Official news only
  marketingOps:  "1508990192495755385",   // Internal ops log (NOT public content)
  genesisLounge: "1504207669773336639",   // Player spotlights + lore
  degenLocker:   "1504251275175264352",   // Zealy + alpha + CTA
};

// ─── STATE: what ran today to prevent same-day repeats ───────────────────────
const STATE_FILE = "/home/goalchain/hermes/logs/discord_router_state.json";

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

  // Priority 1: Genesis Lounge spotlight (if not done today)
  if (!posted.includes("genesis-spotlight")) {
    return { channelKey: "genesisLounge", contentType: "genesis-spotlight" };
  }

  // Priority 2: Degen Locker CTA (if not done today)
  if (!posted.includes("degen-cta")) {
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
    const logPath = "/home/goalchain/hermes/workspace/GoalChain/scratch/marketing_log.md";
    const entry = `\n## Discord Router - ${new Date().toISOString()}\n- Type: ${decision.contentType}\n- Channel: #${ch.name} (${channelId})\n- Spotlight: ${spotlight ? `${spotlight.name} (${spotlight.real})` : "N/A"}\n- Rule: ONE channel per content type per day (Golden Rule enforced)\n`;
    try { fs.appendFileSync(logPath, entry); } catch {}

  } catch (e) {
    console.log(`[Router] ❌ Error posting to ${channelName}: ${e.message}`);
  }

  process.exit(0);
});

client.login(TOKEN);
