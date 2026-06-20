# OA Proposal — Issue #299

## Title
[OPENCODE] Task 5 - Live "Trust Badge" on Landing Showing Real Economy Metrics

## Source
GitHub issue #299

## Objective
## Objective
`goalchain_api/src/index.ts:810` already computes and exposes `emit_burn_ratio_7d`, `onchain_sink_coverage`, `config_drift`, and `vault_buyback_coverage` via `GET /api/economy/metrics` — the four KPIs that `docs/EXECUTION_BACKLOG_90D.md` defines as the "gate of release" for scaling user acquisition. None of them are visible anywhere on the public site. Investors and Zealy quest participants have no way to see that the protocol is operating within its target economic bands. Action: (1) add an `EconomyHealthBadge.tsx` component in `goalchain_webapp/src/ui/` that fetches `/api/economy/metrics` every 60s and renders a 4-cell status grid (Healthy / Warning / Critical) using the existing `buildEconomyHealthPayload` thresholds, (2) mount it on the landing page in `App.tsx` below the hero, (3) auto-post a daily snapshot of these KPIs to the new `hermes-reports` private Discord channel (commit `684a1416`) using a cron-driven script in `scripts/marketing/` so partners/holders see live numbers, (4) ship the badge in English to match the campaign.

---
**Canonical specification file:** [2026-06-04-growth-task-5-live-trust-badge-on-landing-showing-real-economy-metrics.md](file:///home/ubuntu/hermes/workspace/GoalChain/docs/intake/2026-06-04-growth-task-5-live-trust-badge-on-landing-showing-real-economy-metrics.md)
Please execute the implementation following the steps outlined in this intake brief.

## Owner
opencode

## Priority
P2

## Context
Requested by Nico via Manager (hermes-ceo profile). Keep scope tight and aligned with GoalChain orchestration rules.

## Required output
- Proposed file list
- Risks/regressions + rollback
- Exact test commands

## Workflow
- One implementer only
- Branch naming:
  - cursor: `feat/*` or `fix/*`
  - antigravity: `exp/antigravity-*`
  - opencode: `exp/opencode-*`
  - grok: `exp/grok-*`
- Draft PR for Antigravity/Nico review — no direct merge to `main` unless `cambio urgente`

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #299
