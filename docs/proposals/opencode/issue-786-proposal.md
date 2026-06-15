# OA Proposal — Issue #786

## Title
AI-AUDIT: Resilient Vault Crank Jupiter Swaps

## Source
GitHub issue #786

## Objective
### Goal
Replace the risky SOL transfer fallback in `vault_crank.ts` with Jupiter swap token burns, verify the returned transaction, and handle token-burning.

### Checklist
- Locate `vault_crank.ts` mainnet execution path.
- Replace the `SystemProgram.transfer` fallback with a proper checked Jupiter swap instruction or raise a validated error.
- Add transaction preflight simulation (`simulateTransaction`) before transaction submission.
- Ensure Jupiter swap logic works with Versioned Transactions and handles token-burning correctly.

## Current State Analysis
**File:** `goalchain_oracle/src/vault_crank.ts`

### Problems Identified
1. **Risky SOL Transfer Fallback (lines 304-347)**: After Jupiter swap attempt (mainnet path), the code falls back to a `SystemProgram.transfer` sending SOL to the System Program (`11111111111111111111111111111111`) as a "burn". This:
   - Does not actually buy back GCH tokens
   - Does not burn GCH tokens (the economic intent)
   - Uses legacy `Transaction` class instead of `VersionedTransaction`
   - Has a hardcoded lamport limit (1,000,000 = 0.001 SOL) for devnet/localnet

2. **Missing Transaction Simulation**: No `connection.simulateTransaction()` before any transaction submission on mainnet

3. **Jupiter Swap Uses Legacy Transaction (lines 190-193, 283-289)**:
   ```typescript
   const rawTx = Buffer.from(swapTransaction, "base64");
   const tx = Transaction.from(rawTx);  // Legacy, not VersionedTransaction
   tx.sign(payer);
   const txid = await connection.sendRawTransaction(tx.serialize(), {...});
   ```
   Jupiter v6 returns Versioned Transactions - should use `VersionedTransaction.deserialize()`

4. **No Proper Error Handling for Failed Jupiter Swap**: The catch block (lines 298-301) just logs and falls back to the risky transfer

5. **Token Burning Logic Absent**: The economic intent is "buyback and burn GCH" but the fallback doesn't interact with GCH token accounts at all

6. **Jito Bundle Path Also Has Issues (lines 165-216)**:
   - Uses `Transaction.from(rawTx)` instead of `VersionedTransaction.deserialize()`
   - Extracts only first instruction (`swapTx.instructions[0]`) instead of using the full VersionedTransaction
   - Burn instruction uses `SystemProgram.transfer` to system program instead of SPL Token burn

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
- **Remove** the `SystemProgram.transfer` fallback entirely (lines 304-347)
- If Jupiter swap fails on mainnet, **throw a validated error** with context
- On devnet/localnet: keep a safe no-op or mock for testing (but clearly labeled)

### Phase 4: Fix Jito Bundle Path
- Update buyback instruction construction to use VersionedTransaction properly
- Replace placeholder burn instruction with proper SPL Token burn instruction structure (or document limitation)

### Phase 5: Add Token Burn Verification (Future Enhancement - Documented)
- Document that actual GCH burning requires SPL Token `burn` instruction on the treasury token account
- This requires the treasury token account authority and is a separate on-chain program interaction

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

### 2. Fix Jupiter Swap Block in Jito Path (lines 165-204)
- Use `VersionedTransaction.deserialize()`
- Call `simulateAndValidate()` before adding to bundle
- Keep the full VersionedTransaction instead of extracting single instruction

### 3. Fix Jupiter Swap Block in Standard RPC Path (lines 255-301)
- Use `VersionedTransaction.deserialize()`
- Call `simulateAndValidate()` before send
- Use `connection.sendTransaction()` for v0 support

### 4. Remove Fallback Block (lines 304-347)
- Replace with explicit error throw on mainnet if Jupiter fails
- Keep dry-run / devnet mock behavior clearly separated

### 5. Update Burn Logic
- For Jito bundle: construct proper SPL Token burn instruction (requires treasury token account)
- For standard path: same requirement
- Document that without treasury token account authority, real burn cannot execute

