# OA Proposal — Issue #376

## Title
[OPENCODE] [OPENCODE] Oracle: Constants single source of truth (program-id, seeds, token-mints, pda)

## Source
GitHub issue #376

## Objective
## Objective
## Objective
Establish single source of truth constants for Oracle: Program ID, PDA seeds, Token mints.

## Scope
Create goalchain_oracle/src/constants/:

### Files:
1. **program-id.ts**
   ```typescript
   import { PublicKey } from "@solana/web3.js";
   export const PROGRAM_ID = "FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg";
   export const PROGRAM_ID_PUBKEY = new PublicKey(PROGRAM_ID);
   ```

2. **seeds.ts** — All PDA seeds from program
   ```typescript
   export const SEEDS = {
     CONFIG: "config",
     STAKE: "stake",
     PLAYER: "player",
     RENTAL: "rental",
     WAGER: "wager",
     WAGER_VAULT: "wager_vault",
     FIXTURE: "fixture",
     FIXTURE_VAULT: "fixture_vault",
     LIVE_STATE: "live_state",
     MARKET: "market",
     MARKET_VAULT: "market_vault",
     POSITION: "position",
     STAKE_POOL: "stake_pool",
     REWARD_POOL: "reward_pool",
     BUILDER_FUND: "builder_fund",
     BUILDER_EPOCH: "builder_epoch",
     PLAYER_MATCH_RECORD: "player_match_record",
   } as const;
   ```

3. **token-mints.ts** — CRITICAL: Separate token mints from program ID
   ```typescript

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-376` and close draft PR.
