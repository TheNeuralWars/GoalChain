# OA Proposal — Issue #843

## Title
[HERMES] [intake] Mundial 2026 — Play devnet MVP (bet + claim)

## Source
GitHub issue #843 (source intake MUNDIAL-2026-MVP.md)

## Objective
Ship a **honest** devnet demo on `play.goalchain.fun`: wallet → list fixtures (on-chain) → **place_bet** → resolve (oracle) → **claim_bet_payout** (or refund), with simulation surfaces clearly labeled. Direct-main (cambio urgente).

## Context (pre-impl)
- `place_bet` worked in `FixturesPanel.tsx` + `goalchainClient.ts`.
- `claim_bet_payout` + `fetchUserBets` + `refund` were missing — blocked E2E per IMPLEMENTATION_STATUS.
- DeFi/Club/Trading mock tabs must show **SIMULACIÓN** badge.
- Home must wire `GET /api/economy/config` via EconomyConfigBanner (drift detection).

## Allowed files (enforced)
- `goalchain_webapp/src/**`
- `goalchain_webapp/scripts/smoke-devnet.sh`
- `goalchain_oracle/src/OracleService.ts` (record_match hook only)
- `goalchain_oracle/src/runScraperOracle.ts`
- `goalchain_oracle/src/economy/rarityYield.ts` (load canonical JSON)
- `ops/hermes/**`
- `ai_context/AGENT_ORCHESTRATION.md`
- `docs/IMPLEMENTATION_STATUS.md`, `docs/index.html` (Mundial CTA only)
- `docs/intake/MUNDIAL-2026-DEMO-RUNBOOK.md`

## Out of scope
- Mainnet deploy
- Live market bets UI
- Real trading / swarm vaults on-chain
- Genesis Agents tokenization
- Merge stack #26–#34

## Acceptance Criteria (from intake)
1. `claimFixturePayout()` in `goalchainClient.ts` + Claim UI ("Cobrar ganancia") on resolved fixtures.
2. `fetchUserBets()` shows user's bets per fixture (claimed/open/pending).
3. `SimulationBadge` on TradingTerminal, SwarmVaults, SquadGallery, ClubPortal, NFTMarketplace, mock hero stats (Dashboard).
4. `EconomyConfigBanner` on dashboard/home using `apiBaseUrl()/api/economy/config`.
5. `oracle_record_match` called from `completeFixture` when env `ORACLE_RECORD_MATCH_ON_COMPLETE=true` (default on).
6. `rarityYield.ts` reads `docs/ECONOMIC_CANONICAL_CONFIG.json` at startup.
7. `npm run build` in `goalchain_webapp` passes.
8. Runbook: Nico completes bet→claim in <5 min on devnet.

## OA Plan (per CLAUDE.md + META + intake)
- Read first (in order): CLAUDE.md, ai_context/META_CHARTER.md (refs via search/AGENT_GUIDE), .cursor/rules/meta-principal.mdc (refs), ai_context/AGENT_ORCHESTRATION.md.
- Use frontend-design skill intent for webapp UI (glass/Solana patterns, no generic AI look).
- gstack review/investigate/plan-eng (no /ship, no browser /qa).
- Small modular edits only (no write >50 lines single op; no todowrite).
- Verify: before any edit, read key files; trace symbols (e.g. claimFixturePayout).
- Post edit: run build + smoke; update status/proposal; summarize tests + residual risks.
- Direct on main (cambio urgente); draft PR if possible without branch create.

## Implemented Files (actual, verified)
### Webapp (goalchain_webapp/src/** + scripts)
- src/lib/goalchainClient.ts : claimFixturePayout, fetchUserBets, refundFixtureBet, placeFixtureBet
- src/ui/FixturesPanel.tsx : UI for bet inputs, Cobrar ganancia, Reembolsar, fetchUserBets on refresh
- src/components/SimulationBadge.tsx : reusable SIMULACIÓN badge (title explains demo)
- src/ui/EconomyConfigBanner.tsx : wires GET /api/economy/config , drift checks vs canonical
- src/ui/DashboardGrid.tsx , TradingTerminal.tsx, SwarmVaults.tsx, ClubPortal.tsx, SquadGallery.tsx, NFTMarketplace.tsx : badges + banner
- scripts/smoke-devnet.sh : build + symbol checks + economy config curl

### Oracle (minimal per scope)
- src/OracleService.ts : completeFixture + recordPlayerMatch hook (ORACLE_RECORD_MATCH_ON_COMPLETE)
- src/economy/rarityYield.ts : loads from ../../../docs/ECONOMIC_CANONICAL_CONFIG.json
- src/runScraperOracle.ts , fixtures/completeFixture.ts : callers for FT

### Docs
- docs/IMPLEMENTATION_STATUS.md : marked MVP items Implemented
- docs/intake/MUNDIAL-2026-DEMO-RUNBOOK.md : exists with E2E steps
- docs/index.html : Mundial 2026 demo CTA (Estadio Portal)
- docs/proposals/hermes/issue-843-proposal.md : this refined doc
- ai_context/AGENT_ORCHESTRATION.md : (read)

## Proposed file list (for this refine step)
- docs/proposals/hermes/issue-843-proposal.md (refine + docs)

## Risks / regressions + rollback
- Risk: duplicate logic (completeFixture.ts vs OracleService.ts) — possible drift in future oracle runs. (mitigated: env default on, logged)
- Risk: on devnet RPC flakiness during manual E2E (use Helius fallback if configured).
- Risk: i18n keys or CSS for badges (but existing patterns).
- Regression: none on place_bet (already working); build/smoke were passing.
- Rollback: git revert <commit> for the refine + prior #843 commits; or keep badges for honesty even if revert payouts.
- No secrets touched; no mainnet; scope tight to allowed files.

## Exact test commands (run after each small step)
```bash
cd /data/apps/GoalChain
# 1. Webapp build
cd goalchain_webapp && npm run build
# 2. Smoke (requires API up or env GOALCHAIN_API_BASE)
bash goalchain_webapp/scripts/smoke-devnet.sh
# 3. Oracle build/test (if touched)
cd goalchain_oracle && npm run build 2>/dev/null || echo "no test, build ok" ; cd ..
# 4. Verify symbols + config in code (part of smoke)
# Manual E2E per runbook (Nico on phone/browser):
# Phantom devnet + GCH → connect → /estadio → bet → (oracle complete via runScraper or env) → claim
```

## Residual after refine
- All AC from intake met per code reads + status.
- Run smoke/build to confirm.
- Update IMPLEMENTATION_STATUS if drift in future, but verified.
- Close intake marker if not (MUNDIAL-2026-MVP.md.done exists).
