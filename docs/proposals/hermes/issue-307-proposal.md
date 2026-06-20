# Issue #307 Proposal: Extract Oracle Fixtures Module

## Objective
Extract fixture lifecycle operations from `OracleService.ts` into a dedicated `packages/oracle/src/fixtures/` module for better separation of concerns and maintainability.

## Current State
All fixture operations are in `goalchain_oracle/src/OracleService.ts` (529 lines):
- `initializeFixture` (lines 180-218)
- `upsertLiveState` (lines 223-269)
- `completeFixture` (lines 384-435)
- `recordPlayerMatch` (lines 441-490)
- `updatePlayerStats` (lines 495-529)

## Proposed File Structure
```
goalchain_oracle/src/fixtures/
├── types.ts                    # Shared types: FixtureInput, LiveStateInput, PlayerMatchRecord, PlayerStatsUpdate, OracleError
├── initializeFixture.ts        # Initialize new fixture on-chain
├── upsertLiveState.ts          # Update live match state: minute, score, HT/FT
├── completeFixture.ts          # Complete fixture, resolve pre-match pools, record player matches
├── recordPlayerMatch.ts        # Record player participation (idempotent with on-chain guard)
├── updatePlayerStats.ts        # Update player goals/assists for yield boost
├── fixtures.ts                 # Composed FixturesService class with all methods
└── index.ts                    # Barrel exports
```

## Implementation Plan

### 1. Create `types.ts` - Shared Types & Errors
- Define input types for each operation
- Define `OracleError` class with variants (INIT_FAILED, LIVE_UPDATE_FAILED, COMPLETION_FAILED, PLAYER_RECORD_FAILED, STATS_UPDATE_FAILED)
- Export all types for use across fixture modules

### 2. Create Individual Operation Files
Each file exports a single async function that:
- Takes `OracleService` instance (for connection, wallet, priority fees, program access)
- Takes typed input parameters
- Returns `Promise<string>` (transaction signature)
- Proper error handling with typed `OracleError` variants
- Logging consistent with current style

### 3. Create `fixtures.ts` - FixturesService Class
- Composed class that wraps all operations
- Constructor takes `OracleService` instance
- Methods delegate to individual operation functions
- Maintains same public API as current `OracleService` methods

### 4. Update `OracleService.ts`
- Remove the 5 fixture methods (lines 180-218, 223-269, 384-529)
- Import and delegate to `FixturesService` from `./fixtures`
- Keep `syncOracleAuthority`, `createLiveMarket`, `resolveMarket`, `sendWithPriorityFees`

### 5. Create Unit Tests
- Mock `OracleService` with minimal interface (connection, wallet, provider, program, configPda, sendWithPriorityFees)
- Test each operation file independently
- Test `FixturesService` composition
- Test error handling paths
- Test idempotency of `recordPlayerMatch` (on-chain guard verification)

## Risks & Regressions

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing API consumers | Medium | High | `OracleService` keeps same public method signatures via delegation |
| PDA derivation inconsistencies | Low | High | Copy PDA logic exactly; add unit tests for PDA derivation |
| Priority fee estimation changes | Low | Medium | Reuse `sendWithPriorityFees` from `OracleService` unchanged |
| Idempotency regression in `recordPlayerMatch` | Low | High | On-chain guard is in program; test verifies no double-drain |
| Import circular dependencies | Low | Medium | `fixtures` imports `OracleService` only for types; `OracleService` imports `FixturesService` |

## Rollback Plan
1. Revert `OracleService.ts` to original (git checkout)
2. Delete `goalchain_oracle/src/fixtures/` directory
3. Run `npm run lint` in `goalchain_oracle` to verify

## Test Commands

```bash
# Lint check
cd goalchain_oracle && npm run lint

# Run unit tests (to be created)
cd goalchain_oracle && npm test

# Build check
cd goalchain_oracle && npm run build

# Integration test (requires local validator)
cd goalchain_program && anchor test --validator legacy
```

## Branch & PR
- Branch: `exp/opencode-issue-307`
- PR: Draft, title: "feat(oracle): extract fixtures module (issue #307)"
- No direct merge to main (no `cambio urgente` in issue)

## Files to Create/Modify

### New Files (7)
1. `goalchain_oracle/src/fixtures/types.ts`
2. `goalchain_oracle/src/fixtures/initializeFixture.ts`
3. `goalchain_oracle/src/fixtures/upsertLiveState.ts`
4. `goalchain_oracle/src/fixtures/completeFixture.ts`
5. `goalchain_oracle/src/fixtures/recordPlayerMatch.ts`
6. `goalchain_oracle/src/fixtures/updatePlayerStats.ts`
7. `goalchain_oracle/src/fixtures/fixtures.ts`
8. `goalchain_oracle/src/fixtures/index.ts` (barrel export)

### Modified Files (2)
1. `goalchain_oracle/src/OracleService.ts` - Remove fixture methods, add FixturesService delegation
2. `goalchain_oracle/src/index.ts` - Export new fixtures module (optional)

### Test Files (1+)
1. `goalchain_oracle/src/fixtures/__tests__/fixtures.test.ts` (or similar test structure)