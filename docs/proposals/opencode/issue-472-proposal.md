# OA Proposal — Issue #472

## Title
[opencode] P1: Implement MEV-protected bet settlement via Jito bundles: atomic execution of [oracle resolution → payout distribution → protocol fee → Jito tip] to eliminate front-running, sandwich attacks, and partial settlement failures on devnet.

## Source
GitHub issue #472

## Objective
## Objective
Implement MEV-protected bet settlement via Jito bundles: atomic execution of [oracle resolution → payout distribution → protocol fee → Jito tip] to eliminate front-running, sandwich attacks, and partial settlement failures on devnet.

## Context
- **Current state:** Bet settlement likely uses sequential transactions vulnerable to MEV extraction
- **Jito bundle advantage:** 5 tx atomic execution in single slot, no mempool visibility, guaranteed ordering
- **Economic impact:** Protects user payouts, captures protocol fees reliably, reduces dispute surface

## Bundle Composition (Max 5 Transactions)
| Slot | Transaction | Purpose | Risk if Sequential |
|------|-------------|---------|-------------------|
| 1 | Oracle Resolution | Submit game result, finalize markets | — |
| 2 | Winner Payout A | Transfer GCH/SOL to winner batch 1 | Front-run payout amounts |
| 3 | Winner Payout B | Transfer GCH/SOL to winner batch 2 | Sandwich between batches |
| 4 | Protocol Fee | Transfer fee to treasury | Fee diversion |
| 5 | Jito Tip | Tip to Jito validator | — |

**Optimization:** If < 5 payout batches, combine payouts. If > 5, queue remaining for next slot (batches of 5).

## Implementation Files
| File | Purpose |
|------|---------|
| `goalchain_oracle/src/settlement/bundle.ts` | `buildSettlementBundle(marketId, results, feeBps)` → `Transaction[]` |
| `goalchain_oracle/src/settlement/executor.ts` | `executeSettlementBundle(bundle, tier)` — uses `FeeService.simulateAndSend` |
| `goalchain_oracle/src/settlement/batcher.ts` | Batch payouts into ≤4 txs (slot 5 reserved for tip) |
| `goalchain_program/.../instructions/settle_bet.rs` | On-chain instruction: single atomic settle (if moving logic on-chain) |

## On-Chain vs Off-Chain Decision
- **Option A (Off-chain bundle):** Flexible, uses existing oracle, easier to iterate
- **Option B (On-chain settle instruction):** Single tx, oracle submits result + payouts atomically
- **Recommendation:** Start with **Option A** for devnet speed; evaluate Option B for mainnet gas optimization

## Jito Bundle Construction
```typescript
async function buildSettlementBundle(marketId, results, protocolFeeBps) {
  const txs: Transaction[] = [];
  
  // Tx 1: Oracle resolution (existing instruction)
  txs.push(buildOracleResolutionTx(marketId, results));
  

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-472` and close draft PR.
