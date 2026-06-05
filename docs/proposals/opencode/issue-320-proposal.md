# OA Proposal — Issue #320

## Title
[OPENCODE] Program: Extract utils module (PDA, time, token, serialization helpers)

## Source
GitHub issue #320

## Objective
## Objective
Extract utility helpers into programs/goalchain_program/src/utils/:

## Scope
Create `utils/` with:

1. `pda.rs` - All PDA derivations:
   - config_pda(), fixture_pda(match_id), live_state_pda(fixture)
   - market_pda(fixture, market_id), player_pda(player_id)
   - player_match_pda(player, fixture), vault_pda(), etc.
2. `time.rs` - Timestamp/epoch helpers:
   - current_timestamp(), epoch_start(), epoch_end()
   - is_match_live(), is_cutoff_passed()
3. `token.rs` - Token account helpers:
   - get_or_create_ata(), transfer_checked(), burn_checked()
4. `serialization.rs` - Borsh/Anchor serialization helpers
5. `mod.rs` - Re-export all

## Acceptance Criteria
- Each file < 80 lines
- Used by all instruction modules
- No duplicate PDA derivations in instructions
- Unit tests for PDA derivations

## Skill Hint
Follow gstack investigate workflow (root cause, max 3 fixes).

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

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #320
