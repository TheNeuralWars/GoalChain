# OA Proposal — Issue #839

## Title
[HERMES] [DRAFT] Update TypeScript tests & SDK to match new program signatures

## Source
GitHub issue #839

## Objective
## Objective
After the MoA security audit, several program instruction signatures changed. The TypeScript tests in tests/ and any SDK code must be updated to match.

Changes to sync:

**place_market_bet**: now accepts (ticket_id: u64, amount: u64, prediction: MatchResult)
**oracle_upsert_live_state**: now accepts (minute: u16, score_a: u8, score_b: u8, is_ht: bool, is_ft: bool)
**oracle_create_market**: now accepts (market_id: u8, fixture: Pubkey, token_mint: Pubkey, delay_seconds: i64, cooldown_seconds: i64, close_minute: u16, max_goal_diff: u8, require_tied: bool)
**place_bet**: PlaceBet accounts struct now includes a GlobalConfig PDA account (seeds=[b"config"]) — add it to test account lists
**InitializeFixture**: now includes GlobalConfig PDA — add to test account lists
**UpdateFixtureStatus**: now includes GlobalConfig PDA — add to test account lists
**SweepFixtureDust**: now includes GlobalConfig PDA — add to test account lists
**resolve_wager**: ResolveWager now includes a 'winner' UncheckedAccount that must be passed and validated against player_a/player_b

Steps:
1. Run 'anchor build' to regenerate IDL
2. Update tests/*.ts to match new signatures and account lists
3. Add test cases for the new validation errors: BetAmountZero, ExceededMaxSol, BetTooLate, UnauthorizedAdmin
4. Verify 'anchor test' passes (or at least compiles)

Follow gstack investigate workflow. Follow gstack review pass before opening draft PR.

## Owner
hermes

## Priority
P1

## Context
Requested by Nico via Manager (WhatsApp/OpenClaw). Keep scope tight and aligned with goalworld orchestration rules.

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
- Rollback: revert main commit linked to issue #839
