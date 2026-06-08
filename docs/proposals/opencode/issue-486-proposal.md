# OA Proposal — Issue #486

## Title
[OPENCODE] [IMPL] #377 Priority Fees v2 — simulateAndSend, Helius + Jito failover, health monitor

## Source
GitHub issue #486

## Objective
## Objective
## Task: Priority Fees v2 module with simulateAndSend (Issue #377)

**Priority:** P0
**Branch:** exp/opencode-issue-377
**PR Target:** New (blocks #482 vault crank, #470 Jito bundle)

### Context
Critical infrastructure for all oracle transactions. Replaces ad-hoc `sendWithPriorityFees` with production-grade module.

### Implementation Required
**New module:** `goalchain_oracle/src/priority-fees/`

**Files to create:**

1. **`priority-fees/src/types.ts`** — Canonical fee tiers + interfaces
```typescript
export enum FeeTier {
  LOW = 'low',           // 1-2k CU, base fee
  MEDIUM = 'medium',     // 50-100k CU, 1.5x base
  HIGH = 'high',         // 200-500k CU, 3x base
  CRITICAL = 'critical'  // 1M+ CU, 10x base (cranks, settlements)
}

export interface PriorityFeeConfig {
  heliusRpcUrl: string;
  jitoBlockEngineUrl: string;
  feeTiers: Record<FeeTier, { computeUnits: number; maxFeeLamports: number }>;
  healthCheckIntervalMs: number;
}

export interface SimulateResult {
  success: boolean;
  computeUnitsConsumed: number;
  logs: string[];
  error?: string;
}
```

2. **`priority-fees/src/helius-client.ts`** — Helius RPC + priority fee estimation

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-486` and close draft PR.
