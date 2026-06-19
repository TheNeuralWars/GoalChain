# 🏛️ GoalChain Repository Architecture

This document is the **layer map** of the monorepo. Whenever you (an agent) need to
decide *where* to make a change, read this file first.

For the human/agent entry point see [`AGENT_GUIDE.md`](../AGENT_GUIDE.md).

---

## 🧭 Top-level layout

```
GoalChain/
├── AGENT_GUIDE.md            # Single source of truth for AI agents (read first)
├── WORKFLOW.md               # Process rules for any task
├── CLAUDE.md                 # FCC/Claude-Code specific instructions
├── README.md                 # Public-facing readme
│
├── goalchain-sdk/            # Shared TS SDK (id, idl, PROGRAM_ID, SEEDS)
├── goalchain_api/            # Express REST API on port 3001
├── goalchain_webapp/         # React/Vite SPA on port 5173 (Transaction Play)
├── goalchain_program/        # Solana/Rust Anchor program
├── goalchain_oracle/         # Sports-data oracle + vault cranking
├── goalchain_unity_scripts/  # Standalone .cs scripts for the Unity client
│
├── docs/                     # Marketing site (goalchain.fun) — read-only HTML/JS
├── assets/                   # Image assets shared on-chain + for marketing
│
├── ai_context/               # Agent operating manuals, charters, blueprints
├── ops/                      # Hermes, orchestrator, Oracle, X automation, Discord
├── scripts/                  # One-off CLI tools (playbooks, generators)
│
├── hermes/                   # Local-Hermes scripts/conventions (CEO profile)
├── antigravity_export/       # .md export of Antigravity plugins (legacy)
├── research/                 # x-deep reconnaissance artifacts
├── grok_batches/             # Immutable Grok squad-generation batch outputs
├── data/                     # Fiat/CSV tabular data referencing the on-chain state
├── exp/                      # Experimental branches
├── google_sync/              # Drive↔GitHub sync helper script
├── google_sync/              # Drive↔GitHub sync glue
├── mint_setup/               # One-shot NFT mint prep (Sugar config + wallet mapping)
├── polymarket_bot/           # Side-bet bot (separate Polymarket wallet)
│
└── Talks/                    # Conversation logs (Grok-CEO, X-Research)
```

> Anything starting with underscore (`_archive/`) is **not** part of the active
> codebase. Read those only for archaeology.

---

## 🔬 Three-layer model

The active code is grouped into **three layers** that connect in two well-defined
places: **economy** and **on-chain calls**.

```
┌────────────────────────────────────────────────────────────────────┐
│                       1. ON-CHAIN LAYER (Rust/Anchor)              │
│   goalchain_program/programs/goalchain_program/src/lib.rs          │
│   - PDAs, instructions, account layouts                            │
│   - Hard guarantee: ECONOMIC_CANONICAL_CONFIG values enforced      │
└────────────────────┬───────────────────────────────────────────────┘
                     │  IDL JSON (Anchor generated)
                     ▼
┌────────────────────────────────────────────────────────────────────┐
│                  2. SDK LAYER (TypeScript)                         │
│   goalchain-sdk/src/                                              │
│       index.ts           → exports PROGRAM_ID, idl, types         │
│       goalchain_program.json                                     │
│       goalchain_program.ts                                         │
│       utils/retry.ts                                              │
│   NEW (this reorg):                                                │
│       goalchain_program_environment.ts → typed env wrapper        │
└────────┬─────────────────────────────────────┬─────────────────────┘
         │                                     │
         ▼                                     ▼
┌────────────────────────┐         ┌─────────────────────────────────┐
│ 3A. API (Node/Express) │         │ 3B. WEBAPP (React/Vite)         │
│ goalchain_api/src/     │         │ goalchain_webapp/src/           │
│ - HTTP @3001           │         │ - SPA @5173 (play.goalchain)    │
│ - Reads GlobalConfig   │         │ - Calls SDK                     │
│ - Exposes /api/economy │         │ - Posts signed tx via wallet    │
│ - Bridges on-chain ↔   │         │ - Subscribes to fixtures        │
│   off-chain ops/health │         │                                 │
└────────────────────────┘         └────────────────┬────────────────┘
                                                   │
                                                   ▼
                                       ┌────────────────────────────┐
                                       │ 4. DATA ORACLE              │
                                       │ goalchain_oracle/           │
                                       │ - Fixture pipelines         │
                                       │ - Vault crank               │
                                       │ - Token init                │
                                       │ - Contributor epoch          │
                                       └──────────────────────────────┘
```

---

## 📌 The two connection points

### A. **Economy** ‑ `docs/ECONOMIC_CANONICAL_CONFIG.json`

The canonical config is rendered into **all four** consumer layers:

