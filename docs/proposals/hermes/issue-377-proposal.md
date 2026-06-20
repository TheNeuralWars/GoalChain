# OA Proposal — Issue #377

## Title
[OPENCODE] [OPENCODE] Oracle: Priority fees v2 — health monitoring, failover, transaction simulation

## Source
GitHub issue #377

## Objective
## Objective
## Objective
Refactor priority fee management with RPC health monitoring, failover, and transaction simulation.

## Scope
Create goalchain_oracle/src/priority-fees/:

### Files:
1. **helius.ts** — Helius getPriorityFeeEstimate client
2. **fallback.ts** — Conservative default + percentile estimation from recent blocks
3. **health.ts** — RPC health monitoring + failover (Helius → Alchemy → Public devnet/mainnet)
4. **simulate.ts** — Transaction simulation before send (preflight validation)
5. **index.ts** — Barrel export: getPriorityFeeInstructions, simulateAndSend

### Key Features:
- **Health checks**: getSlot() every 30s, track latency, error rate
- **Failover**: Round-robin with health scoring, circuit breaker (5 failures → 60s cooldown)
- **Simulation**: Use connection.simulateTransaction() before real send; reject if simulation fails
- **Blockhash management**: Fetch fresh blockhash per transaction, confirm with lastValidBlockHeight

### API:
```typescript
export async function getPriorityFeeInstructions(
  connection: Connection,
  accountKeys: PublicKey[],
  computeUnitsLimit: number
): Promise<TransactionInstruction[]>

export async function simulateAndSend(
  connection: Connection,
  wallet: anchor.Wallet,
  instructions: TransactionInstruction[],
  accountKeys: PublicKey[],
  computeUnitsLimit: number
): Promise<string>
```

### Migration:
- Replace OracleService.sendWithPriorityFees() with new simulateAndSend
- Remove old priorityFees.ts after verification

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-377` and close draft PR.
