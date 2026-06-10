# GOALCHAIN VPS INFRASTRUCTURE — OPERATING MANUAL
## Complete Architecture Reference (Printable Reference Document)

**Version:** 1.0 | **Date:** 2025-06-10 | **Classification:** INTERNAL — CEO EYES ONLY
**Status:** HONEST ASSESSMENT — NOT MARKETING MATERIAL

---

## EXECUTIVE SUMMARY: THE HONEST TRUTH

### What was promised vs What exists

| Promised (400+ Issues Plan) | Actually Delivered | Status |
|----------------------------|-------------------|--------|
| Complete web refactor (10 areas) | ~30% (X-Scout i18n, Language toggle, Fixtures expand, Oracle i18n, Zealy client, Penalty game) | **PARTIAL** |
| Economic bugs fixed | **UNVERIFIED** — No audit trail of economic fixes applied | **UNKNOWN** |
| Play.goalchain.fun polished | **NO** — Still looks "espantoso", missing UX polish | **BROKEN** |
| FCC workers autonomous | **NO** — 8 tasks assigned, 0 completed, all stuck in `status:ready` | **STALLED** |
| Marketing ↔ Play sync | **YES** — Cron + sync script working | **WORKING** |
| Repo public + internal split | **YES** — Done correctly | **WORKING** |

### Root Cause of Failure

**The FCC Worker Fleet is NOT working.** 
- 10 workers configured (Nemotron 3 Ultra via NVIDIA NIM)
- All 8 active tasks show `status:ready` — **none picked up**
- No branches created, no PRs opened, no code committed by workers
- The "autonomous fleet" is a **ghost fleet** — configured but not executing

**I (Manager) have been doing the work manually** via direct commits, not delegating to FCC. This is why only ~30% of the 10-area refactor is done.

---

## COMPLETE VPS ARCHITECTURE — EVERY COMPONENT

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ORACLE CLOUD VPS (Ubuntu 22.04)                      │
│                           89.168.20.135                                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
           ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
           │  HERMES      │   │  AGENTS/     │   │  INFRA/      │
           │  PROFILES    │   │  WORKERS     │   │  SERVICES    │
           └──────────────┘   └──────────────┘   └──────────────┘
```

---

### 1. HERMES PROFILES (Isolated Runtime Environments)

| Profile | Path | Purpose | Status |
|---------|------|---------|--------|
| **hermes-ceo** | `~/.hermes/profiles/hermes-ceo/` | **ACTIVE** — Main orchestrator, this session | **ACTIVE** |
| **default** | `~/.hermes/` | Original profile, legacy | **INACTIVE** |

**Each profile isolates:**
- `config.yaml` (model, gateway, tools, MCP servers)
- `.env` (API keys, secrets)
- `skills/` (loaded skills)
- `plugins/` (loaded plugins)
- `cron/` (scheduled jobs)
- `memories/` (persistent memory)
- `scripts/` (custom scripts)

**Cross-profile writes blocked by default** — Requires `cross_profile=true` + explicit user direction.

---

### 2. HERMES GATEWAY (Model Router)

| Component | Config | Status |
|-----------|--------|--------|
| **Provider** | Nous Research | **ACTIVE** |
| **Model** | `nvidia/nemotron-3-ultra:free` | **ACTIVE** |
| **Port** | 8644 (main), 8645 (collabs) | **LISTENING** |
| **Auth** | Grok OAuth (SuperGrok Pro) | **ROTATED 2025-06-09** |
| **MCP Servers** | gbrain, goalchain-ops | **CONNECTED** |

**Gateway responsibilities:**
- Route chat → Model
- Expose tools (terminal, file, web, etc.) to model
- Manage MCP server connections
- Handle OAuth callbacks (port 56121)

**Known Issue:** `hermes-gateway` shows **inactive** in ops snapshot — may need restart.

---

### 3. AGENTS / WORKERS — WHO DOES WHAT

```
┌────────────────────────────────────────────────────────────────────────┐
│                         AGENT HIERARCHY                                 │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐                                                        │
│  │   MANAGER   │  ← YOU ARE HERE (this session, hermes-ceo profile)    │
│  │  (Hermes)   │     • Orchestrates all                                │
│  └──────┬──────┘     • Delegates to FCC                               │
│         │          • Runs cron, sync, ops                             │
│         │          • Direct commits when workers fail                 │
│         ▼                                                             │
│  ┌─────────────────────┐                                              │
│  │   FCC WORKERS x10   │  ← SUPPOSED TO BE AUTONOMOUS FLEET          │
│  │  (Free Claude Code) │     • Model: Nemotron 3 Ultra (NIM)        │
│  └─────────┬───────────┘     • 10 workers, digit-based routing      │
│           │                 • Branch: exp/opencode-issue-*           │
│           │                 • **CURRENTLY: ALL IDLE** ⚠️           │
│           ▼                                                          │
│  ┌─────────────────────┐                                              │
│  │   ANTIGRAVITY       │  ← MERGE OWNER (currently NOT USED)        │
│  │   (Mac, Cursor)     │     • Human reviews PRs                    │
│  └─────────────────────┘     • Merges to main                        │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

