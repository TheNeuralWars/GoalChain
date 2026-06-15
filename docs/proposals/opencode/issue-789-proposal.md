# OA Proposal — Issue #789

## Title
AI-AUDIT: Standardize Logging with Winston/Pino across API & Oracle

## Source
GitHub issue #789

## Objective
### Goal
Replace generic `console.log` statements with structured, JSON-formatted logs using winston or pino for better cloud monitoring.

### Checklist
- Integrate `pino` or `winston` in both the Express API and Oracle daemon.
- Format logs as JSON for integration with cloud logging services.

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-789` and close draft PR.
