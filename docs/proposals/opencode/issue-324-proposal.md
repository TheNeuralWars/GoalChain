# OA Proposal — Issue #324

## Title
[OPENCODE] Program: Extract betting instructions (5 instructions)

## Source
GitHub issue #324

## Objective
## Objective
Extract betting instructions into programs/goalchain_program/src/instructions/betting/:

## Scope
1. `create_wager.rs` - Create peer-to-peer wager
2. `accept_wager.rs` - Accept wager challenge
3. `place_bet.rs` - Place bet on fixture market
4. `claim_bet_payout.rs` - Claim winning bet payout
5. `cancel_bet.rs` - Cancel pending bet (if allowed)
6. `mod.rs` - Re-export all

## Acceptance Criteria
- Each file < 150 lines
- Use betting_validator.rs
- Emit WagerCreated, WagerAccepted, BetPlaced, BetClaimed, BetCancelled events
- Parimutuel pool accounting
- Fee calculation via math.rs

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
  - cursor: `feat/*` or `fix/*`
  - antigravity: `exp/antigravity-*`

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #324
