# OA Proposal — Issue #325

## Title
[OPENCODE] Program: Extract live_market instructions (4 instructions)

## Source
GitHub issue #325

## Objective
## Objective
Extract live market instructions into programs/goalchain_program/src/instructions/live_market/:

## Scope
1. `open_position.rs` - Open leveraged position on live market
2. `close_position.rs` - Close position (user or liquidation)
3. `claim_market_payout.rs` - Claim resolved market payout
4. `liquidate_position.rs` - Liquidate underwater position
5. `mod.rs` - Re-export all

## Acceptance Criteria
- Each file < 150 lines
- Use market_validator.rs, math_validator.rs
- Emit PositionOpened, PositionClosed, MarketPayoutClaimed, PositionLiquidated events
- Leverage and margin calculations via math.rs
- Liquidation price calculation

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
  - opencode: `exp/opencode-*`

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-325` and close draft PR.
