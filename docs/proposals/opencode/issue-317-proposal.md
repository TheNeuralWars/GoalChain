# OA Proposal — Issue #317

## Title
[OPENCODE] Program: Extract state module (13 account structs)

## Source
GitHub issue #317

## Objective
## Objective
Extract all account structs into programs/goalchain_program/src/state/:

## Scope
Create one file per account struct (from lib.rs):

1. `config.rs` - Config account
2. `builder_fund.rs` - BuilderFund account
3. `fixture.rs` - Fixture account
4. `live_state.rs` - LiveState account
5. `market.rs` - Market account
6. `user_bet.rs` - UserBet account
7. `position.rs` - Position account (live markets)
8. `player.rs` - Player account (parody player NFT)
9. `player_match.rs` - PlayerMatchRecord account
10. `vault.rs` - Vault account
11. `stake_pool.rs` - StakePool account
12. `reward_pool.rs` - RewardPool account
13. `contributor.rs` - Contributor account
14. `mod.rs` - Re-export all

## Acceptance Criteria
- Each file < 100 lines
- Anchor discriminators match deployed program
- PDA seeds use constants.rs
- Proper space calculations for init
- `#[account]` macros preserved

## Skill Hint
Follow gstack plan-eng-review before coding.

## Owner
opencode

## Priority
P0

## Context
Requested by Nico via Manager (WhatsApp/OpenClaw). Keep scope tight and aligned with GoalChain orchestration rules.

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #317
