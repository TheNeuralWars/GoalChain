# 🤖 GoalChain: AI Agent Master Instructions

**Source of Truth.** Priority over any other README. Read this file before doing anything.

> One single document replaces the old `AGENTS.md` + `ai_context/01_guidelines/AGENT_GUIDE.md`.
> If you find conflicting guidance in those files, this one wins.

---

## 🎯 What is GoalChain

GoalChain is a Solana Web3 football gaming ecosystem. The core flow is:

- **Economy**: NFT mint + Vault + Liquid Staking → ∞ Buyback & Burn of $GCH.
- **Programming**: SDK ↔ API ↔ Webapp call the same Solana program (`FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg`).
- Two layers connect everything: **economy config** and **on-chain program calls**. See `ai_context/REPO_ARCHITECTURE.md`.

---

## 📂 Where each piece lives (TL;DR)

| Layer | Path | Owner | Purpose |
|-------|------|-------|---------|
| On-chain program | `goalchain_program/` | Solana/Rust (Anchor) | PDAs, instructions, accounts |
| Shared TS SDK | `goalchain-sdk/` | `id`, `idl`, `PROGRAM_ID`, `SEEDS` | Consumed by API + Webapp |
| API | `goalchain_api/` | Express on port 3001 | Economy metrics, ops, economy config |
| Webapp (player) | `goalchain_webapp/` | React/Vite port 5173 | Transactional Play UI |
| Oracle | `goalchain_oracle/` | Node.js | Fixtures, vault crank, off-chain workers |
| Marketing site | `docs/` | Vanilla HTML/JS/glass | Reads-only at goalchain.fun |
| Agent context | `ai_context/` | Markdown | Charters, blueprints, skills |
| Operations | `ops/hermes/` | Bash + systemd | 24/7 Hermes CEO Manager |

Full layer map and decision rules: `ai_context/REPO_ARCHITECTURE.md`.

---

## 🏛️ Architecture non-negotiables

1. **Single Source of Truth for economy**: `docs/ECONOMIC_CANONICAL_CONFIG.json`. Any change in tokenomics, fees, mint gates, or burn ratios **must** start here. The on-chain program enforces it; the API reads it; the webapp reads it.
2. **Single Source of Truth for the IDL**: `goalchain-sdk/src/goalchain_program.json` (rebuilt from `goalchain_program/programs/goalchain_program/src/lib.rs`). After any `anchor build`, copy the regenerated IDL into the SDK and run `cd goalchain-sdk && npm run build`.
3. **Single Program ID everywhere**: `FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg`. Hard-coded in `Anchor.toml`, `goalchain-sdk/src/index.ts`, and `goalchain_program/programs/.../lib.rs` `declare_id!`. Do not duplicate.
4. **Single players DB**: `docs/assets/data/players.json` AND `ai_context/03_data/players.json` are mirrors (both 528 players, same SHA). Replicate changes in both.
5. **Never read or commit** `.env`, `fcc.secrets.env`, `config.env`, or any keypair file. The agent **may** read `.env` *values* at runtime via helpers in `ops/hermes/`, but never writes them.

---

## 🛠️ Build & run order

```bash
# 1. SDK first
cd goalchain-sdk && npm run build

# 2. Start the API
cd ../goalchain_api && npm run dev    # port 3001

# 3. Start the webapp
cd ../goalchain_webapp && npm run dev # port 5173
```

Webhook config in `goalchain_webapp/.env.production` points to `http://localhost:3001` for dev and the prod URL for builds.

The Oracle runs off-host (typically on the VPS under `oa-worker.service`). `cd goalchain_oracle && npm install` then `node index.js` for local.

---

## ⚙️ Network seams (read this before touching RPC)

A single shared config lives at `.env.shared` (root). It is the **bridge between packages** so the SDK, API, webapp, and Oracle agree on:

- `GOALCHAIN_CLUSTER` — `localnet` | `devnet` | `mainnet`
- `RPC_URL` — Solana RPC endpoint
- `PROGRAM_ID` — Anchor program pubkey
- `GCH_TOKEN_MINT` — $GCH SPL mint (currently `<PENDING_MINT_BASE58>` until the mint is established on devnet; the runtime reads the active mint from `global_config` account on chain)

