# OA Proposal — Issue #319

## Title
[OPENCODE] Program: Extract validators module (reusable require! logic)

## Source
GitHub issue #319

## Objective
## Objective
Extract reusable validation logic into programs/goalchain_program/src/validators/:

## Scope
Create `validators/` with:

1. `config_validator.rs` - validate_fee_bps, validate_cutoff_buffer, validate_sol_per_user
2. `fixture_validator.rs` - validate_match_id, validate_teams, validate_start_time, validate_live_state
3. `market_validator.rs` - validate_market_type, validate_delay, validate_close_minute, validate_token_mint
4. `betting_validator.rs` - validate_wager_amount, validate_odds, validate_counterparty
5. `player_validator.rs` - validate_player_id, validate_stamina, validate_rarity, validate_synergy
6. `math_validator.rs` - validate_no_overflow, validate_bps_sum, validate_yield_bounds
7. `mod.rs` - Re-export all

## Acceptance Criteria
- Each file < 100 lines
- Return `Result<(), GoalChainError>`
- Used by all instruction modules
- Unit tests for each validator

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
- Rollback: revert main commit linked to issue #319
