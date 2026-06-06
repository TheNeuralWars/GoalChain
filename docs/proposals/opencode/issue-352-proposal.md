# OA Proposal — Issue #352

## Title
[OPENCODE] SDK: Update goalchain-sdk to match modular Oracle + Program (IDL sync, types, clients)

## Source
GitHub issue #352

## Objective
## Objective
Update goalchain-sdk to match new modular architecture:

## Scope
### 1. IDL Generation & Sync
- Regenerate IDL from modular goalchain_program (after Program issues #315-332 complete)
- `src/idl/` - Single source IDL.json
- `src/types/` - TypeScript types from IDL (anchor-typescript-gen)
- `src/accounts/` - Account discriminators, layouts, fetchers
- `src/instructions/` - Instruction builders, args types
- `src/events/` - Event types, parsers
- `src/errors/` - Error codes, messages

### 2. Client Modules
- `src/client/oracle.ts` - OracleService facade (modular oracle parity)
- `src/client/program.ts` - Program client (modular program parity)
- `src/client/api.ts` - goalchain_api client
- `src/client/index.ts` - Barrel export

### 3. Economy Module
- `src/economy/`
  - `constants.ts` - Re-export from ECONOMIC_CANONICAL_CONFIG.json
  - `calculations.ts` - Yield, fees, stamina, taxonomy helpers
  - `index.ts` - Barrel export

### 4. Player/NFT Module
- `src/players/` - Player metadata, asset URLs, rarity helpers
- `src/nft/` - Collection IDs, mint helpers, metadata

### 5. Utils & Helpers
- `src/utils/` - PDA derivations, serialization, validation
- `src/hooks/` - React hooks (if React package) or vanilla helpers

### 6. Barrel Export
- `src/index.ts` - Single public API

## Acceptance Criteria
- IDL matches deployed program exactly
- All types strictly typed (no any)
- `npm run build` passes

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-352` and close draft PR.