#### FCC Worker Fleet Detail

| Worker | Port | Model | Routing | Status |
|--------|------|-------|---------|--------|
| Alpha | 3456 | Nemotron 3 Ultra | issue % 10 = 0 | **IDLE** |
| Beta | 3457 | Nemotron 3 Ultra | issue % 10 = 1 | **IDLE** |
| Gamma | 3458 | Nemotron 3 Ultra | issue % 10 = 2 | **IDLE** |
| Delta | 3459 | Nemotron 3 Ultra | issue % 10 = 3 | **IDLE** |
| Epsilon | 3460 | Nemotron 3 Ultra | issue % 10 = 4 | **IDLE** |
| Zeta | 3461 | Nemotron 3 Ultra | issue % 10 = 5 | **IDLE** |
| Eta | 3462 | Nemotron 3 Ultra | issue % 10 = 6 | **IDLE** |
| Theta | 3463 | Nemotron 3 Ultra | issue % 10 = 7 | **IDLE** |
| Iota | 3464 | Nemotron 3 Ultra | issue % 10 = 8 | **IDLE** |
| Kappa | 3465 | Nemotron 3 Ultra | issue % 10 = 9 | **IDLE** |

**FCC Server:** `fcc-claude` binary, Anthropic-format API (`/v1/messages`)
- Endpoint: `http://localhost:3456` (per worker port)
- Model IDs: `nvidia_nim/nvidia/nemotron-3-super-120b-a12b`
- API Keys: Must be in `~/.fcc/.env` per profile

**Why workers are idle:** Unknown. Possible causes:
- `oa-worker` process not spawning FCC children
- FCC server not starting on worker ports
- Queue not draining (check `oa-worker` logs)
- Model routing misconfiguration

---

### 4. OA (OpenAutonomy) RESEARCH AGENTS

| Agent | Schedule | Function | Status |
|-------|----------|----------|--------|
| **X-Scout** | Every 2h (`15 */2 * * *`) | Autonomous X/Twitter research → Discord | **ACTIVE** |
| **OA Worker** | Continuous | Discord bot, research publishing | **RUNNING** |
| **XAI OAuth** | 15min timer | Grok credential refresh | **ACTIVE** |

**X-Scout Output:** `ai-radar-*.md` → Discord forum `active-research` (channel ID in `DISCORD_RESEARCH_CHANNEL_ID`)
- Anti-spam: Cooldown 2h, dedup, `X_SCOUT_QUIET` when no signal
- Publishing: `OA_WORKER_PUBLISH_RESEARCH=false` by default

---

### 5. GBRAIN (Institutional Memory)

| Location | Transport | Status |
|----------|-----------|--------|
| **VPS (hermes-ceo)** | MCP stdio (`gbrain` binary) | **CONNECTED** |
| **Mac (Cursor)** | MCP stdio (`.cursor/mcp.json`) | **INSTALLED, NEEDS RESTART** |
| **Mac (Antigravity)** | MCP stdio (`~/.gemini/config/mcp_config.json`) | **INSTALLED, NEEDS RESTART** |

