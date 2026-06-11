# OA Proposal — Issue #716

## Title
[TEST] Add health endpoint to webapp

## Source
GitHub issue #716

## Objective
Add a simple /health endpoint to the GoalChain webapp that returns JSON {status: 'ok', timestamp: ISO}. Files to modify: goalchain_webapp/src/main.tsx or create a new route. Verify with npm run build.

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-716` and close draft PR.
