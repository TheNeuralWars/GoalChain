# OA Proposal — Issue #19

## Title
ISSUE-017 - Implement mint_gate script using 7d ratio

## Source
GitHub issue #19

## Objective
## Objective
Create `mint_gate` script that evaluates 7d emit/burn ratio and enforces policy.

## Files
- `goalchain_oracle/src/mint_gate.ts`

## Acceptance Criteria
- Computes `emit_burn_ratio_7d` from defined data sources.
- Produces deterministic action/recommendation based on thresholds.

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-19` and close draft PR.
