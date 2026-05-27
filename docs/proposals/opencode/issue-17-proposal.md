# OA Proposal — Issue #17

## Title
ISSUE-015 - Add API endpoint for active economy config

## Source
GitHub issue #17

## Objective
## Objective
Expose active economic parameters to clients through API.

## Files
- `goalchain_api/src/index.ts`

## Acceptance Criteria
- `GET /api/economy/config` returns config version + parameters.
- UI can consume endpoint instead of hardcoded values.

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-17` and close draft PR.
