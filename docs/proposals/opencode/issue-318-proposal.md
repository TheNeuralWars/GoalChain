# OA Proposal — Issue #318

## Title
[OPENCODE] Program: Extract events module (centralized emit! macros)

## Source
GitHub issue #318

## Objective
## Objective
Centralize all events in programs/goalchain_program/src/events/:

## Scope
Create `events/` with one file per domain:

1. `config_events.rs` - ConfigInitialized, ConfigUpdated
2. `fixture_events.rs` - FixtureInitialized, LiveStateUpdated, MarketCreated, FixtureCompleted
3. `market_events.rs` - MarketOpened, MarketResolved, PositionOpened, PositionClosed
4. `betting_events.rs` - WagerCreated, WagerAccepted, BetPlaced, BetClaimed, BetCancelled
5. `player_events.rs` - PlayerInitialized, MatchRecorded, StatsUpdated, JerseyEquipped, PotionConsumed
6. `vault_events.rs` - VaultInitialized, Deposited, Withdrawn, Compounded, StrategyUpdated
7. `contributor_events.rs` - ContributorRegistered, ScoreUpdated, RewardsClaimed, EpochTransitioned
8. `mod.rs` - Re-export all

## Acceptance Criteria
- Each file < 80 lines
- All `emit!` macros moved from instruction files
- Event structs implement `AnchorSerialize + AnchorDeserialize`
- Proper indexing for off-chain consumption

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

## Workflow
- One implementer only

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #318