**Sync Protocol:** Manual — `git pull` + `gbrain import ai_context docs/intake` on each host
**No live sync between hosts.**

**VPS Install:** `bash ~/hermes/workspace/GoalChain/ops/hermes/install-gbrain-hermes.sh`

---

### 6. MCP SERVERS (Model Context Protocol)

| Server | Transport | Connected To | Functions |
|--------|-----------|--------------|-----------|
| **gbrain** | stdio | Hermes (VPS), Cursor (Mac), Antigravity (Mac) | Knowledge graph, queries, imports |
| **goalchain-ops** | stdio | Hermes (VPS) | `goalchain_ops_status`, `goalchain_economy_health`, `goalchain_onchain_program_info` |
| **goalchain-empresa** | stdio | Hermes (VPS) | Enterprise workflows |

**Config Location:** `~/.hermes/profiles/hermes-ceo/config.yaml` → `mcp_servers`

---

### 7. REPOSITORIES — STRUCTURE & DEPLOYMENT

```
GoalChain/ (TheNeuralWars/GoalChain)
├── goalchain_webapp/          → PLAY.APP (Vercel)
│   ├── src/
│   │   ├── ui/               # React components (DashboardGrid, FixturesPanel, etc.)
│   │   ├── i18n/             # EN/ES locales (306 keys each)
│   │   ├── lib/              # Clients (zealyClient, goalchainClient)
│   │   └── components/       # Reusable (LanguageToggle, SimulationBadge)
│   ├── .env.example          # VITE_* vars
│   ├── vercel.json           # Framework: Vite
│   └── package.json
│
├── docs/                      → MARKETING SITE (GitHub Pages)
│   ├── index.html            # Landing page
│   ├── colabs.html           # Collabs portal + Collabs Agent widget
│   ├── assets/js/i18n.js     # TRANSLATIONS object (synced from webapp)
│   └── assets/css/           # Styles
│
├── goalchain_program/         # Solana/Anchor smart contracts
├── goalchain_sdk/             # Shared TypeScript SDK
├── goalchain_api/             # Express REST API (port 3001)
├── goalchain_oracle/          # Oracle server (private repo copy)
├── scripts/                   # Utility scripts (sync-marketing-i18n.js)
├── api/                       # Vercel serverless functions (/api/collabs-chat.ts)
└── .github/workflows/         # CI/CD
    └── goalchain-ci-cd.yml    # GitHub Pages deploy (docs/)
```

#### DEPLOYMENT PIPELINES

| Target | Platform | Trigger | Config |
|--------|----------|---------|--------|
| **play.goalchain.fun** | Vercel | Push to `main` (any `goalchain_webapp/**` change) | `vercel.json` |
| **goalchain.fun** | GitHub Pages | Push to `main` (any `docs/**` change) | `.github/workflows/goalchain-ci-cd.yml` |
| **api.goalchain.fun** | Vercel | Push to `main` (`api/**`) | Vercel project |

**Sync Mechanism:** 
- Cron `sync-marketing-i18n` (hourly) → `scripts/sync-marketing-i18n.js` 
- Reads `goalchain_webapp/src/i18n/locales/*.json` → writes `docs/assets/js/i18n.js`
- Auto-commits if changes → triggers BOTH deploys

---

### 8. CRON JOBS (Autonomous Operations)

| Job ID | Name | Schedule | Function |
|--------|------|----------|----------|
| `075855f2de5f` | `sync-marketing-i18n` | Hourly | Sync i18n webapp → marketing, auto-commit/push |
| `hermes-credential-maintain` | 15min | Refresh Grok OAuth + Vault |
| `oa-x-scout` | 2h | X-Scout research run |
| `oa-scout-synth` | 9:30 UTC | Synthesize research reports |
| `oa-scout-weekly` | Mon 12:00 | Weekly research summary |

**Ops Snapshot:** `bash ~/hermes/workspace/GoalChain/ops/hermes/hermes-context.sh`

