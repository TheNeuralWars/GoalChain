# OA Proposal — Issue #15

## Title
ISSUE-013 - Update rent_nft with 70/25/5 split

## Source
GitHub issue #15

## Objective
## Objective
Implement renter/owner/protocol split in rent flow.

## Files
- `goalchain_program/programs/goalchain_program/src/lib.rs`
- `goalchain_program/tests/goalchain_program.ts`

## Acceptance Criteria
- Split amounts tested exactly.
- Protocol share routes to configured fee split policy.

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-15` and close draft PR.
