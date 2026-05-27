# OA Proposal — Issue #23

## Title
ISSUE-021 - Define official transactional frontend and deprecations

## Source
GitHub issue #23

## Objective
## Objective
Set `goalchain_webapp` as official transactional client and deprecate conflicting docs flows.

## Files
- `docs/LAUNCH_READINESS_CHECKLIST.md`
- `goalchain_webapp/*`
- `docs/*`

## Acceptance Criteria
- Critical transactions exist only in official client.
- Docs site is read-only for economy-sensitive actions.

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-23` and close draft PR.
