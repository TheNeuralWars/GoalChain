# OA Proposal — Issue #788

## Title
AI-AUDIT: Add Transaction Simulation (simulateTransaction) to Critical Paths

## Source
GitHub issue #788

## Objective
### Goal
Run transaction simulations before every mainnet submission to catch failures pre-flight.

### Checklist
- Implement `simulateTransaction` calls before submitting any on-chain transaction in `vault_crank.ts` and Oracle paths.
- Log simulation details and halt execution if the simulation fails.

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-788` and close draft PR.
