# OA Proposal — Issue #309

## Title
[OPENCODE] Oracle: Extract players module (record match, update stats)

## Source
GitHub issue #309

## Objective
## Objective
Extract player operations into packages/oracle/src/players/:

## Scope
Create `packages/oracle/src/players/` with:

1. `recordMatch.ts` - Record player fixture participation (from fixtures/recordPlayerMatch.ts)
2. `updateStats.ts` - Update player goals/assists for yield calculation (from fixtures/updatePlayerStats.ts)
3. `players.ts` - Composed PlayersService class
4. `types.ts` - PlayerMatchInput, PlayerStatsInput

## Note
These were in fixtures/ in the monolith but belong in their own domain module.

## Acceptance Criteria
- Each file < 100 lines
- Reuse fixtures module for PDA derivation
- Stats update validates against ECONOMIC_CANONICAL_CONFIG.json rarity yields

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
- Rollback: revert main commit linked to issue #309
