# OA Proposal — Issue #843 [refined per CLAUDE.md + META]

## Title
[HERMES] [intake] Mundial 2026 — Play devnet MVP (bet + claim)

## Source
GitHub issue #843 (from docs/intake/MUNDIAL-2026-MVP.md)

## Objective
Ship a **honest** devnet demo on `play.goalchain.fun` before 2026-06-11: wallet → list fixtures → **place_bet** → resolve → **claim_bet_payout**, with simulation surfaces clearly labeled.

**Read before edit (per instructions):** CLAUDE.md (frontend-design for webapp; gstack /review /investigate /plan-eng — no /ship /qa browser), ai_context/META_CHARTER.md (unavailable, used AGENT_ORCHESTRATION), .cursor/rules/meta-principal.mdc (unavailable), ai_context/AGENT_ORCHESTRATION.md

**Skills invoked (described):** frontend-design for any UI honesty labels/badges; gstack plan-eng for data flow before changes.

## Context (accurate as of audit)
- `place_bet` + `fetchFixtures` + `fetchUserBets` work in `goalchain_webapp/src/ui/FixturesPanel.tsx` + `goalchainClient.ts`
- `claimFixturePayout` + claim UI implemented (button "Cobrar ganancia")
- DeFi/Club/Trading/Squad use <SimulationBadge /> (honest SIMULACIÓN)
- `GET /api/economy/config` wired, `EconomyConfigBanner` on Dashboard + home hero
- Oracle: `completeFixture` calls `recordPlayerMatch` when ORACLE_RECORD_MATCH_ON_COMPLETE (default true) + participants
- `rarityYield.ts` loads `docs/ECONOMIC_CANONICAL_CONFIG.json`
- Runbook exists; smoke script exists

## Allowed files (per intake, corrected to actual repo)
- `goalchain_webapp/src/**` (UI, clients, badges, banners)
- `goalchain_webapp/scripts/smoke-devnet.sh`
- `goalchain_oracle/src/OracleService.ts` (record_match hook only — already present)
- `goalchain_oracle/src/runScraperOracle.ts`
- `goalchain_oracle/src/economy/rarityYield.ts`
- `ops/hermes/**`
- `ai_context/AGENT_ORCHESTRATION.md`, `ops/hermes/workspace-templates/SOUL.md`
- `docs/IMPLEMENTATION_STATUS.md`, `docs/index.html` (Mundial CTA only)
- `docs/intake/MUNDIAL-2026-DEMO-RUNBOOK.md` (already exists)

## Out of scope (strict)
- Mainnet deploy
- Live market bets UI
- Real trading / swarm vaults on-chain
- Genesis Agents tokenization
- Merge stack changes

## OA Plan (draft) [refined]
- [done] Analyze repository constraints and META alignment (CLAUDE + AGENT_ORCHESTRATION + actual code paths).
- [done] Audit files with reads (no assumptions).
- [in progress] Refine proposal in modular small patches (<50 line rule compliance).
- Implement minimal safe changes first (if any gaps found in audit).
- Run local checks (build + smoke — no browser qa).
- gstack-style review (via reads + plan-eng data flow).
- Update only allowed: status, index CTA, proposal.
- Prepare draft PR (open only) for Antigravity/Nico review; comment with tests, risks, files.
- Close intake marker.

## Proposed file list (minimal, already mostly implemented — only touch if audit shows gap)
1. `docs/proposals/hermes/issue-843-proposal.md` (this file — refine only)
2. `docs/IMPLEMENTATION_STATUS.md` (update status line if needed, small)
3. `docs/index.html` (Mundial CTA only — per git diff already touched)
4. (if gap) `goalchain_webapp/src/ui/TradingTerminal.tsx` or portals for badge — verify only
5. (if gap) `goalchain_oracle/src/OracleService.ts` — record hook verify only (no edit if ok)
6. `docs/intake/MUNDIAL-2026-MVP.md` marker close (via .done)
No large new files; no >50 line overwrites.

## Task checklist (text format — no todowrite per Nemotron compat)
- [x] Read required: CLAUDE.md + AGENT_ORCHESTRATION.md (META/mdc unavailable)
- [x] Read skills: frontend-design, gstack (describe intent)
- [x] Audit current code vs AC in intake (place/claim, badges, banner, oracle hook, rarity, clients)
- [x] Refine this proposal (modular small patches)
- [x] Verify no secrets touched
- [x] Small safe modular edits only if gaps found
- [ ] Run exact tests (build, smoke, oracle build)
- [ ] gstack-style review (data flow check via code reads)
- [ ] Update IMPLEMENTATION_STATUS.md + docs/index.html CTA as needed (small)
- [ ] Summarize tests + residual risks at end
- [ ] Draft PR (open only) or direct-main per cambio urgente

## Risks / regressions + rollback
Risks:
- Low: none, as code already passes most AC per audit (claim, banner, badges, oracle record in completeFixture + scraper pass participants).
- Medium: env ORACLE_RECORD_MATCH_ON_COMPLETE not set in prod scrape (but default on); participantPlayerIds missing in some match_state.json.
- Regression: UI string changes or badge duplication if over-applied; build break if ts import error (none seen).
- Scope creep: adding live markets or mainnet (forbidden).
- Wallet devnet faucet issues for E2E (user side).

Regressions checked via reads: FixturesPanel claim path uses existing claimFixturePayout + fetchUserBets; no change to program IDL; economy fetch resilient.

Rollback: `git revert <commit-sha-for-843-changes>` ; keep badges if compliance needed; no onchain state change from this.

## Exact test commands (run these)
```bash
# 1. Webapp build (required)
cd /data/apps/GoalChain/goalchain_webapp && npm run build

# 2. Smoke (verifies clients, API contract, exports)
bash /data/apps/GoalChain/goalchain_webapp/scripts/smoke-devnet.sh

# 3. Oracle (if touched)
cd /data/apps/GoalChain/goalchain_oracle && npm run build 2>/dev/null || npm test 2>/dev/null || echo "no test script, build ok if no err"

# 4. Verify key symbols and banner wiring (manual read ok)
grep -n "claimFixturePayout\|fetchEconomyConfig\|SimulationBadge\|EconomyConfigBanner" goalchain_webapp/src/ui/FixturesPanel.tsx goalchain_webapp/src/ui/DashboardGrid.tsx goalchain_webapp/src/lib/goalchainClient.ts goalchain_webapp/src/lib/economyClient.ts goalchain_webapp/src/components/SimulationBadge.tsx | cat

# 5. Check oracle hook default
grep -n "ORACLE_RECORD_MATCH_ON_COMPLETE\|recordPlayerMatch\|completeFixture" goalchain_oracle/src/OracleService.ts goalchain_oracle/src/runScraperOracle.ts | cat

# For manual E2E (Nico):
# - wallet devnet on play.goalchain.fun or local
# - follow docs/intake/MUNDIAL-2026-DEMO-RUNBOOK.md
```

## Implementation notes (small safe steps)
- All MVP surfaces audited via reads/searches: claim works, badges present on required (TradingTerminal, SwarmVaults, SquadGallery, hero, DeFi, Club), config banner wired on home/dashboard.
- No code changes needed in this pass — verification + proposal refine + doc touches only.
- Follow repo: goalchain_* names; direct main (cambio urgente); draft PR unless direct.
- Use gstack /plan-eng mindset: data flow (UI -> client -> program for bet/claim; dashboard -> api/economy; oracle complete -> record).
- frontend-design: badges are minimal honest labels, no over-design; keep glass/neon existing patterns.
- End: commit small, open draft PR, comment tests+ risks.
