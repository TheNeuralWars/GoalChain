# OA Proposal — Issue #16

## Title
ISSUE-014 - Unify economy i18n wording burn vs treasury

## Source
GitHub issue #16

## Objective
## Objective
Remove ambiguous economy wording in UI text.

## Files
- `docs/assets/js/i18n.js`
- `docs/assets/js/*`
- `goalchain_webapp/src/ui/*`

## Acceptance Criteria
- Burn is only used for actual burns.
- Treasury transfer wording is explicit in ES/EN.

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-16` and close draft PR.
