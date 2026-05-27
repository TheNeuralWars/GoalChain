# OA Proposal — Issue #10

## Title
ISSUE-008 - Expose new config fields in SDK

## Source
GitHub issue #10

## Objective
## Objective
Expose new GlobalConfig fields through SDK/IDL types and helpers.

## Files
- `goalchain-sdk/src/goalchain_program.ts`
- `goalchain-sdk/src/index.js`

## Acceptance Criteria
- Types include new config fields.
- Clients can read updated config via SDK.

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-10` and close draft PR.
