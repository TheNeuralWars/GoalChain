# OA Proposal — Issue #8

## Title
ISSUE-006 - Apply fee split in claimBetPayout

## Source
GitHub issue #8

## Objective
## Objective
Split payout fee into burn/jackpot/treasury in `claimBetPayout`.

## Files
- `goalchain_program/programs/goalchain_program/src/lib.rs`
- `goalchain_program/tests/goalchain_program.ts`

## Acceptance Criteria
- Exact split tested in base units.
- Events emit split amounts.

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-8` and close draft PR.
