# Issue #476: [opencode] P1: Build comprehensive Jito/MEV observability dashboard and alerting: bundle success rates, tip efficiency, MEV capture metrics, ShredStream latency, and economy health correlation — all feeding into existing `/api/economy/health` and Hermes cron alerts.

## Source
Local queue (autonomous FIFO mode)

## Objective
## Objective
Build comprehensive Jito/MEV observability dashboard and alerting: bundle success rates, tip efficiency, MEV capture metrics, ShredStream latency, and economy health correlation — all feeding into existing `/api/economy/health` and Hermes cron alerts.

## Context
- **Current state:** Basic economy health endpoint exists; no Jito-specific metrics
- **Hermes cron:** `goalchain-alpha-watch.sh` runs every 30m, posts to WhatsApp; `oa-x-scout` posts to Discord
- **Gap:** No visibility into bundle landing rates, tip overpayment, MEV protection effectiveness

## Metrics to Track
| Category | Metric | Target | Alert Threshold |
|----------|--------|--------|-----------------|
| **Bundle Health** | `bundle_success_rate_24h` | > 95% | < 90% → PagerDuty |
| | `bundle_landed_slot_accuracy` | > 90% | < 80% → Warning |
| | `avg_bundle_confirmation_ms` | < 2000ms | > 5000ms → Warning |
| **Tip Efficiency** | `avg_tip_lamports_per_bundle` | ~5000 | > 2× floor → Warning |
| | `tip_overpayment_ratio` | < 1.5× | > 3× → Optimization needed |
| | `tip_account_distribution` | Even across 8 | Skew > 60% to 1 → Warning |
| **MEV Protection** | `dontfront_usage_rate` | > 80% of user txs | < 50% → Warning |
| | `settlement_front_run_attempts` | 0 | > 0 → Investigation |
| | `sandwich_attack_prevented` | Count | — |
| **ShredStream** | `shredstream_uptime_24h` | > 99.9% | < 99% → Critical |
| | `shredstream_to_bundle_ms` | < 100ms | > 200ms → Warning |
| | `slot_sync_drift_ms` | < 50ms | > 200ms → Warning |
| **Economy Correlation** | `vault_buyback_coverage` | > 0.25 | < 0.15 → Critical |
| | `jitosol_yield_sol_30d` | > 0 | = 0 for 7d → Warning |
| | `protocol_revenue_sol_7d` | Trending up | Flat/declining 14d → Warning |

## Implementation Files
| File | Purpose |
|------|---------|
| `goalchain_oracle/src/monitoring/jito_metrics.ts` | Collect Jito metrics from Block Engine API + on-chain |
| `goalchain_oracle/src/monitoring/economy_correlation.ts` | Correlate Jito metrics with `/api/economy/health` |
| `goalchain_api/src/routes/health.ts` | Extend `/api/economy/health` with Jito section |
| `~/hermes/scripts/jito-health-check.sh` | Cron script: runs every 15m, posts to Hermes/WhatsApp |
| `~/hermes/scripts/jito-dashboard.py` | Generates HTML dashboard (served via nginx or standalone) |

## Block Engine API Endpoints to Poll
```bash
# Bundle statuses (last 100)
curl https://testnet.block-engine.jito.wtf/api/v1/bundles \

## Priority
P1

## Labels
status:ready,source:manager,agent:opencode,priority:P1,observability,devnet,hermes,jito,mev,yield,settlement,dontfront,jitosol,latency,shredstream,area:monitoring,

## OA Plan (aggressive / yolo mode)
- **FULL AUTONOMY**: Make decisions, implement, test, push. No approval needed.
- Implement the complete solution in one pass - no minimal/progressive approach.
- Run all checks: build, lint, typecheck, tests. Fix all errors.
- Push directly to branch and open PR. Auto-merge if CI passes.
- If blocked by missing deps/config: document, create follow-up issue, continue.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-476`.
