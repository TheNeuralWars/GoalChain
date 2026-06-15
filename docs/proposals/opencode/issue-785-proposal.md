# OA Proposal — Issue #785

## Title
AI-EXPONENTIAL: OpenTelemetry & Prometheus Ingestion Metrics

## Source
GitHub issue #785

## Objective
### Goal
Track system health and burn metrics for presale campaigns.

### Checklist
- Integrate `prom-client` or OpenTelemetry in the Express API to expose real-time metrics (RPC health, burn rate, Presale SOL totals).
- Expose a `/metrics` scrape endpoint for Prometheus dashboard visualization.

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-785` and close draft PR.
