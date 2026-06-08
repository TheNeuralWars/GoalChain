# OA Proposal — Issue #481

## Title
[OPENCODE] [IMPL] #360 Core unit tests (onchainService, csvService, PDA, failover)

## Source
GitHub issue #481

## Objective
## Objective
## Task: Core unit tests (Issue #360 → PR #406)

**Priority:** P1
**Branch:** exp/opencode-issue-360
**PR Target:** #406 (already approved)

### Context
Approved with global vision: "SDK & Testing: unit tests reales + IDL types = devs externos pueden construir sin permission. Test-first en core → #406 garantiza que onchainService/csvService/PDA/failover no rompen al iterar"

### Implementation Required
Create test files in `packages/goalchain-core/tests/` (or existing test dir):

**1. `onchainService.test.ts`**
- `getProgramAccounts` with filters
- `sendTransaction` with priority fees
- `simulateTransaction` preflight
- `confirmTransaction` with commitment levels
- Mock connection for unit tests, devnet for integration

**2. `csvService.test.ts`**
- `parseCSV` with various delimiters
- `validateCSV` against schema
- `transformCSV` to typed objects
- Edge cases: empty, malformed, BOM, large files

**3. `pdaUtils.test.ts`**
- `deriveFixturePDA(season, home, away, time)`
- `deriveMarketPDA(fixtureId, type)`
- `derivePlayerPDA(mint)`
- `derivePoolPDA(marketId)`
- Test collision resistance, seed ordering

**4. `solanaFailover.test.ts`**
- RPC endpoint rotation on failure
- Health check latency threshold
- Automatic fallback to next healthy RPC
- Circuit breaker pattern

### Shared Test Utilities

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-481` and close draft PR.
