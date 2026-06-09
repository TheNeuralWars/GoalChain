# OA Proposal — Issue #326

## Title
[OPENCODE] Program: Extract player instructions (7 instructions)

## Source
GitHub issue #326

## Objective
## Objective
Extract player instructions into programs/goalchain_program/src/instructions/player/:

## Scope
1. `initialize_player.rs` - Initialize parody player account
2. `oracle_record_match.rs` - Oracle records player match participation
3. `oracle_update_player_stats.rs` - Oracle updates goals/assists
4. `mint_parody_nft.rs` - Mint parody player NFT
5. `equip_jersey.rs` - Equip jersey for synergy bonus
6. `consume_potion.rs` - Consume stamina potion (burn GCH)
7. `delegate_stake.rs` - Delegate stake to validator
8. `mod.rs` - Re-export all

## Acceptance Criteria
- Each file < 150 lines
- Use player_validator.rs
- Emit PlayerInitialized, MatchRecorded, StatsUpdated, JerseyEquipped, PotionConsumed, StakeDelegated events
- Stamina drain logic (STAMINA_DRAIN_PER_MATCH = 30)
- Yield boost calculation via math.rs

## Skill Hint
Follow gstack plan-eng-review before coding.

## Owner
opencode

## Priority
P0

## Context
Requested by Nico via Manager (WhatsApp/OpenClaw). Keep scope tight and aligned with GoalChain orchestration rules.

## Required output
- Proposed file list
- Risks/regressions + rollback
- Exact test commands

## Workflow
- One implementer only
- Branch naming:

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-326` and close draft PR.
