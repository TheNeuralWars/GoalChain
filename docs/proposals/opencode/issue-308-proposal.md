# OA Proposal — Issue #308

## Title
[OPENCODE] Oracle: Extract markets module (create live market, resolve market, update market status)

## Source
GitHub issue #308

## Objective
## Objective
Extract live market operations into packages/oracle/src/markets/:

## Scope
Create `packages/oracle/src/markets/` with:

1. `createLiveMarket.ts` - Open new live betting market (lines 274-334)
2. `resolveMarket.ts` - Resolve market with winner, allow claims (lines 339-379)
3. `updateMarketStatus.ts` - Update market status (open/closed/resolved)
4. `markets.ts` - Composed MarketsService class
5. `types.ts` - MarketInput, MarketType, WinnerVariant, MarketStatus

## Acceptance Criteria
- Each file < 150 lines
- Proper PDA derivation for market accounts
- Token mint validation (must be GCH or approved)
- Delay seconds and close minute validation
- Unit tests for market creation flow

## Skill Hint
Follow gstack investigate workflow (root cause, max 3 fixes).

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

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #308
