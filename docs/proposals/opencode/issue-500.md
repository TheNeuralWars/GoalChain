# Issue #500: [OPENCODE] [P0] Fix Vault Crank On-Chain Execution (vault_crank.ts)

## Source
Local queue (autonomous FIFO mode)

## Objective
## Objective
# P0: Fix Vault Crank On-Chain Execution (vault_crank.ts)

## Problem
The vault crank `execute` mode fails with: "Transaction simulation failed: Error processing Instruction 0: instruction changed the balance of a read-only account."

Root causes in `goalchain_oracle/src/vault_crank.ts`:
1. **Line 165-169**: Fallback `SystemProgram.transfer` targets the System Program (`11111111111111111111111111111111`) as "burn" — but System Program is a read-only program account, cannot receive lamports.
2. **Line 103-107**: If oracle keypair file missing, generates a transient keypair with 0 SOL — cannot pay fees or transfer amount.
3. **Line 84**: `GCH_MINT` defaults to program ID (`FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg`) instead of actual GCH token mint address.

## Required Fixes

### 1. Fix Burn Mechanism (lines 163-170)
Replace the broken SystemProgram.transfer with a proper SOL burn:
- Option A: Transfer to a known burn address (e.g., `1nc1nerator111111111111111111111111111111111` or similar dead address)
- Option B: Use `SystemProgram.transfer` to a PDA with no withdrawal authority
- Option C: Call the actual GoalChain vault program's `crank` instruction (preferred)

### 2. Fix Oracle Keypair / Funding (lines 98-107)
- Require `ORACLE_KEYPAIR_PATH` to exist and have SOL balance — fail fast with clear error if not
- Remove transient keypair fallback (it's useless without funding)
- Add balance check: `connection.getBalance(payer.publicKey)` must cover fees + transfer amount

### 3. Fix GCH Mint Address (line 84)
- `GCH_MINT` must be the actual GCH token mint (SPL token), not the program ID
- Add validation: `GCH_MINT` should be a valid SPL token mint (32-44 base58 chars, not the program ID)

### 4. Add Jupiter Integration Guard (lines 111-159)
- Only attempt Jupiter swap on mainnet if `JUPITER_API_KEY` or proper mainnet RPC configured
- On devnet: skip Jupiter, log clearly, use fallback

### 5. Improve Error Handling & Logging
- Each failure step should produce actionable error message
- Report should include `success: boolean` field
- Distinguish between "simulation failed" vs "broadcast failed" vs "insufficient funds"

## Files to Modify
- `goalchain_oracle/src/vault_crank.ts` — primary fix
- May need: `goalchain_oracle/package.json` for any new deps

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
- Rollback: revert branch `exp/opencode-issue-500`.