- **Program** enforces `max_fee_bps`, `architect_tax_bps`, `potion_burn_lamports`, etc.
- **SDK** does **not** compute fees. It forwards instructions. The fees come from accounts.
- **API** reads the JSON to compute `flow_24h`, KPIs, and the `config_drift_reasons` warnings.
- **Webapp** displays **read-only** values (no client-side economics — read from the API).
- **Oracle** enforces the burn/buyback schedule from the same config.

**Rule:** any change to tokenomics **starts** in this file, then flows to:
1. `goalchain_program` (re-anchor build)
2. `goalchain-sdk` (regenerate JSON IDL if accounts change)
3. `goalchain_api` (snapshot reads — usually no code change)
4. `goalchain_webapp` (re-display via API)
5. `goalchain_oracle` (drift detection + KPI alerting)

### B. **Programming** ‑ `goalchain-sdk` is the bridge

- `goalchain_webapp/src/lib/goalchainClient.ts` imports through `import { idl } from '@goalchain/sdk'`.
- `goalchain_api/src/index.ts` imports `idl, PROGRAM_ID, GoalchainProgram, retryRpcCall` from `@goalchain/sdk`.
- `goalchain_oracle/src/*.ts` constructs `ANCHOR_PROGRAM_ID` from the same generated IDL.

**The SDK is *the* bridge.** If you change a Solana account layout, you regenerate
the IDL, rebuild the SDK (`cd goalchain-sdk && npm run build`), then the API and webapp
will pick up the new types on their next build. The Oracle reads the on-chain layout
directly so it usually self-heals.

---

## 🗺️ Decision rules — where to put new code

| If you're adding... | Put it in... |
|---------------------|--------------|
| A Solana account, instruction, or constraint | `goalchain_program/programs/` |
| A typed wrapper or PDA helper | `goalchain-sdk/src/` |
| A new HTTP endpoint or KPI | `goalchain_api/src/` and update `goalchain_webapp/src/lib/economyClient.ts` |
| A new SPA page or component | `goalchain_webapp/src/ui/` (or `components/`) |
| A cron job / background worker | `ops/` or new sibling to `goalchain_oracle/` |
| A marketing page or copy | `docs/` |
| A prompt or asset spec | `ai_context/` (or `assets/` for generated images) |
| A study/research artifact | `research/` (with a date prefix) |
| A throwaway experiment | `exp/` (never `scratch/` — `.gitignore`d) |
| A side-product (Polymarket etc.) | `polymarket_bot/` or its own top-level |

If your change touches **both** the program and the SDK **and** the API/webapp,
ship them as **one PR** — they cannot be merged independently without breaking
the build.

---

## 🚧 Active vs. archived vs. external

| Status | Detection |
|--------|-----------|
| 🟢 Active | Has `package.json` / `Anchor.toml` and is imported by another package |
| 🟡 Experimental | Lives under `exp/`, `grok_batches/` (read-only output), or is a personal script |
| 🔴 Archived | Starts with `_`; or contains `ARCHIVED.md` / `OBSOLETE_DO_NOT_READ.md`; or is in a `.tar.gz` |
| 🔵 External | Lives outside this repo (VPS, Notion, Drive) |

---

## 🔍 What's gone (recent reorganization, 2026-06-19)

The following were pruned in this pass — **do not resurrect** unless the issue
tracker says otherwise:

- `goalchain_backend/`, `goalchain_hub/`, `goalchain_web/` — superseded by `goalchain_api` + `goalchain_webapp`.
- `_backups/STABLE_V1_FULL_SQUAD/`, `_backups/web_history/` — content backed up under tag `stable-v1-backup`.
- `scratch/migration_temp/` — was an orphan copy. Backup under the same tag.
- `_archive/GoalChain_Client/` (Unity project, ~11 MB uncompressed) → preserved as `_archive/GoalChain_Client_Legacy.tar.gz`.
- `goalchain_unity_scripts/` stays — these are the *scripts* the Unity team pulls in by hand.

The full audit trail is in [`reorganization_log.md`](../../reorganization_log.md) at the
repo root.

---

## 🤝 Multi-agent coordination map

| Agent | Touches | Skips |
|-------|---------|-------|
| **Antigravity (Cursor)** | integration, merge owner | raw implementation experiments |
| **FCC / OpenCode** | `agent:opencode`-tagged issues, draft PRs | architecture / on-chain (P0 uses opus) |
| **Manager (Hermes CEO)** | user-facing schedule, ops, discord | direct repo commits |
| **Cursor Cloud** | preview / qa | production deploys |
| **Grok via Hermes** | review, spike | long-running refactors |

If you are a new agent reading this, **always** look for `dispatch:local-queued`
issues on the kanban (Oracle VPS `state.db`) and the `#dev-room` channel for
current tasks before opening new work.
