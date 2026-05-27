# OA Proposal — Issue #24

## Title
ISSUE-022 - Ship economy observability dashboard endpoints

## Source
GitHub issue #24

## Objective
## Objective
Expose and display real-time sustainability KPIs.

## Files
- `goalchain_api/src/index.ts`
- `docs/*`

## Acceptance Criteria
- Endpoints include `emit_burn_ratio_7d`, `onchain_sink_coverage`, `config_drift`.
- Dashboard renders metrics clearly for community/team.

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-24` and close draft PR.
