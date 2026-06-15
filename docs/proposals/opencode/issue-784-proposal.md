# OA Proposal — Issue #784

## Title
AI-EXPONENTIAL: Consensus-Driven Multi-Source Oracle Scraper

## Source
GitHub issue #784

## Objective
### Goal
Remove single points of failure in sports score ingestion by scraping ESPN and SofaScore in parallel.

### Checklist
- Refactor `oracle_scraper.py` to fetch live soccer scores from multiple providers (e.g. ESPN, SofaScore, Transfermarkt) in parallel.
- Implement a simple consensus algorithm to resolve discrepancies before writing the canonical match state.

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-784` and close draft PR.
