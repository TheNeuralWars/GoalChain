# OA Proposal — Issue #379

## Title
[OPENCODE] [OPENCODE] Oracle: Refactor scraper, economy, CLI onto new foundations

## Source
GitHub issue #379

## Objective
## Objective
## Objective
Refactor Oracle modules (scraper, economy, CLI) onto new foundations (constants, priority-fees, vault-crank).

## Scope
Update goalchain_oracle/src/:

### 1. Scraper Resilience (scraper/)
- **circuit-breaker.ts** — Provider circuit breaker: 5 consecutive failures → 30s cooldown
- **retry.ts** — Exponential backoff + jitter (base 1s, max 30s)
- **health.ts** — Provider health metrics (latency, success rate, last error)
- **service.ts** — ScraperService: integrate circuit breaker, retry, health
- **fixtureOracle.ts** — FixtureOracle: use retry on provider calls, health reporting

### 2. Economy Module (economy/)
- **rarityYield.ts** — Verify imports from constants, no hardcoded paths
- Add unit tests for baseYieldForRarityTier, tieredPotionBurnGch

### 3. CLI Commands (cli/commands/)
All commands must:
- Import PROGRAM_ID from constants
- Use priority-fees/simulate.ts for tx safety
- Use vault-crank/ for crank-vaults
- Remove --program-id default (use constant)

Commands to verify/update:
- crank-vaults.ts → use vault-crank/
- init-fixture.ts, live-update.ts, complete-fixture.ts
- create-market.ts, resolve-market.ts, update-stats.ts
- record-player.ts, sync-authority.ts, init-tokens.ts
- contributor-epoch.ts

### 4. OracleService (OracleService.ts)
- Replace sendWithPriorityFees with priority-fees/simulateAndSend
- Import PDAs from constants/pda.ts
- Remove hardcoded program ID default param

## Acceptance Criteria
- Zero hardcoded program IDs outside constants/
- All CLI commands use new transaction safety

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-379` and close draft PR.
