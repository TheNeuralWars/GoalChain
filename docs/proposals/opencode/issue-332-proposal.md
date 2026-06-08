# OA Proposal — Issue #332

## Title
[OPENCODE] Program: Full test suite (anchor test + integration)

## Source
GitHub issue #332

## Objective
## Objective
Run complete test suite for modular program:

## Scope
1. Unit tests in each instruction module (inline `#[cfg(test)]`)
2. Integration tests in `packages/program/programs/goalchain_program/tests/`:
   - `config_test.rs`
   - `fixture_test.rs`
   - `market_test.rs`
   - `betting_test.rs`
   - `player_test.rs`
   - `vault_test.rs`
   - `contributor_test.rs`
   - `integration_test.rs`
3. Run: `anchor test --validator legacy`
4. Run: `cargo test --workspace`
5. Run: `cd goalchain_oracle && npm run build` (verify oracle compiles)

## Acceptance Criteria
- All tests pass
- Coverage > 80% on instruction logic
- No regressions from monolith
- Localnet deployment works

## Skill Hint
Follow gstack review pass before opening draft PR.

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
- Rollback: revert branch `exp/opencode-issue-332` and close draft PR.
