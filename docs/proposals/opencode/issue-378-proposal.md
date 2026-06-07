# OA Proposal — Issue #378

## Title
[OPENCODE] [OPENCODE] Oracle: Vault crank v2 — GCH_MINT fix, Jupiter integration, safe burn

## Source
GitHub issue #378

## Objective
## Objective
## Objective
Fix critical GCH_MINT bug and rebuild vault crank with safe Jupiter integration and on-chain burn.

## Scope
Create goalchain_oracle/src/vault-crank/:

### Files:
1. **config.ts** — Env validation + share clamping
   ```typescript
   export interface CrankConfig {
     mode: 'dry-run' | 'execute';
     principalSol: number;
     currentSol: number;
     minExcessSol: number;
     gchPriceUsd: number;
     solPriceUsd: number;
     buybackShare: number;
     jackpotShare: number;
     reinvestShare: number;
     gchMint: PublicKey;  // REQUIRED, no fallback
   }
   export function loadConfig(): CrankConfig { ... }
   ```

2. **jupiter.ts** — Safe Jupiter swap (quote → swap → sign → send)
   - quote-api.jup.ag/v6/quote
   - quote-api.jup.ag/v6/swap
   - Only on mainnet (detect via RPC URL)
   - Slippage 100 bps, wrap/unwrap SOL

3. **burn.ts** — On-chain burn execution
   - Use program's burn instruction (NOT SystemProgram.transfer to program ID)
   - On devnet/localnet: use mock tx, log clearly

4. **report.ts** — burn_tracker.json reporting
   - Same VaultCrankReport interface
   - Atomic write (temp file + rename)

5. **crank.ts** — Main orchestration

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-378` and close draft PR.
