# OA Proposal — Issue #307

## Title
[OPENCODE] Oracle: Extract fixtures module (initialize, live state, complete, player match, player stats)

## Source
GitHub issue #307

## Objective
## Objective
Extract fixture lifecycle operations into packages/oracle/src/fixtures/:

## Scope
Create `packages/oracle/src/fixtures/` with:

1. `initializeFixture.ts` - Initialize new fixture on-chain (lines 180-218)
2. `upsertLiveState.ts` - Update live match state: minute, score, HT/FT (lines 223-269)
3. `completeFixture.ts` - Complete fixture, resolve pre-match pools, record player matches (lines 384-435)
4. `recordPlayerMatch.ts` - Record player participation (idempotent) (lines 441-490)
5. `updatePlayerStats.ts` - Update player goals/assists for yield boost (lines 495-529)
6. `fixtures.ts` - Composed FixturesService class with all methods
7. `types.ts` - FixtureInput, LiveStateInput, PlayerMatchRecord, PlayerStatsUpdate

## Acceptance Criteria
- Each file < 150 lines
- Reuse core/OracleService for connection, wallet, priority fees
- Proper error handling with typed OracleError variants
- Idempotency for recordPlayerMatch (on-chain guard)
- Unit tests with mock provider

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

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #307
