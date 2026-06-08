# OA Proposal — Issue #470

## Title
[opencode] P1: Fix the failing vault crank by converting sequential transactions into an atomic Jito bundle submitted to the testnet Block Engine. This unblocks the buyback/burn loop and activates MEV-enhanced yield recycling.

## Source
GitHub issue #470

## Objective
## Objective
Fix the failing vault crank by converting sequential transactions into an atomic Jito bundle submitted to the testnet Block Engine. This unblocks the buyback/burn loop and activates MEV-enhanced yield recycling.

## Context
- **Current state:** `/api/ops/status` shows vault crank last ran 2026-05-27, simulation failing with "instruction changed the balance of a read-only account"
- **Root cause:** Legacy `sendWithPriorityFees` without simulation/failover; sequential txs can partially fail
- **Jito integration exists:** GoalChain already has Stake Pool CPI (`SPoo1Ku8WFXoNDMHPsrGSTSG1Y47rzgn41SLUNakuHy`) and `treasury_jito_ata` on-chain

## Solution: Jito Bundle Atomic Execution
Bundle 3 transactions atomically (all succeed or all fail):
1. **Jupiter Swap** — SOL → GCH (via Jupiter v6 on devnet)
2. **Burn GCH** — Transfer GCH to burn authority / invoke burn instruction
3. **Jito Tip** — Transfer SOL to one of 8 Jito tip accounts (min 1,000 lamports)

## Implementation Details
**File to modify:** `goalchain_oracle/src/vault_crank.ts`

**New dependencies:** 
- `@jito-foundation/block-engine-sdk` or raw JSON-RPC to `https://testnet.block-engine.jito.wtf`
- Jupiter devnet SDK for swap quote + transaction building

**Bundle submission flow:**
```typescript
const BLOCK_ENGINE_URL = process.env.JITO_BLOCK_ENGINE_URL || 'https://testnet.block-engine.jito.wtf';
const TIP_ACCOUNTS = [/* 8 hardcoded tip accounts */];

async function executeVaultCrankBundle(connection, wallet, excessSol) {
  // 1. Get Jupiter swap quote (SOL → GCH)
  const quote = await jupiter.getQuote({ inputMint: SOL_MINT, outputMint: GCH_MINT, amount: excessSol });
  const swapTx = await jupiter.getSwapTransaction({ quote, userPublicKey: wallet.publicKey });
  
  // 2. Build burn instruction (GCH → burn)
  const burnIx = createBurnInstruction({ mint: GCH_MINT, amount: quote.outAmount, authority: wallet.publicKey });
  const burnTx = new Transaction().add(burnIx);
  
  // 3. Tip instruction (random tip account)
  const tipAccount = TIP_ACCOUNTS[Math.floor(Math.random() * TIP_ACCOUNTS.length)];
  const tipIx = SystemProgram.transfer({ fromPubkey: wallet.publicKey, toPubkey: tipAccount, lamports: 5000 });
  const tipTx = new Transaction().add(tipIx);
  

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-470` and close draft PR.
