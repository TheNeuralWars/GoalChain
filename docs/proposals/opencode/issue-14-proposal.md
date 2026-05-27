# OA Proposal — Issue #14

## Title
ISSUE-012 - Enforce max 11 salary claims per manager/day

## Source
GitHub issue #14

## Objective
## Objective
Enforce Starting XI claim cap per manager/day.

## Files
- `goalchain_program/programs/goalchain_program/src/lib.rs`
- `goalchain_program/tests/goalchain_program.ts`

## Acceptance Criteria
- 12th claim in same UTC day fails.
- Counter resets on next UTC day.

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-14` and close draft PR.
