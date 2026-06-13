# OA Proposal — Issue #752

## Title
[OPENCODE] [DELEGATED] [OPENCODE] [P0] Fix Vault Crank On-Chain Execution (vault_crank.ts)

## Source
GitHub issue #752

## Objective
## Objective
## DELEGATION TASK → FCC (Nemotron 3 Super via NVIDIA NIM)

### Objective
Implement the fixes described in GitHub issue #500 for `goalchain_oracle/src/vault_crank.ts`.

### GitHub Issue
- **Issue**: #500
- **URL**: https://github.com/TheNeuralWars/GoalChain/issues/500

### Problem Summary
The vault crank `execute` mode fails with: "Transaction simulation failed: Error processing Instruction 0: instruction changed the balance of a read-only account."

### Root Causes (in `goalchain_oracle/src/vault_crank.ts`)
1. **Lines 165-169**: Fallback `SystemProgram.transfer` targets the System Program (`11111111111111111111111111111111`) as "burn" — but System Program is a read-only program account, cannot receive lamports.
2. **Lines 103-107**: If oracle keypair file missing, generates a transient keypair with 0 SOL — cannot pay fees or transfer amount.
3. **Line 84**: `GCH_MINT` defaults to program ID (`FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg`) instead of actual GCH token mint address.

### Required Fixes
1. **Fix Burn Mechanism (lines 163-170)**: Replace broken SystemProgram.transfer with proper SOL burn — Option C preferred: call actual GoalChain vault program's `crank` instruction
2. **Fix Oracle Keypair / Funding (lines 98-107)**: Require `ORACLE_KEYPAIR_PATH` to exist and have SOL balance — fail fast with clear error if not; remove transient keypair fallback; add balance check
3. **Fix GCH Mint Address (line 84)**: `GCH_MINT` must be actual GCH token mint (SPL token), not program ID; add validation
4. **Add Jupiter Integration Guard (lines 111-159)**: Only attempt Jupiter swap on mainnet if `JUPITER_API_KEY` or proper mainnet RPC configured; on devnet: skip Jupiter, log clearly, use fallback
5. **Improve Error Handling & Logging**: Each failure step produces actionable error message; report includes `success: boolean` field; distinguish between "simulation failed" vs "broadcast failed" vs "insufficient funds"

### Files to Modify
- `goalchain_oracle/src/vault_crank.ts` — primary fix
- May need: `goalchain_oracle/package.json` for any new deps

### Verification
After fix, run vault crank in execute mode on devnet:
```bash
cd goalchain_oracle
VAULT_CRANK_EXECUTE=1 \
VAULT_CURRENT_SOL=5033 \
VAULT_PRINCIPAL_SOL=5000 \
RPC_URL=https://api.devnet.solana.com \
ORACLE_KEYPAIR_PATH=/path/to/funded/keypair.json \
GCH_MINT=<actual-gch-mint> \
npx ts-node src/vault_crank.ts

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #752
