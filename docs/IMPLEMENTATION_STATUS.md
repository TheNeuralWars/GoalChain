# Implementation Status (docs ↔ code reconciliation)

**Updated:** 2026-05-24  
**Purpose:** Single map of what is implemented in code vs what remains operational/frontend work. Resolves stale “planned” language in older design docs.

Source of truth for parameters: `docs/ECONOMIC_CANONICAL_CONFIG.json`.

---

## On-chain core (`goalchain_program`)

| Capability | Design doc | Code status | Remaining |
|------------|------------|-------------|-----------|
| `fee_burn_bps`, `fee_jackpot_bps`, `max_starters_per_manager` on `GlobalConfig` | `P1_ONCHAIN_SINKS_DESIGN.md` §2 | **Implemented** (`lib.rs`, init defaults) | Env-specific config validation on target cluster |
| Fee split on claim/payout paths | §3 | **Implemented** (`split_fee_amounts` in claims) | Integration tests + frontend i18n accuracy |
| `oracle_record_match` (stamina drain, idempotent) | §4 | **Implemented** (`lib.rs`) | **Oracle wiring** — `goalchain_oracle` does not call it yet |
| `ManagerDailyClaim` XI cap (11/day) | §5 | **Implemented** | Integration test coverage |
| `rent_nft` 70/25/5 split | §6 | **Implemented** | Webapp UX copy |
| `BuilderFund` + contributor epochs | `CURRENT_ECONOMIC_PARAMETERS.md`, `P2_VAULT_MINT_ROADMAP.md` | **Implemented** (accounts + fund/spend/epoch ix) | Operational runbook + devnet/mainnet validation |
| P0 fee cap, architect tax, potion burn, rarity yields | `P0_HARDENING_PLAN.md` | **Implemented** | Governance review for mainnet deploy |

---

## Oracle / ops (`goalchain_oracle`)

| Job | Status | Notes |
|-----|--------|-------|
| `OracleService` fixture sync | **Implemented** | Live devnet path |
| `vault_crank.ts` | **Implemented** | Ops script exists |
| `mint_gate.ts` | **Implemented** | Script in repo; env thresholds need tuning |
| `contributor_epoch_hook.ts` | **Implemented** | Script in repo |
| Call `oracle_record_match` after fixture resolution | **Not wired** | On-chain ix exists; oracle integration pending |

---

## API (`goalchain_api`)

| Endpoint | Status |
|----------|--------|
| `GET /api/economy/config` | **Implemented** |
| `GET /api/economy/metrics` | **Implemented** |
| `GET /health` | **Implemented** |

---

## Frontend

| Surface | URL | Status |
|---------|-----|--------|
| Marketing / read-only | `goalchain.fun` (`docs/`) | **Live** — CTAs → `/go/` |
| Transactional webapp | `play.goalchain.fun` (`goalchain_webapp/`) | **Deploy pending** (Vercel + DNS); devnet MVP in progress |
| Legacy dashboard | `goalchain.fun/app.html` | **Redirect** → play |

See `docs/FRONTEND_ROUTING.md`.

---

## Docs that were stale (corrected 2026-05-24)

- `P1_ONCHAIN_SINKS_DESIGN.md` — header now marks on-chain core as implemented.
- `docs/issues/P1-onchain-sinks.md` — scope split into done vs follow-up.
- `EXECUTION_BACKLOG_90D.md` Sprint 1 — annotated with implementation status.
- `FRONTEND_OWNERSHIP_POLICY.md` — play URL + redirect policy.

---

## Still open (not contradictions — genuine backlog)

1. Wire `oracle_record_match` in `OracleService` after match resolution.
2. Frontend: expose mint gate / vault crank / epoch hook status (`/to_do/5`).
3. Webapp devnet E2E: wallet → bet → claim (`/to_do/1`, `/to_do/10`).
4. BuilderFund operational validation + spend runbook on target env.
5. Simulation script: include `fee_burn` in S0 scenarios (`scripts/tokenomics_simulation.py`).
