# OA Proposal — Issue #11

## Title
ISSUE-009 - Add idempotent oracle_record_match

## Source
GitHub issue #11

## Objective
## Objective
Add `oracle_record_match` with one-time stamina drain per fixture/player.

## Files
- `goalchain_program/programs/goalchain_program/src/lib.rs`
- `goalchain_program/tests/goalchain_program.ts`

## Acceptance Criteria
- Stamina drains by configured amount once per fixture.
- Duplicate record for same fixture does not double-drain.

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-11` and close draft PR.
