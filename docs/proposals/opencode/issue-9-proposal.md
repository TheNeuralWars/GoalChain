# OA Proposal — Issue #9

## Title
ISSUE-007 - Apply fee split in claimMarketPayout

## Source
GitHub issue #9

## Objective
## Objective
Apply same fee split logic to live market payout claims.

## Files
- `goalchain_program/programs/goalchain_program/src/lib.rs`
- `goalchain_program/tests/goalchain_program.ts`

## Acceptance Criteria
- Payout and fee split test coverage added.
- Rule parity with `claimBetPayout`.

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-9` and close draft PR.