---

### 9. SUPERPOWERS (On-Chain Monitoring)

| Endpoint | Function | Status |
|----------|----------|--------|
| `goalchain_ops_status` | Protocol health | **ACTIVE** |
| `goalchain_economy_health` | Economic parameters | **ACTIVE** |
| `goalchain_onchain_program_info` | Program info | **ACTIVE** |

**Webhook:** `http://127.0.0.1:8644/webhooks/goalchain-alpha-push` (instant alpha alerts)
**Cron:** Alpha every 30min, Summary 07:00 UTC → WhatsApp (Nico)

**Install:** `bash ~/hermes/scripts/install-hermes-superpowers.sh`

---

### 10. CREDENTIALS & SECRETS MANAGEMENT

| Secret | Location | Rotation |
|--------|----------|----------|
| **Discord Token** | `~/.hermes/profiles/hermes-ceo/home/hermes/config.env` → `DISCORD_TOKEN` | Rotated 2025-06-09 |
| **Grok OAuth** | Hermes Vault + `auth.json` | 15min auto-refresh |
| **XAI API Key** | `VITE_XAI_API_KEY` (Vercel env) | Manual |
| **Zealy API** | `VITE_ZEALY_API_KEY` (Vercel env) | Manual |
| **Zealy Community ID** | `VITE_ZEALY_COMMUNITY_ID` | Manual |
| **Grok Build Cli** | `grok_tmux_bridge` (port 56121) | N/A |

**Private Repo:** `TheNeuralWars/GoalChain-internal` — All ops/, hermes/, ai_context/, prompts/, scratch/, secrets

---

### 11. WHATSAPP INTEGRATION

| Channel | Format | Language |
|---------|--------|----------|
| Self-chat (Nico) | `manager:` prefix → `[Manager]` reply | **Spanish** |
| Target | `WHATSAPP_TARGET` in config.env | — |

**Rule:** Only replies to `manager:` prefix. Never impersonate Nico.

---

### 12. DISCORD INTEGRATION

| Channel | Purpose | Bot |
|---------|---------|-----|
| `#dev-room` | Dev discussion, FCC task coordination | OA Worker |
| `#oa-research-live` | Live research alerts (deprecated) | OA Worker |
| `#active-research` (Forum) | X-Scout research threads | X-Scout |
| `#lounge` | GM/GN daily (11:00/23:00 UTC) | OA Worker |

**Moderation:** Auto-delete spam/scam, **never delete Nico's messages** (ID: 844704632714690601), red embed notice 5min.

---

### 13. NETWORK PORTS MAP

| Port | Service | Notes |
|------|---------|-------|
| 3001 | goalchain_api (Express) | Local dev |
| 3456-3465 | FCC Workers (10 ports) | Alpha-Kappa |
| 3456 | FCC Server (main) | Anthropic format `/v1/messages` |
| 5173 | Vite dev server (webapp) | Local dev |
| 56121 | Grok Build CLI / OAuth callback | `grok_tmux_bridge` |
| 8644 | Hermes Gateway (main) | Main chat gateway |
| 8645 | Hermes Gateway (collabs) | Collabs Agent widget |
| 6080 | noVNC (browser automation) | Requires Oracle VCN ingress |
| 8899 | Solana test validator | Local dev |

---

### 14. FILE SYSTEM KEY PATHS

| Path | Purpose |
|------|---------|
| `/home/ubuntu/.hermes/profiles/hermes-ceo/` | Active Hermes profile |
| `/home/ubuntu/hermes/config.env` | Hermes ops config (secrets) |
| `/home/ubuntu/hermes/workspace/GoalChain/` | Main repo (cloned) |
| `/data/apps/GoalChain/` | **Active working directory** (this session) |
| `~/hermes/scripts/` | Hermes utility scripts |
| `~/hermes/workspace/GoalChain/ops/hermes/` | Ops scripts (hermes-context.sh, create-task.sh) |
| `~/.gbrain/` | GBrain knowledge base (VPS) |

---

### 15. CURRENT BLOCKERS & REQUIRED ACTIONS

