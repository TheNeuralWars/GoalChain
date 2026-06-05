# Growth Task 5: Live "Trust Badge" on Landing Showing Real Economy Metrics

- **Status:** ready-for-hermes
- **Priority:** P2
- **Owner:** opencode
- **Created:** 2026-06-04
- **Source:** GitHub Issue #299 / Manager

## Objective

`goalchain_api/src/index.ts:810` already computes and exposes `emit_burn_ratio_7d`, `onchain_sink_coverage`, `config_drift`, and `vault_buyback_coverage` via `GET /api/economy/metrics` — the four KPIs that `docs/EXECUTION_BACKLOG_90D.md` defines as the "gate of release" for scaling user acquisition. None of them are visible anywhere on the public site. Investors and Zealy quest participants have no way to see that the protocol is operating within its target economic bands.

**Action:**
1. Add an `EconomyHealthBadge.tsx` component in `goalchain_webapp/src/ui/` that fetches `/api/economy/metrics` every 60s and renders a 4-cell status grid (Healthy / Warning / Critical) using the existing `buildEconomyHealthPayload` thresholds
2. Mount it on the landing page in `App.tsx` below the hero
3. Auto-post a daily snapshot of these KPIs to the new `hermes-reports` private Discord channel (commit `684a1416`) using a cron-driven script in `scripts/marketing/` so partners/holders see live numbers
4. Ship the badge in English to match the campaign

---

## Recommended Path Forward

- [ ] Parse and generate implementation tasks via autonomic-intake-processor
- [ ] Auto-dispatch to FCC/OpenCode for code implementation
- [ ] Run typescript checks and auto-merge to main if clean

## Tags

#growth-task #trust-badge #economy-metrics #landing-page #discord-reports #transparency #humans-0 #autonomous-push