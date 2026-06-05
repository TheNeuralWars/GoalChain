# Issue #309 Proposal: Extract Players Module from Oracle Fixtures

## Objective
Extract player operations into `packages/oracle/src/players/` as a dedicated domain module.

## Current State
- `recordPlayerMatch.ts` exists in `src/fixtures/` (42 lines)
- `updatePlayerStats()` method exists in `OracleService.ts` (lines 450-483)
- Types `PlayerMatchRecord` and `PlayerStatsUpdate` in `src/fixtures/types.ts`
- PDA derivation functions in `src/fixtures/types.ts`

## Proposed File Structure
```
goalchain_oracle/src/players/
├── types.ts          # PlayerMatchInput, PlayerStatsInput, PlayerError
├── recordMatch.ts    # Record player fixture participation
├── updateStats.ts    # Update player goals/assists with canonical config validation
├── players.ts        # Composed PlayersService class
└── index.ts          # Barrel exports
```

## Implementation Plan

### 1. `types.ts` (~30 lines)
- Move `PlayerMatchRecord` → `PlayerMatchInput`
- Move `PlayerStatsUpdate` → `PlayerStatsInput`
- Add `PlayerErrorCode` and `PlayerError` class (mirroring `OracleError`)
- Re-export PDA derivation functions from `../fixtures/types.js`

### 2. `recordMatch.ts` (~45 lines)
- Extract logic from `fixtures/recordPlayerMatch.ts`
- Import PDA derivation from `../fixtures/types.js`
- Use `PlayerError` for error handling

### 3. `updateStats.ts` (~60 lines)
- Extract logic from `OracleService.updatePlayerStats()`
- **Add validation**: Check `goalsAdded`/`assistsAdded` against `ECONOMIC_CANONICAL_CONFIG.json` rarity yields
- Import `baseYieldForRarityName` from `../economy/rarityYield.js`
- Use `PlayerError` for error handling

### 4. `players.ts` (~50 lines)
- `PlayersService` class composing `recordMatch` and `updateStats`
- Constructor accepts `OracleService` (for `program`, `wallet`, `configPda`, `sendWithPriorityFees`)
- Delegate to standalone functions

### 5. `index.ts` (~10 lines)
- Barrel export all modules

## Integration Points
- `OracleService` will delegate to `PlayersService` (backward compatible)
- `runMatchSimulation` in `index.ts` continues to work via `oracle.updatePlayerStats()`
- No changes to on-chain program or SDK

## Validation Logic for `updateStats.ts`
```typescript
// Pseudo-code for canonical config validation
const baseYield = baseYieldForRarityName(playerRarity); // from config
const goalPercent = config.oracle_yield_policy.goal_percent; // 10%
const assistPercent = config.oracle_yield_policy.assist_percent; // 5%
// Validate goalsAdded/assistsAdded are reasonable (e.g., < 10 per match)
```

## Risks & Regressions
| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Breaking `OracleService.updatePlayerStats()` callers | Low | Keep method as thin delegate to `PlayersService` |
| PDA derivation mismatch | Low | Reuse exact same functions from `fixtures/types.ts` |
| Canonical config path resolution | Medium | Use existing pattern from `rarityYield.ts` |

## Rollback Plan
1. Revert `goalchain_oracle/src/players/` directory creation
2. Restore `OracleService.updatePlayerStats()` inline implementation
3. No database/on-chain state changes — purely code reorganization

## Test Commands
```bash
# Lint (type-check)
cd goalchain_oracle && npm run lint

# Build
cd goalchain_oracle && npm run build

# Verify OracleService still compiles and exports correctly
cd goalchain_oracle && node -e "import('./dist/OracleService.js').then(m => console.log('OK:', Object.keys(m)))"
```

## Branch
`exp/opencode-issue-309` (draft PR for Antigravity/Nico review)

## Notes
- Each file < 100 lines ✓
- Reuses fixtures PDA derivation ✓
- Validates against `ECONOMIC_CANONICAL_CONFIG.json` ✓
- Follows existing `markets/` module pattern ✓