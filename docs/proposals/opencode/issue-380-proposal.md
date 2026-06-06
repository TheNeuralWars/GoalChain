# OA Proposal — Issue #380

## Title
[OPENCODE] [OPENCODE] Oracle: Facade services + SDK sync + tests + CI gate

## Source
GitHub issue #380

## Objective
## Objective
## Objective
Create facade services (OracleService, ScraperService, EconomyService) and sync SDK imports.

## Scope
### 1. Facade Services (goalchain_oracle/src/)
- **OracleService.ts** — Final version using all new modules (constants, priority-fees, vault-crank)
- **ScraperService.ts** — Final version with circuit breaker, retry, health
- **EconomyService.ts** — rarityYield + contributor epoch hook (refactored)

### 2. SDK Sync (goalchain-sdk/)
- Verify @goalchain/sdk exports PROGRAM_ID, SEEDS, IDL types
- Update goalchain_api to use SDK constants (already done, verify)
- Update goalchain_webapp lib clients to use SDK

### 3. Tests (goalchain_oracle/tests/)
- **priority-fees.test.ts** — Health check, failover, simulation
- **vault-crank.test.ts** — Config validation, GCH_MINT requirement, report generation
- **scraper.test.ts** — Circuit breaker, retry, provider health
- **oracle-service.test.ts** — PDA derivations, tx simulation

### 4. CI Gate (GitHub Actions)
- Add step: verify no hardcoded program IDs in oracle/src
- Add step: verify GCH_MINT_ADDRESS required in vault-crank
- Add step: SDK/anchor IDL match

## Acceptance Criteria
- Facade services expose clean APIs
- All tests pass
- CI gate prevents regressions
- Build passes

## Skill Hint
Follow gstack plan-eng-review.

## Owner
opencode

## Priority
P0

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-380` and close draft PR.
