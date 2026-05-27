# OA Proposal — Issue #12

## Title
ISSUE-010 - Integrate oracle_record_match in OracleService

## Source
GitHub issue #12

## Objective
## Objective
Call new match-record instruction from oracle flow.

## Files
- `goalchain_oracle/src/OracleService.ts`

## Acceptance Criteria
- Oracle flow sends instruction on fixture update/close.
- Logs include matchId, player, tx hash.

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-12` and close draft PR.
