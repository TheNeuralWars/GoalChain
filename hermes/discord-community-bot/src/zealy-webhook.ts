// @ts-nocheck
/**
 * zealy-webhook.ts — GoalChain Zealy Quest Verification + Discord Role Sync
 * ========================================================================
 * Lightweight HTTP webhook server (no new deps — uses Node's built-in http module).
 * Runs alongside the main discord-community-bot (shares .env vars).
 *
 * POST /api/zealy/webhook
 *   Headers:  x-zealy-secret: <ZEALY_WEBHOOK_SECRET>
 *   Body:     { user_id, quest_id, wallet_address?, discord_id? }
 *
 * Flow:
 *   1. Verify secret
 *   2. Log completion to data/zealy_completions.json
 *   3. Assign Discord role (degen | quests) via Discord REST API
 *
 * Run:  npx ts-node src/zealy-webhook.ts
 * Or:   node --loader ts-node/esm src/zealy-webhook.ts
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../../data');
const COMPLETIONS_FILE = path.join(DATA_DIR, 'zealy_completions.json');

const PORT = parseInt(process.env.ZEALY_WEBHOOK_PORT || '3001', 10);
const SECRET = process.env.ZEALY_WEBHOOK_SECRET || '';
const DISCORD_BOT_TOKEN = process.env.DISCORD_COMMUNITY_BOT_TOKEN || '';
const GUILD_ID = process.env.DISCORD_GUILD_ID || '';
const DISCORD_ROLE_DEGEN = process.env.DISCORD_ROLE_DEGEN || 'Degen';
const DISCORD_ROLE_QUESTS = process.env.DISCORD_ROLE_QUESTS || 'Quests';

// ── Helpers ──────────────────────────────────────────────────────────────────

function readCompletions(): Record<string, unknown>[] {
  try {
    if (fs.existsSync(COMPLETIONS_FILE)) {
      return JSON.parse(fs.readFileSync(COMPLETIONS_FILE, 'utf-8'));
    }
  } catch { /* ignore */ }
  return [];
}

function writeCompletions(data: Record<string, unknown>[]): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(COMPLETIONS_FILE, JSON.stringify(data, null, 2));
}

function logCompletion(entry: Record<string, unknown>): void {
  const existing = readCompletions();
  existing.push({ ...entry, _logged_at: new Date().toISOString() });
  // Keep last 10,000 entries
  writeCompletions(existing.slice(-10000));
  console.log(`[zealy-webhook] Logged: ${entry.user_id} / ${entry.quest_id}`);
}

async function assignDiscordRole(
  discordId: string,
  roleName: string
): Promise<void> {
  if (!DISCORD_BOT_TOKEN || !GUILD_ID) {
    console.warn('[zealy-webhook] Discord env vars not set — skipping role assign');
    return;
  }
  // Fetch guild members to find the member by their Discord ID
  const memberRes = await fetch(
    `https://discord.com/api/v10/guilds/${GUILD_ID}/members/${discordId}`,
    { headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` } }
  );
  if (!memberRes.ok) {
    console.warn(`[zealy-webhook] Member ${discordId} not found in guild`);
    return;
  }
  const member = await memberRes.json() as { roles: string[]; user: { id: string } };

  // Fetch guild roles to find the role ID by name
  const rolesRes = await fetch(
    `https://discord.com/api/v10/guilds/${GUILD_ID}/roles`,
    { headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` } }
  );
  if (!rolesRes.ok) {
    console.error('[zealy-webhook] Could not fetch guild roles');
    return;
  }
  const roles = await rolesRes.json() as Array<{ id: string; name: string }>;
  const role = roles.find(r => r.name === roleName);
  if (!role) {
    console.warn(`[zealy-webhook] Role "${roleName}" not found in guild`);
    return;
  }
  if (member.roles.includes(role.id)) {
    console.log(`[zealy-webhook] User ${discordId} already has role ${roleName}`);
    return;
  }
  const addRes = await fetch(
    `https://discord.com/api/v10/guilds/${GUILD_ID}/members/${discordId}/roles/${role.id}`,
    {
      method: 'PUT',
      headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` },
    }
  );
  if (addRes.ok) {
    console.log(`[zealy-webhook] Assigned ${roleName} to ${discordId}`);
  } else {
    const err = await addRes.text();
    console.error(`[zealy-webhook] Failed to assign role: ${err}`);
  }
}

// ── HTTP Server ───────────────────────────────────────────────────────────────

function parseBody(req: http.IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://localhost:${PORT}`);

  // CORS preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-zealy-secret');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // Health check
  if (req.method === 'GET' && url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'zealy-webhook' }));
    return;
  }

  // POST /api/zealy/webhook
  if (req.method === 'POST' && url.pathname === '/api/zealy/webhook') {
    const incomingSecret = req.headers['x-zealy-secret'] || req.headers['x-webhook-secret'];
    if (!SECRET || incomingSecret !== SECRET) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }

    let body: Record<string, unknown>;
    try {
      body = await parseBody(req);
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid JSON body' }));
      return;
    }

    const user_id = body['user_id'] as string | undefined;
    const quest_id = body['quest_id'] as string | undefined;
    const wallet_address = body['wallet_address'] as string | undefined;
    const discord_id = body['discord_id'] as string | undefined;

    if (!user_id || !quest_id) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing user_id or quest_id' }));
      return;
    }

    // Log completion
    const entry = { user_id, quest_id, wallet_address, discord_id };
    logCompletion(entry);

    // Assign Discord role asynchronously (non-blocking)
    if (discord_id) {
      const roleName = (quest_id as string).toLowerCase().includes('first')
        ? DISCORD_ROLE_DEGEN
        : DISCORD_ROLE_QUESTS;
      assignDiscordRole(discord_id, roleName).catch(console.error);
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, logged: true }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`[zealy-webhook] Listening on http://localhost:${PORT}`);
  console.log(`[zealy-webhook] Endpoint: POST /api/zealy/webhook`);
  console.log(`[zealy-webhook] Log file: ${COMPLETIONS_FILE}`);
});

server.on('error', (err) => {
  console.error('[zealy-webhook] Server error:', err);
  process.exit(1);
});