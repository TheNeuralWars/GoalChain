# OA Proposal — Issue #7

## Title
ISSUE-005 - Extend GlobalConfig with split and starters cap

## Source
GitHub issue #7

## Objective
## Objective
Extend GlobalConfig with `fee_burn_bps`, `fee_jackpot_bps`, `max_starters_per_manager`.

## Files
- `goalchain_program/programs/goalchain_program/src/lib.rs`

## Acceptance Criteria
- BPS sum validation is enforced.
- Safe defaults are initialized.

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-7` and close draft PR.
