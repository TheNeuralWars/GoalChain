# OA Proposal — Issue #344

## Title
[OPENCODE] Webapp: Decompose OpsPortal+AlphaPanel → features/ops (6 components + 3 hooks)

## Source
GitHub issue #344

## Objective
## Objective
Decompose OpsPortal + AlphaPanel into features/ops/:

## Scope
Create `src/features/ops/` with:

**Components:**
1. `AlphaCards.tsx` - Alpha signal cards: score, source, time, action button (Investigate/Trade)
2. `AlphaFeed.tsx` - Paginated feed, filters (score min, type, time), virtualized list
3. `SystemHealth.tsx` - Service grid: Wallet, RPC, Oracle, Indexer, DB, Alpha (status badges)
4. `OracleMonitor.tsx` - Oracle status, last update, price drift, feed health
5. `MetricsPanel.tsx` - Charts: TVL, Users, Volume, Yield (Recharts wrapper)
6. `AlertBanner.tsx` - Dismissible alerts: warning, critical, info

**Hooks:**
7. `useAlphaSignals.ts` - Fetch alpha feed, score threshold filter, polling
8. `useSystemHealth.ts` - Health checks, interval refresh, status aggregation
9. `useOpsMetrics.ts` - Time-series metrics, chart data transformation

**Composition:**
10. `types.ts` - AlphaSignal, ServiceHealth, MetricPoint, Alert
11. `constants.ts` - Signal types, health thresholds (ENGLISH ONLY)
12. `index.ts` - Barrel export
13. `OpsPortal.tsx` - Composed page component
14. `AlphaPanel.tsx` - Legacy alias re-export

## English-Only Enforcement
- "SYSTEM HEALTH", "ORACLE STATUS", "ALPHA SIGNALS"
- "INVESTIGATE", "EXECUTE", "DISMISS"
- "HEALTHY", "DEGRADED", "DOWN"
- "HIGH CONFIDENCE", "MEDIUM", "LOW"

## Acceptance Criteria
- Each file < 200 lines
- Real-time health status (5s polling)
- Alpha feed virtualized for 1000+ items
- Mobile: collapsible cards, swipe actions

## Skill Hint
Apply frontend-design skill (no generic AI UI).

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #344
