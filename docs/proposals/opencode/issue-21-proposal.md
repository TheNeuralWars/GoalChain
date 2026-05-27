# OA Proposal — Issue #21

## Title
ISSUE-019 - Implement weekly vault buyback/burn crank

## Source
GitHub issue #21

## Objective
## Objective
Operationalize Infinity Engine loop: harvest yield -> buyback -> burn.

## Files
- `goalchain_oracle/src/*`

## Acceptance Criteria
- Job is idempotent with tx-hash logging.
- Retry/alert behavior documented and tested in dry-run.

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-21` and close draft PR.
