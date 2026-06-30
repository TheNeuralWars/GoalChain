# OA Proposal — Issue #838

## Title
[HERMES] [DRAFT] Webapp: sync frontend calls to new program signatures

## Source
GitHub issue #838

## Objective
## Objective
Adapt all webapp/ frontend calls to match the updated Solana program signatures after the MoA security audit. Specifically:

1. **place_market_bet** now accepts (ticket_id: u64, amount: u64, prediction: MatchResult) as instruction args — update the webapp form and tx builder accordingly.
2. **oracle_upsert_live_state** now accepts (minute: u16, score_a: u8, score_b: u8, is_ht: bool, is_ft: bool) — update any admin/oracle dashboard that calls this.
3. **oracle_create_market** now accepts (market_id: u8, fixture: Pubkey, token_mint: Pubkey, delay_seconds: i64, cooldown_seconds: i64, close_minute: u16, max_goal_diff: u8, require_tied: bool) — update market creation form.
4. **place_bet** (fixture betting) now requires a GlobalConfig PDA account in its accounts struct — update the accounts list passed by the webapp.
5. **InitializeFixture** now requires a GlobalConfig PDA account — update the fixture creation form.

New error variants to handle in the UI:
- BetAmountZero, ExceededMaxSol, BetTooLate (from place_bet)
- UnauthorizedAdmin (from InitializeFixture, UpdateFixtureStatus, SweepFixtureDust)

Files to check: webapp/src/ — look for any tx builder, IDL reference, or instruction helper that calls these methods. The program IDL may need regeneration via 'anchor build' before the webapp can use it.

Apply frontend-design skill (no generic AI UI). Follow gstack review pass before opening draft PR.

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
  - antigravity: `exp/antigravity-*`
  - hermes: `exp/hermes-*`
  - grok: `exp/grok-*`
- Draft PR for Antigravity/Nico review — no direct merge to `main` unless `cambio urgente`

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #838