## Risk / Rollback
- **Risk**: Breaking mainnet crank if Jupiter API unavailable
- **Mitigation**: Clear error messages; cron can alert; fallback is explicit failure not silent wrong behavior
- **Rollback**: Revert branch `exp/opencode-issue-786` and close draft PR

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
- `goalchain_oracle/src/jitoBundle.ts` (updated to accept VersionedTransactions)
- `docs/proposals/opencode/issue-786-proposal.md` (this file)

## Implementation Summary

### Changes Made to `goalchain_oracle/src/vault_crank.ts`:

1. **Added `VersionedTransaction` import** - Added `VersionedTransaction` to the Solana web3.js imports.

2. **Added `simulateAndValidate` helper function** (lines 20-47):
   - Handles both `VersionedTransaction` and legacy `Transaction` types
   - Calls `connection.simulateTransaction()` with appropriate config for each type
   - Throws detailed error with logs if simulation fails
   - Logs compute units consumed on success

3. **Jito Bundle Path Updates** (lines 202-263):
   - Changed `buybackIx: TransactionInstruction` to `buybackTx: VersionedTransaction`
   - Changed `burnIx: TransactionInstruction` to `burnTx: VersionedTransaction`
   - Jupiter swap now uses `VersionedTransaction.deserialize(rawTx)` instead of `Transaction.from(rawTx)`
   - Added preflight simulation via `simulateAndValidate()` before adding to bundle
   - Burn transaction created as VersionedTransaction (placeholder with clear documentation)

4. **Standard RPC Fallback Path Updates** (lines 297-369):
   - Jupiter swap uses `VersionedTransaction.deserialize()` instead of `Transaction.from()`
   - Added preflight simulation via `simulateAndValidate()` before sending
   - Uses `connection.sendTransaction(versionedTx, ...)` for v0 transaction support
   - **Removed** the risky `SystemProgram.transfer` fallback entirely (was lines 336-388)
   - On mainnet: Jupiter failure now throws explicit error - no silent fallback
   - On devnet/localnet: Mock execution with clear labeling

5. **Documentation Added**:
   - Clear notes that real GCH burning requires SPL Token `burn` instruction on treasury token account
   - Placeholder burn transactions marked as "placeholder - real burn requires SPL Token burn ix"

### Changes Made to `goalchain_oracle/src/jitoBundle.ts`:

1. **Updated `VaultCrankBundleParams` interface**:
   - `buybackIx: TransactionInstruction` → `buybackTx: VersionedTransaction`
   - `burnIx: TransactionInstruction` → `burnTx: VersionedTransaction`

2. **Updated `buildVaultCrankBundle` function**:
   - Uses provided VersionedTransactions directly instead of rebuilding from instructions
   - Signs and adds Jupiter swap VersionedTransaction as-is (preserves address lookup tables)
   - Signs and adds burn VersionedTransaction as-is

3. **Updated `executeVaultCrankBundle` function signature** to match new params.

### Verification Results:
- ✅ `cd goalchain_oracle && npm run lint` - PASS
- ✅ `cd goalchain_oracle && npm run build` - PASS
- ✅ `cd goalchain_sdk && npm run build` - PASS
- ✅ `cd goalchain_webapp && npm run build` - PASS
- ✅ `cd goalchain_api && npm run build` - PASS
- ✅ `VAULT_CRANK_EXECUTE=0 node dist/vault_crank.js` - PASS (dry-run works)

### Residual Risks:
1. **Real GCH token burning not implemented** - Requires treasury token account authority and SPL Token program interaction. Documented in code as future enhancement.
2. **Jupiter API dependency** - Mainnet execution will fail hard if Jupiter API is unavailable. This is intentional (explicit failure > silent wrong behavior).
3. **Jito Bundle simulation** - Bundle simulation via Jito Block Engine is already implemented and called before submission.
4. **Burn transaction placeholder** - Current burn transactions are SystemProgram.transfer placeholders. Real implementation requires SPL Token burn instruction with proper authority.