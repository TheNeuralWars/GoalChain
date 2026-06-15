# OA Proposal — Issue #776

## Title
AI-AUDIT: Implement Resilient Staking and Jupiter Swap in Vault Crank

## Source
GitHub issue #776

## Objective
### Goal
Replace the risky SOL transfer fallback in `vault_crank.ts` and add transaction simulations for mainnet safety.

### Checklist
- Locate `vault_crank.ts` mainnet execution path.
- Replace the `SystemProgram.transfer` fallback with a proper checked Jupiter swap instruction or raise a validated error.
- Add transaction preflight simulation (`simulateTransaction`) before transaction submission.
- Ensure Jupiter swap logic works with Versioned Transactions and handles token-burning correctly.

## Current State Analysis
**File:** `goalchain_oracle/src/vault_crank.ts`

### Problems Identified
1. **Risky SOL Transfer Fallback (lines 189-222)**: After Jupiter swap attempt (mainnet path), the code falls back to a `SystemProgram.transfer` sending SOL to the System Program (`11111111111111111111111111111111`) as a "burn". This:
   - Does not actually buy back GCH tokens
   - Does not burn GCH tokens (the economic intent)
   - Uses legacy `Transaction` class instead of `VersionedTransaction`
   - Has a hardcoded lamport limit (1,000,000 = 0.001 SOL) for devnet/localnet

2. **Missing Transaction Simulation**: No `connection.simulateTransaction()` before any transaction submission on mainnet

3. **Jupiter Swap Uses Legacy Transaction (lines 168-174)**: 
   ```typescript
   const rawTx = Buffer.from(swapTransaction, "base64");
   const tx = Transaction.from(rawTx);  // Legacy, not VersionedTransaction
   tx.sign(payer);
   const txid = await connection.sendRawTransaction(tx.serialize(), {...});
   ```
   Jupiter v6 returns Versioned Transactions - should use `VersionedTransaction.deserialize()`

4. **No Proper Error Handling for Failed Jupiter Swap**: The catch block (line 183-186) just logs and falls back to the risky transfer

5. **Token Burning Logic Absent**: The economic intent is "buyback and burn GCH" but the fallback doesn't interact with GCH token accounts at all

## Proposed Implementation Plan

### Phase 1: Add Transaction Simulation Helper
Create a reusable `simulateAndValidate` function that:
- Takes a `VersionedTransaction` or `Transaction`
- Calls `connection.simulateTransaction()`
- Throws descriptive error if simulation fails (with logs)
- Returns simulation result for inspection

### Phase 2: Fix Jupiter Swap to Use VersionedTransaction
- Replace `Transaction.from(rawTx)` with `VersionedTransaction.deserialize(rawTx)`
- Use `connection.sendTransaction()` with VersionedTransaction (supports v0)
- Add simulation before send

### Phase 3: Replace Risky Fallback with Proper Error
- **Remove** the `SystemProgram.transfer` fallback entirely (lines 189-222)
- If Jupiter swap fails on mainnet, **throw a validated error** with context
- On devnet/localnet: keep a safe no-op or mock for testing (but clearly labeled)

### Phase 4: Add Token Burn Verification (Future Enhancement)
- Document that actual GCH burning requires SPL Token `burn` instruction on the treasury token account
- This is out of scope for this issue but should be noted

## Code Changes

### 1. New Helper Function (add near top of file after imports)
```typescript
async function simulateAndValidate(
  connection: Connection,
  tx: VersionedTransaction | Transaction,
  label: string
): Promise<void> {
  const simResult = await connection.simulateTransaction(tx, {
    commitment: "confirmed",
    replaceRecentBlockhash: true,
    sigVerify: false,
  });
  
  if (simResult.value.err) {
    const logs = simResult.value.logs?.join("\n") || "No logs";
    throw new Error(`Simulation failed for ${label}: ${JSON.stringify(simResult.value.err)}\nLogs:\n${logs}`);
  }
  
  console.log(`[vault_crank] Simulation OK for ${label}: ${simResult.value.unitsConsumed} CU consumed`);
}
```

### 2. Fix Jupiter Swap Block (lines 141-186)
- Use `VersionedTransaction.deserialize()`
- Call `simulateAndValidate()` before send
- Use `connection.sendTransaction()` for v0 support

### 3. Remove Fallback Block (lines 189-222)
- Replace with explicit error throw on mainnet if Jupiter fails
- Keep dry-run / devnet mock behavior clearly separated

## Risk / Rollback
- **Risk**: Breaking mainnet crank if Jupiter API unavailable
- **Mitigation**: Clear error messages; cron can alert; fallback is explicit failure not silent wrong behavior
- **Rollback**: Revert branch `exp/opencode-issue-776` and close draft PR

## Verification Commands
```bash
# Lint
cd goalchain_oracle && npm run lint

# Build
cd goalchain_oracle && npm run build

# Dry-run test (no RPC calls)
VAULT_CRANK_EXECUTE=0 node dist/vault_crank.js
```

## Files Touched
- `goalchain_oracle/src/vault_crank.ts` (primary)
- `docs/proposals/opencode/issue-776-proposal.md` (this file)