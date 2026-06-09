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

### /to_do/6 (P1) — done
Consolidate Hermes/OpenClaw installers into an idempotent server install path.
- Entry: `ops/hermes/install-hermes-server.sh` (bootstrap + script sync + hands-free + optional OpenClaw)

### /to_do/7 (P0) — done
Harden dispatch lifecycle:
- Idempotent queue in `oa-dispatch-local.sh` (skip duplicate queued/running/done)
- Labels: `dispatch:local-queued/running/done/blocked`
- Retry + macOS timeout fallback in `local-agent-bridge.sh`

### /to_do/8 (P1) — done
Align config variables with actual consumption; remove or implement dead keys.
- Trimmed `ops/hermes/config.env.example` to [used] vs [planned]
- Flags: `OA_RESEARCH_PUBLISHER_ENABLED`, `OA_X_PUBLISH_ENABLED` (default OFF)

### /to_do/9 (P1) — done
Replace mint placeholders → `mint_setup/wallets.json` + `apply_wallets.py` (1248 assets, 2026-05-24)
- Same pubkeys for devnet + mainnet (`wallets.json` field `environment`)

### /to_do/10 (P1) — done
Add frontend integration/e2e checks for wallet -> bet -> claim flow.
- Script: `goalchain_webapp/scripts/smoke-devnet.sh` (build + API ops/config smoke; wallet bet manual on devnet)

### /to_do/11 (P2) — done
Unify backlog sources → `docs/BACKLOG_STATUS_MODEL.md`

### /to_do/12 (P2) — done
Stop noisy X publisher failures when credentials are missing (feature-flag/no-op mode).
- Worker skips publisher unless `OA_RESEARCH_PUBLISHER_ENABLED=true`
- `post_x` no-op when `OA_X_PUBLISH_ENABLED=false`

### /to_do/13 (P2) — done
Update task discovery scripts to include dispatch labels and in-progress states.
- `scripts/check-tasks.sh`: ready + in_progress per agent + dispatch queue

### /to_do/14 (P2) — done
Runbook template → `docs/intake/templates/feature-integration-runbook.md`

## Execution policy (autonomous sequence)

- Execute `/to_do/1..n` in order without waiting for additional prompts.
- Only stop for blockers that require external credentials, production approvals, wallet custody, or infra permissions.
- For each blocker:
  - record path + exact reason
  - document unblock command/request
  - continue to next todo immediately

## Blocker handling section (to fill during execution)

- **B-001 (play deploy):** resolved 2026-05-24 — `play.goalchain.fun` valid on Vercel.

- **B-002 (mint wallets):** resolved 2026-05-24.
  - **Wallets:** `mint_setup/wallets.json` (devnet + mainnet, same pubkeys)
  - **Regenerate:** `python3 mint_setup/apply_wallets.py`

- **B-003 (ops panel live):** optional — deploy public `goalchain_api` + set `VITE_API_BASE_URL` on Vercel. See `docs/PLAY_DEPLOY_GUIDE.md` Paso 1b.