A typed wrapper is exported from `@goalchain/sdk/goalchain_program_environment` (added in 2026-06-19 reorganization). It does **not** yet replace the per-package `Connection` constructors — that migration is tracked separately to keep this pass zero-risk on the build. See **§ Future migration** below.

---

## 🌐 Frontend & deployment

- **Source of Truth for the website**: `/docs` is the **only** folder that should ever deploy to `goalchain.fun`. The webapp under `goalchain_webapp/` is the **transactional Play** SPA at `play.goalchain.fun`.
- **Tech**: HTML5, vanilla CSS (glassmorphism), JS for `/docs`. No frameworks without authorization.
- **Asset masters**: `docs/assets/data/players.json` for player names, `nft_master_prompts_*.json` under `ai_context/` for image prompts.

---

## 🔑 Hand-offs (Antigravity & Cursor plugins)

The following Antigravity skills are mandatory references:

1. `solana-web3-integration` — PDAs, IDL handling, `DevGoaL` wallet mock fallbacks.
2. `responsive-glassmorphism` — dApp glass UI on PC/tablet/mobile.
3. `client-side-ai-ml` — WebGPU/WASM/IndexedDB patterns for in-browser AI.
4. `grok-cli-delegation` — For image/video generation tasks (e.g. NFT cards, automated video projects), agents can delegate the work to the active `grok-cli` session on the VPS by running `/home/ubuntu/hermes/scripts/grok-agent-cmd.sh "<instruction>"`.

---

## 🚨 Critical operational rules

1. **English-only on public surfaces** (Discord, X, Zealy, ads, docs marketing copy). Zero Spanish. Marketing generators and validators must enforce this.
2. **Channel-overload discipline** — each info gets one channel; never cross-blast identical blocks. See `ops/discord/discord_channel_router.js` + `LAUNCH_CAMPAIGN_AGGRESSIVE.md`.
3. **VPS-only writes** for `/data/apps/GoalChain`. Local edits can happen for preview but deploys come from the VPS repo.
4. **One implementer per task** — FCC pipeline via `oa-run-code.sh`, draft PRs only. Never merge to main unless the issue body has `cambio urgente`.

---

## 🧰 Verification matrix

| Package | Command |
|---------|---------|
| `goalchain-sdk` | `npm run lint` (tsc --noEmit) |
| `goalchain_api` | `npm run lint` (tsc --noEmit) |
| `goalchain_oracle` | `npm run lint` (tsc --noEmit) |
| `goalchain_program` | `anchor build` |
| `goalchain_webapp` | `npx tsc --noEmit` (known wallet-adapter JSX typings warning is OK) |

Known gotcha: the webapp has a React 18 + `@solana/wallet-adapter-react` types mismatch on `ConnectionProvider`. **It does not block Vite dev.** Don't try to "fix" it — work around the typing.

---

## 🔁 Future migration (deferred)

After this reorganization, the following steps are **queued** but **NOT executed**:

- Migrate `goalchain_api/src/index.ts` import of `Connection` to use `@goalchain/sdk/goalchain_program_environment`.
- Migrate `goalchain_webapp/src/lib/goalchainClient.ts` to use the same wrapper.
- Migrate `goalchain_oracle/src/initialize_tokens.ts` and `src/vault_crank.ts` to read RPC_URL + PROGRAM_ID from the env wrapper instead of dotenv.
- Replace hard-coded `PROGRAM_ID` in older `docs/assets/js/*.js` snippets with the wrapper import.

Each migration must ship in its own PR after a successful `anchor test` and the frontend type check.

---

## 📚 Where to read next

- `ai_context/REPO_ARCHITECTURE.md` — full layer map and decision rules.
- `ai_context/META_CHARTER.md` — engineering principles.
- `ai_context/AGENT_ORCHESTRATION.md` — who merges what.
- `docs/ECONOMIC_CANONICAL_CONFIG.json` — economy canonical config.
- `WORKFLOW.md` — task workflow rules.
## 🔒 Skill Security (from voice #845)
Before installing or using new skills (SKILL.md, ~/.claude/skills/ packs from intake/voice), scan with NVIDIA SkillSpector: `skillspector scan <path-or-git-url> --no-llm`. See docs/SECURITY_AUDIT.md §5 for patterns (prompt inj, exfil, MCP abuse etc). Thin, optional, no dep.

**Last updated:** 2026-06-19 (Reorganization v1.0 — merged AGENTS.md + old AGENT_GUIDE.md into this single root file).
