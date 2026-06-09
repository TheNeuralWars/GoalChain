# OA Proposal — Issue #471

## Title
[opencode] P1: Implement Priority Fees v2 module (`goalchain_oracle/src/priority-fees/`) with Helius RPC + Jito failover, preflight simulation, health monitoring, and canonical fee tiers — replacing the ad-hoc `sendWithPriorityFees` that lacks reliability for Jito bundle submission.

## Source
GitHub issue #471

## Objective
## Objective
Implement Priority Fees v2 module (`goalchain_oracle/src/priority-fees/`) with Helius RPC + Jito failover, preflight simulation, health monitoring, and canonical fee tiers — replacing the ad-hoc `sendWithPriorityFees` that lacks reliability for Jito bundle submission.

## Context
- **Current state:** `sendWithPriorityFees` in `goalchain_oracle/src/cli.ts` uses static fees, no simulation, no health monitoring
- **Issue #377:** Proposes full refactor with `FeeService`, `PriorityFeeTier` enum, `HeliusClient`, `JitoTipClient`, `SimulationGuard`
- **Critical for:** Vault crank bundle (Issue #1), bet settlement bundles (Issue #3), any Jito bundle submission

## Architecture: 4-Layer Fee Stack
```
┌─────────────────────────────────────────────────────────────┐
│  FeeService (facade)                                         │
│  ┌─────────────┐ ┌─────────────┐ ┌────────────────────────┐ │
│  │ HeliusClient│ │JitoTipClient│ │   SimulationGuard      │ │
│  │ (primary)   │ │ (fallback)  │ │ (preflight + revert)   │ │
│  └──────┬──────┘ └──────┬──────┘ └──────────┬──────────────┘ │
└─────────┼───────────────┼───────────────────┼────────────────┘
          │               │                   │
          ▼               ▼                   ▼
    ┌───────────┐ ┌─────────────┐ ┌─────────────────────┐
    │ Priority  │ │  Jito Tip   │ │  Simulate + Verify  │
    │ Fee Tier  │ │  Accounts   │ │  (readonly check)   │
    │  (enum)   │ │  (8 const)  │ │  + balance delta    │
    └───────────┘ └─────────────┘ └─────────────────────┘
```

## Implementation Files
| File | Purpose |
|------|---------|
| `goalchain_oracle/src/priority-fees/index.ts` | Exports: `FeeService`, `PriorityFeeTier`, `createFeeService()` |
| `goalchain_oracle/src/priority-fees/helius.ts` | Helius `getPriorityFeeEstimate` with 3-tier response (low/medium/high) |
| `goalchain_oracle/src/priority-fees/jito-tips.ts` | Jito tip accounts + `getTipFloor()` + `getTipAccounts()` with caching |
| `goalchain_oracle/src/priority-fees/simulation.ts` | `simulateAndSend(connection, txs, tier)` — dry-run + readonly account check |
| `goalchain_oracle/src/priority-fees/health.ts` | Background health monitor: `recordSuccess()`, `recordFailure()`, `getHealthScore()` |
| `goalchain_oracle/src/priority-fees/types.ts` | Types: `FeeEstimate`, `FeeTier`, `HealthMetrics`, `SimulationResult` |

## Priority Fee Tiers (canonical)
```typescript
export enum PriorityFeeTier {
  ECONOMY = 'economy',      // 25th percentile, batch/cron jobs

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-471` and close draft PR.
