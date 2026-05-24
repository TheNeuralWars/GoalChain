# Deep Audit Master TODO (Repo-wide)

- **Date:** 2026-05-24
- **Status:** ready
- **Owner:** cursor (integration owner)
- **Source:** deep repository excavation (code + docs + ops)

## Objective
Convert all backend/ops capabilities that are already implemented into concrete frontend behavior, while closing unfinished integrations and stale plans across the full GoalChain repository.

## Repository map (where each thing lives)

### Core runtime
- `goalchain_program/`: Solana Anchor on-chain logic (bets, treasury, yield, policy guards).
- `goalchain-sdk/`: TS SDK + synced IDL + seeds/program id exports.
- `goalchain_api/`: Express API (economy config/metrics/health + support endpoints).
- `goalchain_oracle/`: off-chain ops jobs (match sync, vault crank, mint gate, epoch hooks).
- `goalchain_webapp/`: transactional frontend (wallet flows, bets, claims, user UX).
- `docs/`: static/marketing/read-only site + operational docs/intake backlog.

### Operations / orchestration
- `ops/hermes/`: OA worker/webhook/systemd/hands-free dispatch.
- `ops/openclaw/`: workspace templates + cron installers.
- `ai_context/`: architecture rules, orchestration docs, canonical context.
- `scripts/`: cross-repo utilities (idl sync, check tasks, setup, sync helpers).

### Data / mint / support
- `mint_setup/`: mint config and metadata assets.
- `assets/`: static datasets and support artifacts.
- `_archive/`, `_backups/`: historical snapshots (non-runtime).

## `/to_do` list (prioritized)

### /to_do/1 (P0) — done
Implement end-to-end `goalchain_webapp` devnet transaction MVP:
- real fixtures source (`goalchainClient.fetchFixtures`)
- real `place_bet` (`placeFixtureBet`)
- real user state (`fetchUserChainStats` in profile)
- LiveEventFeed on-chain snapshot

### /to_do/2 (P1) — done
Enforce frontend ownership split:
- `docs/` strictly read-only/marketing
- transactional flows only in `goalchain_webapp`
- canonical play URL: `https://play.goalchain.fun` (alias `https://goalchain.fun/go`)

### /to_do/3 (P1) — done
Reconcile stale docs that contradict implemented backend/on-chain behavior.
- Canonical map: `docs/IMPLEMENTATION_STATUS.md`
- Updated: `P1-onchain-sinks.md`, `EXECUTION_BACKLOG_90D.md`, `LAUNCH_READINESS_CHECKLIST.md`, `FRONTEND_OWNERSHIP_POLICY.md`

### /to_do/4 (P1) — done
Unify duplicate intake briefs for webapp devnet transactions into one canonical brief.
- Canonical: `docs/intake/2026-05-22-webapp-devnet-transactions.md`
- Duplicate cancelled: `2026-05-23-quiero-que-el-webapp-muestre-transacciones-en-devnet.md`

### /to_do/5 (P1) — done
Expose backend ops state in frontend:
- mint gate status
- vault crank status
- contributor epoch hook status
- API: `GET /api/ops/status` · UI: `OpsStatusPanel` in webapp

### /to_do/6 (P1)
Consolidate Hermes/OpenClaw installers into an idempotent server install path.

### /to_do/7 (P0)
Harden dispatch lifecycle:
- queue reliability
- `dispatch:local-queued/running/done/blocked` transitions
- retry safety

### /to_do/8 (P1)
Align config variables with actual consumption; remove or implement dead keys.

### /to_do/9 (P1) — blocked
Replace mint placeholders with real environment-specific accounts and regenerate artifacts.

### /to_do/10 (P1) — done
Add frontend integration/e2e checks for wallet -> bet -> claim flow.
- Script: `goalchain_webapp/scripts/smoke-devnet.sh` (build + API ops/config smoke; wallet bet manual on devnet)

### /to_do/11 (P2)
Unify backlog sources (`docs/intake`, `docs/issues`, `EXECUTION_BACKLOG_90D`) into one consistent status model.

### /to_do/12 (P2)
Stop noisy X publisher failures when credentials are missing (feature-flag/no-op mode).

### /to_do/13 (P2)
Update task discovery scripts to include dispatch labels and in-progress states.

### /to_do/14 (P2)
Create a mandatory backend->frontend integration runbook template for all future features.

## Execution policy (autonomous sequence)

- Execute `/to_do/1..n` in order without waiting for additional prompts.
- Only stop for blockers that require external credentials, production approvals, wallet custody, or infra permissions.
- For each blocker:
  - record path + exact reason
  - document unblock command/request
  - continue to next todo immediately

## Blocker handling section (to fill during execution)

- **B-001 (affects /to_do/2):** resolved 2026-05-24.
  - **Decision:** canonical `play.goalchain.fun`; alias redirect `goalchain.fun/go`.
  - **Implemented:** `docs/app.html` + `docs/go/index.html` redirects, CTAs → `/go/`, `docs/FRONTEND_ROUTING.md`, `goalchain_webapp/vercel.json`.
  - **Remaining ops (user):** connect Vercel project to `goalchain_webapp/` and add DNS CNAME `play` → Vercel.

- **B-002 (affects /to_do/9):** mint royalty wallets still placeholders in `mint_setup/`.
  - **Why blocked:** requires confirmed Founder / BuilderFund / Community Treasury pubkeys per environment (devnet vs mainnet).
  - **Required user intervention:** provide three Solana pubkeys (or approve devnet-only test wallets) to regenerate `mint_setup/config.json` + asset metadata batch.
  - **Interim action:** documented; execution continues with remaining todos.

