# OA Proposal — Issue #13

## Title
ISSUE-011 - Create ManagerDailyClaim PDA

## Source
GitHub issue #13

## Objective
## Objective
Add `ManagerDailyClaim` PDA keyed by manager and UTC day.

## Files
- `goalchain_program/programs/goalchain_program/src/lib.rs`

## Acceptance Criteria
- Counter increments on each salary claim.
- Explicit error is returned when cap is exceeded.

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-13` and close draft PR.