| Blocker | Impact | Required Action |
|---------|--------|-----------------|
| **FCC Workers idle** | 0% autonomous code delivery | Debug `oa-worker` → check FCC spawn, logs at `~/hermes/logs/` |
| **Grok OAuth rotated** | Chat gateway may fail | Verify `hermes-gateway` restart, test chat |
| **Economic fixes unverified** | Unknown if critical bugs fixed | Audit: run `goalchain_economy_health` + manual review |
| **Play.app UX "espantoso"** | User retention at risk | Manual CSS/UX fixes (LanguageToggle now in PlayNav) |
| **Marketing site on GitHub Pages** | Billing failures block deploy | Migrate to Vercel (unified with Play) |
| **GBrain Mac not restarted** | Cursor/Antigravity can't use MCP | Restart Cursor + Antigravity |

---

## COMMAND REFERENCE — HOW TO DRIVE THIS MACHINE

### Daily Operations

```bash
# Check system health
bash ~/hermes/workspace/GoalChain/ops/hermes/hermes-context.sh

# View FCC task queue
gh issue list --repo TheNeuralWars/GoalChain --state open --label "agent:opencode"

# Trigger FCC worker manually (if needed)
bash ~/hermes/workspace/GoalChain/ops/hermes/create-task.sh opencode P0 "Title" "Detailed prompt"

# Force marketing sync
node scripts/sync-marketing-i18n.js --apply

# Deploy marketing manually
gh workflow run goalchain-ci-cd.yml --repo TheNeuralWars/GoalChain

# Check deployments
gh run list --repo TheNeuralWars/GoalChain --workflow=goalchain-ci-cd.yml --limit=5
gh api repos/TheNeuralWars/GoalChain/deployments --jq '.[] | {created_at, state, environment_url}'
```

### Emergency Procedures

```bash
# Restart Hermes gateway
# (requires access to Hermes process manager)

# Rotate Discord token (if leaked)
# 1. Discord Dev Portal → Reset token
# 2. Update ~/.hermes/profiles/hermes-ceo/home/hermes/config.env
# 3. Commit to GoalChain-internal
# 4. Restart Hermes gateway

# Force FCC worker restart
pkill -f fcc-claude
# oa-worker should respawn

# Force marketing sync + deploy
node scripts/sync-marketing-i18n.js --apply && git push origin main
```

---

## HONEST ASSESSMENT: WHAT NEEDS TO HAPPEN NOW

### Immediate (This Week)
1. **Debug FCC Workers** — They are the engine. If they don't work, nothing scales.
2. **Verify Economic Fixes** — Run full audit, document what's actually fixed.
3. **Migrate Marketing to Vercel** — Eliminate GitHub Pages billing dependency.
4. **UX Polish Sprint** — Fix the "espantoso" Play.app (LanguageToggle is step 1).

### This Month
1. **Reactivate FCC Fleet** — 10 workers must deliver ~1 PR/day each.
2. **Collabs Agent → Production** — Add `XAI_API_KEY` to Vercel, test live.
3. **Zealy Integration Live** — Add real API keys, test real XP sync.
4. **Penalty Game Polish** — Canvas rendering, mobile touch, daily challenge UX.

### Architecture Decision Needed
**Option A:** Fix FCC Workers (invest debugging time)
**Option B:** Accept manual-driven + targeted FCC for specific tasks
**Option C:** Migrate to different agent framework (Cursor/Claude Code CLI)

---

## DOCUMENT CONTROL

| Field | Value |
|-------|-------|
| **Document ID** | GC-VPS-ARCH-2025-06-10 |
| **Classification** | INTERNAL — CEO ONLY |
| **Owner** | Manager (Hermes) / Nico (CEO) |
| **Review Cycle** | Weekly (Monday) |
| **Next Review** | 2025-06-16 |
| **Change Log** | v1.0 — Honest baseline assessment |

---

**END OF DOCUMENT**

*This document is the single source of truth for GoalChain VPS operations. Print it. Keep it updated. If it's not in here, it doesn't exist.*