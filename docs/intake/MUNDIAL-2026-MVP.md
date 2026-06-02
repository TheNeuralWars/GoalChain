# Mundial 2026 — Play devnet MVP (bet + claim)

- **Task Created:** https://github.com/TheNeuralWars/GoalChain/issues/272
- **Task Status:** ready

- **Date:** 2026-05-26
- **Status:** ready
- **Priority:** P0
- **Owner (implementer):** `agent:opencode` (FCC) / Antigravity merge
- **Reviewers:** Grok, Hermes

## Objective

Ship a **honest** devnet demo on `play.goalchain.fun` before 2026-06-11: wallet → list fixtures → **place_bet** → resolve → **claim_bet_payout**, with simulation surfaces clearly labeled.

## Context

- `place_bet` works ([`FixturesPanel.tsx`](../../goalchain_webapp/src/ui/FixturesPanel.tsx)).
- **`claim_bet_payout` missing** in webapp — blocks E2E ([`docs/IMPLEMENTATION_STATUS.md`](../IMPLEMENTATION_STATUS.md)).
- DeFi/Club tabs are mock — must show **SIMULACIÓN** badge, not imply on-chain.
- API: wire `GET /api/economy/config` on home (drift banner).

## Allowed files

- `goalchain_webapp/src/**`
- `goalchain_webapp/scripts/smoke-devnet.sh`
- `goalchain_oracle/src/OracleService.ts` (record_match hook only)
- `goalchain_oracle/src/runScraperOracle.ts`
- `goalchain_oracle/src/economy/rarityYield.ts` (load canonical JSON)
- `ops/hermes/**` (CEO commands, profile sync scripts)
- `ai_context/AGENT_ORCHESTRATION.md`, `ops/hermes/workspace-templates/SOUL.md`
- `docs/IMPLEMENTATION_STATUS.md`, `docs/index.html` (Mundial CTA only)
- `docs/intake/MUNDIAL-2026-DEMO-RUNBOOK.md` (new)

## Out of scope

- Mainnet deploy
- Live market bets UI
- Real trading / swarm vaults on-chain
- Genesis Agents tokenization
- Merge stack #26–#34 (Antigravity separate)

## Acceptance criteria

1. `claimFixturePayout()` in `goalchainClient.ts` + Claim UI on resolved fixtures.
2. `fetchUserBets()` shows user's bets per fixture (claimed/open).
3. `SimulationBadge` on TradingTerminal, SwarmVaults, SquadGallery, mock hero stats.
4. `EconomyConfigBanner` on dashboard using `apiBaseUrl()/api/economy/config`.
5. `oracle_record_match` called from `completeFixture` when env `ORACLE_RECORD_MATCH_ON_COMPLETE=true` (default on).
6. `rarityYield.ts` reads `docs/ECONOMIC_CANONICAL_CONFIG.json` at startup.
7. `npm run build` in `goalchain_webapp` passes.
8. Runbook: Nico completes bet→claim in &lt; 5 min on devnet.

## Test commands

```bash
cd goalchain_webapp && npm run build
bash goalchain_webapp/scripts/smoke-devnet.sh
cd goalchain_oracle && npm test 2>/dev/null || npm run build
```

## Rollback

Revert webapp/oracle commits; keep simulation badges if needed for compliance.
