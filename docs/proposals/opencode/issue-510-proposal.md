# OA Proposal — Issue #510

## Title
[OPENCODE] [P0] #326 Player instructions (7 instructions)

## Source
GitHub issue #510

## Objective
# [OPENCODE] [P0] #326 Player instructions (7 instructions)

## Priority: P0 (program — core domain)
## Labels: agent:opencode, priority:P0, area:program, status:ready

## Objective
Implement 7 player instructions in the Anchor program for player lifecycle management.

## Instructions to Implement
| Instruction | Purpose |
|-------------|---------|
| `initialize_player` | Create player account (PDA: [\"player\", mint]) |
| `update_player_stats` | Update on-chain stats (goals, assists, minutes, rating) |
| `record_player_match` | Link player to fixture + record performance |
| `update_player_rarity` | Change rarity tier (Common → Legendary) |
| `mint_player_nft` | Mint SPL token for player (Metaplex) |
| `burn_player_nft` | Burn NFT (retirement/transfer) |
| `transfer_player` | Transfer ownership (club transfer) |

## Current State
- Program structure modularized (#315-320 done)
- State module has `Player` account struct
- PDA derivations in `constants/seeds.ts`

## Files to Create/Modify
- `goalchain_program/programs/goalchain-program/src/instructions/player/` — 7 files
- `goalchain_program/programs/goalchain-program/src/state/player.rs` — account struct
- `goalchain_program/programs/goalchain-program/src/lib.rs` — module declarations
- `goalchain_program/tests/player.ts` — integration tests

## Verification
```bash
cd goalchain_program
anchor build --ignore-keys
anchor test --skip-lint -- --test-threads=1
```

## Acceptance Criteria
- All 7 instructions compile + deploy to devnet
- Integration tests pass (create, update, record, transfer)

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-510` and close draft PR.
