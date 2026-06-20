# OA Proposal: Issue #352 — [OPENCODE] SDK: Update goalchain-sdk to match modular Oracle + Program (IDL sync, types, clients)

**Worker:** stigma (partition 9)
**Owner:** opencode
**Priority:** P0
**Mode:** Normal mode: open draft PR for Antigravity/Nico review.

## Issue Body
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
- `npm run test` > 80% coverage
- Exports work in webapp: `import { ... } from 'goalchain-sdk'`

## Dependencies
- Requires Program modularization (#315-332) and Oracle modularization (#305-314) complete first

## Owner
opencode

## Priority
P0

## Context
Requested by Nico via Manager (WhatsApp/OpenClaw). Keep scope tight and aligned with GoalChain orchestration rules.

## Required output
- Proposed file list
- Risks/regressions + rollback
- Exact test commands

## Workflow
- One implementer only
- Branch naming:
  - cursor: `feat/*` or `fix/*`
  - antigravity: `exp/antigravity-*`
  - opencode: `exp/opencode-*`
  - grok: `exp/grok-*`
- Draft PR for Antigravity/Nico review — no direct merge to `main` unless `cambio urgente`
