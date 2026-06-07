# OA Proposal — Issue #323

## Title
[OPENCODE] Program: Extract fixture instructions (6 instructions)

## Source
GitHub issue #323

## Objective
## Objective
Extract fixture lifecycle instructions into programs/goalchain_program/src/instructions/fixture/:

## Scope
1. `initialize_fixture.rs` - Initialize new fixture
2. `oracle_upsert_live_state.rs` - Update live match state (minute, score, HT/FT)
3. `oracle_create_market.rs` - Create live betting market for fixture
4. `oracle_update_market_status.rs` - Update market status (open/closed/resolved)
5. `update_fixture_status.rs` - Update fixture status (pre-match → live → completed)
6. `complete_fixture.rs` - Complete fixture, resolve pre-match pools
7. `mod.rs` - Re-export all

## Acceptance Criteria
- Each file < 150 lines
- Use fixture_validator.rs, market_validator.rs
- Emit FixtureInitialized, LiveStateUpdated, MarketCreated, FixtureCompleted events
- Oracle authority signer check on oracle_* instructions
- PDA derivations via pda.rs

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

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-323` and close draft PR.
