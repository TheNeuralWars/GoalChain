# Implementation Status (docs ↔ code reconciliation)

**Updated:** 2026-07-08 (#843 direct-main verified: build/smoke pass, claim+badge+config wired, oracle hook ok; FCC re-audit + proposal refine + tests executed)  
**Purpose:** Single map of what is implemented in code vs operational/frontend work.

Source of truth for parameters: `docs/ECONOMIC_CANONICAL_CONFIG.json`.

---

## Mundial 2026 MVP (devnet demo — target before 2026-06-11)

| Item | Status | Notes |
|------|--------|-------|
| Wallet connect devnet | **Implemented** | Play webapp |
| Fixtures list on-chain | **Implemented** | `fetchFixtures` |
| `place_bet` UI | **Implemented** | `FixturesPanel` |
| `claim_bet_payout` UI | **Implemented** | `claimFixturePayout` + Cobrar button |
| `refund_bet` UI | **Implemented** | Cancelled fixtures |
| Economy banner (API) | **Implemented** | `EconomyConfigBanner` → `/api/economy/config` |
| Simulation badges (DeFi/Club) | **Implemented** | `SimulationBadge` |
| Ops panel home | **Implemented** | `OpsStatusPanel` |
| Smoke script | **Implemented** | `scripts/smoke-devnet.sh` + runbook |
| `oracle_record_match` on FT | **Implemented** | `completeFixture` + `ORACLE_RECORD_MATCH_ON_COMPLETE` |
| Rarity yields from canonical JSON | **Implemented** | `goalchain_oracle/src/economy/rarityYield.ts` |

**Out of Mundial MVP:** mainnet, live market bets UI, real trading/vaults, Genesis Agents, video automation.

Brief: `docs/intake/MUNDIAL-2026-MVP.md` · Demo: `docs/intake/MUNDIAL-2026-DEMO-RUNBOOK.md`

---

## On-chain core (`goalchain_program`)

| Capability | Code status | Remaining |
|------------|-------------|-----------|
| Fee split on claim/payout | **Implemented** | Mainnet validation |
| `oracle_record_match` | **Implemented** | Oracle wired on fixture complete |
| ManagerDailyClaim XI cap | **Implemented** | — |
| BuilderFund + epochs | **Implemented** | Ops runbook |

---

## Oracle / ops (`goalchain_oracle`)

| Job | Status | Notes |
|-----|--------|-------|
| Fixture sync / complete | **Implemented** | Scraper driver |
| `recordPlayerMatch` after complete | **Implemented** | Optional `participantPlayerIds` in match state JSON |
| `rarityYield` canonical load | **Implemented** | Reads `ECONOMIC_CANONICAL_CONFIG.json` |
| `vault_crank.ts` | **Implemented** | Execute path still dry-run/fake until post-Mundial |

---

## API (`goalchain_api`)

| Endpoint | Play webapp usage |
|----------|-------------------|
| `GET /api/ops/status` | **Yes** |
| `GET /api/economy/config` | **Yes** (banner) |
| `POST /api/coach/chat` | Classic hub / marketing (not Vite routes yet) |

---

## Frontend

| Surface | URL | Status |
|---------|-----|--------|
| Marketing | `goalchain.fun` (`docs/`) | **Live** — Mundial CTAs → `/go/estadio` |
| Play | `play.goalchain.fun` (`goalchain_webapp/`) | Devnet MVP in repo; deploy per `docs/PLAY_DEPLOY_GUIDE.md` |

---

## Post-Mundial backlog

1. Merge stack PRs #26–#34 + #35 (Completed/Merged)
2. Live market bets UI + oracle markets
3. Vault crank real execution or documented OFF
4. Genesis Agents (`docs/GENESIS_AGENTS_PROTOCOL.md`)
5. Archive `goalchain_backend/` (`goalchain_backend/ARCHIVED.md`)
6. Coach API in Play via `apiBaseUrl()` (retire localhost in `docs/assets/js/ai_agent.js`)

---

## Archived / dead packages

- `goalchain_backend/` — see `ARCHIVED.md`
- `goalchain_web/` — empty shell
- `DashboardHub.tsx` — not routed in `App.tsx`
