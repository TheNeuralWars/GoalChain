# OA Proposal — Issue #360

## Title
[OPENCODE] [OPENCODE] Core: Unit tests for onchainService, csvService, pda utils, solana failover

## Source
GitHub issue #360

## Objective
## Objective
## Objective
Add comprehensive unit tests for core services extracted during API modularization (#353) and SDK restructure (#358).

## Scope
Create test files in goalchain_api/tests/ and goalchain-sdk/tests/:

### goalchain-sdk/tests/
1. **pda.unit.test.ts** — PDA derivation helpers
   - All seeds from constants/seeds.ts derive correct PDAs
   - Config, Player, Fixture, Market, Position, Wager, Stake, Rental, LiveState, BuilderFund, BuilderContributorEpoch
   - Deterministic output for same inputs

2. **types.unit.test.ts** — Type shape validation
   - Account types have expected fields (Config, Player, Fixture, Market, etc.)
   - Instruction arg types match IDL
   - Event types serializable

3. **client.integration.test.ts** — Client fetch patterns (mocked)
   - ConfigAccountClient.fetch() returns typed OnchainConfigSnapshot | null
   - Client.subscribe() sets up change listeners
   - Graceful null fallback when account missing

### goalchain_api/tests/
1. **onchainService.test.ts** — Onchain account fetching
   - fetchOnchainConfig() returns typed snapshot or null
   - fetchAccountOrNull() generic works for all account types
   - No 500 thrown on missing accounts
   - Warn-level logging on miss

2. **csvService.test.ts** — CSV parsing & helpers
   - parseCsv() handles quoted fields, empty lines, missing columns
   - num() handles strings, numbers, undefined, NaN
   - envNum() reads from process.env with fallback

3. **solana.test.ts** — RPC failover & connection
   - getConnection() returns Connection instance
   - healthCheckAndFailover() rotates endpoints on failure
   - Falls through priority list: Helius → Alchemy → public devnet → public mainnet
   - Recovers when primary comes back

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-360` and close draft PR.
