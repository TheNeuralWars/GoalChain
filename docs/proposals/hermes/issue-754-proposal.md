# OA Proposal — Issue #754

## Title
[OPENCODE] [DELEGATED] [OPENCODE] [IMPL] #378 Vault crank v2 — Jito bundle, Jupiter, safe burn

## Source
GitHub issue #754

## Objective
## Objective
Implement Vault Crank v2 with Jito bundle, Jupiter swap, and safe burn as specified in GitHub issue #482.

## Full Spec from Issue #482

**File to implement:** `goalchain_oracle/src/vault_crank.ts`

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
  
  // 3. Submit to Jito Block Engine
  const bundleId = await submitBundle(BLOCK_ENGINE_URL, bundle);
  
  // 4. Wait for confirmation
  const result = await waitForBundleConfirmation(connection, bundleId);
  
  // 5. Verify on-chain effects

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #754
