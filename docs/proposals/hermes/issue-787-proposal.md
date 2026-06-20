# OA Proposal — Issue #787

## Title
AI-AUDIT: Minimum Priority Fee Floors & Compute Unit Caching

## Source
GitHub issue #787

## Objective
### Goal
Enforce minimum priority fee floors via environment variables and cache compute unit estimates in `priorityFees.ts`.

### Checklist
- Add support for loading `PRIORITY_FEE_FLOOR` from environment variables.
- Cache compute unit estimates with a TTL (5-15 seconds) inside `priorityFees.ts` to reduce RPC pressure.

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-787` and close draft PR.
