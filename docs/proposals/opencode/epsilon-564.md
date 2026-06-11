# OA Proposal: Issue #564 — [OPENCODE] [P0] #326 Player instructions (7 instructions)

**Worker:** epsilon (partition 4)
**Owner:** opencode
**Priority:** P0
**Mode:** Normal mode: open draft PR for Antigravity/Nico review.

## Issue Body
## Objective
Implement 7 player instructions in the Anchor program for player lifecycle management.

## Instructions to Implement

| Instruction | Purpose |
|-------------|---------|
| `initialize_player` | Create player account (PDA: ["player", mint]) |
| `update_player_stats` | Update on-chain stats (goals, assists, minutes, rating) |
| `record_player_match` | Link player to fixture + record performance |
| `update_player_rarity` | Change rarity tier (Common → Legendary) |
| `mint_player_nft` | Mint SPL token for player (Metaplex) |
| `burn_player_nft` | Burn NFT (retirement/transfer) |
| `transfer_player` | Transfer ownership (club transfer) |

## Current State (from issue)
- Program structure modularized (#315-320 done)
- State module has `Player` account struct
- PDA derivations in `constants/seeds.ts`

## Files to Create/Modify

### 1. Create 7 instruction files in:
```
goalchain_program/programs/goalchain-program/src/instructions/player/
  ├── initialize_player.rs
  ├── update_player_stats.rs
  ├── record_player_match.rs
  ├── update_player_rarity.rs
  ├── mint_player_nft.rs
  ├── burn_player_nft.rs
  ├── transfer_player.rs
```

### 2. Ensure state struct exists at:
```
goalchain_program/programs/goalchain-program/src/state/player.rs
```

### 3. Module declarations in:
```
goalchain_program/programs/goalchain-program/src/lib.rs
```

### 4. Integration tests at:
```
goalchain_program/tests/player.ts
```

## Technical Requirements

- **PDA derivations**: Use seeds from `constants/seeds.ts` — player PDA is `["player", mint]`
- **Account validation**: Proper constraint checks (signer, owner, mutability)
- **Error handling**: Custom error codes for each instruction
- **Events**: Emit events for indexability (initialize, update, transfer, mint, burn)
- **Metaplex integration**: For mint/burn NFT instructions — use Metaplex Core or Token Metadata
- **IDL**: All 7 instructions must appear in generated IDL with correct accounts

## Verification Commands

```bash
cd /data/apps/GoalChain/goalchain_program
anchor build --ignore-keys
anchor test --skip-lint -- --test-threads=1
```

## Acceptance Criteria
- [ ] All 7 instructions compile + deploy to devnet
- [ ] Integration tests pass (create, update, record, transfer)
- [ ] PDA derivations correct, no collisions
- [ ] IDL includes all 7 instructions with correct accounts
- [ ] Anchor test suite green

## Constraints & Notes
- Follow existing code patterns in `goalchain_program/programs/goalchain-program/src/instructions/`
- Use `gstack plan-eng-review` before coding (architectural P0)
- No regression on devnet
- One implementer per task — this is the ONLY task for this work
- Open **draft PR** when done — no direct merge to main

## Skill Hint
Follow `gstack plan-eng-review` workflow before coding. This is a P0 architectural change to the Solana program.

## Output
Return the GitHub issue URL for the draft PR created by FCC.
