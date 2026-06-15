# OA Proposal — Issue #791

## Title
AI-AUDIT: Fix computeMintGateFromRows & WSOL Fallbacks

## Source
GitHub issue #791

## Objective
### Goal
Fix edge cases in `computeMintGateFromRows` (empty selections) and remove dangerous fallback mint resolutions to WSOL in `vault_crank.ts:217`.

### Checklist
- Ensure `computeMintGateFromRows` handles empty selected arrays gracefully.
- Remove dangerous fallback mint resolution to WSOL in `vault_crank.ts:217`.

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-791` and close draft PR.
