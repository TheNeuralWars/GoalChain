# Issue #308 Proposal: Oracle Markets Module Extraction

## Objective
Extract live market operations from `OracleService.ts` into a dedicated `packages/oracle/src/markets/` module.

## Current State
Market operations (lines 274-379 in `OracleService.ts`):
- `createLiveMarket()` - lines 274-334
- `resolveMarket()` - lines 339-379

## Proposed File Structure
```
goalchain_oracle/src/markets/
├── types.ts              # MarketInput, MarketType, WinnerVariant, MarketStatus
├── createLiveMarket.ts   # Create live market logic
├── resolveMarket.ts      # Resolve market with winner
├── updateMarketStatus.ts # Update market status (open/closed/resolved/cancelled)
├── markets.ts            # Composed MarketsService class
└── index.ts              # Barrel exports
```

## Implementation Plan

### 1. types.ts
Define TypeScript equivalents of on-chain enums:
- `MarketType`: `MatchResultLive` | `NextGoal` | `Custom`
- `MarketStatus`: `Open` | `Closed` | `Resolved` | `Cancelled`
- `MatchResult` (WinnerVariant): `TeamA` | `TeamB` | `Draw`
- `MarketInput` interface for createLiveMarket parameters
- `ResolveMarketInput` interface for resolveMarket parameters

### 2. createLiveMarket.ts
Extract `createLiveMarket` logic from OracleService:
- PDA derivation for market account
- Token mint validation (must be GCH or approved)
- Delay seconds and close minute validation
- Returns transaction signature

### 3. resolveMarket.ts
Extract `resolveMarket` logic:
- PDA derivation
- Winner validation
- Calls `oracleUpdateMarketStatus` with `Resolved` status and winner

### 4. updateMarketStatus.ts
New function to update market status generically:
- Accepts `MarketStatus` enum and optional `winner`
- Validates status transitions (e.g., can't reopen resolved market)
- Used by both resolveMarket and future close/cancel operations

### 5. markets.ts
Composed `MarketsService` class:
- Depends on `OracleService` (connection, wallet, provider, program, configPda)
- Exposes `createLiveMarket`, `resolveMarket`, `updateMarketStatus`
- Delegates to individual modules

### 6. OracleService.ts refactor
- Remove `createLiveMarket` and `resolveMarket` methods
- Add `markets: MarketsService` property
- Delegate market operations to `this.markets`

## Acceptance Criteria
- [ ] Each file < 150 lines
- [ ] Proper PDA derivation for market accounts
- [ ] Token mint validation (must be GCH or approved)
- [ ] Delay seconds and close minute validation
- [ ] Unit tests for market creation flow

## Risks & Regressions
| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing OracleService API | High | Keep same method signatures on MarketsService, delegate from OracleService |
| PDA derivation mismatch | High | Copy exact derivation logic from OracleService |
| Token mint validation missing | Medium | Add explicit validation in createLiveMarket |
| Test coverage gaps | Medium | Add unit tests for new modules |

## Rollback Plan
1. Revert `OracleService.ts` to original state
2. Delete `goalchain_oracle/src/markets/` directory
3. Run `npm run lint` in `goalchain_oracle` to verify

## Test Commands
```bash
# Lint check
cd goalchain_oracle && npm run lint

# Build check
cd goalchain_oracle && npm run build

# Run program tests (requires local validator)
cd goalchain_program && anchor test --validator legacy

# Manual verification - run oracle simulation
cd goalchain_oracle && npm start
```

## Branch & PR
- Branch: `exp/opencode-issue-308`
- PR: Draft, title references #308
- No direct merge to main (no `cambio urgente` in issue)