# Issue #482: [OPENCODE] [IMPL] #378 Vault crank v2 — Jito bundle, Jupiter, safe burn

## Source
Local queue (autonomous FIFO mode)

## Objective
## Objective
## Task: Oracle Vault Crank v2 (Issue #378 → PR #391)

**Priority:** P0
**Branch:** exp/opencode-issue-378
**PR Target:** #391 (already approved)
**Depends on:** #377 (Priority Fees v2 with simulateAndSend) — BLOCKER

### Context
Approved with global vision: "Oracle & Economy: Vault crank v2 + Jupiter + safe burn = tesoro que se auto-gestiona, rebalancea, quema exceso. Autonomía real → Oracle crank v2 + program instructions = sistema que vive solo 24/7"

### Implementation Required
**File: `goalchain_oracle/src/vault_crank.ts`**

**Dependencies (must be available):**
- Priority Fees v2 module (`goalchain_oracle/src/priority-fees/`) with `simulateAndSend`
- Jupiter devnet SDK for swap quotes
- Jito Block Engine client for bundle submission

**New Implementation — Atomic Jito Bundle:**

```typescript
// goalchain_oracle/src/vault_crank.ts
import { simulateAndSend } from './priority-fees';
import { jupiterSwap, burnGCH, jitoTip } from './jito-bundle';

const BLOCK_ENGINE_URL = process.env.JITO_BLOCK_ENGINE_URL || 'https://testnet.block-engine.jito.wtf';
const GCH_MINT = process.env.GCH_MINT!;
const SOL_MINT = process.env.SOL_MINT!;
const TIP_ACCOUNTS = (process.env.JITO_TIP_ACCOUNTS || '').split(',');

export async function executeVaultCrank(connection, wallet, excessSolLamports) {
  // 1. Preflight simulation (uses Priority Fees v2 simulateAndSend)
  const simulation = await simulateVaultCrankBundle(connection, wallet, excessSolLamports);
  if (!simulation.success) {
    throw new Error(`Vault crank simulation failed: ${simulation.error}`);
  }

  // 2. Build atomic bundle: [Jupiter Swap SOL→GCH, Burn GCH, Jito Tip]
  const bundle = await buildVaultCrankBundle(connection, wallet, excessSolLamports);

## Priority
P0

## Labels
status:ready,source:manager,agent:opencode,priority:P0,

## OA Plan (aggressive / yolo mode)
- **FULL AUTONOMY**: Make decisions, implement, test, push. No approval needed.
- Implement the complete solution in one pass - no minimal/progressive approach.
- Run all checks: build, lint, typecheck, tests. Fix all errors.
- Push directly to branch and open PR. Auto-merge if CI passes.
- If blocked by missing deps/config: document, create follow-up issue, continue.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-482`.
